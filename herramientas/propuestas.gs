// Buzón de propuestas del Herbario de palabras (Google Apps Script).
// Va pegado en Extensiones → Apps Script de la planilla de propuestas.
// Columnas: fecha | palabra | significado | autor | visible
// Para ocultar una propuesta, cambia "visible" a FALSE en la planilla.

const HOJA = 'Propuestas';

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(HOJA);
  if (!h) {
    h = libro.insertSheet(HOJA);
    h.appendRow(['fecha', 'palabra', 'significado', 'autor', 'visible']);
    h.setFrozenRows(1);
  }
  return h;
}

function limpiar_(t, max) {
  return String(t || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Lista las propuestas visibles.
function doGet() {
  const filas = hoja_().getDataRange().getValues().slice(1);
  const brotes = filas
    .filter(f => f[1] && f[4] !== false && String(f[4]).toUpperCase() !== 'FALSE')
    .map(f => ({
      fecha: Utilities.formatDate(new Date(f[0]), 'America/Santiago', 'yyyy-MM-dd'),
      palabra: String(f[1]), significado: String(f[2] || ''), autor: String(f[3] || ''),
    }));
  return json_({ brotes });
}

// Recibe una propuesta nueva.
function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false }); }
  if (d.web) return json_({ ok: true });                 // campo trampa: lo llenan los robots
  const palabra = limpiar_(d.palabra, 40);
  if (!palabra || !/^[\p{L}\s'-]+$/u.test(palabra)) return json_({ ok: false, error: 'palabra no válida' });

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const h = hoja_();
    const existentes = h.getRange(2, 2, Math.max(h.getLastRow() - 1, 1), 1).getValues().flat().map(x => String(x).toLowerCase());
    if (existentes.includes(palabra.toLowerCase())) return json_({ ok: true, repetida: true });
    h.appendRow([new Date(), palabra, limpiar_(d.significado, 400), limpiar_(d.autor, 40), true]);
  } finally { lock.releaseLock(); }
  return json_({ ok: true });
}
