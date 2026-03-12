"""LangChain integration entry points for the TZP RAG Interceptor.

Provides two deployment patterns:

TZPRunnable    LCEL Runnable — plug into any chain as a preprocessor
TZPChatModel   ChatModel wrapper — transparently intercept messages
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Iterator, List, Optional

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_core.runnables import RunnableConfig, RunnableSerializable

from .interceptor import TZPInterceptor
from .models import InterceptorConfig

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mode A: LCEL Runnable
# ---------------------------------------------------------------------------

class TZPRunnable(RunnableSerializable[dict, dict]):
    """LCEL-compatible Runnable that expands TZP markers in a dict field.

    Usage::

        from langchain_core.prompts import ChatPromptTemplate
        from langchain_openai import ChatOpenAI
        from rag_interceptor.config import build_config
        from rag_interceptor.langchain import TZPRunnable

        config = build_config(api_key="...", embedding_model="bge-m3")
        chain = (
            TZPRunnable(interceptor_config=config)
            | ChatPromptTemplate.from_template(
                "Context: {context}\\n\\nQuestion: {question}"
            )
            | ChatOpenAI(model="gpt-4o")
        )
        result = await chain.ainvoke({
            "context": "See [TZP: tx_us_8f9A2bXr7]",
            "question": "Q1 trends?",
        })
    """

    interceptor_config: Any  # InterceptorConfig
    context_key: str = "context"
    question_key: str = "question"

    class Config:
        arbitrary_types_allowed = True

    def _get_interceptor(self) -> TZPInterceptor:
        return TZPInterceptor(self.interceptor_config)

    def invoke(
        self, input: dict, config: Optional[RunnableConfig] = None, **kwargs: Any
    ) -> dict:
        return asyncio.get_event_loop().run_until_complete(
            self.ainvoke(input, config, **kwargs)
        )

    async def ainvoke(
        self, input: dict, config: Optional[RunnableConfig] = None, **kwargs: Any
    ) -> dict:
        context = input.get(self.context_key, "")
        question = input.get(self.question_key, "")

        if "[TZP:" not in context:
            return input

        async with self._get_interceptor() as interceptor:
            processed = await interceptor.process(context, question)

        return {**input, self.context_key: processed}


# ---------------------------------------------------------------------------
# Mode C: ChatModel Wrapper
# ---------------------------------------------------------------------------

class TZPChatModel(BaseChatModel):
    """Wraps any BaseChatModel, transparently intercepting TZP markers.

    Scans all incoming messages for ``[TZP: ...]`` markers, expands them
    via the interceptor, then forwards the rewritten messages to the
    inner model.

    Usage::

        from langchain_openai import ChatOpenAI
        from rag_interceptor.config import build_config
        from rag_interceptor.langchain import TZPChatModel

        config = build_config(api_key="...", embedding_model="bge-m3")
        model = TZPChatModel(
            inner=ChatOpenAI(model="gpt-4o"),
            interceptor_config=config,
        )
        result = await model.ainvoke([
            HumanMessage("Analyze: [TZP: tx_us_8f9A2bXr7]\\nWhat are the key risks?")
        ])
    """

    inner: Any  # BaseChatModel
    interceptor_config: Any  # InterceptorConfig
    question_extract: str = "last_human"  # strategy to find the user question

    class Config:
        arbitrary_types_allowed = True

    @property
    def _llm_type(self) -> str:
        return "tzp-intercepted"

    def _extract_question(self, messages: List[BaseMessage]) -> str:
        """Extract the user question from message list for RAG retrieval."""
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage) and msg.content:
                text = msg.content if isinstance(msg.content, str) else str(msg.content)
                # Use the last sentence / line as the query
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                return lines[-1] if lines else text
        return ""

    async def _intercept_messages(
        self, messages: List[BaseMessage]
    ) -> List[BaseMessage]:
        """Process all messages, expanding TZP markers."""
        has_tzp = any(
            "[TZP:" in (m.content if isinstance(m.content, str) else str(m.content))
            for m in messages
        )
        if not has_tzp:
            return messages

        question = self._extract_question(messages)
        result: List[BaseMessage] = []

        async with TZPInterceptor(self.interceptor_config) as interceptor:
            for msg in messages:
                content = msg.content if isinstance(msg.content, str) else str(msg.content)
                if "[TZP:" in content:
                    content = await interceptor.process(content, question)
                result.append(msg.copy(update={"content": content}))

        return result

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                processed = pool.submit(
                    asyncio.run, self._intercept_messages(messages)
                ).result()
        else:
            processed = asyncio.run(self._intercept_messages(messages))

        return self.inner._generate(processed, stop=stop, run_manager=run_manager, **kwargs)

    async def _agenerate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        processed = await self._intercept_messages(messages)
        return await self.inner._agenerate(processed, stop=stop, run_manager=run_manager, **kwargs)
