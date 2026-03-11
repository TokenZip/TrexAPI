// Auto-generated from public/demo.html. Re-run: node scripts/sync-demo-html.cjs
// Includes i18n (EN/ZH, auto-detect + manual switch).

export const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TokenZip Protocol (TZP) — Semantic Shared Memory for AI Agents</title>
<meta name="description" content="TokenZip Protocol reduces AI-to-AI communication bandwidth by 80% and latency by 95%. Open standard for heterogeneous agents. Try the live demo.">
<meta property="og:title" content="TokenZip Protocol (TZP)">
<meta property="og:description" content="The universal semantic shared memory standard for AI agents. Replace 10,000-token payloads with a 15-character pointer.">
<meta property="og:type" content="website">
<link rel="canonical" href="/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,16..72,200..800;1,16..72,200..800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#f5f0e6;--surface:#faf6ed;--surface2:#ebe5d9;--border:#ddd6c8;
  --text:#1a1a1a;--text-dim:#4a4a4a;--text-bright:#0a0a0a;
  --accent:#5c4a3a;--accent2:#4a3c2f;--accent3:#6b5344;
  --green:#16a34a;--red:#b91c1c;--amber:#b45309;--cyan:#0e7490;
  --radius:12px;--font-mono:'SF Mono','Fira Code','Cascadia Code',monospace;
}
html{scroll-behavior:smooth}
body{
  font-family:'Newsreader',Georgia,serif;
  background:var(--bg);color:var(--text);line-height:1.6;
  overflow-x:hidden;
}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}

/* ── Nav ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(245,240,230,.92);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);padding:0 2rem;height:56px;
  display:flex;align-items:center;justify-content:space-between;
}
nav .logo{font-weight:700;font-size:1.1rem;color:var(--text-bright);display:flex;align-items:center;gap:.5rem;text-decoration:none}
nav .logo:hover{text-decoration:none;color:var(--text-bright);opacity:.85}
nav .logo span{color:inherit}
nav ul{list-style:none;display:flex;gap:1.5rem}
nav ul a{color:var(--text-dim);font-size:.875rem;transition:color .2s}
nav ul a:hover{color:var(--text-bright);text-decoration:none}

/* ── Section base ── */
section{padding:6rem 2rem;max-width:1120px;margin:0 auto}
.section-label{
  text-transform:uppercase;font-size:.75rem;letter-spacing:.15em;
  color:var(--accent);font-weight:600;margin-bottom:.5rem;
}
.section-title{font-size:2rem;font-weight:700;color:var(--text-bright);margin-bottom:1rem}
.section-desc{color:var(--text-dim);max-width:640px;margin-bottom:2.5rem}

/* ── Hero ── */
#hero{
  min-height:100vh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  position:relative;overflow:hidden;padding-top:56px;
}
#hero::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 0%,rgba(92,74,58,.06),transparent),
    radial-gradient(ellipse 40% 40% at 80% 80%,rgba(92,74,58,.04),transparent);
  pointer-events:none;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:.4rem;
  background:rgba(92,74,58,.1);border:1px solid var(--border);
  border-radius:999px;padding:.3rem .9rem;font-size:.8rem;color:var(--accent);
  margin-bottom:1.5rem;
}
.hero-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse-dot 2s infinite}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
#hero h1{
  font-size:clamp(2.4rem,5vw,4rem);font-weight:700;line-height:1.15;
  margin-bottom:1rem;color:var(--text-bright);
}
#hero .subtitle{font-size:1.15rem;color:var(--text-dim);max-width:620px;margin:0 auto 2.5rem}
.hero-stats{display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center;margin-bottom:3rem}
.stat-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:1.2rem 1.8rem;min-width:160px;text-align:center;
  transition:transform .3s,border-color .3s;
}
.stat-card:hover{transform:translateY(-4px);border-color:var(--accent)}
.stat-card .num{font-size:2.2rem;font-weight:700;font-variant-numeric:tabular-nums}
.stat-card .num.blue{color:var(--accent)}
.stat-card .num.green{color:var(--green)}
.stat-card .num.cyan{color:var(--cyan)}
.stat-card .label{font-size:.78rem;color:var(--text-dim);margin-top:.25rem}
.cta-btn{
  display:inline-flex;align-items:center;gap:.5rem;
  background:var(--text-bright);color:var(--bg);
  font-weight:600;font-size:.95rem;padding:.75rem 2rem;
  border:none;border-radius:999px;cursor:pointer;transition:transform .2s,box-shadow .2s;
}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15);text-decoration:none}

/* ── Comparison ── */
.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem}
@media(max-width:768px){.compare-grid{grid-template-columns:1fr}}
.compare-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:2rem;position:relative;overflow:hidden;
}
.compare-card.old{border-color:rgba(239,68,68,.25)}
.compare-card.new{border-color:rgba(34,197,94,.25)}
.compare-card .tag{
  position:absolute;top:1rem;right:1rem;font-size:.7rem;font-weight:600;
  padding:.2rem .6rem;border-radius:999px;text-transform:uppercase;letter-spacing:.08em;
}
.compare-card.old .tag{background:rgba(239,68,68,.15);color:var(--red)}
.compare-card.new .tag{background:rgba(34,197,94,.15);color:var(--green)}
.compare-card h3{font-size:1.1rem;color:var(--text-bright);margin-bottom:1rem}
.compare-card .code-block{
  background:var(--bg);border:1px solid var(--border);border-radius:8px;
  padding:1rem;font-family:var(--font-mono);font-size:.8rem;
  color:var(--text-dim);white-space:pre-wrap;word-break:break-all;
  line-height:1.7;margin-bottom:1rem;max-height:120px;overflow:hidden;position:relative;
}
.compare-card.old .code-block{max-height:120px}
.compare-card .code-block .fade{
  position:absolute;bottom:0;left:0;right:0;height:40px;
  background:linear-gradient(transparent,var(--bg));
}
.metric-row{display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.85rem}
.metric-row:last-child{border:none}
.metric-row .val{font-weight:600;font-family:var(--font-mono)}
.metric-row .val.bad{color:var(--red)}
.metric-row .val.good{color:var(--green)}

