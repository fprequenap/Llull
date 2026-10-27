/* Código de Llull — motor de la Orden: estado, días, pruebas, grados, caída, expulsión y redención. */
'use strict';

const CLAVE = 'codigoLlull.v1';
const EDAD_MIN = 14, EDAD_ARMAR = 18, EDAD_CONDE = 60;
const DIAS_ESCUDERIA = 365, VENTANA = 20, DIAS_ACIDIA = 30;
const PENITENCIA = { falta:40, acidia:30, caida:0 };

/* ---------- utilidades de fecha ---------- */
function hoyISO(d){ d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function deISO(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function difDias(a, b){ return Math.round((deISO(b) - deISO(a)) / 86400000); }
function diaDelAno(d){ return Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000); }
function edadEn(nac, d){ const n = deISO(nac); d = d || new Date(); let e = d.getFullYear() - n.getFullYear(); if (d.getMonth() < n.getMonth() || (d.getMonth() === n.getMonth() && d.getDate() < n.getDate())) e--; return e; }
function hash(str){ let h = 2166136261; for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function fechaLarga(d){ return d.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' }); }

/* ---------- estado ---------- */
function estadoNuevo(){
  return {
    v:1, creado: hoyISO(),
    perfil:null,                 // {nombre, sexo:'m'|'f', nac:'YYYY-MM-DD', opcionales:[]}
    situacion:'nuevo',           // nuevo | escudero | aspirante | orden | expulsado | rechazado
    grado:0,
    escuderia:{ dias:0, inicio:null },
    examenes:[],                 // {fecha, tipo, aprobado, nota, detalle}
    proximoExamen:null,          // fecha a partir de la cual puede repetir
    investidura:null,            // {fecha, nombre, pasos:{}, grado}
    blason:null, abatido:false,
    prog:{ virt:{}, armas:{}, oficios:{}, fisico:{}, desde:hoyISO() },
    armasConocidas:{},           // escudero: armas aprendidas
    dias:{},                     // por fecha
    honra:0,
    caidaDesde:null,             // los fallos se cuentan desde aquí
    penitencia:null,             // {causa, req, dias, confesion}
    usadas:{},                   // año → índices de divisas usadas
    ultimoExamenNoche:null,
    historial:[],
    ajustes:{ tam:19, columnas:'ambas', horaManana:'07:00', horaNoche:'22:00' },
    ultimaCopia:null
  };
}
let S = null;
function cargar(){
  try { const t = localStorage.getItem(CLAVE); S = t ? JSON.parse(t) : estadoNuevo(); }
  catch(e){ S = estadoNuevo(); }
  const base = estadoNuevo();
  for (const k in base) if (S[k] === undefined) S[k] = base[k];
  return S;
}
function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch(e){} }
function anotar(evento, tipo){ S.historial.unshift({ fecha: hoyISO(), evento, tipo: tipo||'info' }); if (S.historial.length > 400) S.historial.length = 400; }

/* ---------- perfil y coeficientes ---------- */
function edad(){ return S.perfil ? edadEn(S.perfil.nac) : 0; }
function fem(){ return S.perfil && S.perfil.sexo === 'f'; }
function nombreGrado(g, corto){
  if (S.situacion === 'expulsado') return fem() ? 'Expulsada de la Orden' : 'Expulsado de la Orden';
  if (S.situacion === 'aspirante') return fem() ? 'Escudera aprobada, en espera de investidura' : 'Escudero aprobado, en espera de investidura';
  if (S.situacion === 'rechazado') return 'No admitido';
  if (S.situacion === 'nuevo') return 'Aspirante al examen';
  const G = GRADOS[g == null ? S.grado : g];
  if (corto && G.corto_m) return fem() ? G.corto_f : G.corto_m;
  return fem() ? G.f : G.m;
}
function cMoral(){ return coefMoral(edad(), S.situacion === 'orden' ? S.grado : 0); }
function cFisico(){ return coefFisico(edad()); }
function tolerancia(){ return Math.floor(5 / cMoral()); }
function notaMinima(grado){ return Math.min(0.99, 0.70 * coefMoral(edad(), grado == null ? S.grado : grado)); }
function numPruebasMorales(){ const c = cMoral(); return c >= 1.30 ? 3 : c >= 1.15 ? 2 : 1; }
function numPreguntasNoche(){ const c = cMoral(); return c >= 1.30 ? 7 : c >= 1.15 ? 5 : 3; }

/* ---------- la divisa del día ---------- */
function indiceBase(d){ return (diaDelAno(d) - 1) % DIVISAS.length; }
function divisaDelDia(fecha, animo, circ){
  const d = deISO(fecha);
  const k = `${d.getMonth()+1}-${d.getDate()}`;
  if (SANTOS_CABALLEROS[k]) { const [santo, t, ref] = SANTOS_CABALLEROS[k]; return { t, ref, santo, idx:-1, v:[] }; }
  const A = ANIMOS.find(a => a.id === animo) || ANIMOS[0];
  const C = CIRCUNSTANCIAS.find(c => c.id === circ) || CIRCUNSTANCIAS[0];
  const objetivo = [...new Set([...A.remedio, ...C.virt])];
  const base = indiceBase(d);
  const y = String(d.getFullYear());
  const usadas = new Set(S.usadas[y] || []);
  let idx = base;
  if (objetivo.length) {
    let cand = DIVISAS.map((x,i)=>[x,i]).filter(([x]) => x.v.some(v => objetivo.includes(v)));
    const libres = cand.filter(([,i]) => !usadas.has(i));
    if (libres.length) cand = libres;
    if (cand.length) idx = cand[hash(fecha + animo + circ) % cand.length][1];
  }
  const x = DIVISAS[idx];
  return { t: x.t, ref: `${LIBRO.partes[x.p].nombre}, §${x.n}`, p:x.p, n:x.n, idx, v:x.v, a:x.a };
}
function marcarUsada(fecha, idx){
  if (idx < 0) return;
  const y = fecha.slice(0,4); S.usadas[y] = S.usadas[y] || [];
  if (!S.usadas[y].includes(idx)) S.usadas[y].push(idx);
}

/* ---------- pruebas del día ---------- */
function virtudesObjetivo(animo, circ){
  const A = ANIMOS.find(a => a.id === animo) || ANIMOS[0];
  const C = CIRCUNSTANCIAS.find(c => c.id === circ) || CIRCUNSTANCIAS[0];
  return [...new Set([...A.remedio, ...C.virt].map(v => v === 'humildad' ? 'templanza' : v))];
}
function pruebaMoral(v, semilla, excluir){
  const L = PRUEBAS[v]; let i = semilla % L.length, n = 0;
  while (excluir.has(`${v}:${i}`) && n++ < L.length) i = (i+1) % L.length;
  excluir.add(`${v}:${i}`);
  const [t, d, ref] = L[i];
  return { tipo:'moral', v, id:`${v}:${i}`, t, d, ref, ok:null };
}
function generarDia(fecha, animo, circ){
  const sem = hash(fecha + (S.perfil ? S.perfil.nombre : ''));
  const objetivo = virtudesObjetivo(animo, circ);
  const n = numPruebasMorales();
  // las virtudes de remedio primero; después, las menos probadas
  const orden = [...objetivo];
  const resto = VIRTUDES.map(v => v.id).filter(v => !orden.includes(v))
    .sort((a,b) => ((S.prog.virt[a]||0) - (S.prog.virt[b]||0)) || ((hash(fecha+a)%7) - (hash(fecha+b)%7)));
  orden.push(...resto);
  const usadas = new Set(), pruebas = [];
  for (let i=0; i<n; i++) pruebas.push(pruebaMoral(orden[i], sem + i*31, usadas));
  // armas: el escudero aprende una cada 20 días; el caballero hacia Valvasor prueba las que le faltan
  if (S.situacion === 'escudero' || S.situacion === 'aspirante') {
    const ia = Math.min(ARMAS.length-1, Math.floor((S.escuderia.dias||0) / 20));
    const a = ARMAS[ia];
    if (!S.armasConocidas[a.id]) pruebas.push({ tipo:'arma', id:a.id, v:a.virtud, t:`Aprender el arma: ${a.nombre}`, d:`${a.sig} — Prueba: ${a.prueba}`, ref:`V, §${a.n}`, ok:null });
  } else if (S.situacion === 'orden' && S.grado === 1) {
    const faltan = ARMAS.filter(a => !S.prog.armas[a.id]);
    if (faltan.length && sem % 3 === 0) { const a = faltan[sem % faltan.length]; pruebas.push({ tipo:'arma', id:a.id, v:a.virtud, t:`Prueba del arma: ${a.nombre}`, d:`${a.sig} — ${a.prueba}`, ref:`V, §${a.n}`, ok:null }); }
  } else if (S.situacion === 'orden' && S.grado === 2) {
    const faltan = OFICIOS.filter(o => (S.prog.oficios[o.id]||0) < REQ_OFICIO);
    if (faltan.length && sem % 2 === 0) { const o = faltan[sem % faltan.length]; const k = (S.prog.oficios[o.id]||0); pruebas.push({ tipo:'oficio', id:o.id, v:'justicia', t:`Oficio: ${o.nombre}`, d:o.pruebas[k % o.pruebas.length], ref:o.ref, ok:null }); }
  }
  // prueba física aleatoria: dos días por semana
  const lunes = deISO(fecha); lunes.setDate(lunes.getDate() - ((lunes.getDay()+6)%7));
  const hs = hash(hoyISO(lunes) + 'fis');
  const d1 = hs % 6, d2 = (d1 + 2 + (hs>>3) % 3) % 6;
  const dow = (deISO(fecha).getDay()+6)%7;
  let fisica = null;
  if (S.perfil && (dow === d1 || dow === d2)) {
    const L = pruebasFisicas(edad(), S.perfil.sexo);
    const faltan = L.filter(p => !S.prog.fisico[p.id]);
    const pool = faltan.length ? faltan : L;
    const p = pool[(hs + dow) % pool.length];
    fisica = { ...p, valor:null, ok:null };
  }
  return { animo, circ, pruebas, fisica, ejercicio:false, opcionales:[], examen:null, cerrado:false, superado:null, honra:0 };
}

/* ---------- cierre del día (examen de la noche) ---------- */
function fallosRecientes(){
  const desde = S.caidaDesde;
  let f = 0;
  const hoy = hoyISO();
  for (const [fecha, d] of Object.entries(S.dias)) {
    if (difDias(fecha, hoy) >= VENTANA) continue;
    if (desde && fecha <= desde) continue;
    if (!d.cerrado) continue;
    f += d.pruebas.filter(p => p.tipo !== 'fisica' && p.ok === false).length;
  }
  return f;
}
function multiplicador(d){
  let m = 1;
  for (const id of d.opcionales) { const o = OPCIONALES.find(x => x.id === id); if (o) m *= o.mult; }
  return Math.min(TOPE_MULT, m);
}
function cerrarDia(fecha, respuestas, faltaGrave){
  const d = S.dias[fecha]; if (!d || d.cerrado) return null;
  const res = { eventos:[] };
  d.examen = { respuestas, falta: faltaGrave || null };
  d.cerrado = true;
  S.ultimoExamenNoche = fecha;
  if (faltaGrave) {
    d.superado = false; guardar();
    expulsar('falta', `Falta grave declarada: ${faltaGrave}`);
    res.eventos.push('expulsion'); return res;
  }
  const morales = d.pruebas;
  const okTodas = morales.every(p => p.ok === true);
  d.superado = okTodas && d.ejercicio;
  // progreso
  let n = 0;
  for (const p of morales) if (p.ok) {
    n++;
    if (p.tipo === 'moral') S.prog.virt[p.v] = (S.prog.virt[p.v]||0) + 1;
    if (p.tipo === 'arma') { if (S.situacion === 'orden') S.prog.armas[p.id] = true; else S.armasConocidas[p.id] = true; S.prog.virt[p.v] = (S.prog.virt[p.v]||0) + 1; }
    if (p.tipo === 'oficio') S.prog.oficios[p.id] = (S.prog.oficios[p.id]||0) + 1;
  }
  if (d.fisica && d.fisica.ok) { S.prog.fisico[d.fisica.id] = true; n++; }
  d.honra = Math.round(n * 10 * (d.superado ? multiplicador(d) : 1));
  S.honra += d.honra;
  // escudería y penitencia
  if (d.superado) {
    if (S.situacion === 'escudero') S.escuderia.dias++;
    if (S.situacion === 'expulsado' && S.penitencia) S.penitencia.dias++;
  }
  // caída
  if (fallosRecientes() > tolerancia() && ['orden','escudero','aspirante'].includes(S.situacion)) {
    caer(); res.eventos.push('caida');
  } else if (S.situacion === 'orden') {
    const a = comprobarAscenso();
    if (a === 'asciende') res.eventos.push('ascenso');
  }
  guardar();
  return res;
}

/* ---------- caída, expulsión, redención ---------- */
function caer(){
  S.caidaDesde = hoyISO();
  if (S.situacion === 'orden' && S.grado > 1) {
    const antes = nombreGrado();
    S.grado--; resetProg();
    anotar(`Pierde con deshonor el grado de ${antes}. Debe reconquistarlo.`, 'deshonor');
  } else if (S.situacion === 'orden' && S.grado === 1) {
    S.situacion = 'escudero'; S.grado = 0; S.abatido = true; resetProg();
    S.escuderia = { dias:0, inicio:hoyISO() };
    anotar(`Pierde con deshonor la caballería: vuelve a ${fem()?'escudera':'escudero'} con las armas abatidas. Debe reconquistarlas.`, 'deshonor');
  } else if (S.situacion === 'escudero' || S.situacion === 'aspirante') {
    S.situacion = 'escudero';
    S.escuderia = { dias:0, inicio:hoyISO() };
    anotar('No se mantuvo: el año de escudería comienza de nuevo.', 'deshonor');
  }
}
function expulsar(causa, texto){
  S.situacion = 'expulsado'; S.grado = 0; S.abatido = !!S.blason; S.investidura = null;
  S.penitencia = { causa, req: PENITENCIA[causa] || 30, dias:0, confesion:false, inicio:hoyISO() };
  S.caidaDesde = hoyISO(); resetProg();
  anotar(`Expulsión de la Orden. ${texto}`, 'deshonor');
  guardar();
}
function comprobarAcidia(){
  if (!['orden','escudero','aspirante'].includes(S.situacion)) return false;
  const ref = S.ultimoExamenNoche || (S.examenes.length ? S.examenes[S.examenes.length-1].fecha : null);
  if (!ref) return false;
  if (difDias(ref, hoyISO()) > DIAS_ACIDIA) { expulsar('acidia', `Acidia: más de ${DIAS_ACIDIA} días sin examen (VI, §12).`); return true; }
  return false;
}
function penitenciaCumplida(){ return S.penitencia && S.penitencia.confesion && S.penitencia.dias >= S.penitencia.req; }
function resetProg(){ S.prog = { virt:{}, armas:{}, oficios:{}, fisico:{}, desde:hoyISO() }; }

/* ---------- ascenso ---------- */
function requisitosAscenso(){
  if (S.situacion !== 'orden' || S.grado >= 4) return null;
  const sig = S.grado + 1, req = REQ_VIRT[sig];
  const R = { sig, virt: VIRTUDES.map(v => ({ id:v.id, nombre:v.nombre, n:S.prog.virt[v.id]||0, req })) };
  R.fisico = pruebasFisicas(edad(), S.perfil.sexo).map(p => ({ id:p.id, nombre:p.nombre, ok:!!S.prog.fisico[p.id] }));
  if (sig === 2) R.armas = ARMAS.map(a => ({ id:a.id, nombre:a.nombre, ok:!!S.prog.armas[a.id] }));
  if (sig === 3) R.oficios = OFICIOS.map(o => ({ id:o.id, nombre:o.nombre, n:S.prog.oficios[o.id]||0, req:REQ_OFICIO }));
  if (sig === 4) R.examen = { nota: notaMinima(4), aprobado: !!S.prog.examenCondado };
  R.completo = R.virt.every(x => x.n >= x.req) && R.fisico.every(x => x.ok)
    && (!R.armas || R.armas.every(x => x.ok)) && (!R.oficios || R.oficios.every(x => x.n >= x.req))
    && (!R.examen || R.examen.aprobado);
  return R;
}
function comprobarAscenso(){
  const R = requisitosAscenso();
  if (!R || !R.completo) return null;
  S.grado = R.sig; resetProg(); S.honra += 1000;
  anotar(`Asciende al grado de ${nombreGrado()}.`, 'honor');
  return 'asciende';
}

/* ---------- examen de ingreso / reingreso ---------- */
function evaluarIngreso(r){
  /* r: {moral:{id:bool}, vicios:[...], fisico:{id:valor}, quiz:{aciertos,total}} */
  const e = edad(), det = [];
  let elim = false, puntos = 0, total = 0;
  for (const q of INGRESO) {
    if (q.paraje || q.obras) continue;
    total++;
    const ok = r.moral[q.id] === q.ok;
    if (ok) puntos++; else { det.push(`${q.ref}: ${q.t}`); if (q.elim) elim = true; }
  }
  // paraje (III, §8) o, en su defecto, nobles obras (III, §10)
  total++;
  if (r.moral.paraje === true || r.moral.obras === true) puntos++; else { det.push('III, §§8–10: sin paraje ni nobles obras que lo suplan'); elim = true; }
  // vicios del §20
  total += VICIOS_P20.length;
  puntos += VICIOS_P20.length - r.vicios.length;
  if (r.vicios.length) det.push(`III, §20: ${r.vicios.join(', ')}`);
  const nm = notaMinima(e >= EDAD_CONDE ? 4 : 0);
  const notaMoral = puntos / total;
  const notaQuiz = r.quiz.aciertos / r.quiz.total;
  const fis = pruebasFisicas(e, S.perfil.sexo).map(p => ({ ...p, valor: r.fisico[p.id], ok: cumple(p, r.fisico[p.id]) }));
  const fisOk = fis.every(p => p.ok);
  if (!fisOk) det.push('III, §17: no supera la tabla física de su edad');
  if (notaQuiz < nm) det.push(`IV, §§5–7: conocimientos ${Math.round(notaQuiz*100)} % (mínimo ${Math.round(nm*100)} %)`);
  if (notaMoral < nm) det.push(`Parte III: examen moral ${Math.round(notaMoral*100)} % (mínimo ${Math.round(nm*100)} %)`);
  const aprobado = !elim && fisOk && notaQuiz >= nm && notaMoral >= nm;
  return { aprobado, notaMoral, notaQuiz, minima:nm, fis, det };
}
function aplicarIngreso(res, tipo){
  const e = edad(), hoy = hoyISO();
  S.examenes.push({ fecha:hoy, tipo, aprobado:res.aprobado, notaMoral:res.notaMoral, notaQuiz:res.notaQuiz, det:res.det });
  if (res.aprobado) {
    if (e < EDAD_ARMAR) {
      S.situacion = 'escudero'; S.escuderia = { dias:0, inicio:hoy };
      anotar(`Aprueba el examen, pero no tiene la edad conveniente (III, §5): servirá como ${fem()?'escudera':'escudero'} hasta los ${EDAD_ARMAR} años y un año de escudería.`, 'info');
    } else {
      S.situacion = 'aspirante'; S.penitencia = null;
      anotar(`Aprueba el examen de ${tipo}. Debe señalar una fiesta de precepto para ser ${fem()?'armada':'armado'} (IV, §2).`, 'honor');
    }
  } else {
    if (e >= EDAD_CONDE) {
      S.situacion = tipo === 'reingreso' ? 'expulsado' : 'rechazado';
      S.proximoExamen = hoyISO(new Date(Date.now() + 30*86400000));
      anotar('No supera el examen. Con sesenta años o más no se entra como escudero: podrá repetir el examen pasados treinta días.', 'deshonor');
    } else {
      S.situacion = 'escudero'; S.escuderia = { dias:0, inicio:hoy }; S.penitencia = null;
      anotar(`No supera el examen: comienza su año de escudería (${DIAS_ESCUDERIA} días superados).`, 'info');
    }
  }
  S.ultimoExamenNoche = hoy;
  guardar();
}
function escuderiaCumplida(){ return S.situacion === 'escudero' && S.escuderia.dias >= DIAS_ESCUDERIA && edad() >= EDAD_ARMAR; }

/* ---------- investidura (Parte IV) ---------- */
const PASOS_INVESTIDURA = [
  { id:'confesion', dia:-1, t:'Confesión', d:'Confesarse de las faltas cometidas contra Dios, a quien quiere servir en la Orden.', ref:'IV, §1' },
  { id:'ayuno', dia:-1, t:'Ayuno de la vigilia', d:'Ayunar la vigilia de la fiesta, en honra del santo que se celebra.', ref:'IV, §3' },
  { id:'vela', dia:-1, t:'Vela de armas', d:'La noche anterior, velar en la iglesia en oración y contemplación, oyendo palabras de Dios y de la Orden. La app guía la lectura de los artículos, los mandamientos y los sacramentos.', ref:'IV, §3' },
  { id:'comunion', dia:0, t:'Comunión', d:'Recibir, como corresponde, el cuerpo sacramentado de Jesucristo.', ref:'IV, §1' },
  { id:'misa', dia:0, t:'Misa solemne y ofrecimiento', d:'Llegarse ante el altar y ofrecerse para servir a Dios en la Orden, obligándose a honrarla y sostenerla con todo su poder.', ref:'IV, §4' },
  { id:'juramento', dia:0, t:'Juramento', d:'Pronunciar el juramento de la Orden.', ref:'IV, §§4, 7' },
  { id:'ceremonia', dia:0, t:'Ceñir la espada, el beso y la bofetada', d:'Arrodillado ante el altar, alzando a Dios los ojos y las manos.', ref:'IV, §11' },
  { id:'armas', dia:0, t:'Elegir sus armas', d:'Componer el blasón que llevará en el escudo.', ref:'V, §18' },
  { id:'mostrarse', dia:0, t:'Montar y mostrarse a las gentes', d:'Que todos sepan que es caballero y está obligado a sostener el honor de la Caballería.', ref:'IV, §12' },
  { id:'dadivas', dia:0, t:'Fiesta y dádivas', d:'Repartir dádivas como corresponde a quien recibe don tan grande.', ref:'IV, §13' }
];
const JURAMENTO = 'Ante Dios y ante la Orden de Caballería, me ofrezco para servir en ella a Dios, y me obligo a honrarla y sostenerla con todo mi poder: a mantener la santa fe católica, defender a mi señor, mantener la justicia, amparar a las viudas, los huérfanos y los desvalidos, y guardar la tierra; a creer los catorce artículos, guardar los diez mandamientos y honrar y cumplir los siete sacramentos de la santa madre Iglesia. Así Dios me ayude.';
function señalarFiesta(f){ S.investidura = { fecha: hoyISO(f.fecha), nombre: f.nombre, pasos:{} }; anotar(`Señala para su investidura la fiesta de ${f.nombre} (${f.fecha.toLocaleDateString('es-ES')}).`, 'info'); guardar(); }
function estadoInvestidura(){
  if (!S.investidura) return null;
  const dif = difDias(hoyISO(), S.investidura.fecha);
  return { dif, vigilia: dif === 1, dia: dif === 0, pasada: dif < 0 };
}
function completarInvestidura(){
  const e = edad();
  S.situacion = 'orden';
  S.grado = e >= EDAD_CONDE ? 4 : 1;
  S.abatido = false; S.caidaDesde = hoyISO(); resetProg();
  S.honra += 500;
  anotar(`${fem()?'Armada':'Armado'} en la fiesta de ${S.investidura.nombre}: ${nombreGrado()}.`, 'honor');
  S.investidura.completada = hoyISO();
  guardar();
}
