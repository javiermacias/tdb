(function () {

  function initAccessibility() {
  // ── Estilos ─────────────────────────────────────────────────────────────
  const css = `
    #acc-toggle {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: 2px solid #000;
      background: #b1a9a9;
      color: #000;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s, background-color 0.2s;
    }
    #acc-toggle:hover { transform: scale(1.1); background-color: #fbff00; }

    #acc-panel {
      position: fixed;
      bottom: 85px;
      left: 20px;
      z-index: 9998;
      background: #b1a9a9;
      border: 2px solid #000;
      border-radius: 8px;
      padding: 16px;
      width: 280px;
      max-height: calc(100vh - 110px);
      overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      font-family: 'Roboto Mono', monospace;
      display: none;
    }
    #acc-panel.acc-open { display: block; }

    .acc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
    }

    .acc-header h3 {
      font-family: 'Arial Black', sans-serif;
      font-size: 14px;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: 1px;
      color: #000;
    }

    #acc-close {
      background: transparent;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      color: #000;
      font-weight: bold;
      padding: 0 5px;
    }
    #acc-close:hover { color: #555; }

    .acc-section-label {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #444;
      margin: 14px 0 8px 0;
      font-weight: bold;
    }

    .acc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 12px;
      color: #000;
      gap: 8px;
    }
    .acc-row > span { white-space: nowrap; font-weight: bold; }

    .acc-size-btns, .acc-spacing-btns {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .acc-btn {
      background: transparent;
      border: 1.5px solid #000;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      transition: all 0.15s;
      padding: 4px 8px;
      font-size: 12px;
      color: #000;
      font-weight: bold;
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
      padding: 8px 10px;
      text-align: left;
      transition: all 0.15s;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #000;
      font-weight: bold;
    }
    .acc-toggle-btn::before {
      content: '○';
      font-size: 12px;
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
      border: 2px solid #000;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      padding: 8px 10px;
      margin-top: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
      font-weight: bold;
      transition: all 0.15s;
    }
    .acc-reset:hover {
      background: #d32f2f;
      color: #fff;
      border-color: #d32f2f;
    }

    /* ── Tamaño de texto (Preciso sin cascada excesiva) ── */
    body.acc-large p, body.acc-large li, body.acc-large h1, body.acc-large h2, body.acc-large h3, body.acc-large label, body.acc-large input, body.acc-large textarea, body.acc-large .p-parrafoCitado, body.acc-large .p-parrafoCitadoCita, body.acc-large .footnote { 
      font-size: 1.25em !important; 
    }
    body.acc-large .fanzine-link { font-size: clamp(40px, 10vw, 70px) !important; }
    body.acc-large .menu-links a { font-size: clamp(20px, 3.75vw, 27.5px) !important; }

    body.acc-xlarge p, body.acc-xlarge li, body.acc-xlarge h1, body.acc-xlarge h2, body.acc-xlarge h3, body.acc-xlarge label, body.acc-xlarge input, body.acc-xlarge textarea, body.acc-xlarge .p-parrafoCitado, body.acc-xlarge .p-parrafoCitadoCita, body.acc-xlarge .footnote { 
      font-size: 1.5em !important; 
    }
    body.acc-xlarge .fanzine-link { font-size: clamp(48px, 12vw, 84px) !important; }
    body.acc-xlarge .menu-links a { font-size: clamp(24px, 4.5vw, 33px) !important; }

    /* Prevenir el efecto compuesto en elementos anidados */
    body.acc-large p *, body.acc-large li *, body.acc-large h1 *, body.acc-large h2 *, body.acc-large h3 *, body.acc-large label *, body.acc-large .footnote *,
    body.acc-xlarge p *, body.acc-xlarge li *, body.acc-xlarge h1 *, body.acc-xlarge h2 *, body.acc-xlarge h3 *, body.acc-xlarge label *, body.acc-xlarge .footnote * { 
      font-size: 1em !important; 
    }

    /* ── Alto contraste ── */
    body.acc-contrast, 
    body.acc-contrast .menu, 
    body.acc-contrast .parent, 
    body.acc-contrast .contact-container,
    body.acc-contrast .header-container, 
    body.acc-contrast .contact-form, 
    body.acc-contrast nav,
    body.acc-contrast main, 
    body.acc-contrast section, 
    body.acc-contrast div:not(#acc-widget):not(#acc-widget *), 
    body.acc-contrast footer {
      background-color: #000 !important;
    }
    
    body.acc-contrast p, body.acc-contrast h1, body.acc-contrast h2, body.acc-contrast h3,
    body.acc-contrast li, body.acc-contrast span, body.acc-contrast label, body.acc-contrast .fanzine-subtitle, body.acc-contrast .p-parrafoCitado, body.acc-contrast .p-parrafoCitadoCita, body.acc-contrast .footnote, body.acc-contrast .cita-bloque, body.acc-contrast strong, body.acc-contrast em {
      color: #ffff00 !important;
      border-color: #ffff00 !important;
    }
    
    body.acc-contrast a, body.acc-contrast a * { 
      color: #00ffff !important; 
      text-decoration: underline !important;
    }
    
    /* Ajuste específico para el menú en contraste */
    body.acc-contrast .menu-toggle-icon::before {
      background-color: #ffff00 !important;
      box-shadow: 0 9px 0 #ffff00, 0 -9px 0 #ffff00 !important;
    }

    body.acc-contrast img:not(#acc-widget *) {
      background-color: #fff !important;
      filter: contrast(120%) !important;
      outline: 2px solid #ffff00 !important;
    }
    
    body.acc-contrast input, body.acc-contrast textarea {
      background-color: #000 !important;
      color: #ffff00 !important;
      border: 2px solid #ffff00 !important;
    }
    body.acc-contrast input::placeholder, body.acc-contrast textarea::placeholder {
      color: #cccc00 !important;
    }
    body.acc-contrast button:not(#acc-widget *) {
      background-color: #ffff00 !important;
      color: #000 !important;
      border: 2px solid #ffff00 !important;
    }

    /* Panel en modo contraste */
    body.acc-contrast #acc-toggle { background-color: #222 !important; border-color: #ffff00 !important; color: #ffff00 !important; }
    body.acc-contrast #acc-panel { background-color: #111 !important; border-color: #ffff00 !important; }
    body.acc-contrast #acc-panel h3, body.acc-contrast .acc-row, body.acc-contrast .acc-btn,
    body.acc-contrast .acc-toggle-btn, body.acc-contrast .acc-reset, body.acc-contrast .acc-section-label, body.acc-contrast #acc-close {
      color: #ffff00 !important; border-color: #ffff00 !important;
    }
    body.acc-contrast .acc-btn.acc-active, body.acc-contrast .acc-toggle-btn.acc-active {
      background: #ffff00 !important; color: #000 !important;
    }

    /* ── Escala de grises ── */
    html.acc-grayscale { filter: grayscale(100%); }

    /* ── Subrayar enlaces ── */
    body.acc-underline a { text-decoration: underline !important; }

    /* ── Fuente para dislexia ── */
    body.acc-dyslexia p, body.acc-dyslexia li, body.acc-dyslexia td,
    body.acc-dyslexia span, body.acc-dyslexia h1, body.acc-dyslexia h2,
    body.acc-dyslexia h3, body.acc-dyslexia h4, body.acc-dyslexia a,
    body.acc-dyslexia label, body.acc-dyslexia input, body.acc-dyslexia textarea,
    body.acc-dyslexia .fanzine-link, body.acc-dyslexia .menu-links a, body.acc-dyslexia .footnote {
      font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
      letter-spacing: 0.1em !important;
      word-spacing: 0.2em !important;
      line-height: 1.8 !important;
      font-weight: normal !important;
    }

    /* ── Pausa de animaciones ── */
    body.acc-no-anim *, body.acc-no-anim *::before, body.acc-no-anim *::after {
      animation: none !important;
      animation-duration: 0s !important;
      transition: none !important;
    }
    body.acc-no-anim video { display: none !important; }
    body.acc-no-anim img[src$=".gif"] { visibility: hidden !important; }

    /* ── Cursor ampliado ── */
    body.acc-big-cursor, body.acc-big-cursor * {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpolygon points='4,2 4,28 12,20 18,34 22,32 16,18 28,18' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 2, auto !important;
    }
    body.acc-contrast.acc-big-cursor, body.acc-contrast.acc-big-cursor * {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpolygon points='4,2 4,28 12,20 18,34 22,32 16,18 28,18' fill='%23ffff00' stroke='black' stroke-width='2'/%3E%3C/svg%3E") 4 2, auto !important;
    }

    /* ── Ocultar imágenes ── */
    body.acc-no-images img, body.acc-no-images iframe { visibility: hidden !important; }

    /* ── Enfoque de lectura ── */
    body.acc-reading-focus p:hover,
    body.acc-reading-focus li:hover,
    body.acc-reading-focus h1:hover,
    body.acc-reading-focus h2:hover,
    body.acc-reading-focus h3:hover,
    body.acc-reading-focus .cita-bloque:hover {
      background: rgba(255,255,180,0.6) !important;
      outline: 3px solid rgba(180,160,0,0.5) !important;
      border-radius: 4px;
      color: #000 !important;
    }
    body.acc-contrast.acc-reading-focus p:hover,
    body.acc-contrast.acc-reading-focus li:hover,
    body.acc-contrast.acc-reading-focus h1:hover,
    body.acc-contrast.acc-reading-focus h2:hover,
    body.acc-contrast.acc-reading-focus h3:hover,
    body.acc-contrast.acc-reading-focus .cita-bloque:hover {
      background: #333 !important;
      outline: 3px solid #ffff00 !important;
      color: #ffff00 !important;
    }

    /* ── Espaciado de texto ── */
    body.acc-spacing-1 p, body.acc-spacing-1 li, body.acc-spacing-1 h1, body.acc-spacing-1 h2, body.acc-spacing-1 h3, body.acc-spacing-1 .cita-bloque, body.acc-spacing-1 .footnote {
      line-height: 2 !important;
      letter-spacing: 0.05em !important;
    }
    body.acc-spacing-2 p, body.acc-spacing-2 li, body.acc-spacing-2 h1, body.acc-spacing-2 h2, body.acc-spacing-2 h3, body.acc-spacing-2 .cita-bloque, body.acc-spacing-2 .footnote {
      line-height: 2.5 !important;
      letter-spacing: 0.1em !important;
      word-spacing: 0.2em !important;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HTML del widget ──────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.id = 'acc-widget';
  wrapper.innerHTML = `
    <button id="acc-toggle" aria-label="Abrir opciones de accesibilidad" aria-expanded="false" title="Accesibilidad">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="4" r="2"></circle>
        <path d="M4 9h16"></path>
        <path d="M12 9v8"></path>
        <path d="M8 22l4-5 4 5"></path>
      </svg>
    </button>
    <div id="acc-panel" role="dialog" aria-label="Panel de accesibilidad" aria-modal="true">
      <div class="acc-header">
        <h3>Accesibilidad</h3>
        <button id="acc-close" aria-label="Cerrar panel" title="Cerrar">&times;</button>
      </div>

      <p class="acc-section-label">Texto</p>
      <div class="acc-row">
        <span>Tamaño</span>
        <div class="acc-size-btns" role="group" aria-label="Opciones de tamaño de texto">
          <button class="acc-btn" data-size="normal" aria-pressed="true" title="Tamaño normal">A</button>
          <button class="acc-btn" data-size="large" aria-pressed="false" title="Texto grande">A+</button>
          <button class="acc-btn" data-size="xlarge" aria-pressed="false" title="Texto muy grande">A++</button>
        </div>
      </div>
      <div class="acc-row">
        <span>Espaciado</span>
        <div class="acc-spacing-btns" role="group" aria-label="Opciones de espaciado de texto">
          <button class="acc-btn" data-spacing="0" aria-pressed="true" title="Sin espaciado extra">—</button>
          <button class="acc-btn" data-spacing="1" aria-pressed="false" title="Espaciado medio">≡</button>
          <button class="acc-btn" data-spacing="2" aria-pressed="false" title="Espaciado amplio">≣</button>
        </div>
      </div>
      <button class="acc-toggle-btn" data-feat="dyslexia" aria-pressed="false">Fuente para dislexia</button>

      <p class="acc-section-label">Color y visión</p>
      <button class="acc-toggle-btn" data-feat="contrast" aria-pressed="false">Alto contraste</button>
      <button class="acc-toggle-btn" data-feat="grayscale" aria-pressed="false">Escala de grises</button>

      <p class="acc-section-label">Navegación</p>
      <button class="acc-toggle-btn" data-feat="underline" aria-pressed="false">Subrayar enlaces</button>
      <button class="acc-toggle-btn" data-feat="bigCursor" aria-pressed="false">Cursor ampliado</button>
      <button class="acc-toggle-btn" data-feat="readingFocus" aria-pressed="false">Enfoque de lectura</button>

      <p class="acc-section-label">Contenido</p>
      <button class="acc-toggle-btn" data-feat="noAnim" aria-pressed="false">Pausar animaciones</button>
      <button class="acc-toggle-btn" data-feat="noImages" aria-pressed="false">Ocultar imágenes</button>

      <button class="acc-reset">Restablecer todo</button>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ── Estado ───────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'tdb-acc';
  const defaults = {
    size: 'normal', spacing: '0',
    contrast: false, grayscale: false,
    underline: false, dyslexia: false,
    bigCursor: false, readingFocus: false,
    noAnim: false, noImages: false
  };

  function loadState() {
    try { 
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return Object.assign({}, defaults, JSON.parse(stored));
      return Object.assign({}, defaults);
    } catch (e) { 
      return Object.assign({}, defaults); 
    }
  }

  function saveState(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn('localStorage no disponible', e);
    }
  }

  function applyState(s) {
    const b = document.body;
    const html = document.documentElement;

    // Tamaño de texto
    b.classList.remove('acc-large', 'acc-xlarge');
    if (s.size === 'large')  b.classList.add('acc-large');
    if (s.size === 'xlarge') b.classList.add('acc-xlarge');

    // Espaciado
    b.classList.remove('acc-spacing-1', 'acc-spacing-2');
    if (s.spacing === '1') b.classList.add('acc-spacing-1');
    if (s.spacing === '2') b.classList.add('acc-spacing-2');

    // Toggles booleanos en body
    b.classList.toggle('acc-contrast',      !!s.contrast);
    b.classList.toggle('acc-underline',     !!s.underline);
    b.classList.toggle('acc-dyslexia',      !!s.dyslexia);
    b.classList.toggle('acc-big-cursor',    !!s.bigCursor);
    b.classList.toggle('acc-reading-focus', !!s.readingFocus);
    b.classList.toggle('acc-no-anim',       !!s.noAnim);
    b.classList.toggle('acc-no-images',     !!s.noImages);

    // Toggles en HTML
    html.classList.toggle('acc-grayscale',  !!s.grayscale);

    // Sincronizar botones de tamaño
    document.querySelectorAll('[data-size]').forEach(function (btn) {
      const isActive = btn.dataset.size === s.size;
      btn.classList.toggle('acc-active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Sincronizar botones de espaciado
    document.querySelectorAll('[data-spacing]').forEach(function (btn) {
      const isActive = btn.dataset.spacing === s.spacing;
      btn.classList.toggle('acc-active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Sincronizar toggles
    document.querySelectorAll('[data-feat]').forEach(function (btn) {
      const isActive = !!s[btn.dataset.feat];
      btn.classList.toggle('acc-active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  // ── Inicializar ──────────────────────────────────────────────────────────
  let state = loadState();
  applyState(state);

  const toggle = document.getElementById('acc-toggle');
  const panel  = document.getElementById('acc-panel');
  const closeBtn = document.getElementById('acc-close');

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const open = panel.classList.toggle('acc-open');
    toggle.setAttribute('aria-expanded', open);
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.remove('acc-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) {
      panel.classList.remove('acc-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Tamaño de texto
  document.querySelectorAll('[data-size]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.size = btn.dataset.size;
      saveState(state);
      applyState(state);
    });
  });

  // Espaciado de texto
  document.querySelectorAll('[data-spacing]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.spacing = btn.dataset.spacing;
      saveState(state);
      applyState(state);
    });
  });

  // Toggles booleanos
  document.querySelectorAll('[data-feat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state[btn.dataset.feat] = !state[btn.dataset.feat];
      saveState(state);
      applyState(state);
    });
  });

  // Restablecer
  document.querySelector('.acc-reset').addEventListener('click', function () {
    state = Object.assign({}, defaults);
    saveState(state);
    applyState(state);
  });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibility);
  } else {
    initAccessibility();
  }

})();