/* ── Workflow ── */
.workflow-steps{display:flex;flex-direction:column;gap:1.5rem;position:relative}
.workflow-steps::before{
  content:'';position:absolute;left:23px;top:24px;bottom:24px;width:2px;
  background:var(--border);opacity:.8;
}
.wf-step{
  display:flex;gap:1.2rem;align-items:flex-start;
  opacity:.4;transform:translateX(-10px);transition:all .5s ease;
}
.wf-step.active{opacity:1;transform:translateX(0)}
.wf-step .circle{
  width:48px;height:48px;min-width:48px;border-radius:50%;
  background:var(--surface);border:2px solid var(--border);
  display:flex;align-items:center;justify-content:center;font-weight:700;
  font-size:.85rem;color:var(--accent2);z-index:1;transition:all .4s;
}
.wf-step.active .circle{border-color:var(--accent);background:rgba(92,74,58,.1);color:var(--accent)}
.wf-step .body h4{font-size:1rem;color:var(--text-bright);margin-bottom:.25rem}
.wf-step .body p{font-size:.85rem;color:var(--text-dim)}
.wf-step .body .mini-code{
  margin-top:.5rem;background:var(--surface2);border:1px solid var(--border);
  border-radius:6px;padding:.5rem .75rem;font-family:var(--font-mono);
  font-size:.75rem;color:var(--accent);
}
.wf-controls{display:flex;gap:.75rem;margin-top:1.5rem}
.wf-controls button{
  padding:.5rem 1.2rem;border-radius:8px;border:1px solid var(--border);
  background:var(--surface);color:var(--text);cursor:pointer;font-size:.85rem;
  transition:all .2s;
}
.wf-controls button:hover{border-color:var(--accent);color:var(--accent)}
.wf-controls button.active-ctrl{background:var(--text-bright);border-color:var(--text-bright);color:var(--bg)}

