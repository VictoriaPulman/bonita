/* ============================================================
   БОНИТА И ЕЁ ДЛИННАЯ ЧЕЛКА
   script.js — рисуем комикс SVG-ами и листаем его «паровозиком».
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. ПАЛИТРА И МЕЛОЧИ
     --------------------------------------------------------- */
  const T = {
    ink: '#241c2b',
    fur: '#93a6bf',      // стальная шерсть йорка
    furD: '#74889f',
    furL: '#b3c2d6',
    tan: '#e2ac63',      // золотистая голова и лапки
    tanD: '#c2873f',
    tanL: '#f7dcaa',
    skin: '#ffd2ab',
    skinD: '#f0b58a',
    hairV: '#a2653a',    // Вика — длинные волосы
    hairA: '#3b3550',    // Андрей — короткие
    wood: '#c98a4b',
    woodD: '#a06a34',
    sky: '#bfe9ff',
    mint: '#9fe3c0',
    pink: '#ffc2d6',
    cream: '#fff6d8'
  };

  /* мелкие генераторы фона */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const checker = (x, y, w, h, size, a, b) => {
    let s = '';
    for (let r = 0; y + r * size < y + h; r++) {
      for (let c = 0; x + c * size < x + w; c++) {
        const cw = Math.min(size, x + w - (x + c * size));
        const ch = Math.min(size, y + h - (y + r * size));
        s += `<rect x="${x + c * size}" y="${y + r * size}" width="${cw}" height="${ch}" fill="${(r + c) % 2 ? a : b}"/>`;
      }
    }
    return s;
  };
  const stripes = (x, y, w, h, step, color) => {
    let s = '';
    for (let i = x; i < x + w; i += step) s += `<rect x="${i}" y="${y}" width="${step / 2}" height="${h}" fill="${color}"/>`;
    return s;
  };
  const planks = (y, h, color, line) => {
    let s = `<rect y="${y}" width="640" height="${h}" fill="${color}"/>`;
    for (let i = -20; i < 700; i += 70) {
      const top = clamp(320 + (i - 320) * 1.7, -30, 670);
      s += `<path d="M${Math.round(top)} ${y} L${i} ${y + h}" stroke="${line}" stroke-width="2" opacity=".45"/>`;
    }
    for (let k = 1; k < 4; k++) s += `<path d="M0 ${Math.round(y + k * h / 4)} H640" stroke="${line}" stroke-width="2" opacity=".35"/>`;
    return s;
  };
  const sunRays = (cx, cy, r, color, n) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 / n) * i;
      s += `<path d="M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L${cx + Math.cos(a + .12) * (r + 16)} ${cy + Math.sin(a + .12) * (r + 16)} L${cx + Math.cos(a - .12) * (r + 16)} ${cy + Math.sin(a - .12) * (r + 16)} Z" fill="${color}"/>`;
    }
    return s;
  };
  const sparkles = (pts, color) => pts.map(([x, y, r]) =>
    `<path d="M${x} ${y - r} Q${x + r * .3} ${y - r * .3} ${x + r} ${y} Q${x + r * .3} ${y + r * .3} ${x} ${y + r} Q${x - r * .3} ${y + r * .3} ${x - r} ${y} Q${x - r * .3} ${y - r * .3} ${x} ${y - r} Z" fill="${color}"/>`
  ).join('');
  const heart = (x, y, s, color) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 8C-12-2-10-14 0-10 10-14 12-2 0 8Z" fill="${color}"/>`;

  /* ---------------------------------------------------------
     2. БОНИТА — наш йоркширский терьер
     Локальные координаты: лапы на y = 0, мордой влево.
     --------------------------------------------------------- */
  function eyesFor(face) {
    const e = T.ink;
    switch (face) {
      case 'happy':
        return `<path d="M-26 -8 q6 -8 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-6 -10 q6 -8 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-38 8 q8 9 16 1 q-8 -2 -16 -1Z" fill="${e}"/>
                <path d="M-31 12 q4 10 10 1Z" fill="#ff6f91"/>`;
      case 'proud':
        return `<path d="M-27 -9 q7 -9 13 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-5 -11 q7 -9 13 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-40 6 q9 16 22 2 q-11 -4 -22 -2Z" fill="${e}"/>
                <path d="M-31 12 q6 12 12 1Z" fill="#ff6f91"/>`;
      case 'peek':   // один глаз выглядывает из-под чёлки
        return `<circle cx="-2" cy="0" r="5.5" fill="${e}"/><circle cx="0" cy="-2" r="1.8" fill="#fff"/>`;
      case 'ouch':
        return `<path d="M-28 -8 l11 9 M-17 -8 l-11 9" stroke="${e}" stroke-width="4" stroke-linecap="round"/>
                <path d="M-4 -10 l11 9 M7 -10 l-11 9" stroke="${e}" stroke-width="4" stroke-linecap="round"/>
                <path d="M-36 10 q7 4 12 0" stroke="${e}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'sad':
        return `<path d="M-26 -4 q6 6 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-4 -6 q6 6 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-34 12 q6 -5 11 0" stroke="${e}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'think':
        return `<path d="M-27 -6 q6 -7 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-4 -8 q6 -7 12 0" stroke="${e}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M-36 8 q7 6 13 0" stroke="${e}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'see':   // оба глаза открыты — Бонита наконец видит
        return `<circle cx="-27" cy="-6" r="8" fill="#fff" stroke="${e}" stroke-width="3"/>
                <circle cx="-27" cy="-6" r="4.4" fill="${e}"/>
                <circle cx="-29" cy="-8" r="1.7" fill="#fff"/>
                <circle cx="-8" cy="-9" r="8" fill="#fff" stroke="${e}" stroke-width="3"/>
                <circle cx="-8" cy="-9" r="4.4" fill="${e}"/>
                <circle cx="-10" cy="-11" r="1.7" fill="#fff"/>
                <path d="M-32 9 q9 12 18 0 q-9 -5 -18 0Z" fill="${e}"/>
                <path d="M-25 14 q4 10 9 0Z" fill="#ff6f91"/>`;
      default:
        return '';
    }
  }

  /* чёлка: главный герой сюжета */
  function fringe(kind) {
    if (kind === 'curtain') {
      return `<path d="M-34 2 C-38 -20 -18 -42 6 -42 C26 -42 34 -30 34 -16
                        C22 -24 4 -20 -4 -4 C-10 8 -10 22 -18 30
                        C-26 38 -38 30 -38 18 Z" fill="${T.tanD}"/>
              <path d="M-30 10 C-24 26 -14 34 -6 40" stroke="${T.tan}" stroke-width="5" fill="none" stroke-linecap="round"/>
              <path d="M-34 16 C-30 30 -24 38 -20 44" stroke="${T.tan}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    if (kind === 'flat') {
      return `<path d="M-33 -6 C-32 -30 -14 -42 8 -40 C24 -38 32 -28 32 -14
                        C20 -22 2 -18 -8 -6 C-14 0 -20 -2 -33 -6 Z" fill="${T.tanD}"/>`;
    }
    if (kind === 'swept') {   // убрана вбок — оба глаза видно
      return `<path d="M2 -40 C18 -44 33 -31 34 -12 C27 -23 13 -26 2 -19
                        C-2 -15 -1 -32 2 -40Z" fill="${T.tanD}"/>
              <path d="M8 -33 C20 -30 28 -24 31 -15" stroke="${T.tan}" stroke-width="4.5"
                    fill="none" stroke-linecap="round"/>
              <path d="M6 -20 C16 -18 24 -14 28 -8" stroke="${T.tan}" stroke-width="3.5"
                    fill="none" stroke-linecap="round" opacity=".8"/>`;
    }
    // peek — чёлка чуть выше глаз
    return `<path d="M-33 -2 C-32 -28 -14 -42 8 -40 C24 -38 33 -28 33 -14
                      C20 -24 0 -22 -10 -8 C-16 -1 -22 0 -33 -2 Z" fill="${T.tanD}"/>
            <path d="M-24 -22 C-8 -30 12 -30 26 -22" stroke="${T.tan}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }

  function bonitaHead(face, opts) {
    const o = opts || {};
    return `
      <path d="M12 -24 C34 -32 46 -12 33 4 C22 13 8 4 12 -24Z" fill="${T.tanD}"/>
      <circle cx="0" cy="0" r="34" fill="${T.tan}"/>
      <ellipse cx="-22" cy="10" rx="21" ry="14" fill="${T.tanL}"/>
      <ellipse cx="-40" cy="0" rx="7.5" ry="6" fill="${T.ink}"/>
      <circle cx="-42" cy="-2" r="2" fill="#fff" opacity=".75"/>
      ${eyesFor(face)}
      ${fringe(o.fringe || 'peek')}
      <g class="bow">
        <path d="M18 -34 l-13 -9 v18Z" fill="#ff5d8f" stroke="${T.ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M18 -34 l13 -9 v18Z" fill="#ff5d8f" stroke="${T.ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="18" cy="-34" r="5" fill="#ff5d8f" stroke="${T.ink}" stroke-width="2.5"/>
      </g>`;
  }

  function bonita(o) {
    o = o || {};
    const s = o.s || 1;
    const fx = o.flip ? -1 : 1;
    const face = o.face || 'happy';
    const wag = o.wag === false ? '' : ' anim-wag';
    const tailUp = o.tail === 'up' ? -128 : (o.tail === 'low' ? -78 : -104);
    return `<g transform="translate(${o.x || 0} ${o.y || 0}) scale(${fx * s} ${s})">
      <ellipse cx="34" cy="5" rx="64" ry="8" fill="rgba(36,28,43,.16)"/>
      <g class="tail${wag}" style="transform-box: view-box; transform-origin: 88px -60px">
        <path d="M88 -60 C${112} -${Math.abs(tailUp) - 10} ${124} -${Math.abs(tailUp) - 2} 112 -${Math.abs(tailUp)}"
              fill="none" stroke="${T.tanD}" stroke-width="13" stroke-linecap="round"/>
        <circle cx="112" cy="-${Math.abs(tailUp)}" r="7" fill="${T.tan}"/>
      </g>
      <rect x="56" y="-30" width="15" height="30" rx="7" fill="${T.furD}"/>
      <rect x="78" y="-30" width="15" height="30" rx="7" fill="${T.furD}"/>
      <ellipse cx="26" cy="-52" rx="66" ry="34" fill="${T.fur}"/>
      <path d="M-22 -74 C-6 -70 2 -56 0 -42 C-2 -30 -12 -26 -20 -32 C-30 -40 -32 -68 -22 -74Z" fill="${T.furL}"/>
      <rect x="-18" y="-24" width="14" height="24" rx="7" fill="${T.tan}"/>
      <rect x="2" y="-24" width="14" height="24" rx="7" fill="${T.tanD}"/>
      <g transform="translate(-48 -86)">${bonitaHead(face, o)}</g>
    </g>`;
  }

  /* ---------------------------------------------------------
     3. ЛЮДИ: Вика и Андрей
     --------------------------------------------------------- */
  function humanHead(o) {
    o = o || {};
    const hair = o.hair === 'long' ? T.hairV : T.hairA;
    const back = o.hair === 'long'
      ? `<path d="M-30 -6 C-34 -34 -14 -44 4 -40 C22 -36 30 -14 30 22 C30 34 24 40 20 40 L-24 40 C-32 26 -32 8 -30 -6Z" fill="${hair}"/>`
      : `<path d="M-28 -4 C-30 -30 -14 -40 4 -38 C20 -36 28 -24 27 -6 C18 -16 2 -20 -14 -14 C-20 -12 -25 -8 -28 -4Z" fill="${hair}"/>`;
    let eyes;
    if (o.face === 'awake') {
      eyes = `<circle cx="-10" cy="2" r="3.6" fill="${T.ink}"/><circle cx="9" cy="2" r="3.6" fill="${T.ink}"/>
              <path d="M-18 -8 q8 -4 15 0" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M2 -8 q8 -4 15 0" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M-6 13 q7 6 14 -1" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (o.face === 'rub') {
      eyes = `<path d="M-17 1 q7 6 14 0" stroke="${T.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
              <path d="M2 1 q7 6 14 0" stroke="${T.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
              <path d="M-7 16 q7 -3 13 1" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (o.face === 'happy') {
      eyes = `<path d="M-17 2 q7 -8 14 0" stroke="${T.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
              <path d="M2 2 q7 -8 14 0" stroke="${T.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
              <path d="M-8 12 q9 9 17 -1" fill="${T.ink}"/>`;
    } else { // sleep
      eyes = `<path d="M-17 3 q7 6 14 0" stroke="${T.ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
              <path d="M2 3 q7 6 14 0" stroke="${T.ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
              <path d="M-4 16 q4 4 8 0" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
              <ellipse cx="-24" cy="10" rx="6" ry="4.5" fill="#ff9bb5" opacity=".8"/>`;
    }
    const glasses = o.glasses
      ? `<g fill="none" stroke="${T.ink}" stroke-width="3"><circle cx="-10" cy="2" r="10"/><circle cx="9" cy="2" r="10"/><path d="M0 2 h-1"/></g>`
      : '';
    return `<g transform="translate(${o.x} ${o.y}) scale(${o.s || 1})">
      ${back}
      <circle cx="0" cy="0" r="25" fill="${T.skin}"/>
      <ellipse cx="0" cy="18" rx="16" ry="8" fill="${T.skinD}" opacity=".5"/>
      ${eyes}
      ${glasses}
      ${o.hair === 'long' ? `<path d="M-26 -12 C-18 -22 6 -24 22 -12 C12 -18 -6 -16 -26 -12Z" fill="${hair}"/>` : ''}
      ${o.hair === 'short' ? `<path d="M-22 -16 C-10 -26 12 -25 24 -14 C10 -19 -8 -20 -22 -16Z" fill="${hair}"/>` : ''}
    </g>`;
  }

  /* спящая кровать: подушки, головы, одеяло */
  function bed(x, y, s, people) {
    const p = people || [];
    let heads = '';
    p.forEach(h => {
      heads += `<rect x="${h.x - 34}" y="${h.y - 34}" width="68" height="46" rx="16" fill="#fff" stroke="${T.ink}" stroke-width="3"/>`;
      heads += humanHead(Object.assign({}, h, { y: h.y - 12 }));
    });
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="0" y="-10" width="360" height="120" rx="16" fill="${T.woodD}" stroke="${T.ink}" stroke-width="4"/>
      <rect x="-12" y="-56" width="26" height="180" rx="12" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
      <rect x="346" y="-70" width="26" height="190" rx="12" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
      <rect x="0" y="6" width="360" height="86" rx="14" fill="#fff6e2" stroke="${T.ink}" stroke-width="4"/>
      ${heads}
      <path d="M0 46 C60 34 120 58 180 48 C250 36 300 56 360 44 L360 92 L0 92 Z" fill="#8fc7ff" stroke="${T.ink}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 62 q30 12 60 0 M170 68 q30 12 60 0 M260 60 q24 10 48 0" stroke="#5b9bd8" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  /* миска для Бониты */
  function bowl(x, y, s, o) {
    o = o || {};
    const rot = o.tilt ? ` rotate(${o.tilt})` : '';
    const inner = o.food
      ? `<ellipse cx="0" cy="-1" rx="25" ry="8" fill="#e8b56a"/><circle cx="-8" cy="-3" r="2.6" fill="#f7dcaa"/><circle cx="6" cy="-2" r="2.4" fill="#f7dcaa"/>`
      : `<ellipse cx="0" cy="-1" rx="25" ry="8" fill="#eef3fa"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})${rot}">
      <path d="M-34 0 q34 30 68 0 z" fill="#cfe0f2" stroke="${T.ink}" stroke-width="3.4" stroke-linejoin="round"/>
      <ellipse cx="0" cy="0" rx="34" ry="11" fill="#eef3fa" stroke="${T.ink}" stroke-width="3.4"/>
      ${inner}
      <ellipse cx="0" cy="17" rx="20" ry="5" fill="#b9cee4" opacity=".7"/>
      <text x="0" y="26" text-anchor="middle" font-size="11" font-weight="800" fill="${T.ink}" font-family="Baloo 2, Comic Sans MS, sans-serif">${o.label || ''}</text>
    </g>`;
  }

  function window_(x, y, w, h, o) {
    o = o || {};
    return `<g>
      <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="14" fill="#fff" stroke="${T.ink}" stroke-width="4"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.sky || T.sky}"/>
      <circle cx="${x + w * .72}" cy="${y + h * .3}" r="18" fill="#ffd23f"/>
      <ellipse cx="${x + w * .3}" cy="${y + h * .62}" rx="22" ry="10" fill="#fff" opacity=".9"/>
      <ellipse cx="${x + w * .5}" cy="${y + h * .72}" rx="16" ry="8" fill="#fff" opacity=".8"/>
      <path d="M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}" stroke="${T.ink}" stroke-width="4"/>
      <rect x="${x - 18}" y="${y - 22}" width="${w * .34}" height="18" rx="9" fill="#ff8ab8" stroke="${T.ink}" stroke-width="3.4" transform="rotate(6 ${x} ${y - 14})"/>
      <rect x="${x + w * .7}" y="${y - 22}" width="${w * .34}" height="18" rx="9" fill="#ff8ab8" stroke="${T.ink}" stroke-width="3.4" transform="rotate(-6 ${x + w} ${y - 14})"/>
    </g>`;
  }

  /* ---------------------------------------------------------
     4. СТРАНИЦЫ КОМИКСА
     --------------------------------------------------------- */
  const SCENES = [

    /* 1 — обложка ------------------------------------------------ */
    {
      cover: true,
      title: 'Обложка: Бонита',
      html: `
        <div class="cover-title">
          <h2><span>Бонита</span>и её длинная<br>челка</h2>
          <p>Комикс про 12-летнего йоркширского терьера,<br>который будит хозяев лучше будильника</p>
        </div>
        <div class="cover-badge">Кликай ▶ и тяни страницу</div>`,
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита — йоркширский терьер с длинной чёлкой стоит на кухне">
        <rect width="640" height="360" fill="#bfe9ff"/>
        ${checker(0, 0, 640, 250, 44, '#ffffff', '#a9e2ff')}
        <rect y="250" width="640" height="180" fill="#ffe3a8"/>
        <rect y="248" width="640" height="8" fill="#c9a05e"/>
        ${sparkles([[70, 60, 16], [560, 90, 20], [300, 40, 13], [470, 200, 11]], '#fff8c9')}
        ${heart(140, 120, 2.2, '#ff5d8f')}
        ${heart(210, 70, 1.6, '#ff8ab8')}
        ${heart(520, 300, 1.9, '#ff5d8f')}
        ${heart(120, 300, 1.5, '#ff8ab8')}
        <g transform="translate(360 120) rotate(-12)">
          <path d="M0 0 q14 -6 26 2 q10 8 0 16 q-12 8 -26 2Z" fill="#fff" stroke="${T.ink}" stroke-width="3.4"/>
          <circle cx="4" cy="9" r="4" fill="${T.ink}"/><circle cx="17" cy="8" r="4" fill="${T.ink}"/>
        </g>
        ${bonita({ x: 430, y: 316, s: 1.45, face: 'happy', tail: 'up' })}
        <ellipse cx="180" cy="300" rx="58" ry="16" fill="#8fd0ff" opacity=".5"/>
      </svg>`
    },

    /* 2 — 6:58, все спят ---------------------------------------- */
    {
      title: 'Раннее утро',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Спальня: Вика и Андрей спят в кровати, Бонита смотрит на них">
        <rect width="640" height="360" fill="#ffd9e8"/>
        ${stripes(0, 0, 640, 250, 56, 'rgba(255,255,255,.45)')}
        ${planks(250, 180, '#e5a86a', '#c98a4b')}
        <rect y="244" width="640" height="10" fill="#c98a4b"/>
        ${window_(430, 40, 160, 130)}
        ${bed(24, 176, 1, [
          { x: 74, y: -50, hair: 'long' },
          { x: 176, y: -50, hair: 'short', glasses: true }
        ])}
        <g transform="translate(300 250)">
          <rect x="0" y="0" width="86" height="12" rx="6" fill="#8a5a3b"/>
          <rect x="8" y="-46" width="70" height="48" rx="10" fill="#fff" stroke="${T.ink}" stroke-width="4"/>
          <circle cx="43" cy="-22" r="16" fill="#fff3c4" stroke="${T.ink}" stroke-width="3.4"/>
          <path d="M43 -33 v11 l8 6" stroke="${T.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
          <circle cx="43" cy="-22" r="2" fill="${T.ink}"/>
          <text x="43" y="-4" text-anchor="middle" font-size="11" font-weight="800" fill="${T.ink}">7:00</text>
        </g>
        ${bonita({ x: 424, y: 336, s: 1.02, face: 'peek' })}
      </svg>`,
      bubbles: [
        { x: 3, y: 5, w: 38, c: 'yellow', t: 'tail-l', d: 0, txt: '6:58. В доме Вики и Андрея тихо-тихо. Все спят.' },
        { x: 4, y: 64, w: 42, cls: 'think', t: '', d: .35, txt: 'Двенадцать лет назад я всё это знала: сначала миски.' }
      ],
      zzz: [{ x: 22, y: 40 }, { x: 33, y: 30, s: 1.3 }],
      sfx: []
    },

    /* 3 — план и коридор ---------------------------------------- */
    {
      title: 'План действий',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита бежит по коридору к кухне">
        <rect width="640" height="360" fill="#d7f3ff"/>
        ${stripes(0, 0, 640, 250, 70, 'rgba(255,255,255,.55)')}
        ${planks(250, 180, '#f0d3a4', '#d9b581')}
        <rect y="244" width="640" height="10" fill="#c9a05e"/>
        <rect x="470" y="60" width="170" height="200" rx="10" fill="#7fc7ff" stroke="${T.ink}" stroke-width="4"/>
        <rect x="492" y="86" width="126" height="148" rx="8" fill="#fff" stroke="${T.ink}" stroke-width="3.4"/>
        <circle cx="600" cy="162" r="6" fill="${T.ink}"/>
        <path d="M40 250 h150 v80 h-150z" fill="#ff8ab8" stroke="${T.ink}" stroke-width="4" rx="10"/>
        <rect x="40" y="250" width="150" height="80" rx="10" fill="#ff8ab8" stroke="${T.ink}" stroke-width="4"/>
        <path d="M60 268 h110 M60 288 h110 M60 308 h80" stroke="#ff5d8f" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(250 300)">
          <ellipse cx="0" cy="0" rx="20" ry="9" fill="#ff8a3d" stroke="${T.ink}" stroke-width="3.4"/>
          <ellipse cx="34" cy="4" rx="20" ry="9" fill="#ff8a3d" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        <g opacity=".55">
          <path d="M180 240 h70 M200 258 h56 M172 276 h64" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
        </g>
        ${sparkles([[150, 250, 10], [130, 300, 8]], '#ffffff')}
        ${bonita({ x: 330, y: 330, s: 1.12, face: 'happy', flip: true, tail: 'up' })}
      </svg>`,
      bubbles: [
        { x: 3, y: 5, w: 40, c: 'mint', t: 'tail-l', d: 0, txt: 'А начинается всё с кухни. Там меня ждут МОИ миски.' },
        { x: 3, y: 60, w: 42, cls: 'think', t: '', d: .3, txt: 'План: прийти, глянуть, позвонить в миски.' }
      ],
      sfx: [{ x: 52, y: 70, t: 'Топ-топ!', v: 'sky-sfx' }]
    },

    /* 4 — пустые миски ------------------------------------------ */
    {
      title: 'Кухня. Пустые миски',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="На кухне на столе две пустые миски, Бонита дотрагивается до них лапой">
        <rect width="640" height="360" fill="#fff3d6"/>
        ${checker(0, 0, 640, 250, 40, '#ffffff', '#ffe6b8')}
        ${checker(0, 250, 640, 180, 50, '#ffd9a0', '#ffe9c4')}
        <rect y="250" width="640" height="8" fill="#c9a05e"/>
        ${window_(30, 34, 150, 120, { sky: '#cdeeff' })}
        <g transform="translate(430 40)">
          <rect x="0" y="0" width="180" height="120" rx="10" fill="#e6f7ff" stroke="${T.ink}" stroke-width="4"/>
          <path d="M0 34 h180 M0 68 h180" stroke="${T.ink}" stroke-width="3" opacity=".5"/>
          <rect x="16" y="46" width="34" height="20" rx="4" fill="#ff8ab8" stroke="${T.ink}" stroke-width="3"/>
          <rect x="62" y="52" width="30" height="14" rx="4" fill="#9fe3c0" stroke="${T.ink}" stroke-width="3"/>
          <circle cx="120" cy="24" r="12" fill="#ff5d8f" opacity=".8"/>
          <circle cx="150" cy="96" r="14" fill="#a86bff" opacity=".7"/>
        </g>
        <g transform="translate(70 250)">
          <rect x="0" y="0" width="330" height="20" rx="10" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
          <rect x="26" y="20" width="16" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="288" y="20" width="16" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        ${bowl(160, 252, 1.15, { label: 'БОНИТА' })}
        ${bowl(300, 250, 1.1, { tilt: 8, label: 'ВИКА' })}
        ${bonita({ x: 420, y: 300, s: 1.05, face: 'think' })}
        <path d="M360 262 q22 -14 44 -4" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
      </svg>`,
      bubbles: [
        { x: 2, y: 3, w: 30, c: 'pink', t: 'tail-l', d: 0, txt: 'Пустые. Совсем-совсем пустые.' },
        { x: 46, y: 3, w: 40, c: 'yellow', t: 'tail-r', d: .3, txt: 'Значит, ко мне в гости собираются! Или пора будить хозяев.' }
      ],
      sfx: [{ x: 6, y: 40, t: 'Тук!', v: 'pink-sfx' }]
    },

    /* 5 — ДЗИНЬ! ДЗЫНЬ! ---------------------------------------- */
    {
      title: 'Будильник «Бонита»',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита радостно толкает миски, они звенят">
        <rect width="640" height="360" fill="#fff3d6"/>
        ${checker(0, 0, 640, 250, 40, '#ffffff', '#ffe6b8')}
        ${checker(0, 250, 640, 180, 50, '#ffd9a0', '#ffe9c4')}
        <rect y="250" width="640" height="8" fill="#c9a05e"/>
        ${window_(30, 34, 150, 120, { sky: '#cdeeff' })}
        <g transform="translate(70 250)">
          <rect x="0" y="0" width="330" height="20" rx="10" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
          <rect x="26" y="20" width="16" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="288" y="20" width="16" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        ${bowl(170, 246, 1.2, { tilt: -12 })}
        ${bowl(320, 224, 1.15, { tilt: 34 })}
        <g opacity=".9">
          <path d="M212 190 q10 -12 22 0 M244 172 q12 -14 26 0" stroke="#ffd23f" stroke-width="6" fill="none" stroke-linecap="round"/>
        </g>
        ${sparkles([[250, 150, 14], [300, 130, 10], [200, 130, 9], [360, 170, 8]], '#ffd23f')}
        ${bonita({ x: 440, y: 306, s: 1.15, face: 'proud', tail: 'up' })}
        ${heart(520, 190, 2, '#ff5d8f')}
        ${heart(560, 230, 1.4, '#ff8ab8')}
      </svg>`,
      bubbles: [
        { x: 2, y: 3, w: 30, c: 'yellow', t: 'tail-l', d: 0, txt: 'Бо-о-ольшой звон! Как у настоящего оркестра!' },
        { x: 46, y: 3, w: 40, c: 'mint', t: 'tail-r', d: .3, txt: 'Один удар. Второй. Третий. Всё, утро началось!' }
      ],
      sfx: [
        { x: 30, y: 48, t: 'Дзинь!', v: '' },
        { x: 58, y: 52, t: 'Дзынь!', v: '' }
      ],
      sound: 'ding'
    },

    /* 6 — тишина ----------------------------------------------- */
    {
      title: 'А хозяева спят',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="На кухне тихо, Бонита сидит и грустно смотрит на миски">
        <rect width="640" height="360" fill="#eef4ff"/>
        ${checker(0, 0, 640, 250, 40, '#ffffff', '#dfe9f7')}
        ${checker(0, 250, 640, 180, 50, '#cddcf0', '#e6eefa')}
        <rect y="250" width="640" height="8" fill="#a9bcd6"/>
        ${window_(380, 40, 200, 140, { sky: '#b9c8de' })}
        <g opacity=".5">
          <path d="M40 60 h200" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
        </g>
        <g transform="translate(80 250)">
          <rect x="0" y="0" width="300" height="20" rx="10" fill="#b9c2cf" stroke="${T.ink}" stroke-width="4"/>
          <rect x="24" y="20" width="16" height="86" fill="#98a3b3" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="260" y="20" width="16" height="86" fill="#98a3b3" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        ${bowl(180, 250, 1.1, {})}
        <path d="M120 300 q40 -18 90 -4" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
        ${bonita({ x: 400, y: 310, s: 1.05, face: 'sad', tail: 'low' })}
        <path d="M470 120 q6 12 0 18 q-6 -6 0 -18Z" fill="#7fd7ff"/>
      </svg>`,
      bubbles: [
        { x: 3, y: 5, w: 33, c: 'sky', t: 'tail-l', d: 0, txt: 'Тишина. Ни звука. Кажется, мой план не сработал.' },
        { x: 52, y: 28, w: 42, cls: 'bubble--small pink', t: 'tail-r', d: .3, txt: 'Андрей (за стеной): «Бонита?! Опять?!»' },
        { x: 50, y: 64, w: 44, cls: 'think', t: '', d: .5, txt: 'Двенадцать лет — и ни одного промаха.' }
      ],
      sfx: []
    },

    /* 7 — проверка: коридор и дверь ----------------------------- */
    {
      title: 'Коридор. Проверка',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита идёт по коридору к приоткрытой двери">
        <rect width="640" height="360" fill="#efe6ff"/>
        ${stripes(0, 0, 640, 250, 64, 'rgba(255,255,255,.5)')}
        ${planks(250, 180, '#e3c391', '#c9a05e')}
        <rect y="244" width="640" height="10" fill="#a87c4c"/>
        <g transform="translate(430 40)">
          <rect x="0" y="0" width="210" height="220" rx="8" fill="#7a5a3a" stroke="${T.ink}" stroke-width="4"/>
          <path d="M118 0 v220" stroke="${T.ink}" stroke-width="4"/>
          <rect x="8" y="8" width="100" height="200" rx="4" fill="#8a6a48" stroke="${T.ink}" stroke-width="3"/>
          <circle cx="106" cy="112" r="7" fill="#ffd23f" stroke="${T.ink}" stroke-width="3"/>
          <rect x="128" y="8" width="74" height="200" rx="4" fill="#fff" opacity=".35"/>
          <path d="M128 8 h74 v200 h-74z" fill="#fff8d6" opacity=".55"/>
        </g>
        <path d="M520 60 l120 -30 v230 l-120 20 z" fill="#fff3b0" opacity=".55"/>
        <g transform="translate(30 250)">
          <rect x="0" y="0" width="180" height="86" rx="10" fill="#7fd7ff" stroke="${T.ink}" stroke-width="4"/>
          <path d="M0 30 h180 M40 0 v86 M120 0 v86" stroke="#fff" stroke-width="5"/>
        </g>
        <g transform="translate(230 300)">
          <ellipse cx="0" cy="0" rx="20" ry="9" fill="#ff8a3d" stroke="${T.ink}" stroke-width="3.4"/>
          <ellipse cx="36" cy="4" rx="20" ry="9" fill="#ff8a3d" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        ${bonita({ x: 300, y: 332, s: 1.06, face: 'peek', flip: true, tail: 'up' })}
      </svg>`,
      bubbles: [
        { x: 3, y: 5, w: 36, c: 'sky', t: 'tail-l', d: 0, txt: 'Надо проверить. Вдруг они спят в другой комнате.' },
        { x: 58, y: 60, w: 38, cls: 'think', t: '', d: .35, txt: 'Или вообще вышли из дома. Я проверю.' }
      ],
      sfx: [{ x: 66, y: 24, t: 'Тук-тук!', v: 'sky-sfx' }]
    },

    /* 8 — БАМ! Челка против бокового косяка ---------------------- */
    {
      title: 'БАМ! Челка против бокового косяка',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита бежит и врезается в боковую стойку дверного проёма, чёлка летит в стороны">
        <rect width="640" height="360" fill="#ffe9c9"/>
        ${stripes(0, 0, 640, 250, 58, 'rgba(255,255,255,.5)')}
        ${planks(250, 180, '#f0d3a4', '#d9b581')}
        <rect y="244" width="640" height="10" fill="#c9a05e"/>

        <g transform="translate(24 22)">
          <rect x="0" y="0" width="112" height="236" rx="6" fill="#8a6a48" stroke="${T.ink}" stroke-width="4"/>
          <rect x="16" y="20" width="80" height="92" rx="6" fill="#a5c98a" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="16" y="130" width="80" height="84" rx="6" fill="#a5c98a" stroke="${T.ink}" stroke-width="3.4"/>
        </g>

        <!-- дверной проём: свет из кухни -->
        <rect x="316" y="46" width="248" height="212" rx="6" fill="#fff6cf"/>
        <path d="M316 258 L564 46 V258 Z" fill="#ffe07a" opacity=".85"/>
        <g opacity=".8">
          ${bowl(470, 190, .8, {})}
        </g>
        <!-- перемычка сверху (она ни при чём) -->
        <rect x="300" y="20" width="278" height="28" rx="6" fill="#a9825a" stroke="${T.ink}" stroke-width="4"/>
        <text x="312" y="40" font-size="13" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">перемычка — не виновата</text>
        <!-- косяк: вертикальная стойка СБОКУ -->
        <rect x="288" y="20" width="30" height="240" rx="6" fill="#c2873f" stroke="${T.ink}" stroke-width="4"/>
        <path d="M296 34 v212" stroke="#a06a2c" stroke-width="4" stroke-linecap="round"/>
        <text x="311" y="238" text-anchor="middle" font-size="15" font-weight="800" fill="#fff"
              font-family="Baloo 2, sans-serif" transform="rotate(-90 311 238)">БОКОВОЙ КОСЯК</text>
        <path d="M282 92 l-38 -18 M282 150 l-46 4" stroke="#ff5d5d" stroke-width="5" stroke-linecap="round"/>
        <path d="M244 74 l-14 -2 l6 12Z" fill="#ff5d5d"/>
        <path d="M236 154 l-16 -6 l2 13Z" fill="#ff5d5d"/>

        ${sparkles([[262, 204, 20], [240, 166, 14], [306, 172, 10], [228, 240, 10], [320, 238, 9]], '#ff5d5d')}
        <g opacity=".8">
          <path d="M96 300 q46 -34 100 -22" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="14 12"/>
        </g>
        ${bonita({ x: 236, y: 336, s: 1.2, face: 'ouch', fringe: 'curtain', flip: true, tail: 'up' })}
        <text x="196" y="272" font-size="32" font-weight="800" fill="#fff" stroke="${T.ink}" stroke-width="3" paint-order="stroke"
              font-family="Baloo 2, sans-serif" transform="rotate(-10 196 272)">ай!</text>
      </svg>`,
      bubbles: [
        { x: 2, y: 3, w: 30, c: 'pink', t: 'tail-l', d: 0, txt: 'Ай-ай! В боковой косяк! Он сбоку, а я — нет.' },
        { x: 56, y: 54, w: 42, cls: 'bubble--small yellow', t: 'tail-r', d: .3, txt: 'Сверху перемычка, сбоку косяк. Я двенадцать лет хожу мимо этой двери и всё равно не помню, где сбоку.' }
      ],
      sfx: [{ x: 56, y: 30, t: 'БАМ!', v: 'pink-sfx' }],
      sound: 'boing'
    },

    /* 9 — хозяева проснулись ------------------------------------- */
    {
      title: 'Наконе-то проснулись',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Андрей садится в кровати и трёт глаза, Бонита прыгает к нему на кровать">
        <rect width="640" height="360" fill="#ffd9e8"/>
        ${stripes(0, 0, 640, 250, 56, 'rgba(255,255,255,.45)')}
        ${planks(250, 180, '#e5a86a', '#c98a4b')}
        <rect y="244" width="640" height="10" fill="#c98a4b"/>
        ${window_(400, 34, 180, 130)}
        <g transform="translate(30 150)">
          <rect x="0" y="40" width="420" height="130" rx="18" fill="#fff6e2" stroke="${T.ink}" stroke-width="4"/>
          <rect x="-14" y="20" width="28" height="150" rx="12" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
          <path d="M120 60 h300 v110 h-300z" fill="#8fc7ff" stroke="${T.ink}" stroke-width="4" stroke-linejoin="round"/>
          <path d="M170 100 q26 12 52 0 M300 110 q26 12 52 0" stroke="#5b9bd8" stroke-width="4" fill="none" stroke-linecap="round"/>
          ${humanHead({ x: 150, y: -20, s: 1.35, hair: 'short', glasses: true, face: 'rub' })}
          <g transform="translate(150 -20) scale(1.35)">
            <path d="M18 -2 q22 -10 30 8" stroke="${T.skin}" stroke-width="11" fill="none" stroke-linecap="round"/>
            <path d="M20 0 q14 6 14 14" stroke="${T.ink}" stroke-width="2" fill="none" opacity=".3"/>
          </g>
          <g transform="translate(60 60)">
            <rect x="-40" y="-40" width="80" height="46" rx="16" fill="#fff" stroke="${T.ink}" stroke-width="3"/>
            ${humanHead({ x: 0, y: -6, s: 1.2, hair: 'long', face: 'sleep' })}
          </g>
        </g>
        ${heart(340, 90, 2.4, '#ff5d8f')}
        ${heart(400, 60, 1.6, '#ff8ab8')}
        ${heart(300, 40, 1.4, '#ff8ab8')}
        ${bonita({ x: 300, y: 200, s: .95, face: 'happy', tail: 'up' })}
        <path d="M296 150 q6 -18 0 -30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
      </svg>`,
      bubbles: [
        { x: 2, y: 4, w: 32, c: 'yellow', t: 'tail-l', d: 0, txt: 'Ой… Сначала кофе. Потом собаку. Потом ещё пять минут.' },
        { x: 52, y: 56, w: 42, c: 'mint', t: 'tail-r', d: .35, txt: 'Бонита: «Я не обижаюсь! Я просто рада, что вы проснулись!»' }
      ],
      zzz: [{ x: 8, y: 52 }],
      sfx: [{ x: 36, y: 8, t: 'Пфф!', v: 'sky-sfx' }]
    },

    /* 10 — завтрак и расчёсывание ------------------------------- */
    {
      title: 'Завтрак. Вика берётся за расчёску',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="За завтраком Вика расчёсывает Боните чёлку, Андрей пьёт кофе">
        <rect width="640" height="360" fill="#fff3d6"/>
        ${checker(0, 0, 640, 250, 40, '#ffffff', '#ffe6b8')}
        ${checker(0, 250, 640, 180, 50, '#ffd9a0', '#ffe9c4')}
        <rect y="250" width="640" height="8" fill="#c9a05e"/>
        ${window_(30, 30, 150, 118, { sky: '#cdeeff' })}
        <g transform="translate(60 244)">
          <rect x="0" y="0" width="520" height="24" rx="12" fill="${T.wood}" stroke="${T.ink}" stroke-width="4"/>
          <rect x="34" y="24" width="18" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="468" y="24" width="18" height="86" fill="${T.woodD}" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        ${bowl(150, 250, 1.25, { food: true, label: 'БОНИТА' })}
        <g transform="translate(320 214)">
          <rect x="0" y="0" width="52" height="44" rx="8" fill="#fff" stroke="${T.ink}" stroke-width="3.4"/>
          <path d="M0 14 h52" stroke="${T.ink}" stroke-width="3"/>
          <path d="M14 30 q12 8 24 0" stroke="${T.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M14 8 q6 -8 12 0 q6 -8 12 0" stroke="#c98a4b" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        </g>
        <g transform="translate(430 200)">
          <path d="M-20 44 h44 l-6 -40 h-32z" fill="#fff" stroke="${T.ink}" stroke-width="3.4" stroke-linejoin="round"/>
          <path d="M-12 4 a12 12 0 0 1 26 0" fill="none" stroke="${T.ink}" stroke-width="3.4"/>
          <rect x="-16" y="16" width="36" height="12" rx="4" fill="#8a5a3b" stroke="${T.ink}" stroke-width="3"/>
        </g>
        ${humanHead({ x: 470, y: 150, s: 1.25, hair: 'short', glasses: true, face: 'happy' })}
        ${humanHead({ x: 330, y: 120, s: 1.2, hair: 'long', face: 'happy' })}
        <g>
          <path d="M314 150 L246 158" stroke="${T.skin}" stroke-width="13" stroke-linecap="round" fill="none"/>
          <circle cx="240" cy="159" r="8" fill="${T.skin}" stroke="${T.ink}" stroke-width="2.6"/>
        </g>
        <g transform="translate(238 152) rotate(-20) scale(-1 1)">
          <rect x="0" y="0" width="46" height="14" rx="6" fill="#a86bff" stroke="${T.ink}" stroke-width="3"/>
          <path d="M46 1 v12 M54 1 v12 M62 1 v12" stroke="${T.ink}" stroke-width="2.6" stroke-linecap="round"/>
        </g>
        ${bonita({ x: 200, y: 250, s: .78, face: 'happy', fringe: 'curtain', tail: 'up' })}
        ${heart(180, 60, 2, '#ff5d8f')}
        ${heart(230, 90, 1.4, '#ff8ab8')}
      </svg>`,
      caption: 'Завтрак в 7:15. Через минуту Вика возьмётся за расчёску.',
      bubbles: [
        { x: 2, y: 3, w: 30, c: 'mint', t: 'tail-l', d: 0, txt: 'Спасибо, что разбудила! Ты очень громкая и очень молодец.' },
        { x: 34, y: 3, w: 28, cls: 'bubble--small pink', t: 'tail-l', d: .3, txt: 'Вика: «Сейчас чёлку в стороны — и ты всё увидишь!»' }
      ],
      sfx: [{ x: 34, y: 56, t: 'Ням!', v: 'pink-sfx' }],
      sound: 'nom'
    },

    /* 11 — Вика расчёсывает чёлку (крупный план) ------------------ */
    {
      title: 'Чёлку — в стороны!',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Крупный план: Вика расчёсывает Боните чёлку, осыпаются искорки">
        <rect width="640" height="360" fill="#ffeaf3"/>
        ${stripes(0, 0, 640, 250, 56, 'rgba(255,255,255,.55)')}
        ${planks(250, 180, '#f3c9a6', '#d9a271')}
        <rect y="250" width="640" height="8" fill="#c9a05e"/>

        <!-- рука Вики с расчёской -->
        <g>
          <path d="M20 372 L238 300" stroke="${T.skin}" stroke-width="30" stroke-linecap="round" fill="none"/>
          <path d="M20 372 L238 300" stroke="#e8a87c" stroke-width="12" stroke-linecap="round" fill="none" opacity=".35"/>
          <circle cx="252" cy="294" r="24" fill="${T.skin}" stroke="${T.ink}" stroke-width="3.4"/>
        </g>
        <g transform="translate(258 286) rotate(-14)">
          <rect x="0" y="0" width="86" height="20" rx="9" fill="#a86bff" stroke="${T.ink}" stroke-width="3.4"/>
          <path d="M86 2 v16 M98 2 v16 M110 2 v16 M122 2 v16" stroke="${T.ink}" stroke-width="3.4" stroke-linecap="round"/>
        </g>

        <!-- Бонита крупно: чёлка-шторка, глаза закрыты от удовольствия -->
        <g transform="translate(392 250) scale(2.2)">${bonitaHead('happy', { fringe: 'curtain' })}</g>

        <!-- вылетающие пряди и искорки -->
        <g opacity=".95">
          <path d="M330 214 q-46 -22 -78 -6" stroke="${T.tanD}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M326 244 q-52 -6 -80 16" stroke="${T.tanD}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M338 190 q-38 -30 -70 -26" stroke="${T.tan}" stroke-width="5" fill="none" stroke-linecap="round"/>
        </g>
        ${sparkles([[296, 196, 15], [268, 250, 12], [318, 148, 10], [246, 300, 11], [300, 330, 9]], '#ffd24a')}
        ${heart(214, 176, 1.5, '#ff5d8f')}
        ${heart(196, 214, 1.1, '#ff8ab8')}

        <text x="444" y="120" font-size="19" font-weight="800" fill="#c9205c" font-family="Baloo 2, sans-serif"
              transform="rotate(-7 444 120)">18 см помехи</text>
        <path d="M436 130 q40 10 96 -2" stroke="#c9205c" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M490 144 q4 24 20 32" stroke="#c9205c" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M502 174 l16 8 l-15 8Z" fill="#c9205c"/>
      </svg>`,
      caption: 'Вика берётся за расчёску.',
      bubbles: [
        { x: 2, y: 2, w: 30, c: 'yellow', t: 'tail-l', d: 0, txt: 'Вика: «Держись, девочка!»' },
        { x: 2, y: 32, w: 30, cls: 'bubble--small pink', t: 'tail-l', d: .3, txt: 'Семнадцать раз туда, восемнадцать обратно.' }
      ],
      sfx: [{ x: 2, y: 66, t: 'Шш-ш-ш!', v: 'sky-sfx' }]
    },

    /* 12 — Бонита наконец видит ------------------------------------ */
    {
      title: 'Теперь я всё вижу!',
      svg: `
      <svg class="scene" viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" role="img"
           aria-label="Бонита с расчёсанной чёлкой смотрит на боковой косяк и наконец всё видит">
        <rect width="640" height="360" fill="#ffe9c9"/>
        ${stripes(0, 0, 640, 250, 58, 'rgba(255,255,255,.5)')}
        ${planks(250, 180, '#f0d3a4', '#d9b581')}
        <rect y="250" width="640" height="10" fill="#c9a05e"/>

        <!-- дверной проём со светом -->
        <rect x="316" y="46" width="248" height="212" rx="6" fill="#fff6cf"/>
        <path d="M316 258 L564 46 V258 Z" fill="#ffe07a" opacity=".85"/>
        <g opacity=".85">${bowl(470, 186, .8, {})}</g>
        <rect x="300" y="20" width="278" height="28" rx="6" fill="#a9825a" stroke="${T.ink}" stroke-width="4"/>
        <text x="312" y="40" font-size="13" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">перемычка — не виновата</text>

        <!-- боковой косяк: стойка сбоку -->
        <rect x="288" y="20" width="30" height="240" rx="6" fill="#c2873f" stroke="${T.ink}" stroke-width="4"/>
        <path d="M296 34 v212" stroke="#a06a2c" stroke-width="4" stroke-linecap="round"/>
        <text x="311" y="238" text-anchor="middle" font-size="15" font-weight="800" fill="#fff"
              font-family="Baloo 2, sans-serif" transform="rotate(-90 311 238)">БОКОВОЙ КОСЯК</text>

        ${bonita({ x: 190, y: 336, s: 1.15, face: 'see', fringe: 'swept', flip: true, tail: 'up' })}
        ${sparkles([[298, 202, 18], [330, 168, 12], [262, 158, 10], [330, 236, 11], [250, 226, 8]], '#ffd24a')}
        ${heart(300, 138, 1.6, '#ff5d8f')}
        ${heart(340, 116, 1.2, '#ff8ab8')}
        <text x="236" y="186" font-size="24" font-weight="800" fill="#fff" stroke="${T.ink}" stroke-width="3"
              paint-order="stroke" font-family="Baloo 2, sans-serif" transform="rotate(-10 236 186)">ого!</text>
      </svg>`,
      caption: 'Утро в 7:20. Двенадцатилетняя Бонита видит мир, а косяк — это стойка сбоку. Конец!',
      bubbles: [
        { x: 2, y: 3, w: 34, c: 'yellow', t: 'tail-l', d: 0, txt: '«Всё вижу! Косяк — сбоку! А сверху перемычка!»' },
        { x: 2, y: 56, w: 28, cls: 'bubble--small pink', t: 'tail-l', d: .3, txt: 'Вика: «Вот молодец!»' },
        { x: 50, y: 26, w: 46, c: 'mint', t: 'tail-r', d: .45, txt: '«Двенадцать лет жила, а мир только сегодня стал таким ясным!»' }
      ]
    }
  ];

  /* ---------------------------------------------------------
     5. СБОРКА СТРАНИЦ
     --------------------------------------------------------- */
  const bubbleHTML = (b, i) => {
    const cls = ['bubble'];
    if (b.t === 'tail-l') cls.push('tail-l');
    if (b.t === 'tail-r') cls.push('tail-r');
    if (b.t === 'tail-up') cls.push('tail-up');
    if (b.c) cls.push(b.c);
    if (b.cls) cls.push(b.cls);
    return `<div class="${cls.join(' ')}" style="left:${b.x}%; top:${b.y}%;${b.w ? ' width:' + b.w + '%; max-width:none;' : ''}animation-delay:${b.d || (i * .12)}s">${b.txt}</div>`;
  };
  const sfxHTML = s =>
    `<div class="sfx ${s.v || ''}" style="left:${s.x}%; top:${s.y}%;">${s.t}</div>`;
  const zzzHTML = z => z.map(q =>
    `<span class="zzz" style="left:${q.x}%; top:${q.y}%; animation-delay:${Math.random() * 1.5}s;${q.s ? ' font-size:' + (q.s * 26) + 'px;' : ''}">z z</span>`
  ).join('');

  const track = document.getElementById('track');
  const stage = document.getElementById('stage');
  const dotsBox = document.getElementById('dots');
  const counter = document.getElementById('counter');
  const engine = document.getElementById('engine');
  const rail = document.querySelector('.rail');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const soundBtn = document.getElementById('sound');

  const panels = SCENES.map((sc, i) => {
    const el = document.createElement('article');
    el.className = 'panel' + (sc.cover ? ' panel--cover' : '');
    el.setAttribute('aria-roledescription', 'страница');
    el.setAttribute('aria-label', `Страница ${i + 1}. ${sc.title}`);
    el.innerHTML =
      `<span class="panel-no">${i + 1}</span>` +
      sc.svg +
      (sc.bubbles || []).map(bubbleHTML).join('') +
      (sc.sfx || []).map(sfxHTML).join('') +
      (sc.zzz ? zzzHTML(sc.zzz) : '') +
      (sc.caption ? `<div class="caption-strip">${sc.caption}</div>` : '') +
      (sc.html || '');
    track.appendChild(el);
    return el;
  });

  const dots = panels.map((p, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    d.setAttribute('aria-label', `Страница ${i + 1}: ${p.getAttribute('aria-label').split('. ')[1]}`);
    d.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(d);
    return d;
  });

  /* ---------------------------------------------------------
     6. ПАРОВОЗИК: перемотка, перетаскивание, клавиши
     --------------------------------------------------------- */
  let index = 0;
  let step = 0;
  let maxX = 0;
  const state = { x: 0, dragging: false, samples: [] };

  function measure() {
    if (panels.length > 1) {
      step = panels[1].getBoundingClientRect().left - panels[0].getBoundingClientRect().left;
    } else {
      step = panels[0].offsetWidth;
    }
    maxX = Math.max(0, step * (panels.length - 1));
    apply(state.x, false);
  }

  function apply(x, animate) {
    state.x = Math.max(-maxX, Math.min(0, x));
    track.classList.toggle('anim', !!animate && !state.dragging);
    track.style.transform = `translate3d(${state.x}px, 0, 0)`;
    const p = maxX ? -state.x / maxX : 0;
    const travel = Math.max(0, rail.clientWidth - 92);
    engine.style.transform = `translateX(${p * travel}px)`;
  }

  function goTo(i, animate = true) {
    index = Math.max(0, Math.min(panels.length - 1, i));
    apply(-Math.min(index * step, maxX), animate);

    panels.forEach((p, n) => p.classList.toggle('is-active', n === index));
    dots.forEach((d, n) => d.setAttribute('aria-selected', n === index ? 'true' : 'false'));
    const activeDot = dots[index];
    if (activeDot) {
      dotsBox.scrollTo({
        left: activeDot.offsetLeft - dotsBox.clientWidth / 2 + activeDot.offsetWidth / 2,
        behavior: animate ? 'smooth' : 'auto'
      });
    }
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === panels.length - 1;
    counter.textContent = `Страница ${index + 1} / ${panels.length}`;
    engine.classList.add('go');
    clearTimeout(apply.t);
    apply.t = setTimeout(() => engine.classList.remove('go'), 600);

    // перезапускаем анимашки на новой странице
    const cur = panels[index];
    cur.querySelectorAll('.sfx').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    cur.querySelectorAll('.bubble').forEach(el => el.classList.add('in'));

    if (SCENES[index] && SCENES[index].sound) ding(SCENES[index].sound);
    try { localStorage.setItem('bonita-page', index); } catch (e) { /* не страшно */ }
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* --- перетаскивание мышью и пальцем --- */
  let startX = 0, startBase = 0, lastX = 0, lastT = 0, velocity = 0, moved = false;

  stage.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    state.dragging = true;
    moved = false;
    startX = lastX = e.clientX;
    lastT = performance.now();
    startBase = state.x;
    velocity = 0;
    state.samples = [];
    stage.classList.add('dragging');
    track.classList.remove('anim');
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* пусто */ }
  });

  stage.addEventListener('pointermove', e => {
    if (!state.dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    const now = performance.now();
    if (now - lastT > 16) {
      velocity = (e.clientX - lastX) / (now - lastT);
      lastX = e.clientX; lastT = now;
      state.samples.push({ x: e.clientX, t: now });
      if (state.samples.length > 6) state.samples.shift();
    }
    // лёгкое сопротивление у краёв
    const raw = startBase + dx;
    const rubber = raw > 0 ? raw * .32 : (raw < -maxX ? -maxX + (raw + maxX) * .32 : raw);
    apply(rubber, false);
  });

  function endDrag(e) {
    if (!state.dragging) return;
    state.dragging = false;
    stage.classList.remove('dragging');
    let target = Math.round(-state.x / step);
    if (Math.abs(velocity) > .55) target = index + (velocity < 0 ? 1 : -1);
    else if (moved && Math.abs(-state.x / step - target) > .9) target = Math.round(-state.x / step);
    goTo(target, true);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('dragstart', e => e.preventDefault());

  /* --- клавиатура --- */
  document.addEventListener('keydown', e => {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    if (e.key === 'Home') { goTo(0); e.preventDefault(); }
    if (e.key === 'End') { goTo(panels.length - 1); e.preventDefault(); }
  });

  /* --- горизонтальное колесо мыши --- */
  let wheelLock = 0;
  stage.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!d) return;
    const now = performance.now();
    if (now - wheelLock < 480) return;
    wheelLock = now;
    d > 0 ? next() : prev();
  }, { passive: true });

  /* --- «звон миски» через Web Audio --- */
  let audioCtx = null;
  let soundOn = false;
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '🔔 Звук: вкл' : '🔇 Звук: выкл';
    if (soundOn) ding('ding');
  });
  function ding(kind) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const notes = kind === 'boing' ? [520, 300, 180] : (kind === 'nom' ? [300, 240] : [1046, 1568]);
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = kind === 'boing' ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(f, now + i * .16);
        if (kind === 'boing') o.frequency.exponentialRampToValueAtTime(f * .5, now + i * .16 + .18);
        g.gain.setValueAtTime(.0001, now + i * .16);
        g.gain.exponentialRampToValueAtTime(.18, now + i * .16 + .02);
        g.gain.exponentialRampToValueAtTime(.0001, now + i * .16 + .42);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + i * .16); o.stop(now + i * .16 + .45);
      });
    } catch (e) { /* звук — необязательная радость */ }
  }

  /* ---------------------------------------------------------
     7. СТАРТ
     --------------------------------------------------------- */
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
  try {
    const saved = parseInt(localStorage.getItem('bonita-page'), 10);
    if (!isNaN(saved) && saved > 0 && saved < panels.length) goTo(saved, false);
    else goTo(0, false);
  } catch (e) { goTo(0, false); }
})();
