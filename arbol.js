// Herbario de palabras — dibuja un árbol cuyas hojas son las palabras.
// Cada grupo de 6 palabras cuelga de una rama que brota del tronco (las nuevas, más arriba);
// de cada rama sale una ramilla por palabra, y la hoja cuelga de su punta.

const SVGNS = 'http://www.w3.org/2000/svg';
const ANCHO = 1000;
// URL del buzón de propuestas (Google Apps Script). Vacía = sin propuestas.
const PROPUESTAS_URL = '';
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const TIPOGRAFIA_HOJA = '400 italic 17px Fraunces, Georgia, serif';

// ── utilidades ──
function azar(semilla) {            // pseudoaleatorio estable a partir de un texto
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
function slug(p) { return p.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function fecha(f) { const [a, m, d] = f.split('-'); return `${+d} de ${MESES[m - 1]} de ${a}`; }
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

const lienzo = document.createElement('canvas').getContext('2d');
function medir(texto) {              // ancho real del texto con la tipografía de las hojas
  lienzo.font = TIPOGRAFIA_HOJA;
  return lienzo.measureText(texto).width;
}

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

function disenar(palabras, brotes = []) {
  // ramas de hasta POR_RAMA palabras, en orden cronológico; los brotes propuestos, en la copa
  const POR_RAMA = 6, PASO = 200;
  const grupos = [];
  for (let i = 0; i < palabras.length; i += POR_RAMA) grupos.push(palabras.slice(i, i + POR_RAMA));
  for (let i = 0; i < brotes.length; i += POR_RAMA) grupos.push(brotes.slice(i, i + POR_RAMA));
  const R = grupos.length;
  const alto = Math.max(960, 640 + R * PASO);
  const base = alto - 90, cima = 120;
  const troncoEn = t => ({
    x: ANCHO / 2 + Math.sin(t * Math.PI * 0.9) * 16 + Math.sin(t * 17) * 2.5,
    y: base - (base - cima) * t,
  });

  const ramas = [], hojas = [], etiquetas = [];
  let mesAnterior = '';

  grupos.forEach((grupo, i) => {
    const y0 = base - 320 - i * PASO;
    const t = (base - y0) / (base - cima);
    const lado = i % 2 === 0 ? -1 : 1;
    const a = troncoEn(t);
    const r = azar(grupo[0].palabra);
    const b = { x: ANCHO / 2 + lado * (350 + r * 70), y: a.y - 200 - r * 50 };
    const c = { x: ANCHO / 2 + lado * 180, y: a.y - 18 };
    ramas.push({ a, c, b, grosor: 7.5 - t * 3, retraso: 0.5 + i * 0.22 });

    const mes = grupo[0].brote ? 'brotes' : grupo[0].fecha.slice(0, 7);
    if (mes === 'brotes' && mesAnterior !== 'brotes') {
      etiquetas.push({ x: b.x + lado * 14, y: b.y - 10, ancla: lado < 0 ? 'end' : 'start', texto: 'brotes propuestos' });
    } else if (mes !== 'brotes' && mes !== mesAnterior) {
      const [an, me] = mes.split('-');
      etiquetas.push({ x: b.x + lado * 14, y: b.y - 10, ancla: lado < 0 ? 'end' : 'start', texto: `${MESES[me - 1]} ${an}` });
    }
    mesAnterior = grupo[0].brote ? 'brotes' : grupo[grupo.length - 1].fecha.slice(0, 7);

    grupo.forEach((pal, j) => {
      const s = 0.24 + 0.72 * (j + 0.5) / grupo.length;
      const p = bez(a, c, b, s);
      const n = Math.hypot(p.tx, p.ty), tx = p.tx / n, ty = p.ty / n;
      const sg = j % 2 === 0 ? -1 : 1;                 // alterna arriba/abajo de la rama
      const nx = -ty * sg, ny = tx * sg;
      const largo = 54 + azar(pal.palabra + 'r') * 34;
      const ix = p.x + nx * largo + tx * 20, iy = p.y + ny * largo + ty * 20;
      const w = medir(pal.palabra) + 46;
      hojas.push({ pal, ix, iy, x: ix, y: iy, w, h: 42, desde: p, retraso: ramas[ramas.length - 1].retraso + s * 0.7 });
    });
  });

  // separar hojas que se tocan (relajación simple, con resorte hacia su lugar ideal)
  for (let it = 0; it < 360; it++) {
    for (let i = 0; i < hojas.length; i++) {
      for (let j = i + 1; j < hojas.length; j++) {
        const A = hojas[i], B = hojas[j];
        const dx = B.x - A.x, dy = B.y - A.y;
        const ox = (A.w + B.w) / 2 + 10 - Math.abs(dx), oy = (A.h + B.h) / 2 + 8 - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox < oy) { const k = (dx < 0 ? -1 : 1) * ox / 2; A.x -= k; B.x += k; }
          else { const k = (dy < 0 ? -1 : 1) * oy / 2; A.y -= k; B.y += k; }
        }
      }
    }
    for (const H of hojas) {
      H.x += (H.ix - H.x) * 0.02; H.y += (H.iy - H.y) * 0.02;
      const tx = ANCHO / 2, holgura = H.w / 2 + 20;     // no tapar el tronco
      if (Math.abs(H.x - tx) < holgura && H.y > cima) H.x = tx + (H.x < tx ? -holgura : holgura);
      H.x = Math.min(ANCHO - H.w / 2 - 6, Math.max(H.w / 2 + 6, H.x));
      H.y = Math.min(base - 50, Math.max(80, H.y));
    }
  }
  return { alto, base, cima, troncoEn, ramas, hojas, etiquetas };
}