/* ── Playground ── */
.playground-wrap{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  overflow:hidden;
}
.pg-header{
  display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;
  background:var(--surface2);border-bottom:1px solid var(--border);flex-wrap:wrap;
}
.pg-header label{font-size:.8rem;color:var(--text-dim)}
.pg-header input{
  flex:1;min-width:200px;padding:.4rem .75rem;border-radius:6px;
  border:1px solid var(--border);background:var(--bg);color:var(--text);
  font-family:var(--font-mono);font-size:.8rem;
}
.pg-body{display:grid;grid-template-columns:1fr 1fr;min-height:420px}
@media(max-width:768px){.pg-body{grid-template-columns:1fr}}
.pg-panel{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
.pg-panel:first-child{border-right:1px solid var(--border)}
.pg-panel h3{font-size:.95rem;color:var(--text-bright);display:flex;align-items:center;gap:.5rem}
.pg-panel h3 .badge{
  font-size:.65rem;padding:.15rem .5rem;border-radius:999px;
  background:rgba(92,74,58,.15);color:var(--accent);font-weight:600;
}
.pg-panel textarea{
  flex:1;min-height:120px;resize:vertical;padding:.75rem;border-radius:8px;
  border:1px solid var(--border);background:var(--bg);color:var(--text);
  font-family:var(--font-mono);font-size:.8rem;line-height:1.6;
}
.pg-panel .input-row{display:flex;gap:.5rem}
.pg-panel .input-row input{
  flex:1;padding:.5rem .75rem;border-radius:8px;border:1px solid var(--border);
  background:var(--bg);color:var(--text);font-family:var(--font-mono);font-size:.85rem;
}
.btn-push,.btn-pull{
  padding:.55rem 1.2rem;border:none;border-radius:8px;font-weight:600;
  font-size:.85rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.4rem;
}
.btn-push{background:var(--text-bright);color:var(--bg)}
.btn-push:hover{background:var(--accent);color:var(--bg)}
.btn-pull{background:var(--cyan);color:#0a0e1a}
.btn-pull:hover{opacity:.85}
.btn-push:disabled,.btn-pull:disabled{opacity:.5;cursor:not-allowed}
.result-box{
  background:var(--bg);border:1px solid var(--border);border-radius:8px;
  padding:.75rem;font-family:var(--font-mono);font-size:.78rem;
  color:var(--text-dim);overflow-x:auto;white-space:pre-wrap;
  max-height:220px;overflow-y:auto;flex:1;
}
.result-box .trex-id{color:var(--green);font-weight:700;font-size:.95rem}
.result-box .field-label{color:var(--accent);font-weight:600}

/* ── Benchmark ── */
.bench-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}
.bench-item{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:1.5rem;
}
.bench-item .bench-label{font-size:.8rem;color:var(--text-dim);margin-bottom:.75rem}
.bench-item .bench-bars{display:flex;flex-direction:column;gap:.6rem}
.bench-bar{position:relative;height:28px;border-radius:6px;overflow:hidden;background:var(--bg)}
.bench-bar .fill{
  height:100%;border-radius:6px;display:flex;align-items:center;padding:0 .6rem;
  font-size:.7rem;font-weight:600;color:#fff;width:0;transition:width 1.2s cubic-bezier(.22,1,.36,1);
}
.bench-bar .fill.old{background:linear-gradient(90deg,#dc2626,#ef4444)}
.bench-bar .fill.new{background:linear-gradient(90deg,#059669,#22c55e)}
.bench-bar .bar-label{
  position:absolute;right:.5rem;top:50%;transform:translateY(-50%);
  font-size:.65rem;color:var(--text-dim);font-family:var(--font-mono);
}
.bench-item .bench-delta{
  margin-top:.5rem;font-size:.85rem;font-weight:700;color:var(--green);text-align:right;
}

/* ── Ecosystem ── */
.eco-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.eco-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:1.5rem;transition:border-color .3s,transform .3s;
}
.eco-card:hover{border-color:var(--accent);transform:translateY(-3px)}
.eco-card .eco-icon{font-size:1.5rem;margin-bottom:.75rem}
.eco-card h4{color:var(--text-bright);margin-bottom:.35rem}
.eco-card p{font-size:.85rem;color:var(--text-dim)}
.eco-card .eco-tag{
  display:inline-block;margin-top:.5rem;font-size:.7rem;font-weight:600;
  padding:.15rem .5rem;border-radius:999px;
}
.eco-tag.released{background:rgba(34,197,94,.15);color:var(--green)}
.eco-tag.dev{background:rgba(245,158,11,.15);color:var(--amber)}
.eco-tag.planned{background:rgba(92,74,58,.15);color:var(--accent)}

/* ── Footer ── */
footer{
  text-align:center;padding:3rem 2rem;border-top:1px solid var(--border);
  color:var(--text-dim);font-size:.8rem;
}

/* ── Animations ── */
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.float{animation:float 3s ease-in-out infinite}

/* ── Loading spinner ── */
.spinner{
  display:inline-block;width:14px;height:14px;
  border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
  border-radius:50%;animation:spin .6s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--surface2)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--text-dim)}
.lang-switcher{display:flex;align-items:center;gap:.25rem}
.lang-switcher button{
  padding:.35rem .6rem;border:none;background:transparent;color:var(--text-dim);
  font-size:.8rem;cursor:pointer;border-radius:6px;transition:color .2s,background .2s;
}
.lang-switcher button:hover{color:var(--text-bright)}
.lang-switcher button.active{background:rgba(92,74,58,.15);color:var(--accent);font-weight:600}
nav .nav-github{display:inline-flex;align-items:center;padding:.35rem .5rem;border-radius:8px;color:var(--text-dim);transition:color .2s,background .2s}
nav .nav-github:hover{color:var(--text-bright);background:rgba(92,74,58,.08);text-decoration:none}
nav .nav-github svg{width:1.25rem;height:1.25rem;fill:currentColor}
</style>
</head>
<body>

<!-- ═══════════════ NAV ═══════════════ -->
<nav>
  <a href="/" class="logo"><span>TokenZip</span> Protocol</a>
  <ul>
    <li><a href="#hero" data-i18n="nav_home">Home</a></li>
    <li><a href="#problem" data-i18n="nav_problem">Problem</a></li>
    <li><a href="#workflow" data-i18n="nav_workflow">Workflow</a></li>
    <li><a href="#playground" data-i18n="nav_playground">Playground</a></li>
    <li><a href="#benchmark" data-i18n="nav_benchmark">Benchmark</a></li>
    <li><a href="#ecosystem" data-i18n="nav_ecosystem">Ecosystem</a></li>
    <li><span class="lang-switcher">
      <button type="button" id="langEn" data-lang="en">English</button>
      <button type="button" id="langZh" data-lang="zh">中文</button>
    </span></li>
    <li><a href="https://github.com/tokenzip/trexapi" class="nav-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a></li>
  </ul>
</nav>

<!-- ═══════════════ HERO ═══════════════ -->
<section id="hero">
  <div class="hero-badge"><span class="dot"></span> <span data-i18n="hero_badge">TZP v1.0 · Open Standard</span></div>
  <h1 data-i18n-html="hero_title">AI-to-AI Communication<br>Reinvented</h1>
  <p class="subtitle" data-i18n="hero_subtitle">TokenZip Protocol (TZP) is the universal semantic shared memory standard for heterogeneous AI agents. Replace 10,000-token payloads with a 15-character pointer. Try the interactive demo below.</p>
  <div class="hero-stats">
    <div class="stat-card float" style="animation-delay:0s">
      <div class="num blue" data-target="81" data-suffix="%">0%</div>
      <div class="label" data-i18n="hero_bandwidth">Bandwidth Reduction</div>
    </div>
    <div class="stat-card float" style="animation-delay:.3s">
      <div class="num green" data-target="95" data-suffix="%">0%</div>
      <div class="label" data-i18n="hero_latency">Latency Reduction</div>
    </div>
    <div class="stat-card float" style="animation-delay:.6s">
      <div class="num cyan" data-target="96" data-suffix="%">0%</div>
      <div class="label" data-i18n="hero_cost">Cost Savings</div>
    </div>
  </div>
  <a href="https://github.com/tokenzip/trexapi" class="cta-btn" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:.5rem"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg><span data-i18n="cta_github">GitHub</span></a>
</section>

<!-- ═══════════════ PROBLEM ═══════════════ -->
<section id="problem">
  <div class="fade-up">
    <div class="section-label" data-i18n="problem_label">The Problem</div>
    <div class="section-title" data-i18n="problem_title">The Fatal Bottleneck of AI-to-AI Communication</div>
    <div class="section-desc" data-i18n="problem_desc">Today's multi-agent systems rely on passing full natural-language context between agents — resulting in explosive latency and runaway API costs at scale.</div>
  </div>
  <div class="compare-grid fade-up">
    <div class="compare-card old">
      <span class="tag" data-i18n="compare_old">Traditional</span>
      <h3 data-i18n="pass_value">Pass-by-Value</h3>
      <div class="code-block">Agent A ──── [10,000 tokens full context: "Q1 2026 Global AI Market Report...The market showed strong upward momentum, driven by: 1. Central bank monetary policy shifts...2. AI-driven industrial transformation...3. Easing geopolitical tensions..."] ────▶ Agent B<span class="fade"></span></div>
      <div class="metric-row"><span data-i18n="metric_transfer">Transfer Size</span><span class="val bad">~40 KB</span></div>
      <div class="metric-row"><span data-i18n="metric_latency">Latency</span><span class="val bad">~2,000 ms</span></div>
      <div class="metric-row"><span data-i18n="metric_cost">Cost per Call</span><span class="val bad">$0.030</span></div>
      <div class="metric-row"><span data-i18n="metric_tokens">Tokens Used</span><span class="val bad">10,000</span></div>
    </div>
    <div class="compare-card new">
      <span class="tag" data-i18n="compare_new">TZP</span>
      <h3 data-i18n="pass_ref">Pass-by-Reference</h3>
      <div class="code-block">Agent A ──── "See [TZP: tx_us_8f9A2bXr7]" ────▶ Agent B

&#x2705; 15-char pointer  &#x2705; O(1) transfer complexity</div>
      <div class="metric-row"><span data-i18n="metric_transfer">Transfer Size</span><span class="val good">~7.6 KB</span></div>
      <div class="metric-row"><span data-i18n="metric_latency">Latency</span><span class="val good">~50 ms</span></div>
      <div class="metric-row"><span data-i18n="metric_cost">Cost per Call</span><span class="val good">$0.001</span></div>
      <div class="metric-row"><span data-i18n="metric_tokens">Tokens Used</span><span class="val good">0</span></div>
    </div>
  </div>
</section>

<!-- ═══════════════ WORKFLOW ═══════════════ -->
<section id="workflow">
  <div class="fade-up">
    <div class="section-label" data-i18n="workflow_label">Protocol Lifecycle</div>
    <div class="section-title" data-i18n="workflow_title">The Four-Phase TZP Workflow</div>
    <div class="section-desc" data-i18n="workflow_desc">From capability negotiation to zero-overhead addressing, a complete TZP exchange completes in milliseconds.</div>
  </div>
  <div class="workflow-steps fade-up" id="wfSteps">
    <div class="wf-step active" data-step="0">
      <div class="circle">0</div>
      <div class="body">
        <h4 data-i18n="wf_0_title">Capability Exchange</h4>
        <p data-i18n="wf_0_text">Agent A confirms Agent B supports TZP-Core via an out-of-band handshake. 5-second timeout auto-falls back to full-text transfer.</p>
        <div class="mini-code">{ "tzp_capability_response": { "supported": true, "features": ["TZP-Core"] } }</div>
      </div>
    </div>
    <div class="wf-step" data-step="1">
      <div class="circle">I</div>
      <div class="body">
        <h4 data-i18n="wf_1_title">Semantic Quantization</h4>
        <p data-i18n="wf_1_text">Long text is chunked semantically, embedded via all-MiniLM-L6-v2 into 384-d vectors, then percentile-based Int8 quantized — 81% compression.</p>
        <div class="mini-code">10,000 words &rarr; 20 chunks &times; 384d Float32 &rarr; 20 &times; 384 Int8 &asymp; 7.6 KB</div>
      </div>
    </div>
    <div class="wf-step" data-step="2">
      <div class="circle">II</div>
      <div class="body">
        <h4 data-i18n="wf_2_title">Edge Caching</h4>
        <p data-i18n="wf_2_text">The semantic payload is POSTed to the global edge network. The server generates a globally unique TrexID pointer with configurable TTL and geo-routing.</p>
        <div class="mini-code">POST /v1/payloads &rarr; 201 { "trex_id": "tx_us_8f9A2bXr7" }</div>
      </div>
    </div>
    <div class="wf-step" data-step="3">
      <div class="circle">III</div>
      <div class="body">
        <h4 data-i18n="wf_3_title">Zero-Overhead Addressing</h4>
        <p data-i18n="wf_3_text">Agent A embeds only the TrexID marker in its prompt. Agent B's Interceptor auto-detects, fetches, dequantizes, and injects the full context.</p>
        <div class="mini-code">"Analyze the report. Context: [TZP: tx_us_8f9A2bXr7]"</div>
      </div>
    </div>
  </div>
  <div class="wf-controls fade-up">
    <button onclick="setStep(0)" data-i18n="phase_0">Phase 0</button>
    <button onclick="setStep(1)" data-i18n="phase_1">Phase I</button>
    <button onclick="setStep(2)" data-i18n="phase_2">Phase II</button>
    <button onclick="setStep(3)" data-i18n="phase_3">Phase III</button>
    <button id="autoPlayBtn" class="active-ctrl" onclick="toggleAutoPlay()" data-i18n="auto_play">Auto Play</button>
  </div>
</section>

<!-- ═══════════════ PLAYGROUND ═══════════════ -->
<section id="playground">
  <div class="fade-up">
    <div class="section-label" data-i18n="pg_label">Live Playground</div>
    <div class="section-title" data-i18n="pg_title">Interactive API Demo</div>
    <div class="section-desc" data-i18n="pg_desc">The controls below call the running TrexAPI backend in real time. Experience the full Push / Pull workflow live.</div>
  </div>
  <div class="playground-wrap fade-up">
    <div class="pg-header">
      <label data-i18n="pg_apikey">API Key:</label>
      <input type="text" id="apiKeyInput" data-i18n-placeholder="pg_apikey_ph" placeholder="Enter your DEV_API_KEY from .env">
      <label data-i18n="pg_baseurl">Base URL:</label>
      <input type="text" id="baseUrlInput" value="" data-i18n-placeholder="pg_baseurl_ph" placeholder="auto-detect" style="max-width:220px">
    </div>
    <div class="pg-body">
      <!-- Push Panel -->
      <div class="pg-panel">
        <h3><span data-i18n="pg_push">Push</span> <span class="badge">POST /v1/payloads</span></h3>
        <textarea id="pushInput" data-i18n-placeholder="pg_push_ph" placeholder="Type or paste long-form text...">Q1 2026 Global AI Market Analysis Report

1. Market Overview
The global artificial intelligence market sustained strong growth momentum in Q1 2026, reaching a total market size of $185 billion — a 42% year-over-year increase. This growth was primarily driven by: the full-scale commercial deployment of generative AI applications, the rapid adoption of enterprise-grade AI Agent orchestration platforms, and continued breakthroughs in multimodal foundation model capabilities.

2. Key Trends
  a) Multi-Agent architecture goes mainstream: Over 67% of enterprise AI applications now employ multi-agent collaborative architectures, making efficient inter-agent communication a critical infrastructure requirement.
  b) Token economics under pressure: As context windows expand to millions of tokens, API call costs have become the single largest barrier to scaling deployments.
  c) Semantic compression rises: Next-generation protocols like TokenZip Protocol reduce inter-agent communication costs by 96% through vector-space mapping and pointer-based reference passing.

