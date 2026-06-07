/* ============================================================
 * tapd-fab.js — the persistent "Capture this moment" button.
 * Gold, pulsing, floating bottom-right. Skips itself on capture.html.
 * Include with: <script src="tapd-fab.js" defer></script>
 * ============================================================ */
(function () {
  if (/capture\.html$/.test(location.pathname)) return; // not on the capture page itself

  const css = `
    .tapd-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 1000;
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, #E0BE6E 0%, #B8902E 100%);
      color: #1a1410; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 30px rgba(184,144,46,0.42), 0 3px 10px rgba(0,0,0,0.15);
      font-family: 'Manrope', -apple-system, sans-serif;
      animation: tapd-fab-bob 3.2s ease-in-out infinite;
      transition: transform 0.18s ease;
      text-decoration: none;
    }
    .tapd-fab:hover { transform: scale(1.06); }
    .tapd-fab:active { transform: scale(0.96); }
    .tapd-fab::before {
      content: ''; position: absolute; inset: -10px; border-radius: 50%;
      background: radial-gradient(circle, rgba(224,190,110,0.55), transparent 65%);
      animation: tapd-fab-pulse 2.2s ease-in-out infinite;
      pointer-events: none; z-index: -1;
    }
    .tapd-fab-icon { width: 26px; height: 26px; position: relative; }
    .tapd-fab-label {
      position: absolute; right: 78px; top: 50%; transform: translateY(-50%);
      background: rgba(24,20,16,0.94); color: #fff;
      padding: 9px 14px; border-radius: 999px; font-size: 13px; font-weight: 600;
      white-space: nowrap; opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease; letter-spacing: 0.005em;
    }
    .tapd-fab:hover .tapd-fab-label { opacity: 1; }
    @keyframes tapd-fab-pulse {
      0%, 100% { transform: scale(0.88); opacity: 0.75; }
      55%      { transform: scale(1.45); opacity: 0;    }
    }
    @keyframes tapd-fab-bob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @media (max-width: 480px) {
      .tapd-fab { bottom: 20px; right: 20px; width: 60px; height: 60px; }
      .tapd-fab-label { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .tapd-fab, .tapd-fab::before { animation: none; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function inject() {
    if (document.querySelector('.tapd-fab')) return;
    const btn = document.createElement('a');
    btn.className = 'tapd-fab';
    btn.href = 'capture.html';
    btn.setAttribute('aria-label', 'New capture');
    btn.innerHTML = `
      <svg class="tapd-fab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/>
        <path d="M6 11a6 6 0 0 0 12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="tapd-fab-label">Capture this moment</span>
    `;
    document.body.appendChild(btn);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
