/* Código de Llull — vida en la Orden: protección de los datos, Breviario, aniversario,
   lámina del año, crónica del caballero y preparación de la confesión. */
'use strict';

/* ---------- 1. Proteger los datos ---------- */
async function asegurarPersistencia(){
  try {
    if (!navigator.storage || !navigator.storage.persist) return;
    let ok = await navigator.storage.persisted();
    if (!ok) ok = await navigator.storage.persist();
    S.persistente = !!ok; guardar();
  } catch(e){}
}
function avisoCopiaAlAbrir(){
  if (!S.perfil) return;
  const h = hoyISO();
  if (S.avisoCopiaDia === h) return;
  if (S.ultimaCopia == null || difDias(S.ultimaCopia, h) > 30) {
    S.avisoCopiaDia = h; guardar();
    setTimeout(() => toast(S.ultimaCopia ? `Tu última copia de seguridad es de hace ${difDias(S.ultimaCopia, h)} días. Haz una en Más › Copia de seguridad.` : 'Aún no has hecho ninguna copia de seguridad. Hazla en Más › Copia de seguridad.', 5500), 2800);
  }
}

/* ---------- 3. El Breviario Romano de 1962 (misma web: se lee sin servidor y queda guardado) ---------- */
const BREVIARIO = '../Breviario_Romano_1962/';
const CACHE_BREV = {};
async function diaBreviario(fecha){
  const mes = fecha.slice(0, 7);
  if (!(mes in CACHE_BREV)) {
    try { const r = await fetch(`${BREVIARIO}data/m-${mes}.json`); CACHE_BREV[mes] = r.ok ? await r.json() : null; }
    catch(e){ CACHE_BREV[mes] = null; }
  }
  const M = CACHE_BREV[mes]; if (!M || !M[fecha]) return null;
  const d = M[fecha], partes = (d.title || '').split('~');
  const clase = partes[1] ? partes[1].trim().replace(/\.?\s*classis/i, ' clase').replace(/\s+/g, ' ') : '';
  return { nombre: d.te || partes[0].trim(), latin: partes[0].trim(), clase };
}
function enlaceHora(fecha, hora){ return `${BREVIARIO}#/d/${fecha}/${hora}`; }
async function rellenarBreviario(){
  const el = document.getElementById('brevDia'); if (!el) return;
  const f = el.dataset.f, d = await diaBreviario(f);
  if (!d) { el.remove(); return; }
  el.innerHTML = `<b>${esc(d.nombre)}</b>${d.clase ? ` <span class="peq">· ${esc(d.clase)}</span>` : ''}<br><span class="peq"><i>${esc(d.latin)}</i></span>
    <div class="fila" style="margin-top:6px"><a class="btn sec" href="${enlaceHora(f,'L')}" target="_blank" rel="noopener">Laudes</a><a class="btn sec" href="${enlaceHora(f,'C')}" target="_blank" rel="noopener">Completas</a></div>`;
}