3. Investment Opportunity
In the AI infrastructure layer, semantic communication protocols and edge computing networks represent the next major wave of investment opportunity. The addressable market for this segment is projected to reach $12 billion by 2027.</textarea>
        <button class="btn-push" id="pushBtn" onclick="doPush()" data-i18n="btn_push">Push to Edge Network</button>
        <div class="result-box" id="pushResult" data-i18n="pg_push_result_ph">Results will appear here...</div>
      </div>
      <!-- Pull Panel -->
      <div class="pg-panel">
        <h3><span data-i18n="pg_pull">Pull</span> <span class="badge">GET /v1/payloads/:id</span></h3>
        <div class="input-row">
          <input type="text" id="pullInput" data-i18n-placeholder="pg_pull_ph" placeholder="tx_xx_xxxxxxxxx">
          <button class="btn-pull" id="pullBtn" onclick="doPull()" data-i18n="btn_pull">Pull</button>
        </div>
        <div class="result-box" id="pullResult" style="flex:1" data-i18n="pg_pull_result_ph">Enter a TrexID and click Pull to retrieve the payload...</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════ BENCHMARK ═══════════════ -->
<section id="benchmark">
  <div class="fade-up">
    <div class="section-label" data-i18n="bench_label">Performance</div>
    <div class="section-title" data-i18n="bench_title">Benchmark Results</div>
    <div class="section-desc" data-i18n="bench_desc">Based on the reference implementation. Averaged over 1,000 round-trips with 10,000-token English documents.</div>
  </div>
  <div class="bench-grid fade-up" id="benchGrid">
    <div class="bench-item" data-old="100" data-new="19" data-label-old="40 KB" data-label-new="7.6 KB" data-delta="-81%">
      <div class="bench-label" data-i18n="bench_transfer">Avg. Transfer Size</div>
      <div class="bench-bars">
        <div class="bench-bar"><div class="fill old">Traditional</div><span class="bar-label"></span></div>
        <div class="bench-bar"><div class="fill new">TZP</div><span class="bar-label"></span></div>
      </div>
      <div class="bench-delta"></div>
    </div>
    <div class="bench-item" data-old="100" data-new="5" data-label-old="2,100 ms" data-label-new="105 ms" data-delta="-95%">
      <div class="bench-label" data-i18n="bench_latency">Avg. End-to-End Latency</div>
      <div class="bench-bars">
        <div class="bench-bar"><div class="fill old">Traditional</div><span class="bar-label"></span></div>
        <div class="bench-bar"><div class="fill new">TZP</div><span class="bar-label"></span></div>
      </div>
      <div class="bench-delta"></div>
    </div>
    <div class="bench-item" data-old="100" data-new="4" data-label-old="$30.00" data-label-new="$1.20" data-delta="-96%">
      <div class="bench-label" data-i18n="bench_cost">API Cost per 1K Calls</div>
      <div class="bench-bars">
        <div class="bench-bar"><div class="fill old">Traditional</div><span class="bar-label"></span></div>
        <div class="bench-bar"><div class="fill new">TZP</div><span class="bar-label"></span></div>
      </div>
      <div class="bench-delta"></div>
    </div>
    <div class="bench-item" data-old="100" data-new="98.2" data-label-old="1.000" data-label-new="0.982" data-delta="-1.8%">
      <div class="bench-label" data-i18n="bench_fidelity">Semantic Fidelity (Cosine Sim.)</div>
      <div class="bench-bars">
        <div class="bench-bar"><div class="fill old">Baseline</div><span class="bar-label"></span></div>
        <div class="bench-bar"><div class="fill new">TZP</div><span class="bar-label"></span></div>
      </div>
      <div class="bench-delta"></div>
    </div>
  </div>
