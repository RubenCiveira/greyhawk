// Índice de personajes: carga el character-data.js de cada carpeta de personajes.js y pinta una tarjeta.
// Se cargan de uno en uno porque cada archivo define window.CHARACTER.
(() => {
  'use strict';
  const grid = document.getElementById('roster');
  const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const card = (folder, c) => {
    const im = c.images || {};
    const meta = [`${c.className || ''} ${c.level ?? ''}`.trim(), c.race, c.alignment].filter(Boolean).map(esc).join(' · ');
    return `<article class="roster-card">
      <a class="roster-portrait" href="${folder}/index.html"><img src="${folder}/personaje/${esc(im.portrait || 'heroe.png')}" alt="${esc(im.portraitAlt || c.name)}"></a>
      <h2><a href="${folder}/index.html">${esc(c.name)}</a></h2>
      ${c.subtitle ? `<p class="roster-sub">${esc(c.subtitle)}</p>` : ''}
      <p class="roster-meta">${meta}</p>
      <nav class="roster-links">
        <a href="${folder}/index.html">Completa</a>
        <a href="${folder}/ficha/index.html">Ficha</a>
        <a href="${folder}/presentacion/index.html">Presentación</a>
        <a href="${folder}/historia/index.html">Historia</a>
      </nav>
    </article>`;
  };
  const missing = folder => `<article class="roster-card roster-missing">
      <h2>${esc(folder)}</h2><p class="roster-meta">No se encontró <code>${esc(folder)}/personaje/character-data.js</code></p>
    </article>`;

  const folders = window.PERSONAJES || [];
  if (!folders.length) grid.innerHTML = '<p class="roster-empty">No hay personajes registrados en personajes.js.</p>';

  const load = i => {
    if (i >= folders.length) return;
    const folder = folders[i];
    const slot = document.createElement('div');
    slot.className = 'roster-slot';
    grid.append(slot);
    window.CHARACTER = undefined;
    const s = document.createElement('script');
    s.src = `${folder}/personaje/character-data.js`;
    s.onload = () => { slot.outerHTML = window.CHARACTER ? card(folder, window.CHARACTER) : missing(folder); s.remove(); load(i + 1); };
    s.onerror = () => { slot.outerHTML = missing(folder); s.remove(); load(i + 1); };
    document.head.append(s);
  };
  load(0);
})();