// ── dibujo ──
// una línea que se afina: segmentos cortos de grosor decreciente que van creciendo uno tras otro
function trazoAfinado(padre, punto, N, g0, g1, clase, retraso, duracion) {
  for (let s = 0; s < N; s++) {
    const a = punto(s / N), b = punto((s + 1) / N);
    const seg = el('line', {
      class: `${clase} crece`, x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      'stroke-width': g0 + (g1 - g0) * (s + 0.5) / N, pathLength: 1,
    }, padre);
    seg.style.animationDuration = (duracion / N) + 's';
    seg.style.animationDelay = (retraso + s * duracion / N) + 's';
    seg.style.animationTimingFunction = 'linear';
  }
}

function dibujar(palabras, brotes) {
  const svg = document.getElementById('arbol');
  const g = disenar(palabras, brotes);
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${ANCHO} ${g.alto}`);
  const defs = el('defs', {}, svg);
  const brillo = el('radialGradient', { id: 'brillo' }, defs);
  el('stop', { offset: '0', 'stop-color': '#f7dd8a', 'stop-opacity': '.55' }, brillo);
  el('stop', { offset: '1', 'stop-color': '#f7dd8a', 'stop-opacity': '0' }, brillo);

  // suelo y raíces
  const raices = el('g', {}, svg);
  el('ellipse', { class: 'suelo', cx: ANCHO / 2, cy: g.base + 8, rx: 250, ry: 22 }, raices);
  const bx = g.troncoEn(0).x, by = g.base;
  // [hacia dónde llega, cuánto baja, dónde se curva, grosor inicial]
  for (const [dx, dy, cx, cy, gr] of [[-150, 30, -30, 26, 9], [145, 34, 30, 28, 9], [-70, 52, -26, 30, 7], [78, 56, 24, 34, 7], [-235, 20, -110, 22, 5], [230, 22, 105, 24, 5], [-20, 62, -6, 38, 5]]) {
    const A = { x: bx, y: by - 8 }, C = { x: bx + cx, y: by + cy }, B = { x: bx + dx, y: by + dy };
    trazoAfinado(raices, t => bez(A, C, B, t), 7, gr, 1.2, 'raiz-trazo', 1.2, 0.8);
  }

  // tronco: crece de abajo hacia arriba, cada vez más delgado
  const capaTronco = el('g', {}, svg);
  trazoAfinado(capaTronco, t => g.troncoEn(t), 28, 22, 3, 'tronco', 0.1, 1.5);
  el('text', { class: 'raiz', x: ANCHO / 2, y: g.base + 58, 'text-anchor': 'middle' }, svg).textContent = 'herbario';

  const capaRamas = el('g', {}, svg);
  for (const r of g.ramas) {
    trazoAfinado(capaRamas, t => bez(r.a, r.c, r.b, t), 9, r.grosor, 1.6, 'rama', r.retraso, 1.0);
  }
  for (const e of g.etiquetas) {
    const ancho = e.texto.length * 9.6;                    // la etiqueta no debe salirse del lienzo
    if (e.ancla === 'end' && e.x - ancho < 14) { e.ancla = 'start'; e.x = 14; }
    else if (e.ancla === 'start' && e.x + ancho > ANCHO - 14) { e.ancla = 'end'; e.x = ANCHO - 14; }
    el('text', { class: 'etiqueta-mes', x: e.x, y: e.y, 'text-anchor': e.ancla }, svg).textContent = e.texto.toUpperCase();
  }

  // hojas: cada una cuelga de su ramilla por un extremo (el más cercano a la rama)
  const capaHojas = el('g', {}, svg);
  for (const h of g.hojas) {
    const { w, h: alto } = h, x = w / 2, y = alto / 2;
    const dir = h.x >= h.desde.x ? 1 : -1;                 // la hoja se extiende hacia afuera de la rama
    const tipX = h.x - dir * x;                            // punto donde se une a la ramilla
    const arriba = h.y < h.desde.y ? -1 : 1;
    const inclin = dir * arriba * (3 + azar(h.pal.palabra) * 9);

    const ctrl = { x: h.desde.x + (tipX - h.desde.x) * 0.35, y: h.desde.y + (h.y - h.desde.y) * 0.8 };
    const ramilla = el('path', { class: 'ramilla crece', d: `M${h.desde.x},${h.desde.y} Q${ctrl.x},${ctrl.y} ${tipX},${h.y}`, 'stroke-width': 2, pathLength: 1 }, capaRamas);
    ramilla.style.animationDelay = h.retraso + 's';

    const grupo = el('g', {
      class: `hoja brota ${h.pal.brote ? 'brote' : tipo(h.pal.categoria)}`, transform: `translate(${tipX},${h.y})`,
      tabindex: 0, role: 'button', 'aria-label': h.pal.palabra, 'data-slug': slug(h.pal.palabra),
    }, capaHojas);
    grupo.style.animationDelay = (h.retraso + 0.6) + 's';

    const mece = el('g', { class: 'mece' }, grupo);
    mece.style.animationDuration = (6 + azar(h.pal.palabra + 'm') * 4) + 's';
    mece.style.animationDelay = '-' + (azar(h.pal.palabra + 'd') * 8) + 's';
    const lado = el('g', { transform: `translate(${dir * x},0) rotate(${inclin})` }, mece);
    const cuerpo = el('g', { class: 'cuerpo' }, lado);

    // hoja con base redondeada (donde cuelga) y punta afilada
    const s = dir, X = x;
    const lam = el('path', { class: 'lamina', d: `M${-s * X},0 C${-s * X * 0.55},${-y * 1.55} ${s * X * 0.32},${-y * 1.4} ${s * X},0 C${s * X * 0.32},${y * 1.4} ${-s * X * 0.55},${y * 1.55} ${-s * X},0 Z` }, cuerpo);
    if (!h.pal.brote) lam.style.opacity = (0.84 + azar(h.pal.palabra + 'o') * 0.16).toFixed(2);   // cada hoja, un tono apenas distinto
    el('path', { class: 'vena', d: `M${-s * X},0 L${-s * X + s * 14},0 M${s * X - s * 20},0 L${s * X - s * 4},0` }, cuerpo);
    el('text', { x: -s * w * 0.025, y: 1 }, cuerpo).textContent = h.pal.palabra;

    grupo.addEventListener('click', () => abrir(h.pal));
    grupo.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(h.pal); } });
  }

  // luciérnagas (se ven solo de noche)
  const luc = el('g', { class: 'luciernagas' }, svg);
  for (let i = 0; i < 22; i++) {
    const cx = 60 + azar('lx' + i) * (ANCHO - 120), cy = 120 + azar('ly' + i) * (g.alto - 300), r = 1.7 + azar('lr' + i) * 1.5;
    const c = el('g', { class: 'luciernaga', transform: `translate(${cx},${cy})` }, luc);
    const v = el('g', { class: 'vuela' }, c);
    el('circle', { class: 'halo', r: r * 6 }, v);
    el('circle', { class: 'punto', r }, v);
    v.style.setProperty('--dx', (azar('ldx' + i) * 90 - 45) + 'px');
    v.style.setProperty('--dy', (azar('ldy' + i) * -90 - 10) + 'px');
    v.style.animationDuration = (8 + azar('ld' + i) * 8) + 's';
    v.style.animationDelay = '-' + (azar('lt' + i) * 12) + 's';
  }
}

// ── ficha ──
const $ = id => document.getElementById(id);
function poner(id, bloque, texto) {
  $(id).textContent = vacio(texto) ? '' : texto;
  if (bloque) $(bloque).hidden = vacio(texto);
}
function todas() { return [...palabras, ...brotes]; }
let actual = null;

function abrir(p) {
  actual = p;
  const lista = todas(), pos = lista.indexOf(p);
  $('f-palabra').textContent = p.palabra;
  $('f-fonetica').textContent = p.fonetica || '';
  $('f-cat').textContent = p.brote ? 'brote propuesto' : (p.categoria || '');
  $('f-num').textContent = p.brote ? 'Brote' : `Ejemplar N.º ${String(pos + 1).padStart(3, '0')}`;
  $('f-fecha').textContent = p.fecha ? (p.brote ? `Propuesta el ${fecha(p.fecha)}` : `Recolectada el ${fecha(p.fecha)}`) : '';
  $('ficha').dataset.tipo = p.brote ? 'brote' : tipo(p.categoria);
  poner('f-esencia', null, p.esencia);
  poner('f-significado', 'b-significado', p.significado);
  poner('f-etimologia', 'b-etimologia', p.etimologia);
  poner('f-aura', 'b-aura', p.aura);
  poner('f-autor', null, p.brote ? (p.autor ? `Propuesta por ${p.autor}` : 'Propuesta anónima') : '');
  $('ant').disabled = pos <= 0;
  $('sig').disabled = pos >= lista.length - 1;
  document.querySelectorAll('.hoja.activa').forEach(h => h.classList.remove('activa'));
  document.querySelector(`.hoja[data-slug="${slug(p.palabra)}"]`)?.classList.add('activa');
  $('ficha').classList.add('abierta'); $('ficha').setAttribute('aria-hidden', 'false');
  $('velo').classList.add('visible'); $('ficha').querySelector('.ficha-cuerpo').scrollTop = 0;
  history.replaceState(null, '', '#' + slug(p.palabra));
  cerrarIndice();
}
function vecina(paso) {
  const lista = todas(), i = lista.indexOf(actual) + paso;
  if (actual && lista[i]) abrir(lista[i]);
}
function cerrar() {
  actual = null;
  $('ficha').classList.remove('abierta'); $('ficha').setAttribute('aria-hidden', 'true');
  $('velo').classList.remove('visible');
  document.querySelectorAll('.hoja.activa').forEach(h => h.classList.remove('activa'));
  history.replaceState(null, '', location.pathname);
}
function cerrarIndice() { $('indice').hidden = true; $('btn-indice').setAttribute('aria-expanded', 'false'); }

// ── inicio ──
let palabras = [], brotes = [];

function cargarBrotes() {
  if (!PROPUESTAS_URL) return Promise.resolve([]);
  return fetch(PROPUESTAS_URL).then(r => r.json())
    .then(d => (d.brotes || []).map(b => ({ ...b, brote: true })))
    .catch(() => []);
}

function armarIndice() {
  const lista = $('indice-lista');
  lista.innerHTML = '';
  todas().sort((a, b) => a.palabra.localeCompare(b.palabra, 'es')).forEach(p => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.textContent = p.palabra;
    li.dataset.buscar = slug(p.palabra);
    if (p.brote) b.className = 'es-brote';
    b.addEventListener('click', () => abrir(p));
    li.appendChild(b); lista.appendChild(li);
  });
}

function filtrarIndice() {
  const q = slug($('indice-buscar').value.trim());
  let visibles = 0;
  $('indice-lista').querySelectorAll('li:not(.sin-resultados)').forEach(li => {
    const ok = !q || li.dataset.buscar.includes(q);
    li.hidden = !ok; if (ok) visibles++;
  });
  let nada = $('indice-lista').querySelector('.sin-resultados');
  if (!visibles && !nada) { nada = document.createElement('li'); nada.className = 'sin-resultados'; nada.textContent = 'Ninguna palabra con esas letras.'; $('indice-lista').appendChild(nada); }
  if (nada) nada.hidden = !!visibles;
}

function palabraDeHoy() {            // una por día, prefiriendo las que ya tienen esencia
  const conEsencia = palabras.filter(p => !vacio(p.esencia));
  const pool = conEsencia.length ? conEsencia : palabras;
  return pool[Math.floor(Date.now() / 864e5) % pool.length];
}

function pintar() {
  const n = palabras.length;
  $('contador').textContent = (n === 1 ? '1 palabra' : `${n} palabras`) + (brotes.length ? ` · ${brotes.length} brotes` : '');
  dibujar(palabras, brotes);
  armarIndice();
  const hoy = palabraDeHoy();
  if (hoy) {
    $('hoy-palabra').textContent = hoy.palabra;
    $('hoy-esencia').textContent = vacio(hoy.esencia) ? '' : hoy.esencia;
    $('hoy').hidden = false;
    $('hoy').onclick = () => abrir(hoy);
  }
  centrar();
}

function centrar() {                 // en pantallas angostas el árbol se abre centrado
  const b = $('bosque');
  b.scrollLeft = (b.scrollWidth - b.clientWidth) / 2;
}

// la tipografía de las hojas se mide con la fuente real, así que se espera a que cargue
const fuentes = document.fonts && document.fonts.load
  ? Promise.race([document.fonts.load(TIPOGRAFIA_HOJA), new Promise(r => setTimeout(r, 2500))]).catch(() => {})
  : Promise.resolve();

Promise.all([fetch('datos/palabras.json').then(r => r.json()), cargarBrotes(), fuentes])
  .then(([p, b]) => {
    palabras = p.sort((x, y) => x.fecha.localeCompare(y.fecha));
    const conocidas = new Set(palabras.map(x => slug(x.palabra)));
    brotes = b.filter(x => !conocidas.has(slug(x.palabra)));   // si ya es hoja, no se repite como brote
    pintar();
    const inicial = todas().find(x => slug(x.palabra) === decodeURIComponent(location.hash.slice(1)));
    if (inicial) abrir(inicial);
  })
  .catch(() => {
    $('bosque').innerHTML = '<p style="padding:40px;font-style:italic;color:var(--suave)">No se pudo cargar datos/palabras.json. Abre la página desde un servidor (ver README).</p>';
  });

// ── índice ──
$('btn-indice').addEventListener('click', () => {
  const abrirlo = $('indice').hidden;
  $('indice').hidden = !abrirlo; $('btn-indice').setAttribute('aria-expanded', String(abrirlo));
  if (abrirlo) { $('indice-buscar').value = ''; filtrarIndice(); $('indice-buscar').focus(); }
});
$('indice-buscar').addEventListener('input', filtrarIndice);

// ── día y noche ──
function ponerTema(t, guardar) {
  document.documentElement.setAttribute('data-tema', t);
  $('tema-texto').textContent = t === 'noche' ? 'de día' : 'de noche';
  if (guardar) { try { localStorage.setItem('herbario-tema', t); } catch (e) {} }
}
ponerTema(document.documentElement.getAttribute('data-tema') || 'dia', false);
$('btn-tema').addEventListener('click', () => {
  ponerTema(document.documentElement.getAttribute('data-tema') === 'noche' ? 'dia' : 'noche', true);
});

// ── proponer una palabra ──
function cerrarProponer() { $('proponer').classList.remove('abierta'); }
if (!PROPUESTAS_URL) $('btn-proponer').hidden = true;

$('btn-proponer').addEventListener('click', () => {
  cerrar(); cerrarIndice();
  $('proponer').classList.add('abierta'); $('velo').classList.add('visible');
  $('p-aviso').textContent = ''; $('p-palabra').focus();
});

$('proponer-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const datos = {
    palabra: $('p-palabra').value.trim(), significado: $('p-significado').value.trim(),
    autor: $('p-autor').value.trim(), web: $('p-web').value,
  };
  if (!datos.palabra) return;
  if (!/^[\p{L}\s'-]+$/u.test(datos.palabra)) { $('p-aviso').textContent = 'Solo letras, por favor.'; return; }
  const boton = ev.submitter;
  boton.disabled = true; $('p-aviso').textContent = 'Plantando…';
  // text/plain evita la consulta CORS previa, que Apps Script no admite
  fetch(PROPUESTAS_URL, { method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
    .then(r => r.json())
    .then(r => {
      if (!r.ok) throw new Error(r.error);
      const s = slug(datos.palabra);
      if (!todas().some(x => slug(x.palabra) === s)) {
        brotes.push({ palabra: datos.palabra, significado: datos.significado, autor: datos.autor, fecha: new Date().toISOString().slice(0, 10), brote: true });
        pintar();
      }
      $('proponer-form').reset();
      $('p-aviso').textContent = r.repetida ? 'Esa palabra ya estaba propuesta. ¡Gracias!' : 'Gracias. Tu palabra ya brota en la copa del árbol.';
    })
    .catch(() => { $('p-aviso').textContent = 'No se pudo enviar. Intenta de nuevo en un momento.'; })
    .finally(() => { boton.disabled = false; });
});

$('cerrar').addEventListener('click', cerrar);
$('ant').addEventListener('click', () => vecina(-1));
$('sig').addEventListener('click', () => vecina(1));
$('cerrar-proponer').addEventListener('click', () => { cerrarProponer(); $('velo').classList.remove('visible'); });
$('velo').addEventListener('click', () => { cerrar(); cerrarProponer(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrar(); cerrarIndice(); cerrarProponer(); }
  if (actual && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
    if (e.key === 'ArrowLeft') vecina(-1);
    if (e.key === 'ArrowRight') vecina(1);
  }
});
window.addEventListener('resize', centrar);