</section>

<!-- ═══════════════ ECOSYSTEM ═══════════════ -->
<section id="ecosystem">
  <div class="fade-up">
    <div class="section-label" data-i18n="eco_label">Ecosystem</div>
    <div class="section-title" data-i18n="eco_title">Open Ecosystem & Roadmap</div>
    <div class="section-desc" data-i18n="eco_desc">TZP is an open protocol. Anyone can build a compliant SDK or operate an edge node.</div>
  </div>
  <div class="eco-grid fade-up">
    <div class="eco-card">
      <div class="eco-icon">&#x1f40d;</div>
      <h4 data-i18n="eco_python">Python SDK</h4>
      <p data-i18n="eco_python_desc">Full semantic quantization, payload push/pull, E2EE encryption. Integrates with HuggingFace Transformers.</p>
      <span class="eco-tag dev" data-i18n="tag_dev">In Development</span>
    </div>
    <div class="eco-card">
      <div class="eco-icon">&#x1f7e6;</div>
      <h4 data-i18n="eco_ts">TypeScript SDK</h4>
      <p data-i18n="eco_ts_desc">Lightweight browser & Node.js dual-runtime support. ONNX Runtime inference, zero native dependencies.</p>
      <span class="eco-tag dev" data-i18n="tag_dev">In Development</span>
    </div>
    <div class="eco-card">
      <div class="eco-icon">&#x1f439;</div>
      <h4 data-i18n="eco_go">Go SDK</h4>
      <p data-i18n="eco_go_desc">Optimized for high-concurrency workloads. Kubernetes-native deployment and gRPC gateway support.</p>
      <span class="eco-tag dev" data-i18n="tag_dev">In Development</span>
    </div>
    <div class="eco-card">
      <div class="eco-icon">&#x1f980;</div>
      <h4 data-i18n="eco_rust">Rust SDK</h4>
      <p data-i18n="eco_rust_desc">Maximum performance and memory safety. Targeting embedded edge nodes and WASM runtimes.</p>
      <span class="eco-tag planned" data-i18n="tag_planned">Planned</span>
    </div>
    <div class="eco-card">
      <div class="eco-icon">&#x1f310;</div>
      <h4 data-i18n="eco_edge">TrexAPI Edge Network</h4>
      <p data-i18n="eco_edge_desc">Globally distributed across 12 regions. Built on Cloudflare Workers for sub-50ms latency worldwide.</p>
      <span class="eco-tag dev" data-i18n="tag_dev">In Development</span>
    </div>
    <div class="eco-card">
      <div class="eco-icon">&#x1f91d;</div>
      <h4 data-i18n="eco_mcp">MCP / A2A Interop</h4>
      <p data-i18n="eco_mcp_desc">Seamless integration with Model Context Protocol and Agent-to-Agent standards as a transport-layer optimization.</p>
      <span class="eco-tag dev" data-i18n="tag_dev">In Development</span>
    </div>
  </div>

  <div style="margin-top:3rem;text-align:center" class="fade-up">
    <div style="display:inline-flex;gap:1.5rem;flex-wrap:wrap;justify-content:center">
      <div class="stat-card">
        <div class="eco-icon" style="font-size:1.2rem;margin-bottom:.4rem">&#x1f3c5;</div>
        <h4 style="font-size:.9rem;color:var(--text-bright)" data-i18n="tzp_core">TZP-Core</h4>
        <p style="font-size:.75rem;color:var(--text-dim)" data-i18n="tzp_core_desc">Quantization + Push/Pull</p>
      </div>
      <div class="stat-card">
        <div class="eco-icon" style="font-size:1.2rem;margin-bottom:.4rem">&#x1f6f0;&#xfe0f;</div>
        <h4 style="font-size:.9rem;color:var(--text-bright)" data-i18n="tzp_network">TZP-Network</h4>
        <p style="font-size:.75rem;color:var(--text-dim)" data-i18n="tzp_network_desc">+ Global Edge Cache Network</p>
      </div>
      <div class="stat-card">
        <div class="eco-icon" style="font-size:1.2rem;margin-bottom:.4rem">&#x1f3e2;</div>
        <h4 style="font-size:.9rem;color:var(--text-bright)" data-i18n="tzp_enterprise">TZP-Enterprise</h4>
        <p style="font-size:.75rem;color:var(--text-dim)" data-i18n="tzp_enterprise_desc">+ E2EE / SOC 2 / 99.9% SLA</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════ FOOTER ═══════════════ -->
<footer>
  <p data-i18n="footer_copyright">© 2026 TokenZip Foundation. Apache 2.0 / CC-BY-SA 4.0 Dual-Licensed.</p>
  <p style="margin-top:.4rem"><span data-i18n="footer_standard">TokenZip Protocol is an open standard.</span> &nbsp;|&nbsp; <a href="https://github.com/tokenzip/tokenzip">GitHub</a> &nbsp;|&nbsp; API: <code style="font-size:.85em">/v1/payloads</code> &nbsp;|&nbsp; <a href="/health">Health</a></p>
</footer>

<script>
/* ═══════════════════════════════════════════
   0. i18n: auto-detect + manual switch (localStorage)
   ═══════════════════════════════════════════ */
