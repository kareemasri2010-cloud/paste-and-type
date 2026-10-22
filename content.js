(() => {
  "use strict";

  // Only the top page gets the floating button, and only once.
  if (window.top !== window) return;
  if (document.getElementById("paste-type-host")) return;

  const hostName = location.hostname;

  /* ------------------------------------------------------------------ *
   * Logo (gold rounded square, white keyboard, gold keys)
   * ------------------------------------------------------------------ */
  function logoSvg(gradId, cls) {
    const pos = [
      [114, 174], [174, 174], [234, 174], [294, 174], [354, 174],
      [114, 234], [174, 234], [234, 234], [294, 234], [354, 234],
    ];
    const keys =
      pos
        .map((p) => '<rect class="k" x="' + p[0] + '" y="' + p[1] + '" width="44" height="44" rx="10"></rect>')
        .join("") + '<rect class="k" x="150" y="298" width="212" height="36" rx="10"></rect>';
    return (
      '<svg class="' + cls + '" viewBox="0 0 512 512" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f7d66c"></stop><stop offset="1" stop-color="#c8921c"></stop>' +
      "</linearGradient></defs>" +
      '<rect width="512" height="512" rx="118" fill="url(#' + gradId + ')"></rect>' +
      '<rect x="76" y="138" width="360" height="234" rx="38" fill="#ffffff"></rect>' +
      '<g class="keys" fill="#d6a028">' + keys + "</g></svg>"
    );
  }

  /* ------------------------------------------------------------------ *
   * Styles. Applied through a constructable stylesheet so that strict
   * page CSPs (which can block <style> tags) don't break the UI.
   * ------------------------------------------------------------------ */
  let delayRules = "";
  for (let i = 1; i <= 11; i++) {
    delayRules += ".fab .k:nth-child(" + i + "){animation-delay:" + ((i - 1) * 0.12).toFixed(2) + "s}";
    delayRules += ".fab.typing .k:nth-child(" + i + "){animation-delay:" + ((i - 1) * 0.07).toFixed(2) + "s}";
  }

  const css = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }

    .wrap {
      --bg: #ffffff; --surface: #faf7f0; --fg: #1c1917; --muted: #78716c; --line: #ece6d8;
      --gold: #d4a62a; --gold-deep: #946a0f; --accent-fg: #2b1d00; --ok: #15803d;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
                   Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px; line-height: 1.5; color: var(--fg);
      -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
    }
    @media (prefers-color-scheme: dark) {
      .wrap {
        --bg: #1b1a17; --surface: #25231e; --fg: #f5f3ee; --muted: #a8a29e; --line: #38342b;
        --gold: #e0b43c; --gold-deep: #e0b43c; --ok: #4ade80;
      }
    }
    button { font-family: inherit; font-size: inherit; color: inherit; cursor: pointer; }
    button:disabled { opacity: .45; cursor: default; }

    /* ---------- floating logo button ---------- */
    .fab {
      position: fixed; right: 22px; bottom: 22px; width: 60px; height: 60px;
      padding: 0; border: 0; background: transparent; border-radius: 16px;
      transition: transform .3s cubic-bezier(.34, 1.56, .64, 1);
    }
    .fab.hidden { display: none; }
    .fab::before {
      content: ""; position: absolute; inset: 0; border-radius: 16px;
      border: 2px solid var(--gold); opacity: 0; pointer-events: none;
      animation: ring 3.6s ease-out infinite;
    }
    .fab:hover { transform: scale(1.1) rotate(-5deg); }
    .fab:active { transform: scale(.94); }
    .fab:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }
    .fab .logo { display: block; width: 100%; height: 100%; animation: float 4.5s ease-in-out infinite; }
    .logo-svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 6px 14px rgba(120, 84, 8, .38)); }
    .fab .k {
      transform-box: fill-box; transform-origin: center;
      animation: press 3.2s ease-in-out infinite;
    }
    .fab.typing .k { animation-duration: .9s; }
    .fab.typing::before { animation-duration: 1.4s; }
    .fab.open .logo, .fab.open::before { animation: none; }

    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes ring { 0% { transform: scale(1); opacity: .65; } 70%, 100% { transform: scale(1.6); opacity: 0; } }
    @keyframes press {
      0%, 60%, 100% { transform: translateY(0); fill: #d6a028; }
      72% { transform: translateY(9px) scale(.9); fill: #8f6410; }
    }
    @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }

    /* ---------- panel ---------- */
    .panel {
      position: fixed; right: 22px; bottom: 96px;
      width: 372px; max-width: calc(100vw - 44px);
      max-height: calc(100vh - 120px); overflow: auto;
      padding: 16px; border-radius: 20px;
      background: var(--bg); border: 1px solid var(--line);
      box-shadow: 0 24px 60px rgba(60, 40, 5, .28), 0 2px 8px rgba(60, 40, 5, .12);
      transform-origin: bottom right; display: none;
    }
    .panel.open { display: block; animation: pop .22s cubic-bezier(.2, .9, .3, 1.2); }

    .head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .mark { width: 32px; height: 32px; flex: 0 0 auto; filter: drop-shadow(0 2px 4px rgba(120, 84, 8, .3)); }
    .title { flex: 1; font-size: 16px; font-weight: 700; letter-spacing: -.01em; }
    .x {
      width: 30px; height: 30px; display: grid; place-items: center;
      border: 0; border-radius: 9px; background: transparent; color: var(--muted); font-size: 14px;
    }
    .x:hover { background: var(--surface); color: var(--fg); }

    .target {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 12px; margin-bottom: 12px; border-radius: 999px;
      background: var(--surface); color: var(--muted); font-size: 12px; font-weight: 600;
    }
    .target::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #a8a29e; }
    .target.ok { background: rgba(21, 128, 61, .1); color: var(--ok); }
    .target.ok::before { background: var(--ok); box-shadow: 0 0 0 3px rgba(21, 128, 61, .18); }

    .label-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .label {
      font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--muted);
    }
    .meta { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }

    textarea {
      display: block; width: 100%; min-height: 92px; resize: vertical; padding: 11px 12px;
      font-family: inherit; font-size: 13.5px; line-height: 1.5; color: var(--fg);
      background: var(--surface); border: 1px solid var(--line); border-radius: 12px; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    textarea::placeholder { color: var(--muted); opacity: .8; }
    textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212, 166, 42, .25); }

    .card {
      display: grid; gap: 13px; margin-top: 12px; padding: 12px 14px;
      background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
    }
    .srow { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .lbl { font-size: 13px; font-weight: 600; }
    output { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
    input[type="range"] { display: block; width: 100%; height: 20px; margin: 0; accent-color: var(--gold); }

    .seg {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 4px;
      background: var(--bg); border: 1px solid var(--line); border-radius: 12px;
    }
    .seg button {
      padding: 7px 4px; border: 0; border-radius: 8px; background: transparent;
      color: var(--muted); font-size: 12.5px; font-weight: 600; transition: background .15s, color .15s;
    }
    .seg button:hover { color: var(--fg); }
    .seg button[aria-checked="true"] {
      background: var(--gold); color: var(--accent-fg); box-shadow: 0 1px 3px rgba(120, 84, 8, .3);
    }

    .switch { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; }
    .switch span { font-size: 13px; font-weight: 600; }
    .switch input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .track { position: relative; flex: 0 0 auto; width: 40px; height: 24px; border-radius: 999px; background: #d6d3d1; transition: background .2s; }
    .track::after {
      content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .3); transition: transform .2s;
    }
    .switch input:checked + .track { background: var(--gold); }
    .switch input:checked + .track::after { transform: translateX(16px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--gold-deep); outline-offset: 2px; }

    .buttons { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-top: 12px; }
    .buttons button { height: 42px; border-radius: 12px; font-weight: 700; }
    .primary {
      border: 0; color: var(--accent-fg);
      background: linear-gradient(180deg, #f2cf66, #d4a62a);
      box-shadow: 0 4px 12px rgba(180, 130, 20, .35);
      transition: filter .15s, transform .1s;
    }
    .primary:hover:not(:disabled) { filter: brightness(1.05); }
    .primary:active:not(:disabled) { transform: scale(.98); }
    .secondary { border: 1px solid var(--line); background: transparent; color: var(--fg); }
    .secondary:hover:not(:disabled) { background: var(--surface); }

    .status { min-height: 18px; margin-top: 8px; font-size: 12.5px; color: var(--muted); }
    .foot {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--line);
      font-size: 11.5px; color: var(--muted);
    }
    .link { padding: 0; border: 0; background: transparent; font-size: 11.5px; color: var(--muted); text-decoration: underline; }
    .link:hover { color: var(--fg); }

    @media (prefers-reduced-motion: reduce) {
      .fab, .fab .logo, .fab::before, .fab .k, .panel.open { animation: none !important; transition: none !important; }
    }
  ` + delayRules;

  /* ------------------------------------------------------------------ *
   * UI (inside a shadow root so the site's CSS can't affect it)
   * ------------------------------------------------------------------ */
  const host = document.createElement("div");
  host.id = "paste-type-host";
  host.style.cssText =
    "all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });

  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    root.adoptedStyleSheets = [sheet];
  } catch (e) {
    const st = document.createElement("style");
    st.textContent = css;
    root.appendChild(st);
  }

  root.innerHTML += `
    <div class="wrap">
      <button class="fab" id="pill" type="button" title="Paste and Type" aria-label="Open Paste and Type">
        <span class="logo">${logoSvg("g1", "logo-svg")}</span>
      </button>

      <div class="panel" id="panel" role="dialog" aria-label="Paste and Type">
        <div class="head">
          ${logoSvg("g2", "mark")}
          <div class="title">Paste and Type</div>
          <button class="x" id="close" type="button" aria-label="Close">&#10005;</button>
        </div>

        <div class="target none" id="target"></div>

        <div class="label-row">
          <label class="label" for="text">Text to type</label>
          <span class="meta" id="meta"></span>
        </div>
        <textarea id="text" placeholder="Paste the text you want typed here..." spellcheck="false"></textarea>

        <div class="card">
          <div>
            <div class="srow"><label class="lbl" for="delay">Delay per key</label><output id="delayOut">40 ms</output></div>
            <input id="delay" type="range" min="0" max="400" step="5" value="40">
          </div>
          <div>
            <div class="srow"><label class="lbl" for="wait">Start delay</label><output id="waitOut">2 s</output></div>
            <input id="wait" type="range" min="0" max="10" step="1" value="2">
          </div>
          <div>
            <div class="srow"><span class="lbl">Mistakes</span><output id="mistakesOut"></output></div>
            <div class="seg" id="mistakes" role="radiogroup" aria-label="Mistakes">
              <button type="button" role="radio" data-v="off">Off</button>
              <button type="button" role="radio" data-v="few">Few</button>
              <button type="button" role="radio" data-v="natural">Natural</button>
              <button type="button" role="radio" data-v="many">Many</button>
            </div>
          </div>
          <label class="switch">
            <span>Human-like rhythm</span>
            <input id="jitter" type="checkbox" checked>
            <i class="track"></i>
          </label>
        </div>

        <div class="buttons">
          <button class="primary" id="start" type="button">Start typing</button>
          <button class="secondary" id="stop" type="button" disabled>Stop</button>
        </div>

        <div class="status" id="status"></div>

        <div class="foot">
          <button class="link" id="hide" type="button">Hide button on this site</button>
          <span>Esc stops typing</span>
        </div>
      </div>
    </div>
  `;

  document.documentElement.appendChild(host);

  const $ = (id) => root.getElementById(id);
  const ui = {
    pill: $("pill"),
    panel: $("panel"),
    close: $("close"),
    target: $("target"),
    meta: $("meta"),
    text: $("text"),
    delay: $("delay"),
    delayOut: $("delayOut"),
    wait: $("wait"),
    waitOut: $("waitOut"),
    seg: $("mistakes"),
    mistakesOut: $("mistakesOut"),
    jitter: $("jitter"),
    start: $("start"),
    stop: $("stop"),
    status: $("status"),
    hide: $("hide"),
  };

  const IDLE_LABEL = "Paste and Type";

  // Mistake levels: chance that any given letter is typed wrong first.
  const MISTAKE_RATES = { off: 0, few: 0.025, natural: 0.065, many: 0.14 };
  const MISTAKE_HINTS = {
    off: "none",
    few: "about 1 per 40 letters",
    natural: "about 1 per 15 letters",
    many: "about 1 per 7 letters",
  };
  let mistakes = "few";

  // Keys next to each letter on a QWERTY keyboard (used to pick a believable typo).
  const NEIGHBORS = {
    q: "wa", w: "qes", e: "wrd", r: "etf", t: "ryg", y: "tuh", u: "yij", i: "uok", o: "ipl",
    p: "ol", a: "qsz", s: "awdx", d: "serfc", f: "drtgv", g: "ftyhb", h: "gyujn", j: "huikm",
    k: "jiolm", l: "kop", z: "asx", x: "zsdc", c: "xdfv", v: "cfgb", b: "vghn", n: "bhjm", m: "njk",
  };

  function wrongKey(ch) {
    const lower = ch.toLowerCase();
    const opts = NEIGHBORS[lower];
    if (!opts) return null;
    const w = opts[Math.floor(Math.random() * opts.length)];
    return ch !== lower ? w.toUpperCase() : w;
  }

  function setStatus(msg) { ui.status.textContent = msg; }

  // The floating button has no text; its title/aria-label and a "typing" class
  // (which speeds up the key animation) reflect what's going on.
  function setPill(msg) {
    const idle = msg === IDLE_LABEL;
    ui.pill.title = msg;
    ui.pill.setAttribute("aria-label", idle ? "Open Paste and Type" : msg);
    ui.pill.classList.toggle("typing", !idle);
  }

  function setMistakes(level) {
    if (!(level in MISTAKE_RATES)) level = "few";
    mistakes = level;
    ui.seg.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-checked", b.dataset.v === level ? "true" : "false");
    });
    ui.mistakesOut.textContent = MISTAKE_HINTS[level];
  }

  function updateMeta() {
    const n = Array.from(ui.text.value).length;
    if (!n) { ui.meta.textContent = "Nothing to type yet"; return; }
    const d = Number(ui.delay.value);
    let t = "";
    if (d > 0) {
      const secs = Math.round((n * d) / 1000);
      t = " · about " + (secs < 60 ? Math.max(1, secs) + " s" : Math.floor(secs / 60) + " min " + (secs % 60) + " s");
    }
    ui.meta.textContent = n.toLocaleString() + " characters" + t;
  }

  function refreshLabels() {
    ui.delayOut.textContent = ui.delay.value + " ms";
    ui.waitOut.textContent = ui.wait.value + " s";
    updateMeta();
  }

  // Keep keystrokes typed inside the panel away from the site's own shortcuts.
  ["keydown", "keyup", "keypress"].forEach((type) =>
    ui.panel.addEventListener(type, (e) => e.stopPropagation())
  );

  /* ------------------------------------------------------------------ *
   * Settings (best effort; chrome.storage can throw if the extension
   * was reloaded while this page was open)
   * ------------------------------------------------------------------ */
  async function getStore(keys) {
    try { return await chrome.storage.local.get(keys); } catch (e) { return {}; }
  }
  async function setStore(obj) {
    try { await chrome.storage.local.set(obj); } catch (e) { /* ignore */ }
  }
  async function saveSettings() {
    await setStore({
      text: ui.text.value,
      delay: ui.delay.value,
      wait: ui.wait.value,
      jitter: ui.jitter.checked,
      mistakes: mistakes,
    });
  }
  async function loadSettings() {
    const s = await getStore(["text", "delay", "wait", "jitter", "mistakes", "hiddenHosts"]);
    if (typeof s.text === "string") ui.text.value = s.text;
    if (s.delay !== undefined) ui.delay.value = s.delay;
    if (s.wait !== undefined) ui.wait.value = s.wait;
    if (typeof s.jitter === "boolean") ui.jitter.checked = s.jitter;
    if (typeof s.mistakes === "string") setMistakes(s.mistakes);
    refreshLabels();
    if (Array.isArray(s.hiddenHosts) && s.hiddenHosts.includes(hostName)) {
      ui.pill.classList.add("hidden");
    }
  }

  /* ------------------------------------------------------------------ *
   * Remember which text field the user last clicked into, because
   * clicking our panel moves focus away from it.
   * ------------------------------------------------------------------ */
  let lastEditable = null;
  let savedRange = null;

  function isInputLike(el) {
    return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  }

  function isEditable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el === document.body || el === document.documentElement) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === "TEXTAREA") return !el.readOnly && !el.disabled;
    if (el.tagName === "INPUT") {
      const t = (el.type || "text").toLowerCase();
      const ok = ["text", "search", "url", "tel", "email", "password", "number", ""];
      return ok.includes(t) && !el.readOnly && !el.disabled;
    }
    return false;
  }

  function updateTarget() {
    const ok = !!lastEditable && lastEditable.isConnected;
    ui.target.textContent = ok ? "Field selected" : "Click into the field you want to type in";
    ui.target.className = "target " + (ok ? "ok" : "none");
  }

  document.addEventListener(
    "focusin",
    (e) => {
      const path = e.composedPath ? e.composedPath() : [e.target];
      if (path.includes(host)) return; // focus moved into our own UI
      const el = path[0];
      if (isEditable(el)) {
        if (el !== lastEditable) savedRange = null;
        lastEditable = el;
        updateTarget();
      }
    },
    true
  );

  document.addEventListener("selectionchange", () => {
    if (!lastEditable || isInputLike(lastEditable)) return;
    const sel = document.getSelection();
    if (sel && sel.rangeCount && lastEditable.contains(sel.anchorNode)) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }
  });

  function deepActive() {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }
    return el;
  }

  function focusTarget(target, isInput) {
    try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    if (isInput) return;
    const doc = target.ownerDocument;
    const sel = doc.getSelection();
    if (!sel) return;
    let range = savedRange && target.contains(savedRange.startContainer) ? savedRange : null;
    if (!range) {
      range = doc.createRange();
      range.selectNodeContents(target);
      range.collapse(false); // caret at the end
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ------------------------------------------------------------------ *
   * Typing
   * ------------------------------------------------------------------ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let running = false;
  let stopFlag = false;

  function setRunning(on) {
    ui.start.disabled = on;
    ui.stop.disabled = !on;
  }

  async function startTyping() {
    if (running) return;
    const text = ui.text.value;
    if (!text) {
      setStatus("Paste some text first.");
      return;
    }
    await saveSettings();

    running = true;
    stopFlag = false;
    setRunning(true);

    const onKey = (e) => { if (e.key === "Escape") stopFlag = true; };
    window.addEventListener("keydown", onKey, true);

    let typed = 0;
    try {
      const waitSec = Number(ui.wait.value);
      const delayMs = Number(ui.delay.value);
      const jitter = ui.jitter.checked;
      const mistakeRate = MISTAKE_RATES[mistakes] || 0;

      // Countdown: lets the user click into a field after pressing Start.
      for (let s = waitSec; s > 0; s--) {
        if (stopFlag) { setStatus("Cancelled."); return; }
        setStatus(
          lastEditable && lastEditable.isConnected
            ? "Typing starts in " + s + "s..."
            : "Click into the field now. Typing starts in " + s + "s..."
        );
        setPill("Starting in " + s + "s");
        await sleep(1000);
      }
      if (stopFlag) { setStatus("Cancelled."); return; }

      const target = lastEditable;
      if (!target || !target.isConnected) {
        setStatus("No text field selected. Click into a text box, then press Start.");
        return;
      }

      const isInput = isInputLike(target);
      const doc = target.ownerDocument;
      const win = doc.defaultView || window;
      const nativeSetter = isInput
        ? Object.getOwnPropertyDescriptor(
            target.tagName === "INPUT" ? win.HTMLInputElement.prototype : win.HTMLTextAreaElement.prototype,
            "value"
          ).set
        : null;

      focusTarget(target, isInput);

      const fireKey = (type, key) =>
        target.dispatchEvent(
          new win.KeyboardEvent(type, {
            key,
            code: key.length === 1 && /[a-z]/i.test(key) ? "Key" + key.toUpperCase() : "",
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );

      function insertIntoInput(str) {
        let start = target.value.length;
        let end = start;
        try {
          if (target.selectionStart !== null) {
            start = target.selectionStart;
            end = target.selectionEnd;
          }
        } catch (e) { /* some input types don't expose selection */ }
        nativeSetter.call(target, target.value.slice(0, start) + str + target.value.slice(end));
        try { target.setSelectionRange(start + str.length, start + str.length); } catch (e) { /* ignore */ }
        target.dispatchEvent(
          new win.InputEvent("input", { data: str, inputType: "insertText", bubbles: true, composed: true })
        );
      }

      function typeChar(ch) {
        const isNewline = ch === "\n";
        const keyName = isNewline ? "Enter" : ch;
        fireKey("keydown", keyName);
        fireKey("keypress", keyName);
        if (isInput) {
          if (isNewline) {
            if (target.tagName === "TEXTAREA") insertIntoInput("\n");
            // single-line inputs: the Enter key events above are all we can do
          } else {
            insertIntoInput(ch);
          }
        } else if (isNewline) {
          if (!doc.execCommand("insertParagraph")) doc.execCommand("insertText", false, "\n");
        } else {
          doc.execCommand("insertText", false, ch);
        }
        fireKey("keyup", keyName);
      }

      // Delete the character before the caret (or the selection), like Backspace.
      function backspace() {
        fireKey("keydown", "Backspace");
        if (isInput) {
          let start = target.value.length;
          let end = start;
          try {
            if (target.selectionStart !== null) {
              start = target.selectionStart;
              end = target.selectionEnd;
            }
          } catch (e) { /* ignore */ }
          const from = start === end ? Math.max(0, start - 1) : start;
          if (from !== end) {
            nativeSetter.call(target, target.value.slice(0, from) + target.value.slice(end));
            try { target.setSelectionRange(from, from); } catch (e) { /* ignore */ }
            target.dispatchEvent(
              new win.InputEvent("input", { inputType: "deleteContentBackward", bubbles: true, composed: true })
            );
          }
        } else {
          // Only delete while the editor really has focus, never somewhere else.
          const a = deepActive();
          if (a === target || target.contains(a)) doc.execCommand("delete");
        }
        fireKey("keyup", "Backspace");
      }

      // Normalise line endings; iterate by code point so emoji stay intact.
      const chars = Array.from(text.replace(/\r\n?/g, "\n"));
      const total = chars.length;
      let lostFocus = false;
      let fixes = 0;
      let nextMistakeAt = 3; // no typos in the first few characters

      // Pause between keystrokes.
      const keyPause = () => {
        let w = delayMs;
        if (jitter && delayMs > 0) w = delayMs * (0.5 + Math.random());
        if (w > 0) return sleep(w);
        return typed % 50 === 0 ? sleep(0) : Promise.resolve(); // keep the page responsive at 0 ms
      };

      let i = 0;
      while (i < total) {
        if (stopFlag) break;
        // The user clicked into a different field, or the field disappeared.
        if (lastEditable !== target || !target.isConnected) { lostFocus = true; break; }
        // Rich-text editors only accept typing while focused.
        if (!isInput) {
          const a = deepActive();
          if (!(a === target || target.contains(a))) { lostFocus = true; break; }
        }

        const ch = chars[i];

        // Occasionally hit a neighbouring key, carry on for a moment,
        // notice, backspace over the error and type the right thing.
        const wrong =
          mistakeRate > 0 && i >= nextMistakeAt && Math.random() < mistakeRate ? wrongKey(ch) : null;

        if (wrong) {
          typeChar(wrong);
          await keyPause();

          let extra = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 2) : 0;
          let overshoot = 0;
          for (let k = 1; k <= extra && i + k < total; k++) {
            const next = chars[i + k];
            if (next === "\n" || stopFlag) break;
            typeChar(next);
            overshoot++;
            await keyPause();
          }

          await sleep(220 + Math.random() * 300); // the "oh, that's wrong" moment
          for (let b = 0; b < overshoot + 1; b++) {
            backspace();
            await sleep(55 + Math.random() * 60);
          }
          await sleep(60 + Math.random() * 100);

          fixes++;
          nextMistakeAt = i + 8; // space typos out
          if (stopFlag) break; // the error is already cleaned up at this point
        }

        typeChar(ch);
        i++;
        typed = i;

        if (typed % 5 === 0 || typed === total) {
          setStatus("Typing... " + typed + "/" + total);
          setPill("Typing " + Math.round((typed / total) * 100) + "%");
        }

        await keyPause();
      }

      if (typed === total) {
        setStatus(
          "Done: typed " + typed + " characters" +
            (fixes ? " (fixed " + fixes + " typo" + (fixes === 1 ? "" : "s") + " along the way)." : ".")
        );
      } else if (lostFocus) {
        setStatus("Stopped after " + typed + " characters: the field lost focus.");
      } else {
        setStatus("Stopped after " + typed + " characters.");
      }
    } catch (e) {
      setStatus("Something went wrong: " + (e && e.message ? e.message : e));
    } finally {
      window.removeEventListener("keydown", onKey, true);
      running = false;
      stopFlag = false;
      setRunning(false);
      setPill(IDLE_LABEL);
    }
  }

  /* ------------------------------------------------------------------ *
   * Wiring
   * ------------------------------------------------------------------ */
  function setOpen(on) {
    ui.panel.classList.toggle("open", on);
    ui.pill.classList.toggle("open", on);
    if (on) updateTarget();
  }
  function togglePanel() { setOpen(!ui.panel.classList.contains("open")); }

  ui.pill.addEventListener("click", togglePanel);
  ui.close.addEventListener("click", () => setOpen(false));
  ui.start.addEventListener("click", startTyping);
  ui.stop.addEventListener("click", () => { stopFlag = true; });

  ui.delay.addEventListener("input", () => { refreshLabels(); saveSettings(); });
  ui.wait.addEventListener("input", () => { refreshLabels(); saveSettings(); });
  ui.jitter.addEventListener("change", saveSettings);
  ui.text.addEventListener("input", () => { updateMeta(); saveSettings(); });
  ui.seg.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => { setMistakes(b.dataset.v); saveSettings(); })
  );

  ui.hide.addEventListener("click", async () => {
    const s = await getStore(["hiddenHosts"]);
    const list = Array.isArray(s.hiddenHosts) ? s.hiddenHosts : [];
    if (!list.includes(hostName)) list.push(hostName);
    await setStore({ hiddenHosts: list });
    setOpen(false);
    ui.pill.classList.add("hidden");
  });

  // Toolbar icon click: show the button again if hidden, and toggle the panel.
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== "toggle") return;
      (async () => {
        if (ui.pill.classList.contains("hidden")) {
          const s = await getStore(["hiddenHosts"]);
          const list = (Array.isArray(s.hiddenHosts) ? s.hiddenHosts : []).filter((h) => h !== hostName);
          await setStore({ hiddenHosts: list });
          ui.pill.classList.remove("hidden");
          setOpen(true);
        } else {
          togglePanel();
        }
      })();
    });
  } catch (e) { /* extension context gone; nothing to do */ }

  setMistakes("few");
  setPill(IDLE_LABEL);
  refreshLabels();
  updateTarget();
  loadSettings();
})();
