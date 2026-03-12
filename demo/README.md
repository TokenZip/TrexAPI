# TokenZip Protocol — Demo

Two demo prototypes for YC-style review. No real API or model dependencies.

## 1. Interactive Web Prototype (`index.html`)

Open in a browser; zero dependencies.

```bash
open index.html          # macOS
# or
xdg-open index.html      # Linux
```

**Flow:**
1. Enter `CX-2026-0311` (Caixin) or `WSJ-2026-0842` (Wall Street Journal) in the left Agent chat.
2. The right panel shows full text with a “Licensed via TokenZip” watermark.
3. A payment toast appears: “Royalty paid to rights holder … $0.01”.
4. Header shows transfer time, token count, and compression ratio.

## 2. CLI Mock (`cli_mock.py`)

Plain Python 3, no third-party deps.

```bash
python3 cli_mock.py
```

**Flow:**
1. **Plain Text** — Simulates transferring 50,000 tokens over ~15s (red progress bar).
2. **TokenZip** — Sends only a TrexID pointer; completes in 0.2s (green).
3. **Royalty** — Prints: “Royalties processed via TokenZip Ledger: +$0.02 to Wall Street Journal”.
4. Summary table: Latency, Tokens, Royalties, Copyright.