const i18n = {
  en: {
    nav_home: 'Home', nav_problem: 'Problem', nav_workflow: 'Workflow', nav_playground: 'Playground', nav_benchmark: 'Benchmark', nav_ecosystem: 'Ecosystem',
    hero_badge: 'TZP v1.0 · Open Standard',
    hero_title: 'AI-to-AI Communication\\nReinvented',
    hero_subtitle: 'TokenZip Protocol (TZP) is the universal semantic shared memory standard for heterogeneous AI agents. Replace 10,000-token payloads with a 15-character pointer. Try the interactive demo below.',
    hero_bandwidth: 'Bandwidth Reduction', hero_latency: 'Latency Reduction', hero_cost: 'Cost Savings',
    cta_demo: 'Try Live Demo ↓', cta_github: 'GitHub',
    problem_label: 'The Problem', problem_title: 'The Fatal Bottleneck of AI-to-AI Communication',
    problem_desc: "Today's multi-agent systems rely on passing full natural-language context between agents — resulting in explosive latency and runaway API costs at scale.",
    compare_old: 'Traditional', compare_new: 'TZP', pass_value: 'Pass-by-Value', pass_ref: 'Pass-by-Reference',
    metric_transfer: 'Transfer Size', metric_latency: 'Latency', metric_cost: 'Cost per Call', metric_tokens: 'Tokens Used',
    workflow_label: 'Protocol Lifecycle', workflow_title: 'The Four-Phase TZP Workflow',
    workflow_desc: 'From capability negotiation to zero-overhead addressing, a complete TZP exchange completes in milliseconds.',
    wf_0_title: 'Capability Exchange', wf_0_text: 'Agent A confirms Agent B supports TZP-Core via an out-of-band handshake. 5-second timeout auto-falls back to full-text transfer.',
    wf_1_title: 'Semantic Quantization', wf_1_text: 'Long text is chunked semantically, embedded via all-MiniLM-L6-v2 into 384-d vectors, then percentile-based Int8 quantized — 81% compression.',
    wf_2_title: 'Edge Caching', wf_2_text: 'The semantic payload is POSTed to the global edge network. The server generates a globally unique TrexID pointer with configurable TTL and geo-routing.',
    wf_3_title: 'Zero-Overhead Addressing', wf_3_text: "Agent A embeds only the TrexID marker in its prompt. Agent B's Interceptor auto-detects, fetches, dequantizes, and injects the full context.",
    phase_0: 'Phase 0', phase_1: 'Phase I', phase_2: 'Phase II', phase_3: 'Phase III', auto_play: 'Auto Play',
    pg_label: 'Live Playground', pg_title: 'Interactive API Demo',
    pg_desc: 'The controls below call the running TrexAPI backend in real time. Experience the full Push / Pull workflow live.',
    pg_apikey: 'API Key:', pg_baseurl: 'Base URL:', pg_apikey_ph: 'Leave empty for public demo', pg_baseurl_ph: 'auto-detect',
    pg_push: 'Push', pg_pull: 'Pull', pg_push_ph: 'Type or paste long-form text...', pg_pull_ph: 'tx_xx_xxxxxxxxx',
    btn_push: 'Push to Edge Network', btn_pull: 'Pull', pg_push_result_ph: 'Results will appear here...', pg_pull_result_ph: 'Enter a TrexID and click Pull to retrieve the payload...',
    bench_label: 'Performance', bench_title: 'Benchmark Results', bench_desc: 'Based on the reference implementation. Averaged over 1,000 round-trips with 10,000-token English documents.',
    bench_transfer: 'Avg. Transfer Size', bench_latency: 'Avg. End-to-End Latency', bench_cost: 'API Cost per 1K Calls', bench_fidelity: 'Semantic Fidelity (Cosine Sim.)',
    eco_label: 'Ecosystem', eco_title: 'Open Ecosystem & Roadmap', eco_desc: 'TZP is an open protocol. Anyone can build a compliant SDK or operate an edge node.',
    eco_python: 'Python SDK', eco_python_desc: 'Full semantic quantization, payload push/pull, E2EE encryption. Integrates with HuggingFace Transformers.',
    eco_ts: 'TypeScript SDK', eco_ts_desc: 'Lightweight browser & Node.js dual-runtime support. ONNX Runtime inference, zero native dependencies.',
    eco_go: 'Go SDK', eco_go_desc: 'Optimized for high-concurrency workloads. Kubernetes-native deployment and gRPC gateway support.',
    eco_rust: 'Rust SDK', eco_rust_desc: 'Maximum performance and memory safety. Targeting embedded edge nodes and WASM runtimes.',
    eco_edge: 'TrexAPI Edge Network', eco_edge_desc: 'Globally distributed across 12 regions. Built on Cloudflare Workers for sub-50ms latency worldwide.',
    eco_mcp: 'MCP / A2A Interop', eco_mcp_desc: 'Seamless integration with Model Context Protocol and Agent-to-Agent standards as a transport-layer optimization.',
    tag_released: 'Released', tag_dev: 'In Development', tag_planned: 'Planned', tag_live: 'Live',
    tzp_core: 'TZP-Core', tzp_core_desc: 'Quantization + Push/Pull',
    tzp_network: 'TZP-Network', tzp_network_desc: '+ Global Edge Cache Network',
    tzp_enterprise: 'TZP-Enterprise', tzp_enterprise_desc: '+ E2EE / SOC 2 / 99.9% SLA',
    footer_copyright: '© 2026 TokenZip Foundation. Apache 2.0 / CC-BY-SA 4.0 Dual-Licensed.',
    footer_standard: 'TokenZip Protocol is an open standard.',
    err_apikey: 'Enter an API Key or leave empty for public demo', err_network: 'Network Error: ', err_network_hint: '\\nMake sure TrexAPI is running (npm run dev)',
    pushing: 'Pushing...', push_wait: 'Pushing payload to edge network...', pull_wait: 'Fetching payload from edge network...',
    compression_note: 'Demo uses synthetic vectors; real TZP compresses long text (~81%+).'
  },
  zh: {
    nav_home: '首页', nav_problem: '问题', nav_workflow: '流程', nav_playground: '试玩', nav_benchmark: '性能', nav_ecosystem: '生态',
    hero_badge: 'TZP v1.0 · 开放标准',
    hero_title: 'AI 间通信\\n重新定义',
    hero_subtitle: 'TokenZip 协议 (TZP) 是面向异构 AI 代理的通用语义共享内存标准。用 15 字符的指针替代上万 Token 的载荷。下方可体验交互式演示。',
    hero_bandwidth: '带宽降低', hero_latency: '延迟降低', hero_cost: '成本节省',
    cta_demo: '体验在线演示 ↓', cta_github: 'GitHub',
    problem_label: '问题', problem_title: 'AI 间通信的致命瓶颈',
    problem_desc: '当今多智能体系统依赖在代理间传递完整自然语言上下文，导致延迟暴增与 API 成本失控。',
    compare_old: '传统', compare_new: 'TZP', pass_value: '传值', pass_ref: '传指针',
    metric_transfer: '传输大小', metric_latency: '延迟', metric_cost: '单次成本', metric_tokens: 'Token 数',
    workflow_label: '协议生命周期', workflow_title: '四阶段 TZP 流程',
    workflow_desc: '从能力协商到零开销寻址，一次完整 TZP 交换在毫秒级完成。',
    wf_0_title: '能力协商', wf_0_text: 'Agent A 通过带外握手确认 Agent B 支持 TZP-Core。5 秒超时自动回退为全文传输。',
    wf_1_title: '语义量化', wf_1_text: '长文本按语义分块，经 all-MiniLM-L6-v2 嵌入为 384 维向量，再按分位数 Int8 量化，约 81% 压缩。',
    wf_2_title: '边缘缓存', wf_2_text: '语义载荷 POST 到全球边缘网络，服务端生成全局唯一 TrexID 指针，支持可配置 TTL 与地域路由。',
    wf_3_title: '零开销寻址', wf_3_text: 'Agent A 仅在提示中嵌入 TrexID 标记；Agent B 的拦截器自动检测、拉取、反量化并注入完整上下文。',
    phase_0: '阶段 0', phase_1: '阶段 I', phase_2: '阶段 II', phase_3: '阶段 III', auto_play: '自动播放',
    pg_label: '在线试玩', pg_title: '交互式 API 演示',
    pg_desc: '下方控件实时调用 TrexAPI 后端，可完整体验推送/拉取流程。',
    pg_apikey: 'API Key：', pg_baseurl: 'Base URL：', pg_apikey_ph: '留空即用公开演示', pg_baseurl_ph: '自动检测',
    pg_push: '推送', pg_pull: '拉取', pg_push_ph: '输入或粘贴长文本…', pg_pull_ph: 'tx_xx_xxxxxxxxx',
    btn_push: '推送到边缘网络', btn_pull: '拉取', pg_push_result_ph: '结果将显示在这里…', pg_pull_result_ph: '输入 TrexID 后点击拉取…',
    bench_label: '性能', bench_title: '基准测试结果', bench_desc: '基于参考实现，10,000 Token 英文文档 × 1,000 次往返取平均。',
    bench_transfer: '平均传输大小', bench_latency: '平均端到端延迟', bench_cost: '千次调用 API 成本', bench_fidelity: '语义保真度（余弦相似度）',
    eco_label: '生态', eco_title: '开放生态与路线图', eco_desc: 'TZP 为开放协议，任何人都可构建合规 SDK 或运营边缘节点。',
    eco_python: 'Python SDK', eco_python_desc: '完整语义量化、载荷推送/拉取、E2EE 加密，与 HuggingFace Transformers 集成。',
    eco_ts: 'TypeScript SDK', eco_ts_desc: '轻量浏览器与 Node 双运行时，ONNX Runtime 推理，零原生依赖。',
    eco_go: 'Go SDK', eco_go_desc: '面向高并发场景，Kubernetes 原生部署与 gRPC 网关支持。',
    eco_rust: 'Rust SDK', eco_rust_desc: '极致性能与内存安全，面向嵌入式边缘节点与 WASM 运行时。',
    eco_edge: 'TrexAPI 边缘网络', eco_edge_desc: '全球 12 区域分布，基于 Cloudflare Workers，50ms 内延迟。',
    eco_mcp: 'MCP / A2A 互操作', eco_mcp_desc: '与 Model Context Protocol 及 Agent-to-Agent 标准无缝集成，作为传输层优化。',
    tag_released: '已发布', tag_dev: '开发中', tag_planned: '计划中', tag_live: '已上线',
    tzp_core: 'TZP-Core', tzp_core_desc: '量化 + 推送/拉取',
    tzp_network: 'TZP-Network', tzp_network_desc: '+ 全球边缘缓存网络',
    tzp_enterprise: 'TZP-Enterprise', tzp_enterprise_desc: '+ E2EE / SOC 2 / 99.9% SLA',
    footer_copyright: '© 2026 TokenZip Foundation. Apache 2.0 / CC-BY-SA 4.0 双许可。',
    footer_standard: 'TokenZip 协议为开放标准。',
    err_apikey: '输入 API Key 或留空使用公开演示', err_network: '网络错误：', err_network_hint: '\\n请确认 TrexAPI 已运行 (npm run dev)',
    pushing: '推送中…', push_wait: '正在将载荷推送到边缘网络…', pull_wait: '正在从边缘网络拉取载荷…',
    compression_note: '试玩使用合成向量；真实 TZP 对长文本约 81%+ 压缩。'
  }
};
function setLang(lang) {
  if (!i18n[lang]) lang = 'en';
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.setAttribute('data-lang', lang);
  try { localStorage.setItem('tzp_lang', lang); } catch (e) {}
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][k] !== undefined) el.textContent = i18n[lang][k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var k = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang] && i18n[lang][k] !== undefined) el.placeholder = i18n[lang][k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var k = el.getAttribute('data-i18n-html');
    if (i18n[lang] && i18n[lang][k] !== undefined) el.innerHTML = i18n[lang][k].replace(/\\n/g, '<br>');
  });
  var enBtn = document.getElementById('langEn'); var zhBtn = document.getElementById('langZh');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');
  if (zhBtn) zhBtn.classList.toggle('active', lang === 'zh');
}
function initLang() {
  var stored = null; try { stored = localStorage.getItem('tzp_lang'); } catch (e) {}
  var browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
  var lang = (stored === 'en' || stored === 'zh') ? stored : (browser.indexOf('zh') === 0 ? 'zh' : 'en');
  setLang(lang);
}
function t(key) {
  var lang = document.documentElement.getAttribute('data-lang') || 'en';
  return (i18n[lang] && i18n[lang][key] !== undefined) ? i18n[lang][key] : key;
}
document.addEventListener('DOMContentLoaded', function() {
  initLang();
  document.getElementById('langEn') && document.getElementById('langEn').addEventListener('click', function() { setLang('en'); });
  document.getElementById('langZh') && document.getElementById('langZh').addEventListener('click', function() { setLang('zh'); });
});

