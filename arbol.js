// Herbario de palabras — dibuja un árbol cuyas hojas son las palabras.
// Cada mes es una rama que brota del tronco (los meses nuevos, más arriba);
// cada día es una ramilla, y de ella cuelgan las palabras de ese día.

const SVGNS = 'http://www.w3.org/2000/svg';
const ANCHO = 1000;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// ── utilidades ──
function azar(semilla) {            // pseudoaleatorio estable a partir de un texto
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
function slug(p) { return p.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function fecha(f) { const [a, m, d] = f.split('-'); return `${+d} ${MESES[m - 1]} ${a}`; }
function el(tag, attrs = {}, padre) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (padre) padre.appendChild(e);
  return e;
}
function tipo(cat = '') {
  const c = cat.toLowerCase();
  if (c.startsWith('sustantivo')) return 'sust';
  if (c.startsWith('adjetivo')) return 'adj';
  if (c.startsWith('verbo')) return 'verbo';
  return 'otra';
}
const vacio = t => !t || t.trim().toLowerCase() === 'pendiente';

// ── geometría ──
function bez(a, c, b, t) {           // bezier cuadrática: punto y tangente
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    tx: 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x),
    ty: 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y),
  };
}

function disenar(palabras) {
  // ramas de hasta POR_RAMA palabras, en orden cronológico
  const POR_RAMA = 6, PASO = 170;
  const grupos = [];
  for (let i = 0; i < palabras.length; i += POR_RAMA) grupos.push(palabras.slice(i, i + POR_RAMA));
  const R = grupos.length;
  const alto = Math.max(900, 560 + R * PASO);
  const base = alto - 70, cima = 110;
  const troncoEn = t => ({ x: ANCHO / 2 + Math.sin(t * Math.PI * 0.9) * 14, y: base - (base - cima) * t });

  const ramas = [], hojas = [], etiquetas = [];
  let mesAnterior = '';

  grupos.forEach((grupo, i) => {
    const y0 = base - 300 - i * PASO;
    const t = (base - y0) / (base - cima);
    const lado = i % 2 === 0 ? -1 : 1;
    const a = troncoEn(t);
    const r = azar(grupo[0].palabra);
    const b = { x: ANCHO / 2 + lado * (330 + r * 60), y: a.y - 190 - r * 50 };
    const c = { x: ANCHO / 2 + lado * 170, y: a.y - 15 };
    ramas.push({ a, c, b, grosor: 10 - t * 6, retraso: i * 0.2 });

    const mes = grupo[0].fecha.slice(0, 7);
    if (mes !== mesAnterior) {
      const [an, me] = mes.split('-');
      etiquetas.push({ x: b.x + lado * 14, y: b.y - 8, ancla: lado < 0 ? 'end' : 'start', texto: `${MESES[me - 1]} ${an}` });
    }
    mesAnterior = grupo[grupo.length - 1].fecha.slice(0, 7);

    grupo.forEach((pal, j) => {
      const s = 0.24 + 0.72 * (j + 0.5) / grupo.length;
      const p = bez(a, c, b, s);
      const n = Math.hypot(p.tx, p.ty), tx = p.tx / n, ty = p.ty / n;
      const sg = j % 2 === 0 ? -1 : 1;                 // alterna arriba/abajo de la rama
      const nx = -ty * sg, ny = tx * sg;
      const largo = 48 + azar(pal.palabra + 'r') * 30;
      const ix = p.x + nx * largo + tx * 18, iy = p.y + ny * largo + ty * 18;
      const ctrl = { x: p.x + nx * largo * 0.6, y: p.y + ny * largo * 0.6 };
      const w = Math.max(86, pal.palabra.length * 8.8 + 36);
      hojas.push({ pal, ix, iy, x: ix, y: iy, w, h: 40, desde: p, ctrl, retraso: i * 0.2 + s * 0.6 });
    });
  });

  // separar hojas que se tocan (relajación simple, con resorte hacia su lugar ideal)
  for (let it = 0; it < 320; it++) {
    for (let i = 0; i < hojas.length; i++) {
      for (let j = i + 1; j < hojas.length; j++) {
        const A = hojas[i], B = hojas[j];
        const dx = B.x - A.x, dy = B.y - A.y;
        const ox = (A.w + B.w) / 2 + 8 - Math.abs(dx), oy = (A.h + B.h) / 2 + 6 - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox < oy) { const k = (dx < 0 ? -1 : 1) * ox / 2; A.x -= k; B.x += k; }
          else { const k = (dy < 0 ? -1 : 1) * oy / 2; A.y -= k; B.y += k; }
        }
      }
    }
    for (const H of hojas) {
      H.x += (H.ix - H.x) * 0.02; H.y += (H.iy - H.y) * 0.02;
      const tx = ANCHO / 2, holgura = H.w / 2 + 16;     // no tapar el tronco
      if (Math.abs(H.x - tx) < holgura && H.y > cima) H.x = tx + (H.x < tx ? -holgura : holgura);
      H.x = Math.min(ANCHO - H.w / 2 - 8, Math.max(H.w / 2 + 8, H.x));
      H.y = Math.min(base - 40, Math.max(70, H.y));
    }
  }
  return { alto, base, cima, troncoEn, ramas, hojas, etiquetas };
}

