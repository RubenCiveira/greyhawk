// Generador de la ficha D&D 3.5 y de las hojas de presentación/historia.
// No contiene nada del personaje: todo sale de <personaje>/personaje/character-data.js, presentacion.js e historia.js.
// Cada HTML indica en <body>:
//   data-root  ruta a la raíz del proyecto (app.js, CSS, índice)
//   data-char  ruta a la carpeta del personaje (la que contiene personaje/)
//   data-view  qué mostrar:
//   todo         ficha + presentación/historia según el selector de la barra (<personaje>/index.html)
//   ficha        solo la ficha
//   presentacion solo la presentación
//   historia     solo la historia
(() => {
  'use strict';
  const c = window.CHARACTER;
  const CHAR = document.body.dataset.char || '';
  const VIEW = document.body.dataset.view || 'todo';
  const asset = file => `${CHAR}personaje/${file}`;

  const $ = id => document.getElementById(id);
  const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ED = 'contenteditable="true" spellcheck="false"';
  const mod = n => Math.floor((n - 10) / 2);
  const fmt = n => (n >= 0 ? '+' + n : String(n).replace('-', '−'));
  const m = k => mod(c.abilities[k]);

  document.title = `${c.name} · ${{ todo: 'Ficha D&D 3.5', ficha: 'Ficha D&D 3.5', presentacion: 'Presentación', historia: 'Historia' }[VIEW]}`;

  // ---------- Encuadre de imágenes del personaje → variables CSS de theme.css ----------
  const im = c.images || {};
  const setVar = (name, value, unit = '') => { if (value != null) document.documentElement.style.setProperty(name, value + unit); };
  setVar('--portrait-top', im.portraitTop, 'px');
  setVar('--img-size', im.portraitSize);
  setVar('--img-top', im.portraitOffset, 'px');
  setVar('--figure-w', im.figureWidth, 'px');
  setVar('--figure-h', im.figureHeight, 'px');
  setVar('--figure-shape', im.figureShape);

  const app = $('app');

  // =====================================================================
  //  FICHA
  // =====================================================================
  const sheetHtml = () => {
    // Cálculos D&D 3.5
    const L = c.level;
    const bab = { full: L, medium: Math.floor(L * 3 / 4), poor: Math.floor(L / 2) }[c.bab || 'full'];
    const good = new Set(c.goodSaves || []);
    const baseSave = k => (good.has(k) ? 2 + Math.floor(L / 2) : Math.floor(L / 3));
    const saves = [
      ['Fort', 'fort', baseSave('fort') + m('con')],
      ['Ref', 'ref', baseSave('ref') + m('dex')],
      ['Vol', 'will', baseSave('will') + m('wis')]
    ];
    const armor = c.armor || {}, shield = c.shield || {};
    const ac = 10 + (armor.bonus || 0) + (shield.bonus || 0) + Math.min(m('dex'), armor.maxDex ?? Infinity);
    const hp = c.hp ?? (c.hitDie + m('con'));
    const acp = (armor.checkPenalty || 0) + (shield.checkPenalty || 0);
    const skillTotal = s => s.ranks + m(s.ability) + (s.armorCheck ? acp : 0);

    // Características: medallones sobre el arco
    const abilityNames = { str: 'Fuerza', dex: 'Destreza', con: 'Constitución', int: 'Inteligencia', wis: 'Sabiduría', cha: 'Carisma' };
    const medals = Object.entries(abilityNames).map(([k, label]) =>
      `<div class="medal ab-${k}"><div class="face">${c.abilities[k]}</div><i class="mod">${fmt(m(k))}</i><span class="tag">${label}</span></div>`).join('');

    const saveRow = saves.map(([label, cls, v]) =>
      `<div class="save ${cls}"><b class="coin">${fmt(v)}</b><span class="flag">${label}</span></div>`).join('');

    // Libro de habilidades (rellena con líneas vacías como en la hoja original)
    const ROWS = 18;
    const skillRows = c.skills.map(s => {
      const pen = s.armorCheck ? acp : 0;
      const ab = s.ability.toUpperCase();
      const tip = `${s.ranks} rangos ${fmt(m(s.ability))} ${ab}` + (pen ? ` ${fmt(pen)} armadura` : '');
      return `<div class="skill" title="${tip}"><i class="dot on"></i><span>${esc(s.name)}${pen ? '*' : ''} <small>(${ab})</small></span><em>${s.ranks}</em><b>${fmt(skillTotal(s))}</b></div>`;
    });
    while (skillRows.length < ROWS) skillRows.push(`<div class="skill empty"><i class="dot"></i><span ${ED}></span><em></em><b></b></div>`);

    const spotName = c.spotlightSkill;
    const spot = spotName && c.skills.find(s => s.name === spotName);

    // Armas: primera fila nombre y crítico; después una fila por alcance (o cuerpo a cuerpo) con ataque y daño.
    // A distancia: −2 al ataque por cada incremento tras el primero.
    const applies = (b, dist) => dist >= (b.minRange ?? 0) && dist <= (b.maxRange ?? Infinity);
    const weaponRows = w => {
      const bonuses = w.bonuses || [];
      const row = (label, dist, penalty) => {
        const active = bonuses.filter(b => applies(b, dist));
        const atk = bab + m(w.ability) + penalty + active.reduce((t, b) => t + (b.attack || 0), 0);
        const dmg = m(w.damageAbility) + active.reduce((t, b) => t + (b.damage || 0), 0);
        return `<tr${active.length ? ` class="bonus" title="${esc(active.map(b => b.source).join(', '))}"` : ''}>
          <td>${label}${active.length ? ' *' : ''}</td><td>${fmt(atk)}</td><td>${esc(w.damage)}${fmt(dmg)}</td></tr>`;
      };
      if (!w.rangeIncrement) return row('Cuerpo a cuerpo', 0, 0);
      const rows = [];
      for (let i = 1; i <= (w.maxIncrements || 5); i++) {
        const from = (i - 1) * w.rangeIncrement + 1, to = i * w.rangeIncrement;
        rows.push(row(i === 1 ? `≤ ${to} pies` : `${from}–${to} pies`, to, -2 * (i - 1)));
      }
      return rows.join('');
    };
    const rangeText = b => b.minRange != null && b.maxRange != null ? ` (${b.minRange}–${b.maxRange} pies)`
      : b.maxRange != null ? ` (hasta ${b.maxRange} pies)` : b.minRange != null ? ` (desde ${b.minRange} pies)` : '';
    const weapons = c.weapons.map(w => `<div class="weapon">
        <div class="w-row w-head">
          <label class="w-name">Arma<span>${esc(w.name)}</span></label>
          <label>Crítico<span>${esc(w.critical)}</span></label>
        </div>
        <table class="w-table">
          <thead><tr><th>${w.rangeIncrement ? 'Alcance' : 'Tipo'}</th><th>Ataque</th><th>Daño</th></tr></thead>
          <tbody>${weaponRows(w)}</tbody>
        </table>
        ${(w.bonuses || []).map(b => `<small>* ${esc(b.source)}: ${fmt(b.attack || 0)} ataque / ${fmt(b.damage || 0)} daño${rangeText(b)}</small>`).join('')}
      </div>`).join('');

    const list = items => (items || []).map(v => `<li ${ED}>${esc(v)}</li>`).join('');
    const extra = c.extraField;

    return `<main class="sheet">
  <header class="head">
    <div class="nameplate">
      <div class="eyebrow">DUNGEONS &amp; DRAGONS · 3.5</div>
      <h1 ${ED}>${esc(c.name)}</h1>
      <div class="subtitle" ${ED}>${esc(c.subtitle)}</div>
    </div>
    <div class="scroll">
      <div class="scroll-body identity">
        <div><strong ${ED}>${esc(c.className)} ${c.level}</strong><small>Clase y nivel</small></div>
        <div><strong ${ED}>${esc(c.background)}</strong><small>Antecedente</small></div>
        <div><strong ${ED}>${esc(c.player)}</strong><small>Jugador</small></div>
        <div><strong ${ED}>${esc(c.race)}</strong><small>Raza</small></div>
        <div><strong ${ED}>${esc(c.alignment)}</strong><small>Alineamiento</small></div>
        <div><strong ${ED}>${esc(c.xp)}</strong><small>Puntos de experiencia</small></div>
      </div>
    </div>
  </header>

  <section class="stage">
    <svg class="stage-art" viewBox="0 0 766 590" aria-hidden="true">
      <defs>
        <linearGradient id="goldArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7a5418"/><stop offset=".25" stop-color="#f6dc8a"/>
          <stop offset=".5" stop-color="#a8772c"/><stop offset=".72" stop-color="#fbe7a2"/>
          <stop offset="1" stop-color="#8a5f22"/>
        </linearGradient>
        <path id="runeRing" d="M480 128 a212 212 0 1 1 -0.1 0"/>
      </defs>
      <g class="magic" fill="none">
        <circle cx="480" cy="340" r="232"/>
        <circle cx="480" cy="340" r="222" stroke-width=".6"/>
        <circle cx="480" cy="340" r="196"/>
        <circle cx="480" cy="340" r="120" stroke-width=".6"/>
        <polygon points="480,144 650,438 310,438"/>
        <polygon points="480,536 310,242 650,242"/>
        <text><textPath href="#runeRing">ᚠᚢᚦᚨᚱᚲ ᚷᚹᚺᚾᛁᛃ ᛇᛈᛉᛊᛏᛒ ᛖᛗᛚᛜᛞᛟ ᚠᚢᚦᚨᚱᚲ ᚷᚹᚺᚾᛁᛃ ᛇᛈᛉᛊᛏᛒ ᛖᛗᛚᛜᛞᛟ ᚠᚢᚦᚨᚱᚲ ᚷᚹᚺᚾᛁᛃ ᛇᛈᛉ</textPath></text>
      </g>
      <path class="arc-shadow" d="M268 300 C 262 120, 560 30, 676 196 S 742 430, 690 512"/>
      <path class="arc" d="M268 300 C 262 120, 560 30, 676 196 S 742 430, 690 512"/>
    </svg>

    <div class="portrait"><img src="${asset(im.portrait || 'heroe.png')}" alt="${esc(im.portraitAlt || c.name)}"></div>

    <div class="badge b-bab"><span class="ribbon gold">Ataque base</span><b class="coin">${fmt(bab)}</b></div>
    <div class="badge b-grapple"><span class="ribbon purple">Presa</span><b class="coin">${fmt(bab + m('str'))}</b></div>
    <div class="badge b-init"><span class="ribbon red">Iniciativa</span><b class="coin">${fmt(m('dex'))}</b></div>
    <div class="shield"><b>${ac}</b><span>CA</span></div>

    <div class="saves">
      <div class="crest">Tiradas de salvación</div>
      <div class="save-row">${saveRow}</div>
    </div>

    <div class="book">
      <div class="book-title">Habilidades</div>
      <div class="book-lines">${skillRows.join('')}</div>
      <div class="book-foot">${acp ? `* Incluye penalizador por armadura ${fmt(acp)}` : ''}</div>
    </div>

    <div>${medals}</div>

    ${spot ? `<div class="eye"><small>${esc(spotName)}</small><b>${fmt(skillTotal(spot))}</b></div>` : ''}
    <div class="speed"><b>${c.speed} pies</b><span>Velocidad</span></div>
  </section>

  <section class="bottom">
    <div class="card attacks">
      <h2 class="bar">Ataques y armas</h2>
      <div>${weapons}</div>
      <div class="lined">
        ${c.weaponsNote ? `<p class="note">${esc(c.weaponsNote)}</p>` : ''}
        <p><span class="label">Equipo:</span> <span ${ED}>${esc((c.equipment || []).join(', '))}.</span></p>
      </div>
    </div>

    <div class="card vitals">
      <h2 class="bar">Puntos de golpe</h2>
      <div class="hp-top">
        <div><small>Dado de golpe</small><b>d${c.hitDie}</b></div>
        <div><small>PG máximos</small><b>${hp}</b></div>
      </div>
      <div class="hp-current"><div ${ED}></div><small>PG actuales</small></div>
      <div class="hp-sub">
        <div><small>Daño no letal</small><span ${ED}></span></div>
        <div><small>${esc(extra ? extra.label : '')}</small><span ${ED}>${esc(extra ? extra.value : '')}</span></div>
      </div>
      <h3 class="sub">Dotes</h3>
      <ul class="lined">${list(c.feats)}</ul>
      <h3 class="sub">Notas de campaña</h3>
      <div class="lined notes" ${ED}>${(c.campaignNotes || []).map(esc).join('<br>')}</div>
    </div>

    <div class="card traits">
      <h2 class="bar">Rasgos e historia</h2>
      <div class="lined">
        <ul>${list(c.features)}</ul>
        ${c.progression ? `<p><span class="label">Progresión:</span> <span ${ED}>${esc(c.progression)}</span></p>` : ''}
        ${c.story ? `<p><span class="label">Historia:</span> <span ${ED}>${esc(c.story)}</span></p>` : ''}
      </div>
    </div>
  </section>
</main>`;
  };

  // =====================================================================
  //  PRESENTACIÓN E HISTORIA: Markdown sencillo paginado en hojas A4
  // =====================================================================
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Agrupa líneas en bloques: una línea en blanco cierra párrafo; títulos y --- van siempre solos.
  const parse = md => {
    const blocks = [];
    let buf = [];
    const flush = () => {
      if (!buf.length) return;
      const t = buf.join('\n').trim();
      // Un salto de línea con dos espacios al final se convierte en <br>
      const html = buf.map((l, i) => inline(l.trim()) + (i < buf.length - 1 ? (/ {2}$/.test(l) ? '<br>' : ' ') : '')).join('');
      blocks.push({ tag: 'p', html, lines: buf.map(l => inline(l.trim())), italic: /^\*[^*][\s\S]*\*$/.test(t) });
      buf = [];
    };
    for (const line of md.split('\n')) {
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) { flush(); blocks.push({ tag: 'h' + h[1].length, html: inline(h[2].trim()) }); }
      else if (line.trim() === '---') { flush(); blocks.push({ tag: 'hr' }); }
      else if (!line.trim()) flush();
      else buf.push(line);
    }
    flush();
    return blocks;
  };

  const overflows = el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;

  // Maqueta un texto en hojas nuevas al final de host y devuelve las hojas creadas.
  const renderPrelude = (host, md, eyebrow) => {
    const blocks = parse(md);
    // Cabecera: todo lo anterior al primer capítulo (##)
    const firstChapter = Math.max(0, blocks.findIndex(b => b.tag === 'h2'));
    const head = blocks.slice(0, firstChapter);
    const body = blocks.slice(firstChapter);
    const title = head.find(b => b.tag === 'h1');
    const paras = head.filter(b => b.tag === 'p');
    const subtitle = paras.find(b => b.italic && !b.html.includes('«'));
    const epigraph = paras.find(b => b.italic && b.html.includes('«'));
    const meta = paras.filter(b => !b.italic);

    const pages = [];
    const newPage = () => {
      const page = document.createElement('section');
      page.className = 'sheet prelude';
      // Primera hoja: zona con la figura flotante (el texto rodea la silueta) + zona a dos columnas.
      page.innerHTML = pages.length === 0
        ? `<div class="prose pre-wrap">
             <img class="pre-figure" src="${asset(im.figure || 'heroe-full.png')}" alt="${esc(im.figureAlt || c.name)}">
             <div class="pre-title">
               <div class="eyebrow">${eyebrow}</div>
               <h1>${title ? title.html : esc(c.name)}</h1>
               ${subtitle ? `<p class="pre-sub">${subtitle.html}</p>` : ''}
               ${meta.length ? `<div class="pre-meta">${meta.map(b => `<p>${b.lines.join('<br>')}</p>`).join('')}</div>` : ''}
               ${epigraph ? `<blockquote>${epigraph.html}</blockquote>` : ''}
             </div>
           </div>`
        : `<div class="pre-band">${title ? title.html : esc(c.name)}</div>`;
      page.insertAdjacentHTML('beforeend', `<div class="prose"></div><div class="pre-folio"></div>`);
      host.append(page);
      pages.push(page);
      return [...page.querySelectorAll('.prose')]; // zonas a rellenar, en orden
    };

    let slots = newPage();
    let prose = slots.shift();
    let afterHeading = false, inNotes = false;
    for (const b of body) {
      if (b.tag === 'h3') inNotes = true;
      const el = document.createElement(b.tag);
      if (b.html) el.innerHTML = b.html;
      if (b.tag === 'p' && afterHeading) el.className = 'lead';
      if (b.tag === 'p' && inNotes) el.className = 'trait';
      if (b.tag === 'h3') el.className = 'notes-title';
      afterHeading = b.tag === 'h2';
      prose.append(el);
      if (overflows(prose)) {
        // Pasa a la siguiente zona sin dejar títulos ni separadores huérfanos
        const moved = [el];
        el.remove();
        while (prose.lastElementChild && /^(H2|H3|HR)$/.test(prose.lastElementChild.tagName)) moved.unshift(prose.lastElementChild);
        if (!slots.length) slots = newPage();
        prose = slots.shift();
        moved.forEach(x => prose.append(x));
      }
    }
    return pages;
  };

  const TEXTS = {
    presentacion: [window.PRESENTACION, 'PRESENTACIÓN · DUNGEONS &amp; DRAGONS 3.5'],
    historia: [window.HISTORIA, 'HISTORIA · DUNGEONS &amp; DRAGONS 3.5']
  };
  // Opciones del selector de index.html
  const CHOICES = { presentacion: ['presentacion'], historia: ['historia'], ambas: ['presentacion', 'historia'], ninguna: [] };

  // =====================================================================
  //  MONTAJE SEGÚN LA VISTA
  // =====================================================================
  const withSheet = VIEW === 'todo' || VIEW === 'ficha';
  if (withSheet) app.insertAdjacentHTML('beforeend', sheetHtml());
  const host = document.createElement('div');
  host.id = 'prelude';
  app.append(host);

  const select = $('prelude-select');
  const STORE = 'ficha-preludio';
  if (select) {
    let saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) { /* sin almacenamiento */ }
    if (saved && CHOICES[saved]) select.value = saved;
  }
  const currentTexts = () =>
    VIEW === 'todo' ? CHOICES[select ? select.value : 'ambas'] : VIEW === 'ficha' ? [] : [VIEW];

  const renderTexts = () => {
    host.replaceChildren();
    const pages = currentTexts().filter(k => TEXTS[k][0]).flatMap(k => renderPrelude(host, ...TEXTS[k]));
    const first = withSheet ? 2 : 1;
    pages.forEach((p, i) => { p.querySelector('.pre-folio').textContent = `— ${i + first} —`; });
  };

  // Escala las hojas A4 en pantallas estrechas (no afecta a la impresión)
  const sheets = () => [...document.querySelectorAll('.sheet')];
  const unzoom = () => sheets().forEach(s => { s.style.zoom = ''; });
  const fit = () => {
    const all = sheets();
    if (!all.length) return;
    const w = all[0].offsetWidth;
    const avail = document.documentElement.clientWidth - 16;
    all.forEach(s => { s.style.zoom = avail < w ? (avail / w).toFixed(3) : ''; });
  };

  if (select) select.addEventListener('change', () => {
    try { localStorage.setItem(STORE, select.value); } catch (e) { /* sin almacenamiento */ }
    unzoom();           // la paginación se mide a tamaño real
    renderTexts();
    fit();
  });
  renderTexts();
  fit();
  addEventListener('resize', fit);
  addEventListener('beforeprint', unzoom);
  addEventListener('afterprint', fit);
})();