/* ═══════════════════════════════════════════
   1. Scroll animations (Intersection Observer)
   ═══════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ═══════════════════════════════════════════
   2. Hero stat counter animation
   ═══════════════════════════════════════════ */
function animateCounters() {
  document.querySelectorAll('.stat-card .num[data-target]').forEach(el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
const heroObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { animateCounters(); heroObs.disconnect(); }
}, { threshold: 0.3 });
heroObs.observe(document.getElementById('hero'));

/* ═══════════════════════════════════════════
   3. Workflow step controls
   ═══════════════════════════════════════════ */
let currentStep = 0;
let autoPlayInterval = null;
let autoPlaying = true;

function setStep(n) {
  currentStep = n;
  document.querySelectorAll('.wf-step').forEach((el, i) => {
    el.classList.toggle('active', i <= n);
  });
  document.querySelectorAll('.wf-controls button:not(#autoPlayBtn)').forEach((btn, i) => {
    btn.classList.toggle('active-ctrl', i === n);
  });
}

function toggleAutoPlay() {
  autoPlaying = !autoPlaying;
  const btn = document.getElementById('autoPlayBtn');
  btn.classList.toggle('active-ctrl', autoPlaying);
  if (autoPlaying) startAutoPlay(); else stopAutoPlay();
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => {
    currentStep = (currentStep + 1) % 4;
    setStep(currentStep);
  }, 2500);
}