// ── dibujo ──
function dibujar(palabras) {
  const svg = document.getElementById('arbol');
  const g = disenar(palabras);
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${ANCHO} ${g.alto}`);

  // tronco: segmentos de grosor decreciente
  const capaTronco = el('g', {}, svg);
  for (let s = 0, N = 24; s < N; s++) {
    const a = g.troncoEn(s / N), b = g.troncoEn((s + 1) / N);
    el('line', { class: 'tronco', x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'stroke-width': 18 * (1 - s / N) + 2.5 }, capaTronco);
  }
  el('text', { class: 'raiz', x: ANCHO / 2, y: g.base + 40, 'text-anchor': 'middle' }, svg).textContent = 'herbario';

  const capaRamas = el('g', {}, svg);
  for (const r of g.ramas) {
    const p = el('path', { class: 'rama crece', d: `M${r.a.x},${r.a.y} Q${r.c.x},${r.c.y} ${r.b.x},${r.b.y}`, 'stroke-width': r.grosor, pathLength: 1 }, capaRamas);
    p.style.animationDelay = r.retraso + 's';
  }
  for (const h of g.hojas) {
    const p = el('path', { class: 'ramilla crece', d: `M${h.desde.x},${h.desde.y} Q${h.ctrl.x},${h.ctrl.y} ${h.x},${h.y}`, 'stroke-width': 1.6, pathLength: 1 }, capaRamas);
    p.style.animationDelay = h.retraso + 's';
  }
  for (const e of g.etiquetas) el('text', { class: 'etiqueta-mes', x: e.x, y: e.y, 'text-anchor': e.ancla }, svg).textContent = e.texto;

  const capaHojas = el('g', {}, svg);
  for (const h of g.hojas) {
    const { w, h: alto } = h, inclin = (azar(h.pal.palabra) - 0.5) * 12;
    const grupo = el('g', {
      class: `hoja brota ${tipo(h.pal.categoria)}`, transform: `translate(${h.x},${h.y})`,
      tabindex: 0, role: 'button', 'aria-label': h.pal.palabra, 'data-slug': slug(h.pal.palabra),
    }, capaHojas);
    grupo.style.animationDelay = (h.retraso + 0.5) + 's';
    const cuerpo = el('g', { class: 'cuerpo' }, grupo);
    const lam = el('g', { transform: `rotate(${inclin})` }, cuerpo);
    const x = w / 2, y = alto / 2;
    el('path', { class: 'lamina', d: `M${-x},0 C${-x * 0.45},${-y * 1.35} ${x * 0.45},${-y * 1.35} ${x},0 C${x * 0.45},${y * 1.35} ${-x * 0.45},${y * 1.35} ${-x},0 Z` }, lam);
    el('path', { class: 'nervio', d: `M${-x + 4},0 L${-x + 14},0 M${x - 14},0 L${x - 4},0` }, lam);
    el('text', { x: 0, y: 1 }, cuerpo).textContent = h.pal.palabra;
    grupo.addEventListener('click', () => abrir(h.pal));
    grupo.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(h.pal); } });
  }
}

// ── ficha ──
const $ = id => document.getElementById(id);
function poner(id, bloque, texto) {
  $(id).textContent = vacio(texto) ? '' : texto;
  if (bloque) $(bloque).hidden = vacio(texto);
}
function abrir(p) {
  $('f-palabra').textContent = p.palabra;
  $('f-fonetica').textContent = p.fonetica || '';
  $('f-cat').textContent = p.categoria || '';
  $('f-fecha').textContent = p.fecha ? fecha(p.fecha) : '';
  poner('f-esencia', null, p.esencia);
  poner('f-significado', 'b-significado', p.significado);
  poner('f-etimologia', 'b-etimologia', p.etimologia);
  poner('f-aura', 'b-aura', p.aura);
  document.querySelectorAll('.hoja.activa').forEach(h => h.classList.remove('activa'));
  document.querySelector(`.hoja[data-slug="${slug(p.palabra)}"]`)?.classList.add('activa');
  $('ficha').classList.add('abierta'); $('ficha').setAttribute('aria-hidden', 'false');
  $('velo').classList.add('visible'); $('ficha').scrollTop = 0;
  history.replaceState(null, '', '#' + slug(p.palabra));
  cerrarIndice();
}
function cerrar() {
  $('ficha').classList.remove('abierta'); $('ficha').setAttribute('aria-hidden', 'true');
  $('velo').classList.remove('visible');
  document.querySelectorAll('.hoja.activa').forEach(h => h.classList.remove('activa'));
  history.replaceState(null, '', location.pathname);
}
function cerrarIndice() { $('indice').hidden = true; $('btn-indice').setAttribute('aria-expanded', 'false'); }

// ── inicio ──
fetch('datos/palabras.json')
  .then(r => r.json())
  .then(palabras => {
    palabras.sort((a, b) => a.fecha.localeCompare(b.fecha));
    $('contador').textContent = palabras.length === 1 ? '1 palabra' : `${palabras.length} palabras`;
    dibujar(palabras);

    const lista = $('indice-lista');
    [...palabras].sort((a, b) => a.palabra.localeCompare(b.palabra, 'es')).forEach(p => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.textContent = p.palabra; b.addEventListener('click', () => abrir(p));
      li.appendChild(b); lista.appendChild(li);
    });
    $('btn-indice').addEventListener('click', () => {
      const abierto = $('indice').hidden;
      $('indice').hidden = !abierto; $('btn-indice').setAttribute('aria-expanded', String(abierto));
    });

    const inicial = palabras.find(p => slug(p.palabra) === decodeURIComponent(location.hash.slice(1)));
    if (inicial) abrir(inicial);
  })
  .catch(() => {
    $('bosque').innerHTML = '<p style="padding:40px;font-style:italic;color:#a89880">No se pudo cargar datos/palabras.json. Abre la página desde un servidor (ver README).</p>';
  });

$('cerrar').addEventListener('click', cerrar);
$('velo').addEventListener('click', cerrar);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { cerrar(); cerrarIndice(); } });
