(function () {

  // ── Estilos ─────────────────────────────────────────────────────────────
  const css = `
    #acc-toggle {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #000;
      background: #b1a9a9;
      color: #000;
      font-family: 'Arial Black', sans-serif;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }
    #acc-toggle:hover { transform: scale(1.1); }

    #acc-panel {
      position: fixed;
      bottom: 80px;
      left: 20px;
      z-index: 9998;
      background: #b1a9a9;
      border: 2px solid #000;
      border-radius: 8px;
      padding: 16px;
      width: 220px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      font-family: 'Roboto Mono', monospace;
      display: none;
    }
    #acc-panel.acc-open { display: block; }

    #acc-panel h3 {
      font-family: 'Arial Black', sans-serif;
      font-size: 13px;
      text-transform: uppercase;
      margin: 0 0 14px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
      letter-spacing: 1px;
      color: #000;
    }

    .acc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 12px;
      color: #000;
    }

    .acc-size-btns {
      display: flex;
      gap: 4px;
    }

    .acc-btn {
      background: transparent;
      border: 1.5px solid #000;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      transition: background 0.15s, color 0.15s;
      padding: 3px 7px;
      font-size: 12px;
      color: #000;
    }
    .acc-btn:hover, .acc-btn.acc-active {
      background: #000;
      color: #b1a9a9;
    }

    .acc-toggle-btn {
      width: 100%;
      background: transparent;
      border: 1.5px solid #000;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      padding: 6px 10px;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #000;
    }
    .acc-toggle-btn::before {
      content: '○';
      font-size: 10px;
      flex-shrink: 0;
    }
    .acc-toggle-btn.acc-active::before { content: '●'; }
    .acc-toggle-btn:hover, .acc-toggle-btn.acc-active {
      background: #000;
      color: #b1a9a9;
    }

    .acc-reset {
      width: 100%;
      background: transparent;
      border: 1.5px solid #000;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      padding: 5px 10px;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      transition: background 0.15s, color 0.15s;
    }
    .acc-reset:hover {
      background: #000;
      color: #b1a9a9;
    }

    /* ── Modos de accesibilidad ── */

    body.acc-large p,
    body.acc-large li,
    body.acc-large td,
    body.acc-large span {
      font-size: 19px !important;
    }
    body.acc-xlarge p,
    body.acc-xlarge li,
    body.acc-xlarge td,
    body.acc-xlarge span {
      font-size: 23px !important;
    }

    body.acc-contrast {
      background-color: #000 !important;
      color: #ffff00 !important;
    }
    body.acc-contrast .menu,
    body.acc-contrast .parent,
    body.acc-contrast .contact-container,
    body.acc-contrast .header-container,
    body.acc-contrast .contact-form,
    body.acc-contrast nav,
    body.acc-contrast main,
    body.acc-contrast section,
    body.acc-contrast div,
    body.acc-contrast footer {
      background-color: #000 !important;
    }
    body.acc-contrast p,
    body.acc-contrast h1,
    body.acc-contrast h2,
    body.acc-contrast h3,
    body.acc-contrast li,
    body.acc-contrast span,
    body.acc-contrast label {
      color: #ffff00 !important;
    }
    body.acc-contrast a { color: #00ffff !important; }
    body.acc-contrast .menu-links a { color: #ffff00 !important; }
    body.acc-contrast #acc-toggle {
      background-color: #222 !important;
      border-color: #ffff00 !important;
      color: #ffff00 !important;
    }
    body.acc-contrast #acc-panel {
      background-color: #111 !important;
      border-color: #ffff00 !important;
    }
    body.acc-contrast #acc-panel h3,
    body.acc-contrast .acc-row,
    body.acc-contrast .acc-btn,
    body.acc-contrast .acc-toggle-btn,
    body.acc-contrast .acc-reset {
      color: #ffff00 !important;
      border-color: #ffff00 !important;
    }
    body.acc-contrast .acc-btn.acc-active,
    body.acc-contrast .acc-toggle-btn.acc-active {
      background: #ffff00 !important;
      color: #000 !important;
    }

    body.acc-grayscale { filter: grayscale(100%); }

    body.acc-underline a { text-decoration: underline !important; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HTML del widget ──────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.id = 'acc-widget';
  wrapper.innerHTML = `
    <button id="acc-toggle" aria-label="Abrir opciones de accesibilidad" aria-expanded="false">AA</button>
    <div id="acc-panel" role="dialog" aria-label="Panel de accesibilidad">
      <h3>Accesibilidad</h3>
      <div class="acc-row">
        <span>Tamaño de texto</span>
        <div class="acc-size-btns">
          <button class="acc-btn" data-size="normal" title="Tamaño normal">A</button>
          <button class="acc-btn" data-size="large"  title="Texto grande">A+</button>
          <button class="acc-btn" data-size="xlarge" title="Texto muy grande">A++</button>
        </div>
      </div>
      <button class="acc-toggle-btn" data-feat="contrast">Alto contraste</button>
      <button class="acc-toggle-btn" data-feat="grayscale">Escala de grises</button>
      <button class="acc-toggle-btn" data-feat="underline">Subrayar enlaces</button>
      <button class="acc-reset">Restablecer todo</button>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ── Estado ───────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'tdb-acc';
  const defaults = { size: 'normal', contrast: false, grayscale: false, underline: false };

  function loadState() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch (e) { return Object.assign({}, defaults); }
  }

  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function applyState(s) {
    const b = document.body;
    b.classList.remove('acc-large', 'acc-xlarge');
    if (s.size === 'large')  b.classList.add('acc-large');
    if (s.size === 'xlarge') b.classList.add('acc-xlarge');
    b.classList.toggle('acc-contrast',  !!s.contrast);
    b.classList.toggle('acc-grayscale', !!s.grayscale);
    b.classList.toggle('acc-underline', !!s.underline);

    document.querySelectorAll('[data-size]').forEach(btn =>
      btn.classList.toggle('acc-active', btn.dataset.size === s.size));
    document.querySelectorAll('[data-feat]').forEach(btn =>
      btn.classList.toggle('acc-active', !!s[btn.dataset.feat]));
  }

  // ── Inicializar ──────────────────────────────────────────────────────────
  let state = loadState();
  applyState(state);

  const toggle = document.getElementById('acc-toggle');
  const panel  = document.getElementById('acc-panel');

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const open = panel.classList.toggle('acc-open');
    toggle.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) {
      panel.classList.remove('acc-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('[data-size]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.size = btn.dataset.size;
      saveState(state);
      applyState(state);
    });
  });

  document.querySelectorAll('[data-feat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state[btn.dataset.feat] = !state[btn.dataset.feat];
      saveState(state);
      applyState(state);
    });
  });

  document.querySelector('.acc-reset').addEventListener('click', function () {
    state = Object.assign({}, defaults);
    saveState(state);
    applyState(state);
  });

})();