function stopAutoPlay() {
  if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; }
}

startAutoPlay();

/* ═══════════════════════════════════════════
   4. Playground: Push / Pull
   ═══════════════════════════════════════════ */
function getBaseUrl() {
  const custom = document.getElementById('baseUrlInput').value.trim();
  if (custom) return custom.replace(/\\/$/, '');
  return window.location.origin;
}

function getApiKey() {
  var key = document.getElementById('apiKeyInput').value.trim();
  return key || 'demo-investor-key';
}

function generateFakeVectors(text) {
  const chunkSize = 200;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  if (chunks.length === 0) chunks.push(text);

  const vectorSeqB64 = chunks.map(() => {
    const bytes = new Uint8Array(384);
    crypto.getRandomValues(bytes);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  });

  const quantParams = {
    min: -(2 + Math.random() * 2).toFixed(3) * 1,
    max: (3 + Math.random() * 2).toFixed(3) * 1,
    method: 'percentile_99_9_int8'
  };

  return { vectorSeqB64, quantParams, chunkCount: chunks.length };
}

async function doPush() {
  const text = document.getElementById('pushInput').value.trim();
  if (!text) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    document.getElementById('pushResult').innerHTML = '<span style="color:var(--red)">' + t('err_apikey') + '</span>';
    return;
  }

  const btn = document.getElementById('pushBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> ' + t('pushing');
  document.getElementById('pushResult').textContent = t('push_wait');

  const { vectorSeqB64, quantParams, chunkCount } = generateFakeVectors(text);

  const body = {
    tzp_version: '1.0',
    payload: {
      vector_seq_b64: vectorSeqB64,
      quant_params: quantParams,
      dimensions: 384,
      chunk_count: chunkCount,
      summary: text.slice(0, 80) + (text.length > 80 ? '...' : ''),
      source_lang: 'en'
    },
    metadata: {
      sender_agent_id: 'agent_demo_investor_01',
      ttl_seconds: 3600,
      created_at: new Date().toISOString(),
      idempotency_key: 'demo_' + Date.now()
    }
  };

  try {
    const t0 = performance.now();
    const res = await fetch(getBaseUrl() + '/v1/payloads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(body)
    });
    const elapsed = (performance.now() - t0).toFixed(0);
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('pushResult').innerHTML =
        '<span style="color:var(--red)">Error ' + res.status + ': ' + (data.error?.message || JSON.stringify(data)) + '</span>';
      return;
    }

    document.getElementById('pushResult').innerHTML =
      '<span class="field-label">TrexID:</span>  <span class="trex-id">' + data.trex_id + '</span>\\n' +
      '<span class="field-label">Edge Region:</span>  ' + data.edge_region + '\\n' +
      '<span class="field-label">Expires:</span>  ' + data.expires_at + '\\n' +
      '<span class="field-label">Payload Size:</span>  ' + data.payload_size_bytes + ' bytes\\n' +
      '<span class="field-label">Checksum:</span>  ' + data.checksum_sha256.slice(0, 16) + '...\\n' +
      '<span class="field-label">Latency:</span>  ' + elapsed + ' ms';

    document.getElementById('pullInput').value = data.trex_id;
  } catch (err) {
    document.getElementById('pushResult').innerHTML =
      '<span style="color:var(--red)">' + t('err_network') + err.message + t('err_network_hint') + '</span>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = t('btn_push');
  }
}

async function doPull() {
  const trexId = document.getElementById('pullInput').value.trim();
  if (!trexId) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    document.getElementById('pullResult').innerHTML = '<span style="color:var(--red)">' + t('err_apikey') + '</span>';
    return;
  }

  const btn = document.getElementById('pullBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  document.getElementById('pullResult').textContent = t('pull_wait');

  try {
    const t0 = performance.now();
    const res = await fetch(getBaseUrl() + '/v1/payloads/' + encodeURIComponent(trexId), {
      headers: { 'Authorization': 'Bearer ' + apiKey }
    });
    const elapsed = (performance.now() - t0).toFixed(0);
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('pullResult').innerHTML =
        '<span style="color:var(--red)">Error ' + res.status + ': ' + (data.error?.message || JSON.stringify(data)) + '</span>';
      return;
    }

    const p = data.payload;
    document.getElementById('pullResult').innerHTML =
      '<span class="field-label">TrexID:</span>  <span class="trex-id">' + data.trex_id + '</span>\\n' +
      '<span class="field-label">TZP Version:</span>  ' + data.tzp_version + '\\n' +
      '<span class="field-label">Dimensions:</span>  ' + p.dimensions + '\\n' +
      '<span class="field-label">Chunks:</span>  ' + p.chunk_count + '\\n' +
      '<span class="field-label">Summary:</span>  ' + (p.summary || 'N/A') + '\\n' +
      '<span class="field-label">Language:</span>  ' + (p.source_lang || 'N/A') + '\\n' +
      '<span class="field-label">Quant Method:</span>  ' + p.quant_params.method + '\\n' +
      '<span class="field-label">Vector Seq:</span>  [' + p.vector_seq_b64.length + ' base64 chunks]\\n' +
      '<span class="field-label">Checksum:</span>  ' + data.checksum_sha256.slice(0, 16) + '...\\n' +
      '<span class="field-label">Latency:</span>  ' + elapsed + ' ms';
  } catch (err) {
    document.getElementById('pullResult').innerHTML =
      '<span style="color:var(--red)">' + t('err_network') + err.message + '</span>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = t('btn_pull');
  }
}

/* ═══════════════════════════════════════════
   5. Benchmark bar animations
   ═══════════════════════════════════════════ */
const benchObs = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  benchObs.disconnect();
  document.querySelectorAll('.bench-item').forEach(item => {
    const oldPct = +item.dataset.old;
    const newPct = +item.dataset.new;
    const fills = item.querySelectorAll('.fill');
    const labels = item.querySelectorAll('.bar-label');
    const delta = item.querySelector('.bench-delta');

    requestAnimationFrame(() => {
      fills[0].style.width = oldPct + '%';
      fills[1].style.width = newPct + '%';
    });
    labels[0].textContent = item.dataset.labelOld;
    labels[1].textContent = item.dataset.labelNew;
    delta.textContent = item.dataset.delta;
  });
}, { threshold: 0.3 });
benchObs.observe(document.getElementById('benchGrid'));
</script>
</body>
</html>
`;