/* ---------- 4. Aniversario de la investidura ---------- */
function aniversario(){
  if (S.situacion !== 'orden' || !S.investidura || !S.investidura.completada) return null;
  const c = deISO(S.investidura.completada), h = new Date();
  const anos = h.getFullYear() - c.getFullYear(); if (anos < 1) return null;
  const este = new Date(h.getFullYear(), c.getMonth(), c.getDate());
  const dif = difDias(hoyISO(este), hoyISO(h));
  if (dif < 0 || dif > 7) return null;
  const renovado = (S.renovaciones || []).some(r => r.slice(0,4) === String(h.getFullYear()));
  return { anos, renovado, fecha: hoyISO(este) };
}
function tarjetaAniversario(){
  const A = aniversario(); if (!A) return '';
  if (A.renovado) return `<div class="card oro"><h2>Aniversario de tu investidura</h2><p>Has renovado tu juramento. ${A.anos} ${A.anos===1?'año':'años'} en la Orden.</p><button class="btn sec" data-a="laminaAnual">Lámina del año</button></div>`;
  return `<div class="card roja"><h2>Aniversario de tu investidura</h2>
    <p>Hoy se cumple${A.anos===1?'':'n'} ${A.anos} ${A.anos===1?'año':'años'} desde que fuiste ${fem()?'armada':'armado'}${S.investidura.nombre ? ` en la fiesta de ${esc(S.investidura.nombre)}` : ''}${S.perfil.padrino ? `, ante tu padrino ${esc(S.perfil.padrino)}` : ''}.</p>
    <p>Vela breve: lee de nuevo lo que te obliga (IV, §§11–12) y renueva tu juramento.</p>
    <div class="card" style="background:#fff"><p><i>${esc(JURAMENTO)}</i></p></div>
    <div class="fila"><button class="btn" data-a="renovar">Renuevo mi juramento</button><button class="btn sec" data-a="laminaAnual">Lámina del año</button></div></div>`;
}
function renovarJuramento(){
  S.renovaciones = S.renovaciones || [];
  S.renovaciones.push(hoyISO()); S.honra += 100;
  anotar(`Renueva su juramento en el aniversario de su investidura${S.perfil.padrino ? `, ante su padrino ${S.perfil.padrino}` : ''}.`, 'honor');
  guardar();
}
function balanceDelAno(){
  const h = hoyISO(), dias = Object.entries(S.dias).filter(([f]) => difDias(f, h) < 365 && difDias(f, h) >= 0);
  const superados = dias.filter(([,d]) => d.superado).length;
  const honra = dias.reduce((a,[,d]) => a + (d.honra || 0), 0);
  const pruebas = dias.reduce((a,[,d]) => a + (d.pruebas || []).filter(p => p.ok).length, 0);
  const enVirtud = BALANZAS.filter(B => zona(S.balanzas[B.id]) === 'virtud').length;
  const hechos = S.historial.filter(x => x.tipo === 'honor' && difDias(x.fecha, h) < 365).slice(0, 5).map(x => x.evento);
  return { superados, honra, pruebas, enVirtud, hechos, cercania: cercania(S.balanzas) };
}
async function laminaAnualPNG(){
  const W = 1080, H = 1560, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  try { await Promise.all([document.fonts.load('80px UnifrakturMaguntia'), document.fonts.load('40px "EB Garamond"'), document.fonts.load('italic 40px "EB Garamond"'), document.fonts.load('600 40px "EB Garamond"')]); } catch(e){}
  x.fillStyle = '#F6F0E1'; x.fillRect(0,0,W,H);
  x.strokeStyle = '#9E1F17'; x.lineWidth = 18; x.strokeRect(30,30,W-60,H-60);
  x.strokeStyle = '#1B1A1A'; x.lineWidth = 3; x.strokeRect(58,58,W-116,H-116);
  x.strokeStyle = '#B8891F'; x.lineWidth = 2; x.strokeRect(70,70,W-140,H-140);
  const centro = (t, y, font, color) => { x.font = font; x.fillStyle = color; x.textAlign = 'center'; x.fillText(t, W/2, y); };
  const B = balanceDelAno(), A = aniversario();
  centro('Libro de la Orden de Caballería', 160, '60px UnifrakturMaguntia', '#9E1F17');
  centro(A ? `${A.anos}.º año en la Orden` : 'Un año en la Orden', 225, 'italic 42px "EB Garamond", Georgia, serif', '#3A2F27');
  const u = retratoURL();
  const armas = await cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logroSVG(S.blason, S.grado, null)));
  if (u) { const med = await cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(medallonSVG(300).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))); x.drawImage(med, 150, 280, 300, 300); x.drawImage(armas, 600, 260, 320, 416); }
  else x.drawImage(armas, (W-340)/2, 260, 340, 442);
  centro(S.perfil.nombre, 760, '600 56px "EB Garamond", Georgia, serif', '#1B1A1A');
  centro(nombreGrado(), 828, '52px UnifrakturMaguntia', '#9E1F17');
  const filas = [
    ['Cercanía a lo que la Orden pide', `${B.cercania} %`],
    ['Balanzas en el fiel de la virtud', `${B.enVirtud} de ${BALANZAS.length}`],
    ['Días superados en el año', `${B.superados}`],
    ['Pruebas superadas', `${B.pruebas}`],
    ['Honra ganada', `${B.honra}`]
  ];
  let y = 920;
  x.font = '34px "EB Garamond", Georgia, serif';
  for (const [k, v] of filas) {
    x.textAlign = 'left'; x.fillStyle = '#3A2F27'; x.fillText(k, 170, y);
    x.textAlign = 'right'; x.fillStyle = '#9E1F17'; x.font = '600 34px "EB Garamond", Georgia, serif'; x.fillText(v, W - 170, y);
    x.font = '34px "EB Garamond", Georgia, serif';
    x.strokeStyle = '#D9CCB0'; x.lineWidth = 1; x.beginPath(); x.moveTo(170, y + 14); x.lineTo(W - 170, y + 14); x.stroke();
    y += 58;
  }
  if (B.hechos.length) {
    y += 16; centro('Hechos señalados', y, '600 32px "EB Garamond", Georgia, serif', '#1B1A1A'); y += 44;
    for (const h of B.hechos.slice(0, 4)) { const t = h.length > 70 ? h.slice(0, 68) + '…' : h; centro(t, y, 'italic 27px "EB Garamond", Georgia, serif', '#3A2F27'); y += 38; }
  }
  if (S.perfil.padrino) centro(`Padrino: ${S.perfil.padrino}`, H - 170, 'italic 32px "EB Garamond", Georgia, serif', '#3A2F27');
  centro('AMDG', H - 105, '40px UnifrakturMaguntia', '#9E1F17');
  return new Promise((ok, ko) => c.toBlob(b => b ? ok(b) : ko(new Error('png')), 'image/png'));
}
async function compartirBlob(blob, nombre, titulo){
  const file = new File([blob], nombre, { type: blob.type || 'application/octet-stream' });
  if (navigator.canShare && navigator.canShare({ files:[file] })) { try { await navigator.share({ files:[file], title: titulo }); return; } catch(e){ if (e && e.name === 'AbortError') return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(), 1000);
}

/* ---------- 5. Crónica del caballero ---------- */
const PRETERITOS = [
  [/^(.+?) se presenta a la Orden\.?$/, 'se presentó a la Orden, deseoso de entrar en ella'],
  [/^Aprueba el examen de (ingreso|reingreso)/, m => `fue examinado conforme a la Parte III y hallado digno en el examen de ${m[1]}`],
  [/^Aprueba el examen de condado/, () => 'fue examinado para el condado y hallado digno'],
  [/^Aprueba el examen, pero no tiene la edad conveniente/, () => 'fue hallado digno, pero, por no tener aún la edad conveniente, siguió sirviendo como escudero'],
  [/^No supera el examen: comienza su año de escudería/, () => 'no fue hallado aún apto, y comenzó su año de escudería'],
  [/^No supera el examen\./, () => 'no fue hallado aún apto en el examen'],
  [/^Señala para su investidura la fiesta de (.+?) \(/, m => `señaló para ser armado la fiesta de ${m[1]}`],
  [/^Toma por padrino a (.+)\.$/, m => `tomó por padrino a ${m[1]}`],
  [/^Toma por armas: (.+)$/, m => `tomó por armas: ${m[1].replace(/\.$/, '')}`],
  [/^Armad[oa] en la fiesta de (.+?): (.+)\.$/, m => `fue armado en la fiesta de ${m[1]}, y recibió el grado de ${m[2]}`],
  [/^Asciende al grado de (.+)\.$/, m => `ascendió al grado de ${m[1]}`],
  [/^Renueva su juramento(.*)\.$/, m => `renovó su juramento${m[1]}`],
  [/^Pierde con deshonor (.+)\.?/, m => `perdió con deshonor ${m[1].replace(/\.$/, '').replace('Debe reconquistarlo', 'y hubo de reconquistarlo').replace('Debe reconquistarlas', 'y hubo de reconquistarlas')}`],
  [/^Degradación: (.+)\.?/, m => `sufrió degradación: ${m[1].replace(/\.$/, '').replace('Pierde', 'perdió').replace('Vuelve', 'volvió')}`],
  [/^Expulsión de la Orden\. Falta grave/, () => 'fue expulsado de la Orden por falta grave'],
  [/^Expulsión de la Orden\. Acidia/, () => 'fue expulsado de la Orden por acidia'],
  [/^Expulsión de la Orden\./, () => 'fue expulsado de la Orden'],
  [/^(.+?): el fiel llega al rojo \((.+?)\)\..*$/, m => `su balanza de ${m[1].toLowerCase()} llegó al rojo, por ${m[2]}`],
  [/^(.+?): siete noches seguidas en el rojo.*$/, m => `su balanza de ${m[1].toLowerCase()} permaneció siete noches en el rojo`],
  [/^Sitúa sus balanzas/, () => 'situó por primera vez sus balanzas'],
  [/^Medición de conducta: cercanía a la Orden (\d+) %\.?$/, m => `midió su conducta, y se halló a un ${m[1]} % de lo que la Orden pide de él`],
  [/^Repite el examen/, () => 'repitió el examen de ingreso'],
  [/^No se mantuvo: el año de escudería comienza de nuevo/, () => 'no se mantuvo, y comenzó de nuevo su año de escudería']
];
function aPreterito(ev){
  for (const [re, f] of PRETERITOS) { const m = ev.match(re); if (m) return typeof f === 'function' ? f(m) : f; }
  return ev.charAt(0).toLowerCase() + ev.slice(1).replace(/\.$/, '');
}
function genero(t){
  if (!fem()) return t;
  return t.replace(/\barmado\b/g,'armada').replace(/\bdeseoso\b/g,'deseosa').replace(/\bexpulsado\b/g,'expulsada')
          .replace(/hallado digno/g,'hallada digna').replace(/\bapto\b/g,'apta').replace(/\bde él\b/g,'de ella');
}
function cronicaTexto(){
  const N = S.perfil.nombre, ev = [...S.historial].reverse();
  const porAno = {};
  for (const e of ev) (porAno[e.fecha.slice(0,4)] = porAno[e.fecha.slice(0,4)] || []).push(e);
  const parrafos = [];
  parrafos.push({ t:`Crónica de ${N}, ${nombreGrado()}, de la Orden de Caballería`, h:1 });
  parrafos.push({ t:'Aquí comienza la crónica de los hechos de quien quiso entrar en la Orden de Caballería y servir en ella a Dios, según la regla que escribió el Beato Ramon Llull en el Libro de la Orden de Caballería.' });
  for (const ano of Object.keys(porAno).sort()) {
    parrafos.push({ t:`Del año ${ano}`, h:2 });
    for (const e of porAno[ano]) {
      const f = deISO(e.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long' });
      const frase = aPreterito(e.evento);
      parrafos.push({ t:genero(`El ${f}, ${frase.charAt(0).toLowerCase() + frase.slice(1)}.`.replace(/\.\.$/, '.')), tipo: e.tipo });
    }
  }
  if (S.investidura && S.investidura.pasos && typeof S.investidura.pasos.dadivas === 'string') parrafos.push({ t:`El día de su investidura repartió esta dádiva: ${S.investidura.pasos.dadivas}.` });
  const deseos = Object.entries(S.dias).filter(([,d]) => d.deseo).sort().slice(-12);
  if (deseos.length) {
    parrafos.push({ t:'De sus grandes deseos', h:2 });
    for (const [f, d] of deseos) parrafos.push({ t:`El ${deISO(f).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })} deseó: «${d.deseo}».` });
  }
  parrafos.push({ t:genero(`Hoy se halla a un ${cercania(S.balanzas)} % de lo que la Orden pide de él, y su honra es de ${S.honra}.`) });
  parrafos.push({ t:'Ad maiorem Dei gloriam.' });
  return parrafos;
}
function vistaCronica(){
  if (!S.perfil) return '<p>Aún no hay crónica.</p>';
  const P = cronicaTexto();
  return `<button class="btn sec" data-a="tab" data-v="orden">‹ La Orden</button>
    <div class="card" style="margin-top:10px">${P.map(p => p.h === 1 ? `<h1 style="font-size:1.5em">${esc(p.t)}</h1>` : p.h === 2 ? `<h2>${esc(p.t)}</h2>` : `<p class="${p.tipo==='deshonor'?'rub':''}" style="text-align:justify">${esc(p.t)}</p>`).join('')}</div>
    <div class="fila">${vozDisponible() ? '<button class="btn" data-a="leerCronica">Escuchar la crónica</button>' : ''}<button class="btn sec" data-a="descargarCronica">Descargar</button></div>`;
}

/* ---------- 6. Preparación de la confesión (nada de lo que se marca se guarda) ---------- */
const EXAMEN_CONFESION = {
  mandamientos: [
    ['Adorarás y servirás a un solo Dios', ['¿He dejado mis oraciones o las he hecho sin atención?','¿He dudado voluntariamente de la fe o me he avergonzado de ella?','¿He creído en agüeros, adivinaciones u horóscopos? (VI, §17)']],
    ['No jurarás en vano', ['¿He jurado en falso o sin necesidad?','¿He blasfemado o nombrado a Dios, a la Virgen o a los santos sin respeto?']],
    ['Santificarás las fiestas', ['¿He faltado a Misa en domingo o fiesta de precepto sin causa grave?','¿He trabajado sin necesidad en día de fiesta?']],
    ['Honrarás a tu padre y a tu madre', ['¿He faltado al respeto o a la ayuda debida a mis padres?','¿He descuidado mis deberes con mi familia o con quienes dependen de mí?']],
    ['No matarás', ['¿He guardado odio, rencor o deseo de venganza?','¿He puesto en peligro sin necesidad mi vida o la ajena?','¿He dado escándalo o mal ejemplo?']],
    ['No fornicarás', ['¿He consentido miradas, pensamientos, palabras o actos impuros?','¿He faltado a la fidelidad debida en mi estado?']],
    ['No hurtarás', ['¿He tomado lo ajeno, o no he devuelto lo que debía?','¿He defraudado en mi trabajo, en mis tratos o en los impuestos justos?']],
    ['No darás falso testimonio', ['¿He mentido?','¿He calumniado, murmurado o revelado secretos que debía guardar?']],
    ['No desearás la mujer de tu prójimo', ['¿He consentido deseos impuros sobre persona casada o ajena a mi estado?']],
    ['No codiciarás los bienes de tu prójimo', ['¿He envidiado o codiciado lo que es de otros?']]
  ],
  pecados: [
    ['Soberbia', 'VI, §13', '¿He buscado ser alabado, o me he puesto por encima de los demás?', 'magnanimidad'],
    ['Avaricia', 'VI, §11', '¿He puesto mi corazón en el dinero y negado lo que debía dar?', 'largueza'],
    ['Lujuria', 'VI, §10', '¿He cedido a la impureza en pensamiento, palabra u obra?', 'castidad'],
    ['Ira', 'VI, §15', '¿Me he dejado llevar por la ira o he tratado a alguien con dureza?', 'mansedumbre'],
    ['Gula', 'VI, §9', '¿He comido o bebido sin medida?', 'mesa'],
    ['Envidia', 'VI, §14', '¿Me he entristecido del bien ajeno o alegrado de su mal?', 'benevolencia'],
    ['Acidia', 'VI, §12', '¿He descuidado por desgana mis deberes, sobre todo los que miran a Dios?', 'diligencia']
  ],
  oficio: [
    ['Sostener la santa fe católica', 'II, §2', '¿He defendido la fe cuando debía, o la he callado por respeto humano?'],
    ['Defender a su señor', 'II, §8', '¿He sido leal a quien sirvo y a quien me debo?'],
    ['Mantener la justicia', 'II, §9', '¿He dado a cada uno lo suyo, en mi casa y en mi trabajo?'],
    ['Amparar a viudas, huérfanos y desvalidos', 'II, §19', '¿He socorrido a quien necesitaba mi ayuda y podía darla?'],
    ['Guardar la tierra', 'II, §§12, 22', '¿He servido al bien común de mi tierra y de los míos?']
  ]
};
const ACTO_CONTRICION = 'Señor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío; por ser Vos quien sois, Bondad infinita, y porque Os amo sobre todas las cosas, me pesa de todo corazón haberos ofendido; también me pesa porque podéis castigarme con las penas del infierno. Ayudado de Vuestra divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuere impuesta. Amén.';
function vistaConfesion(){
  const chk = t => `<label class="fila" style="align-items:flex-start;margin:6px 0"><input type="checkbox" style="width:22px;height:22px;flex:none;margin-top:3px"> <span>${esc(t)}</span></label>`;
  const malas = BALANZAS.filter(B => ['amenaza','peligro'].includes(zona(S.balanzas[B.id])));
  return `<h1>Preparar la confesión</h1>
    <div class="card roja"><p>«Primeramente, el escudero, antes de entrar en la Orden de Caballería, debe confesarse de las faltas que ha cometido contra Dios, a quien quiere servir en ella.» <span class="ref">IV, §1</span></p>
      <p class="peq"><b>Nada de lo que marques aquí se guarda:</b> al salir de esta pantalla se borra.</p></div>
    ${malas.length ? `<div class="aviso">Tus balanzas señalan estos frentes: ${malas.map(B => `<b>${esc(B.nombre)}</b> (${esc(ladoNombre(B, S.balanzas[B.id]).split(':')[0].toLowerCase())})`).join(', ')}.</div>` : ''}
    <div class="card"><h2>Los diez mandamientos</h2><p class="peq">Como los da el Libro (IV, §6).</p>
      ${EXAMEN_CONFESION.mandamientos.map(([m, qs], i) => `<h3>${i+1}. ${esc(m)}</h3>${qs.map(chk).join('')}`).join('')}</div>
    <div class="card"><h2>Los siete pecados capitales</h2><p class="peq">Contra ellos está la fortaleza (VI, §8).</p>
      ${EXAMEN_CONFESION.pecados.map(([n, ref, q]) => `<h3>${esc(n)} <span class="ref">${ref}</span></h3>${chk(q)}`).join('')}</div>
    <div class="card"><h2>Los deberes del oficio</h2>
      ${EXAMEN_CONFESION.oficio.map(([n, ref, q]) => `<h3>${esc(n)} <span class="ref">${ref}</span></h3>${chk(q)}`).join('')}</div>
    <div class="card oro"><h2>Acto de contrición</h2><p><i>${esc(ACTO_CONTRICION)}</i></p></div>
    <button class="btn ancho" data-a="meConfese">Me he confesado</button>`;
}
function marcarConfesion(){
  S.confesiones = S.confesiones || []; S.confesiones.push(hoyISO());
  if (S.situacion === 'expulsado' && S.penitencia) S.penitencia.confesion = true;
  if (S.investidura && !S.investidura.completada && S.investidura.pasos) {
    const I = estadoInvestidura();
    if (I && (I.vigilia || I.dia || ENSAYO)) S.investidura.pasos.confesion = true;
  }
  guardar();
}
