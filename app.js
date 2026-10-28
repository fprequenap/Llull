/* Código de Llull — interfaz. */
'use strict';

/* Enlace de compra del libro impreso (dejar vacío si aún no existe) */
const LIBRO_URL = 'https://amzn.eu/d/0c8yaSr1';

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let RUTA = { tab:'hoy', sub:null, arg:null };
let TMP = {};               // estado efímero de la interfaz
let ENSAYO = false;

function hoy(){ return hoyISO(); }
function go(tab, sub, arg){ RUTA = { tab, sub:sub||null, arg:arg||null }; render(); window.scrollTo(0,0); }
function toast(t, ms){ const d = document.createElement('div'); d.className='toast'; d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(), ms||2600); }

/* Días abiertos de hace más de un día: se cierran sin examen; las pruebas sin resolver cuentan como no superadas */
function cerrarDiasAtrasados(){
  const h = hoy();
  for (const [f, d] of Object.entries(S.dias)) {
    if (!d.cerrado && difDias(f, h) > 1) {
      d.pruebas.forEach(p => { if (p.ok === null) p.ok = false; });
      d.cerrado = true; d.superado = false; d.examen = { sinExamen:true };
    }
  }
  guardar();
}

/* ---------- estructura ---------- */
const ICON = {
  hoy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  libro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg>',
  armas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 3h16v8c0 5-4 8-8 10-4-2-8-5-8-10z"/><path d="M12 7v9M8.5 10.5h7"/></svg>',
  orden:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z"/></svg>',
  mas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'
};
function render(){
  $('#ensayo').innerHTML = ENSAYO ? '<div class="ensayo">MODO DE ENSAYO: las fechas de la investidura no se exigen</div>' : '';
  cabecera();
  $('#tabs').innerHTML = [['hoy','Hoy'],['libro','Libro'],['armas','Armas'],['orden','Orden'],['mas','Más']]
    .map(([k,n]) => `<button type="button" onclick="go('${k}')" data-v="${k}" class="${RUTA.tab===k?'on':''}" aria-label="${n}">${ICON[k]}<span>${n}</span></button>`).join('');
  const V = { hoy:vistaHoy, libro:vistaLibro, armas:vistaArmas, orden:vistaOrden, mas:vistaMas }[RUTA.tab];
  $('#app').innerHTML = V();
  despuesDeRender();
}
function estadoEscudo(){
  if (S.situacion === 'orden' && S.blason) return { b:S.blason, g:S.grado, e:null };
  if (S.abatido && S.blason) return { b:S.blason, g:0, e:'abatido' };
  return { b:null, g:0, e:'blanco' };
}
function cabecera(){
  const E = estadoEscudo();
  const nom = S.perfil ? esc(S.perfil.nombre) : 'Libro de la Orden de Caballería';
  const svg = logroSVG(E.b, E.g, E.e).replace('<svg ', '<svg class="miniescudo" preserveAspectRatio="xMidYMid meet" ');
  $('#cab').innerHTML = `${svg}<div class="t"><b>Código de Llull</b><span>${nom}${S.perfil ? ' · ' + esc(nombreGrado()) : ''}</span></div>
    ${S.perfil ? `<div class="peq" title="Honra">⚜ ${S.honra}</div>` : ''}`;
}
function splash(){
  if (!S.perfil) return;
  const E = estadoEscudo();
  const d = document.createElement('div'); d.className = 'splash';
  d.innerHTML = `${logroSVG(E.b, E.g, E.e)}<div class="nom">${esc(S.perfil.nombre)}</div><div class="gr">${esc(nombreGrado())}</div>
    ${S.blason && E.e==null ? `<div class="peq cen" style="max-width:420px;margin-top:6px">${esc(blasonar(S.blason))}</div>` : ''}`;
  document.body.appendChild(d);
  const fuera = () => { d.style.opacity = 0; setTimeout(()=>d.remove(), 600); };
  d.addEventListener('click', fuera); setTimeout(fuera, 2400);
}
function banda(){ return '<img class="banda" src="banda.png" alt="">'; }

/* =====================================================================
   HOY
   ===================================================================== */
function vistaHoy(){
  if (RUTA.sub === 'examen') return vistaExamen();
  if (RUTA.sub === 'investidura') return vistaInvestidura();
  if (!S.perfil) return vistaBienvenida();
  const h = hoy(), d = new Date();
  const disc = disciplinaDia(d, edad());
  const k = `${d.getMonth()+1}-${d.getDate()}`;
  const fl = fechaLarga(d); let s = `<div class="peq">${fl.charAt(0).toUpperCase()+fl.slice(1)}</div>`;
  const marcas = [];
  if (disc.fiesta) marcas.push(`<span class="tag v">Fiesta de precepto: ${esc(disc.fiesta)}</span>`);
  if (SANTOS_CABALLEROS[k]) marcas.push(`<span class="tag v">${esc(SANTOS_CABALLEROS[k][0])}</span>`);
  if (disc.ayuno) marcas.push('<span class="tag" style="color:#9E1F17">Ayuno</span>');
  if (disc.abstinencia) marcas.push('<span class="tag" style="color:#9E1F17">Abstinencia</span>');
  if (marcas.length) s += `<div style="margin:4px 0 10px">${marcas.join(' ')}</div>`;
  if (S.ultimaCopia == null || difDias(S.ultimaCopia, h) > 30) s += `<div class="aviso">Haz una copia de seguridad de tu progreso: si pierdes o cambias el teléfono, se pierde. <a href="#" data-a="sub" data-t="mas" data-v="copia">Hacer copia</a></div>`;
  s += tarjetaSituacion();
  if (['escudero','aspirante','orden','expulsado'].includes(S.situacion)) s += tarjetaDia(h, disc);
  return s;
}
function vistaBienvenida(){
  return `<div class="cen"><img src="ornamento.png" alt="" style="width:70%;max-width:320px"></div>
  <h1 class="cen">Libro de la Orden de Caballería</h1>
  <p class="cen peq">Ramon Llull, hacia 1275 · edición bilingüe lemosín-español</p>
  ${banda()}
  <div class="card roja"><p>«Mira bien, escudero, lo que has de hacer si tomas la Orden de Caballería; pues al hacerte caballero recibes a la par la honra y la servidumbre que corresponden a los amigos de la Caballería.» <span class="ref">I, §7</span></p></div>
  <div class="card"><h2>Cómo funciona la Orden</h2>
    <p>Cada mañana recibes una divisa del Libro según tu ánimo y las circunstancias del día, y las pruebas que has de superar. Cada noche haces examen.</p>
    <p>Para entrar has de pasar el examen del escudero (Parte III) y el de conocimientos (Parte IV), con la tabla física de tu edad (III, §17). Si lo superas, serás armado en una fiesta de precepto; si no, servirás un año como escudero, sin blasón ni caballo.</p>
    <p>Desde caballero de un escudo se asciende a valvasor, comdor y conde (II, §6) superando pruebas. Quien no se mantiene pierde el grado; la falta grave y la acidia llevan a la expulsión. La redención es siempre posible.</p>
    <p>Con sesenta años o más, quien supera el examen es armado y recibe el grado de conde.</p></div>
  <div class="card"><h2>Tus datos</h2>
    <label class="campo"><span>Nombre con que serás conocido en la Orden</span><input type="text" id="pnom" maxlength="40" autocomplete="name"></label>
    <label class="campo"><span>Sexo</span><select id="psex"><option value="m">Varón: caballero</option><option value="f">Mujer: dama de la Orden</option></select></label>
    <label class="campo"><span>Fecha de nacimiento</span><input type="date" id="pnac" max="${hoy()}"></label>
    <button class="btn ancho" data-a="crearPerfil">Presentarse al examen</button>
    <p class="peq">Los datos se guardan solo en este dispositivo.</p></div>`;
}
function tarjetaSituacion(){
  const e = edad();
  switch (S.situacion) {
    case 'nuevo':
      return `<div class="card roja"><h2>Examen de ingreso</h2><p>Antes de entrar en la Orden has de ser examinado: costumbres y vida (Parte III), conocimientos (IV, §§5–7) y aptitud física para llevar el arnés (III, §17).</p>
        <p class="peq">Nota mínima para tu edad: ${Math.round(notaMinima(e>=EDAD_CONDE?4:0)*100)} %.</p>
        <button class="btn" data-a="sub" data-t="hoy" data-v="examen">Comenzar el examen</button></div>`;
    case 'rechazado': {
      const listo = !S.proximoExamen || S.proximoExamen <= hoy();
      return `<div class="card negra"><h2>No admitido</h2><p>No superaste el examen. Con sesenta años o más no se entra como escudero (III, §§5–6).</p>
        ${listo ? '<button class="btn" data-a="sub" data-t="hoy" data-v="examen">Repetir el examen</button>' : `<p>Podrás repetir el examen el ${deISO(S.proximoExamen).toLocaleDateString('es-ES')}.</p>`}</div>`;
    }
    case 'escudero': {
      const pct = Math.min(100, S.escuderia.dias / DIAS_ESCUDERIA * 100);
      let t = `<div class="card oro"><h2>${fem()?'Escudera':'Escudero'}</h2>
        <p>Sin blasón ni caballo. Un año de días superados para ser examinado de nuevo y armado.</p>
        <div class="barra"><i style="width:${pct}%"></i></div><p class="peq">${S.escuderia.dias} de ${DIAS_ESCUDERIA} días superados · armas aprendidas: ${Object.keys(S.armasConocidas).length} de ${ARMAS.length}</p>`;
      if (S.escuderia.dias >= DIAS_ESCUDERIA && e < EDAD_ARMAR) t += `<p>Has cumplido tu año, pero aún no tienes la edad conveniente (${EDAD_ARMAR} años; III, §5).</p>`;
      if (escuderiaCumplida()) t += `<button class="btn" data-a="sub" data-t="hoy" data-v="examen">Presentarse al examen</button>`;
      const ult = S.examenes[S.examenes.length-1];
      if (!S.reexUnidades && ult && !ult.aprobado && ult.fecha <= '2026-10-28' && ult.det && ult.det.length && ult.det.every(x => x.startsWith('III, §17')))
        t += `<div class="aviso" style="margin-top:10px">Tu examen se corrigió con la plancha en segundos, no en minutos. Puedes repetirlo una vez.</div><button class="btn" data-a="reexUnidades">Repetir el examen</button>`;
      return t + '</div>';
    }
    case 'aspirante': {
      const I = estadoInvestidura();
      if (!S.investidura || (I && I.pasada && !S.investidura.completada)) {
        const F = proximasFiestas(new Date(), 6);
        return `<div class="card roja"><h2>Señala el día de tu investidura</h2>
          <p>«Para armar a un caballero conviene señalar una de las fiestas de precepto que se celebran al año.» <span class="ref">IV, §2</span></p>
          ${S.investidura && I.pasada ? '<p class="rub">La fiesta señalada ha pasado sin completarse la investidura. Señala otra.</p>' : ''}
          <div class="lista">${F.map((f,i)=>`<a href="#" data-a="fiesta" data-v="${i}"><b>${esc(f.nombre)}</b><br><span class="peq">${f.fecha.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · vigilia el día anterior</span></a>`).join('')}</div></div>`;
      }
      const f = deISO(S.investidura.fecha);
      return `<div class="card roja"><h2>Investidura: ${esc(S.investidura.nombre)}</h2>
        <p>${f.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}${I.dif>1?` · faltan ${I.dif} días`:I.vigilia?' · <b>hoy es la vigilia</b>':I.dia?' · <b>hoy es el día</b>':''}</p>
        <button class="btn" data-a="sub" data-t="hoy" data-v="investidura">${I.vigilia||I.dia||ENSAYO?'Ir a la ceremonia':'Ver los pasos'}</button>
        <button class="btn sec" data-a="cambiarFiesta">Cambiar la fiesta</button></div>`;
    }
    case 'expulsado': {
      const P = S.penitencia || { req:30, dias:0, confesion:false };
      const listo = penitenciaCumplida() && (!S.proximoExamen || S.proximoExamen <= hoy());
      return `<div class="card negra"><h2>${fem()?'Expulsada':'Expulsado'} de la Orden</h2>
        <p>La redención es siempre posible: confesión, penitencia de días superados y nuevo examen. Tus armas se guardan abatidas y te serán restituidas al ser ${fem()?'armada':'armado'} de nuevo.</p>
        <label class="fila"><input type="checkbox" data-a="confPen" ${P.confesion?'checked':''} style="width:24px;height:24px"> Me he confesado</label>
        <div class="barra" style="margin-top:8px"><i style="width:${Math.min(100,P.dias/P.req*100)}%"></i></div>
        <p class="peq">Penitencia: ${P.dias} de ${P.req} días superados</p>
        ${listo ? '<button class="btn" data-a="sub" data-t="hoy" data-v="examen">Examen de reingreso</button>' : ''}</div>`;
    }
    case 'orden': {
      const R = requisitosAscenso();
      let t = `<div class="card oro"><h2>${esc(nombreGrado())}</h2>
        <p class="peq">Exigencia moral ${Math.round(cMoral()*100)} % · física ${Math.round(cFisico()*100)} % · fallos en ${VENTANA} días: ${fallosRecientes()} de ${tolerancia()} tolerados</p>`;
      if (R) { const pv = R.virt.reduce((a,x)=>a+Math.min(x.n,x.req),0) / (R.virt.length*R.virt[0].req); t += `<div class="barra"><i style="width:${pv*100}%"></i></div><p class="peq">Hacia ${esc(nombreGrado(R.sig))}: virtudes ${Math.round(pv*100)} % · <a href="#" data-a="tab" data-v="orden">ver requisitos</a></p>`; }
      return t + '</div>';
    }
  }
  return '';
}
function tarjetaDia(h, disc){
  const d = S.dias[h];
  let s = '';
  if (!d) {
    const an = TMP.animo || 'paz', ci = TMP.circ || 'ordinario';
    s += `<div class="card roja"><h2>Vigilia de la mañana</h2>
      <p>¿Con qué ánimo amaneces?</p><div class="chips">${ANIMOS.map(a=>`<button class="chip ${an===a.id?'on':''}" data-a="animo" data-v="${a.id}">${esc(a.nombre)}</button>`).join('')}</div>
      <p>¿Qué te espera hoy?</p><div class="chips">${CIRCUNSTANCIAS.map(c=>`<button class="chip ${ci===c.id?'on':''}" data-a="circ" data-v="${c.id}">${esc(c.nombre)}</button>`).join('')}</div>
      <button class="btn ancho" data-a="empezarDia">Recibir la divisa del día</button></div>`;
    s += pendienteAyer();
    return s;
  }
  const dv = d.divisa;
  const A = ANIMOS.find(a=>a.id===d.animo), C = CIRCUNSTANCIAS.find(c=>c.id===d.circ);
  s += `<div class="card roja">${dv.santo ? `<div class="tag v">${esc(dv.santo)}</div>` : ''}
    <p class="divisa">${esc(dv.t)}</p><div class="ref">${esc(dv.ref)}${dv.p!=null?` · <a href="#" data-a="leerPar" data-p="${dv.p}" data-n="${dv.n}">leer el parágrafo</a>`:''}</div>
    ${A && A.vicio ? `<p class="peq" style="margin-top:8px">Amaneces ${esc(A.nombre.toLowerCase())}: acecha la ${esc(A.vicio)}. Remedio: ${A.remedio.map(esc).join(' y ')} (${esc(A.ref)}).</p>` : ''}
    ${C && C.id!=='ordinario' ? `<p class="peq">${esc(C.nombre)}.</p>` : ''}</div>`;
  s += pendienteAyer();
  // pruebas
  s += `<div class="card"><h2>Pruebas del día</h2>${d.pruebas.map((p,i)=>`
    <div class="prueba"><div class="txt"><span class="tag v">${esc(p.tipo==='moral'?(VIRTUDES[VIRT_IDX[p.v]]||{}).nombre:p.tipo==='arma'?'Arma':'Oficio')}</span><b>${esc(p.t)}</b><span>${esc(p.d)}</span> ${p.ref?`<span class="ref">${esc(p.ref)}</span>`:''}</div>
      ${d.cerrado ? `<div>${p.ok?'✔︎':'✘'}</div>` : `<div class="tri"><button class="si ${p.ok===true?'on':''}" data-a="pr" data-i="${i}" data-v="1" aria-label="Superada">✔︎</button><button class="no ${p.ok===false?'on':''}" data-a="pr" data-i="${i}" data-v="0" aria-label="No superada">✘</button></div>`}
    </div>`).join('')}</div>`;
  // ejercicio y física
  const opc = (S.perfil.opcionales||[]).map(id => OPCIONALES.find(o=>o.id===id)).filter(Boolean);
  s += `<div class="card"><h2>El cuerpo (II, §10; III, §17)</h2>
    <label class="fila"><input type="checkbox" data-a="ejer" ${d.ejercicio?'checked':''} ${d.cerrado?'disabled':''} style="width:26px;height:26px"> Ejercicio diario hecho: al menos ${edad()>=60?20:30} minutos</label>
    <div class="fila" style="margin-top:8px"><button class="btn sec" data-a="sub" data-t="mas" data-v="ejercicios">Pedir una rutina</button></div>`;
  if (d.fisica) {
    const p = d.fisica;
    s += `<div class="prueba" style="margin-top:8px"><div class="txt"><span class="tag v">Prueba física</span><b>${esc(p.nombre)}</b><span>Objetivo: ${esc(fmtObj(p))}${p.unidad==='rep'?' repeticiones':''}</span></div></div>
      <div class="fila"><input type="text" inputmode="decimal" id="fisval" placeholder="Tu marca (${p.unidad==='min'?'minutos, p. ej. 1,5':'repeticiones'})" value="${p.valor!=null?numES(p.valor):''}" ${d.cerrado?'disabled':''} style="flex:1"><button class="btn sec" data-a="fisica" ${d.cerrado?'disabled':''}>Anotar</button></div>
      ${p.ok!=null ? `<p class="${p.ok?'':'rub'}">${p.ok?'Superada.':'No alcanzada.'}</p>`:''}`;
  }
  if (opc.length) s += `<p style="margin-bottom:2px">Disciplinas practicadas hoy (multiplican la honra):</p><div class="chips">${opc.map(o=>`<button class="chip ${d.opcionales.includes(o.id)?'on':''}" data-a="opc" data-v="${o.id}" ${d.cerrado?'disabled':''}>${esc(o.nombre)} ×${o.mult}</button>`).join('')}</div>`;
  else s += `<p class="peq">Si practicas equitación, esgrima u otras disciplinas, márcalas en Más › Ajustes: multiplican la honra.</p>`;
  s += '</div>';
  if (disc.ayuno || disc.abstinencia || disc.fiesta) s += `<div class="card"><h2>La mesa de hoy</h2><p>${disc.ayuno?esc(NUTRICION.ayuno)+' ':''}${disc.abstinencia?esc(NUTRICION.abstinencia)+' ':''}${disc.fiesta&&!disc.ayuno?esc(NUTRICION.fiesta):''}</p><p class="peq">${esc(disc.motivo)}</p></div>`;
  // examen
  if (!d.cerrado) s += `<div class="card"><h2>Examen de la noche</h2><p>Antes de dormir, examina el día y declara qué pruebas superaste.</p><button class="btn ancho osc" data-a="examenNoche" data-v="${h}">Hacer el examen</button></div>`;
  else s += `<div class="card ${d.superado?'oro':'negra'}"><h2>Día ${d.superado?'superado':'no superado'}</h2><p>Honra ganada: ${d.honra}${d.opcionales.length&&d.superado?` (×${multiplicador(d).toFixed(2)})`:''}</p></div>`;
  return s;
}
function pendienteAyer(){
  const y = hoyISO(new Date(Date.now()-86400000));
  const d = S.dias[y];
  if (d && !d.cerrado) return `<div class="aviso">No hiciste el examen de ayer. <a href="#" data-a="examenNoche" data-v="${y}">Hacerlo ahora</a></div>`;
  return '';
}

/* ---------- examen de la noche ---------- */
function modal(html){ cerrarModal(); const m = document.createElement('div'); m.className='modal'; m.id='modal'; m.innerHTML = `<div class="hoja">${html}</div>`; m.addEventListener('click', e => { if (e.target === m) cerrarModal(); }); document.body.appendChild(m); }
function cerrarModal(){ const m = $('#modal'); if (m) m.remove(); }
function abrirExamenNoche(fecha){
  const d = S.dias[fecha]; if (!d) return;
  const virt = [...new Set(d.pruebas.map(p=>p.v).filter(v=>EXAMEN[v]))];
  if (!virt.length) virt.push('fe');
  const n = numPreguntasNoche(), qs = [];
  let i = 0; const sem = hash(fecha);
  while (qs.length < n && i < 50) { const v = virt[i % virt.length]; const L = EXAMEN[v]; const q = L[(sem + i) % L.length]; if (!qs.includes(q)) qs.push(q); i++; }
  TMP.noche = { fecha, qs, resp: qs.map(()=>null) };
  modal(`<h2>Examen de la noche</h2><p class="peq">${esc(deISO(fecha).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}</p>
    <h3>Preguntas</h3>${qs.map((q,j)=>`<div class="prueba"><div class="txt">${esc(q)}</div><div class="tri"><button class="si" data-a="nq" data-i="${j}" data-v="1">Sí</button><button class="no" data-a="nq" data-i="${j}" data-v="0">No</button></div></div>`).join('')}
    <h3 style="margin-top:14px">Pruebas</h3>${d.pruebas.map((p,j)=>`<div class="prueba"><div class="txt"><b>${esc(p.t)}</b></div><div class="tri"><button class="si ${p.ok===true?'on':''}" data-a="npr" data-i="${j}" data-v="1">✔︎</button><button class="no ${p.ok===false?'on':''}" data-a="npr" data-i="${j}" data-v="0">✘</button></div></div>`).join('')}
    <label class="fila" style="margin:12px 0"><input type="checkbox" id="nejer" ${d.ejercicio?'checked':''} style="width:26px;height:26px"> Hice el ejercicio diario</label>
    <label class="campo"><span>¿Has incurrido hoy en falta grave contra la Orden? (III, §§18–20)</span>
      <select id="nfalta"><option value="">No</option>${FALTAS_GRAVES.map(f=>`<option>${esc(f)}</option>`).join('')}</select></label>
    <p class="peq">Declarar una falta grave supone la expulsión de la Orden. Nadie más que tú lo sabe: el yelmo es la vergüenza (V, §4).</p>
    <div class="fila"><button class="btn" data-a="cerrarNoche">Cerrar el día</button><button class="btn sec" data-a="cerrarModal">Volver</button></div>`);
}

/* ---------- examen de ingreso ---------- */
function borrador(){
  if (!S.borrador) {
    const e = edad();
    const idx = PREGUNTAS.map((_,i)=>i).sort((a,b)=>hash(S.perfil.nombre+a+Date.now()%997)-hash(S.perfil.nombre+b+Date.now()%997)).slice(0, 12);
    S.borrador = { paso:0, moral:{}, vicios:[], quiz:idx, qresp:{}, fisico:{}, inicio:hoy(), tipo: S.situacion==='expulsado'?'reingreso':'ingreso' };
    guardar();
  }
  return S.borrador;
}
function vistaExamen(){
  if (TMP.resIngreso) return resultadoIngreso(TMP.resIngreso);
  const B = borrador(), e = edad();
  const nm = Math.round(notaMinima(e>=EDAD_CONDE?4:0)*100);
  const pasos = ['Costumbres y vida','Conocimientos','Cuerpo','Resultado'];
  let s = `<h1>${B.tipo==='reingreso'?'Examen de reingreso':fem()?'Examen de la escudera':'Examen del escudero'}</h1><p class="peq">${pasos.map((p,i)=>i===B.paso?`<b class="rub">${p}</b>`:p).join(' › ')} · nota mínima ${nm} %</p>`;
  if (B.paso === 0) {
    s += `<div class="card"><p>«Lo primero que se ha de preguntar al escudero es si ama y teme a Dios.» <span class="ref">III, §2</span></p>
      <p class="peq">Responde con verdad. Nadie te examina sino tu conciencia.</p></div>`;
    for (const q of INGRESO) {
      const v = B.moral[q.id];
      s += `<div class="card"><p>${esc(q.t)} <span class="ref">${esc(q.ref)}</span></p><div class="chips"><button class="chip ${v===true?'on':''}" data-a="im" data-k="${q.id}" data-v="1">Sí</button><button class="chip ${v===false?'on':''}" data-a="im" data-k="${q.id}" data-v="0">No</button></div></div>`;
    }
    s += `<div class="card"><p>«El escudero orgulloso, mal educado, sucio en palabras y vestidos, de corazón cruel, avaro, mentiroso, desleal, perezoso, iracundo, lujurioso, borracho, glotón, perjuro… no conviene con la Orden de Caballería.» <span class="ref">III, §20</span></p>
      <p>Marca con verdad aquello de lo que no estás libre:</p><div class="chips">${VICIOS_P20.map(v=>`<button class="chip ${B.vicios.includes(v)?'on':''}" data-a="iv" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>
      <button class="btn ancho" data-a="ipaso" data-v="1">Siguiente: conocimientos</button>`;
  } else if (B.paso === 1) {
    s += `<div class="card"><p>«Conviene también que aquel día haya sermón en que se expliquen los catorce artículos en que se funda la fe, los diez mandamientos y los siete sacramentos.» <span class="ref">IV, §4</span></p></div>`;
    B.quiz.forEach((qi, j) => {
      const [q, ops, , ref] = PREGUNTAS[qi], r = B.qresp[qi];
      s += `<div class="card"><p><b>${j+1}.</b> ${esc(q)} <span class="ref">${esc(ref)}</span></p><div class="chips" style="flex-direction:column;align-items:stretch">${ops.map((o,k)=>`<button class="chip ${r===k?'on':''}" style="text-align:left" data-a="iq" data-q="${qi}" data-v="${k}">${esc(o)}</button>`).join('')}</div></div>`;
    });
    s += `<div class="fila"><button class="btn sec" data-a="ipaso" data-v="0">Atrás</button><button class="btn" data-a="ipaso" data-v="2">Siguiente: el cuerpo</button></div>`;
  } else if (B.paso === 2) {
    const L = pruebasFisicas(e, S.perfil.sexo);
    s += `<div class="card"><p>«El contrahecho, o demasiado grueso, o con otro defecto corporal por el que no pueda usar del oficio, no debe entrar en la Orden de Caballería… sin fuerzas para llevar el arnés.» <span class="ref">III, §17</span></p>
      <p class="peq">Tabla de tu edad (${FRANJA_NOMBRE[franja(e)]} años${fem()?', baremo femenino':''}), al ${Math.round(cFisico()*100)} %. Anota las marcas que hayas hecho en los últimos siete días; los tiempos, en minutos con decimales (1,5 = un minuto y medio); puedes volver a este paso tantas veces como necesites: el examen queda guardado.</p></div>
      <div class="card"><table class="tab"><tr><th>Prueba</th><th>Objetivo</th><th>Tu marca</th></tr>
      ${L.map(p=>`<tr><td>${esc(p.nombre)}</td><td>${esc(fmtObj(p))}</td><td><input type="text" inputmode="decimal" data-f="${p.id}" value="${B.fisico[p.id]!=null?numES(B.fisico[p.id]):''}" placeholder="${p.unidad==='min'?'min':'rep'}" style="min-width:80px"></td></tr>`).join('')}</table></div>
      <div class="fila"><button class="btn sec" data-a="ipaso" data-v="1">Atrás</button><button class="btn sec" data-a="iguardarf">Guardar marcas</button><button class="btn" data-a="ievaluar">Entregar el examen</button></div>`;
  }
  return s;
}
function resultadoIngreso(R){
  let s = `<h1>Resultado del examen</h1>`;
    s += `<div class="card ${R.aprobado?'oro':'negra'}"><h2>${R.aprobado?'Aprobado':'No aprobado'}</h2>
      <table class="tab"><tr><td>Costumbres y vida</td><td>${Math.round(R.notaMoral*100)} %</td><td>mínimo ${Math.round(R.minima*100)} %</td><td>${R.notaMoral>=R.minima?'✔︎':'✘'}</td></tr>
      <tr><td>Conocimientos</td><td>${Math.round(R.notaQuiz*100)} %</td><td>mínimo ${Math.round(R.minima*100)} %</td><td>${R.notaQuiz>=R.minima?'✔︎':'✘'}</td></tr>
      <tr><td>Cuerpo</td><td>${R.fis.filter(p=>p.ok).length} de ${R.fis.length}</td><td>todas</td><td>${R.fis.every(p=>p.ok)?'✔︎':'✘'}</td></tr></table>
      <h3 style="margin-top:10px">Pruebas físicas</h3>
      <table class="tab"><tr><th>Prueba</th><th>Objetivo</th><th>Marca</th><th></th></tr>${R.fis.map(p=>`<tr><td>${esc(p.nombre)}</td><td>${esc(fmtObj(p))}</td><td>${p.valor!=null?numES(p.valor)+(p.unidad==='min'?' min':''):'—'}</td><td>${p.ok?'✔︎':'✘'}</td></tr>`).join('')}</table>
      ${R.det.length?`<h3>Faltó</h3><ul>${R.det.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
      <p>${esc(S.historial[0] ? S.historial[0].evento : '')}</p>
      <button class="btn" data-a="finIngreso">Continuar</button></div>`;
  return s;
}

/* ---------- investidura ---------- */
function vistaInvestidura(){
  const I = estadoInvestidura();
  if (!S.investidura || !I) return `<p>No hay investidura señalada.</p>`;
  const paso = S.investidura.pasos;
  let s = `<h1>Investidura</h1><p>Fiesta de ${esc(S.investidura.nombre)}, ${deISO(S.investidura.fecha).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}.</p>${banda()}`;
  const puedeV = ENSAYO || I.vigilia || I.dia, puedeD = ENSAYO || I.dia;
  const vigiliaHecha = PASOS_INVESTIDURA.filter(p=>p.dia===-1).every(p=>paso[p.id]);
  for (const p of PASOS_INVESTIDURA) {
    const hab = p.dia === -1 ? puedeV : (puedeD && vigiliaHecha);
    const hecho = !!paso[p.id];
    let accion = '';
    if (!hecho && hab) {
      if (p.id === 'vela') accion = `<button class="btn sec" data-a="vela">Comenzar la vela</button>`;
      else if (p.id === 'juramento') accion = `<div class="card" style="background:#fff"><p><i>${esc(JURAMENTO)}</i></p></div><button class="btn" data-a="pasoInv" data-v="juramento">Lo juro</button>`;
      else if (p.id === 'ceremonia') accion = ceremoniaHTML();
      else if (p.id === 'armas') accion = S.blason ? `<p>Tus armas, abatidas por tu caída, te son restituidas.</p><div class="logro">${logroSVG(S.blason,1,null)}</div><button class="btn" data-a="pasoInv" data-v="armas">Recibir mis armas</button>` : `<button class="btn" data-a="sub" data-t="armas" data-v="constructor">Componer mis armas</button>`;
      else if (p.id === 'mostrarse') accion = `<button class="btn" data-a="compartir">Mostrar mis armas a las gentes</button> <button class="btn sec" data-a="pasoInv" data-v="mostrarse">Hecho</button>`;
      else if (p.id === 'dadivas') accion = `<label class="campo"><span>¿Qué dádiva has repartido?</span><input type="text" id="dadiva" maxlength="120"></label><button class="btn" data-a="dadiva">Anotar y terminar</button>`;
      else accion = `<button class="btn sec" data-a="pasoInv" data-v="${p.id}">Hecho</button>`;
    }
    s += `<div class="card ${hecho?'oro':''}" style="${hab||hecho?'':'opacity:.55'}"><span class="tag">${p.dia===-1?'Vigilia':'Día de la fiesta'}</span>
      <h3>${hecho?'✔︎ ':''}${esc(p.t)} <span class="ref">${esc(p.ref)}</span></h3><p>${esc(p.d)}</p>${accion}</div>`;
  }
  if (!puedeV) s += `<p class="peq">Los pasos de la vigilia se abren el día antes de la fiesta; los demás, el día de la fiesta.</p>`;
  return s;
}
function ceremoniaHTML(){
  const c = TMP.cer || 0;
  const pasos = [['Ceñir la espada','Se te ciñe la espada, en que se te significan la castidad y la justicia.'],['El beso','Recibes un beso, en señal de caridad.'],['La bofetada','Recibes una bofetada, para que recuerdes lo que prometes, el gran cargo a que te obligas y el gran honor que recibes.']];
  if (c >= 3) return `<p>Así se cumple lo que manda el Libro (IV, §11).</p><button class="btn" data-a="pasoInv" data-v="ceremonia">Levantarse ${fem()?'dama':'caballero'}</button>`;
  return `<div id="cerz" class="cen" style="padding:10px"><svg viewBox="0 0 100 100" width="90" class="${c===0?'':'espada-anim'}">${figura('espada','#9AA4AE')}</svg>
    <p><b>${pasos[c][0]}</b><br>${pasos[c][1]}</p><button class="btn" data-a="cer">${c===0?'Arrodillarse ante el altar':'Recibir'}</button></div>`;
}

/* =====================================================================
   LIBRO
   ===================================================================== */
const SECCIONES = [
  ['advertencia','Advertencia del traductor'],['prologo1901','Prólogo de la edición de 1901'],['antiguoTraductor','Advertencia del antiguo traductor'],
  ...LIBRO.partes.map(p => ['parte'+p.id, `${p.nombre}${p.id?'. '+p.titulo.replace(/\.$/,''):''}`]),
  ['notas','Notas al Libro (1901)'],['glosario','Glosario'],['aviso','Aviso legal']
];
function vistaLibro(){
  if (RUTA.sub === 'leer') return vistaLeer(RUTA.arg);
  if (RUTA.sub === 'buscar') return vistaBuscar();
  return `<div class="cen"><img src="ornamento.png" alt="" style="width:60%;max-width:280px"></div>
    <h1 class="cen">Libro de la Orden de Caballería</h1><p class="cen peq">Edición bilingüe: el original en letra gótica, la versión en redonda</p>
    <div class="fila" style="margin:10px 0"><input type="text" id="qbus" placeholder="Buscar en el Libro" style="flex:1" value="${esc(TMP.q||'')}"><button class="btn sec" data-a="buscar">Buscar</button></div>
    <div class="card lista">${SECCIONES.map(([k,n])=>`<a href="#" data-a="leer" data-v="${k}">${k.startsWith('parte')?'<b>':''}${esc(n)}${k.startsWith('parte')?'</b>':''}</a>`).join('')}</div>`;
}
function parrafoTexto(x){
  let es = esc(x.es);
  if (x.cap) es = `<img class="cap" src="${x.cap}" alt="${esc(x.es[0])}">` + es.slice(1);
  return es;
}
function vistaLeer(k){
  const col = S.ajustes.columnas || 'ambas';
  const cls = col === 'es' ? 'es' : col === 'lem' ? 'lem' : '';
  const nav = `<div class="fila" style="margin-bottom:8px"><button class="btn sec" data-a="tab" data-v="libro">Índice</button>
    <select data-a="cols" style="width:auto;flex:1"><option value="ambas" ${col==='ambas'?'selected':''}>Lemosín y español</option><option value="es" ${col==='es'?'selected':''}>Solo español</option><option value="lem" ${col==='lem'?'selected':''}>Solo lemosín</option></select></div>`;
  let s = nav;
  if (k.startsWith('parte')) {
    const P = LIBRO.partes[+k.slice(5)];
    s += `<div class="lector ${cls}">`;
    if (P.invocacion) s += `<div class="par"><div class="lem rub">${esc(P.invocacion.lem)}</div><div class="es rub"><i>${esc(P.invocacion.es)}</i></div></div>`;
    s += `<div class="titlem">${esc(P.tituloLem||'')}</div><div class="tit">${esc(P.nombre)}${P.id?'. '+esc(P.titulo):''}</div>${banda()}`;
    for (const x of P.pars) s += `<div class="par" id="p-${P.id}-${x.n}"><div class="lem">${esc(x.lem)}</div><div class="es">${x.n>1||P.id===0&&!x.cap?`<span class="num">${x.n}.</span>`:''}${parrafoTexto(x)}</div></div>`;
    s += '</div>';
    const ant = P.id>0 ? `<button class="btn sec" data-a="leer" data-v="parte${P.id-1}">‹ ${esc(LIBRO.partes[P.id-1].nombre)}</button>` : '';
    const sig = P.id<7 ? `<button class="btn sec" data-a="leer" data-v="parte${P.id+1}">${esc(LIBRO.partes[P.id+1].nombre)} ›</button>` : '';
    s += `<div class="fila" style="justify-content:space-between;margin-top:12px">${ant}${sig}</div>`;
  } else if (k === 'glosario') {
    s += `<h2>Glosario</h2><div class="card">${LIBRO.glosario.map(g=>`<p><b>${esc(g.t)}.</b> ${esc(g.d)}</p>`).join('')}</div>`;
  } else if (k === 'aviso') {
    s += `<h2>Aviso legal</h2><div class="card">${LIBRO.aviso.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
  } else {
    const titulo = SECCIONES.find(x=>x[0]===k)[1];
    s += `<h2>${esc(titulo)}</h2><div class="card lector">${LIBRO[k].map(x=> x.b || /^[IVX]+\.\s/.test(x.t) ? `<h3 class="rub">${esc(x.t)}</h3>` : `<p class="es" style="text-align:justify">${esc(x.t)}</p>`).join('')}</div>`;
  }
  return s;
}
function vistaBuscar(){
  const q = (TMP.q||'').trim().toLowerCase();
  let s = `<div class="fila" style="margin-bottom:8px"><button class="btn sec" data-a="tab" data-v="libro">Índice</button><input type="text" id="qbus" value="${esc(TMP.q||'')}" style="flex:1"><button class="btn sec" data-a="buscar">Buscar</button></div>`;
  if (q.length < 3) return s + '<p>Escribe al menos tres letras.</p>';
  const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const nq = norm(q), R = [];
  for (const P of LIBRO.partes) for (const x of P.pars) {
    const i = norm(x.es).indexOf(nq), j = norm(x.lem).indexOf(nq);
    if (i >= 0 || j >= 0) { const t = i>=0 ? x.es : x.lem, pos = i>=0?i:j; R.push({ P, x, frag: t.slice(Math.max(0,pos-60), pos+q.length+80), pos: Math.min(60,pos), lem: i<0 }); }
  }
  s += `<p class="peq">${R.length} resultados</p><div class="card lista">${R.map(r=>`<a href="#" data-a="leerPar" data-p="${r.P.id}" data-n="${r.x.n}"><b>${esc(r.P.nombre)}, §${r.x.n}</b><br><span class="${r.lem?'got':''}">…${esc(r.frag.slice(0,r.pos))}<span class="marca">${esc(r.frag.slice(r.pos,r.pos+q.length))}</span>${esc(r.frag.slice(r.pos+q.length))}…</span></a>`).join('')}</div>`;
  return s;
}

/* =====================================================================
   ARMAS
   ===================================================================== */
function vistaArmas(){
  if (RUTA.sub === 'constructor') return vistaConstructor();
  const E = estadoEscudo();
  let s = `<h1>Mis armas</h1>`;
  if (E.e === 'blanco') s += `<div class="card"><div class="logro">${logroSVG(null,0,'blanco')}</div><p>«Las armas en el escudo, la silla y el perpunte se dan al caballero para que sea alabado por los ardimientos que emprenda.» <span class="ref">V, §18</span></p><p>${S.situacion==='orden'?'':'El escudero no lleva blasón. Elegirás tus armas el día de tu investidura.'}</p>
    ${S.situacion==='orden' && !S.blason ? '<button class="btn" data-a="sub" data-t="armas" data-v="constructor">Componer mis armas</button>' : ''}</div>`;
  else if (E.e === 'abatido') s += `<div class="card negra"><div class="logro">${logroSVG(S.blason,0,'abatido')}</div><p>Armas abatidas. Te serán restituidas cuando reconquistes la caballería.</p></div>`;
  else s += `<div class="card"><div class="logro">${logroSVG(S.blason,S.grado,null)}</div><p class="cen"><i>${esc(blasonar(S.blason))}</i></p>
    <p class="peq cen">Ornamentos de ${esc(nombreGrado())}: ${['','yelmo','yelmo, lambrequines y cimera','yelmo, lambrequines, cimera y pendones','corona condal, manto, yelmo, lambrequines, cimera y pendones'][S.grado]}. La corona de conde (18 perlas, 9 vistas) es la de la heráldica española; los ornamentos de valvasor y comdor son convención de esta Orden.</p>
    <div class="fila" style="justify-content:center"><button class="btn" data-a="compartir">Compartir mis armas</button></div></div>`;
  s += `<h2>La panoplia</h2><p class="peq">Las armas del caballero y su significación (Parte V).</p><div class="card">${ARMAS.map(a=>{
    const est = S.situacion==='orden' ? (S.prog.armas[a.id] || S.grado>=2 ? 'probada' : '') : (S.armasConocidas[a.id] ? 'aprendida' : '');
    return `<div class="prueba"><div class="txt"><b>${esc(a.nombre)}</b> <span class="ref">V, §${a.n}</span>${est?` <span class="tag v">${est}</span>`:''}<br>${esc(a.sig)}<br><span class="peq">Virtud: ${esc(VIRTUDES[VIRT_IDX[a.virtud]].nombre)}</span></div></div>`; }).join('')}</div>`;
  return s;
}
function vistaConstructor(){
  if (S.blason && !(S.situacion==='aspirante')) return `<p>Tus armas ya están elegidas: la heráldica es perpetua.</p><button class="btn" data-a="tab" data-v="armas">Volver</button>`;
  const b = TMP.b || (TMP.b = blasonVacio());
  const gPrev = S.perfil && edad() >= EDAD_CONDE ? 4 : 1;
  const err = validarBlason(b);
  const selEsm = (k, i, soloMetal) => `<div class="chips">${Object.entries(ESMALTES).filter(([id,e])=>!soloMetal||e.t==='metal').map(([id,e])=>`<button class="chip ${(i==null?b[k]:b[k][i])===id?'on':''}" data-a="bz" data-k="${k}" data-i="${i??''}" data-v="${id}"><span class="sw" style="background:${e.t==='forro'?(id==='arminos'?'#fff radial-gradient(#111 25%,transparent 30%) 0 0/8px 8px':'repeating-linear-gradient(90deg,#1E4C9A 0 5px,#F3F1EA 5px 10px)'):e.c}"></span> ${esc(e.n)}</button>`).join('')}</div>`;
  const sel = (k, obj, fn) => `<div class="chips">${Object.entries(obj).map(([id,n])=>`<button class="chip ${b[k]===id?'on':''}" data-a="bz" data-k="${k}" data-v="${id}">${esc(fn?fn(n):n)}</button>`).join('')}</div>`;
  const nE = NUM_ESMALTES_PART[b.particion];
  let s = `<div class="constructor"><h1>Componer mis armas</h1>
    <div class="prev logro">${logroSVG(b, gPrev, null)}</div>
    <p class="cen"><i>${esc(blasonar(b))}</i></p>${err.length?`<div class="aviso">${err.map(esc).join('<br>')}</div>`:''}
    <div class="card"><h3>Forma del escudo</h3>${sel('forma', FORMAS)}</div>
    <div class="card"><h3>Partición del campo</h3>${sel('particion', PARTICIONES)}`;
  for (let i=0;i<nE;i++) s += `<p class="peq">${nE===1?'Esmalte del campo':['Primero','Segundo','Tercero'][i]}</p>${selEsm('e', i)}`;
  s += `</div><div class="card"><h3>Pieza honorable</h3>${sel('pieza', PIEZAS, x=>x.n)}${b.pieza!=='ninguna'?selEsm('ep'):''}</div>
    <div class="card"><h3>Figura</h3>${sel('mueble', MUEBLES, x=>x.n)}${b.mueble!=='ninguno'?selEsm('em', null, MUEBLES[b.mueble].metal):''}
      ${b.mueble!=='ninguno'&&MUEBLES[b.mueble].tres?`<div class="chips"><button class="chip ${b.num===1?'on':''}" data-a="bz" data-k="num" data-v="1">Una</button><button class="chip ${b.num===3?'on':''}" data-a="bz" data-k="num" data-v="3">Tres, puestas dos y una</button></div>`:''}</div>
    <div class="card"><h3>Bordura</h3><div class="chips"><button class="chip ${!b.bordura?'on':''}" data-a="bz" data-k="bordura" data-v="0">Sin bordura</button><button class="chip ${b.bordura?'on':''}" data-a="bz" data-k="bordura" data-v="1">Con bordura</button></div>${b.bordura?selEsm('eb'):''}</div>
    <div class="card"><h3>Cimera</h3><p class="peq">Se muestra desde el grado de valvasor.</p>${sel('cimera', CIMERAS)}</div>
    <div class="card"><h3>Lema</h3><input type="text" id="lema" maxlength="40" value="${esc(b.lema)}" placeholder="Por ejemplo: Deo et Ordini"><p class="peq">Puede tomarse de una divisa del Libro.</p></div>
    <div class="aviso">La heráldica es perpetua: una vez confirmadas, tus armas no se cambian. Al ascender solo se añaden ornamentos.</div>
    <button class="btn ancho" data-a="confirmarArmas" ${err.length?'disabled':''}>Confirmar mis armas</button></div>`;
  return s;
}

/* =====================================================================
   ORDEN
   ===================================================================== */
function vistaOrden(){
  if (RUTA.sub === 'reglas') return vistaReglas();
  if (!S.perfil) return `<p>Preséntate primero al examen.</p>`;
  const e = edad();
  let s = `<h1>La Orden</h1><div class="card oro"><h2>${esc(nombreGrado())}</h2>
    <table class="tab"><tr><td>Edad</td><td>${e} años (franja ${FRANJA_NOMBRE[franja(e)]})</td></tr>
    <tr><td>Exigencia moral</td><td>${Math.round(cMoral()*100)} % (100 + ${compEdad(e)} por edad + ${S.situacion==='orden'?GRADOS[S.grado].comp:0} por grado)</td></tr>
    <tr><td>Exigencia física</td><td>${Math.round(cFisico()*100)} % (solo edad)</td></tr>
    <tr><td>Pruebas morales diarias</td><td>${numPruebasMorales()}</td></tr>
    <tr><td>Preguntas en el examen nocturno</td><td>${numPreguntasNoche()}</td></tr>
    <tr><td>Fallos tolerados en ${VENTANA} días</td><td>${tolerancia()} (llevas ${fallosRecientes()})</td></tr>
    <tr><td>Honra</td><td>⚜ ${S.honra}</td></tr></table></div>`;
  const R = requisitosAscenso();
  if (R) {
    s += `<div class="card"><h2>Hacia ${esc(nombreGrado(R.sig))}</h2><h3>Las siete virtudes (VI, §2)</h3><div class="matriz">${R.virt.map(x=>`<span>${esc(x.nombre)}</span><div class="barra"><i style="width:${Math.min(100,x.n/x.req*100)}%"></i></div><span class="peq">${x.n}/${x.req}</span>`).join('')}</div>`;
    if (R.armas) s += `<h3 style="margin-top:12px">Las armas (Parte V)</h3><p class="peq">${R.armas.filter(a=>a.ok).length} de ${R.armas.length} probadas: ${R.armas.filter(a=>!a.ok).map(a=>esc(a.nombre)).join(', ')||'todas'}</p>`;
    if (R.oficios) s += `<h3 style="margin-top:12px">Los oficios (Parte II)</h3><div class="matriz">${R.oficios.map(x=>`<span>${esc(x.nombre.split(' ').slice(0,2).join(' '))}</span><div class="barra"><i style="width:${Math.min(100,x.n/x.req*100)}%"></i></div><span class="peq">${x.n}/${x.req}</span>`).join('')}</div>`;
    s += `<h3 style="margin-top:12px">El cuerpo</h3><p class="peq">Cada prueba de la tabla, superada desde el último cambio de grado.</p><table class="tab">${pruebasFisicas(e,S.perfil.sexo).map(p=>`<tr><td>${esc(p.nombre)}</td><td>${esc(fmtObj(p))}</td><td>${S.prog.fisico[p.id]?'✔︎':`<input type="text" inputmode="decimal" data-fo="${p.id}" placeholder="${p.unidad==='min'?'min':'rep'}" style="width:80px;min-height:36px">`}</td></tr>`).join('')}</table>
      <button class="btn sec" data-a="marcasOrden" style="margin-top:6px">Anotar marcas</button>`;
    if (R.examen) s += `<h3 style="margin-top:12px">Examen de condado</h3><p class="peq">Conocimientos al ${Math.round(R.examen.nota*100)} %.</p>${R.examen.aprobado?'<p>✔︎ Aprobado</p>':'<button class="btn" data-a="examenCondado">Hacer el examen</button>'}`;
    s += '</div>';
  }
  s += `<div class="card"><h2>Historial de honra y deshonra</h2>${S.historial.length?S.historial.slice(0,60).map(h=>`<p class="${h.tipo==='deshonor'?'rub':''}"><span class="peq">${deISO(h.fecha).toLocaleDateString('es-ES')}</span> · ${esc(h.evento)}</p>`).join(''):'<p class="peq">Sin anotaciones.</p>'}</div>
    <button class="btn sec ancho" data-a="sub" data-t="orden" data-v="reglas">Las reglas de la Orden</button>`;
  return s;
}
function vistaReglas(){
  return `<button class="btn sec" data-a="tab" data-v="orden">‹ La Orden</button><h1>Reglas de la Orden</h1>
  <div class="card"><h3>Ingreso</h3><p>Examen de costumbres y vida (Parte III íntegra: amor y temor de Dios, intención, paraje o nobles obras, medios, vicios del §20), de conocimientos (catorce artículos, diez mandamientos, siete sacramentos: IV, §§5–7) y del cuerpo (III, §17). La edad mínima para entrar como escudero es de ${EDAD_MIN} años; para ser armado, ${EDAD_ARMAR} (III, §5).</p>
  <p>Menos de 60 años: si aprueba, es armado en fiesta de precepto; si no, un año de escudería (${DIAS_ESCUDERIA} días superados) y nuevo examen. Con 60 o más: si aprueba, es armado y recibe el grado de conde; si no, no entra y podrá repetir el examen pasados 30 días.</p></div>
  <div class="card"><h3>Grados (II, §6)</h3><p>Escudero › Caballero de un escudo › Valvasor › Comdor › Conde. En femenino: Escudera › Dama de la Orden › Valvasora › Comdora › Condesa.</p>
  <p>Para ascender: cada una de las siete virtudes probada 21 veces (valvasor), 49 (comdor) y 98 (conde), acumuladas; además, las 18 armas de la Parte V (valvasor), los oficios de la Parte II 7 veces cada uno (comdor) y un examen de conocimientos con la exigencia de conde (conde). En cada grado, toda la tabla física de la edad.</p></div>
  <div class="card"><h3>Exigencia según la edad</h3><p>Lo físico baja con la edad: 130 % (14–29), 122 % (30–39), 115 % (40–49), 107 % (50–59), 100 % (60 y más). Lo moral sube con la edad y el grado: 100 % más 0, 4, 8, 11 o 15 puntos por edad y lo mismo por grado. Un conde de 60 años: 130 % en virtudes, 100 % en lo físico. Un escudero de 25: 100 % en virtudes, 130 % en lo físico.</p>
  <p>La exigencia moral fija la nota mínima de los exámenes (70 % × coeficiente), los fallos tolerados (5 ÷ coeficiente en ${VENTANA} días), las pruebas diarias (1, 2 o 3) y las preguntas del examen nocturno (3, 5 o 7).</p></div>
  <div class="card"><h3>Caída, expulsión y redención</h3><p>Quien supera los fallos tolerados pierde con deshonor un grado y debe reconquistarlo; el caballero que cae vuelve a escudero con las armas abatidas. La falta grave declarada (III, §§18–20) y la acidia, ${DIAS_ACIDIA} días sin examen (VI, §12), llevan a la expulsión.</p>
  <p>La redención es siempre posible: confesión, penitencia (${PENITENCIA.falta} días superados por falta grave, ${PENITENCIA.acidia} por acidia) y examen de reingreso. Las armas no se rediseñan: se restituyen al ser armado de nuevo.</p></div>
  <div class="card"><h3>Honra</h3><p>10 puntos por prueba superada. Las disciplinas opcionales multiplican la honra de un día superado (tope ×${TOPE_MULT}); nunca compensan un fallo. Investidura: 500. Ascenso: 1000.</p></div>`;
}

/* =====================================================================
   MÁS
   ===================================================================== */
function vistaMas(){
  const sub = RUTA.sub;
  const V = { ejercicios:vistaEjercicios, nutricion:vistaNutricion, calendario:vistaCalendario, virtudes:vistaVirtudes, avisos:vistaAvisos, copia:vistaCopia, ajustes:vistaAjustes, acerca:vistaAcerca }[sub];
  if (V) return `<button class="btn sec" data-a="tab" data-v="mas">‹ Más</button>` + V();
  return `<h1>Más</h1><div class="card lista">
    <a href="#" data-a="sub" data-t="mas" data-v="ejercicios"><b>Ejercicios</b><br><span class="peq">Rutinas para mantener la forma, según tu edad y tu grado</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="nutricion"><b>Nutrición</b><br><span class="peq">La templanza en la mesa (VI, §§9, 16)</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="calendario"><b>Calendario</b><br><span class="peq">Fiestas de precepto, ayunos y abstinencias</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="virtudes"><b>Virtudes y vicios</b><br><span class="peq">Parte VI</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="avisos"><b>Avisos diarios</b><br><span class="peq">Mañana y noche en el calendario del teléfono</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="copia"><b>Copia de seguridad</b></a>
    <a href="#" data-a="sub" data-t="mas" data-v="ajustes"><b>Ajustes</b></a>
    <a href="#" data-a="sub" data-t="mas" data-v="acerca"><b>Créditos</b><br><span class="peq">El Libro impreso y el fin de la Orden</span></a></div>`;
}
function vistaEjercicios(){
  const e = S.perfil ? edad() : 30, sx = S.perfil ? S.perfil.sexo : 'm';
  const o = TMP.rut || { objetivo:'completa', duracion:30 };
  let s = `<h1>Ejercicios</h1><p>«Despreciar el uso de aquello con que el caballero se dispone para su oficio es despreciar la Orden de Caballería.» <span class="ref">II, §10</span></p>
    <div class="card"><h3>Pide una rutina</h3><p class="peq">Objetivo</p><div class="chips">${[['completa','Completa'],['fuerza','Fuerza'],['resistencia','Resistencia'],['movilidad','Movilidad y equilibrio']].map(([k,n])=>`<button class="chip ${o.objetivo===k?'on':''}" data-a="rut" data-k="objetivo" data-v="${k}">${n}</button>`).join('')}</div>
    <p class="peq">Duración</p><div class="chips">${[20,30,45].map(m=>`<button class="chip ${o.duracion===m?'on':''}" data-a="rut" data-k="duracion" data-v="${m}">${m} min</button>`).join('')}</div>
    <button class="btn ancho" data-a="genRutina">Dame la rutina</button></div>`;
  if (TMP.rutina) {
    const R = TMP.rutina, L = l => l.map(x=>`<div class="prueba"><div class="txt"><b>${esc(x.nombre)}</b> · ${esc(x.dosis)}<br><span class="peq">${esc(x.d)}</span></div></div>`).join('');
    s += `<div class="card oro"><h3>Calentamiento (5 min)</h3>${L(R.calentamiento)}<h3>Bloque principal</h3><p class="peq">${esc(R.formato)}</p>${L(R.principal)}<h3>Vuelta a la calma (5 min)</h3>${L(R.vuelta)}
      <p class="peq">Dosis ajustada a tu edad (${Math.round(coefFisico(e)*100)} %)${sx==='f'?' y baremo femenino':''}. Ante dolor o mareo, para.</p></div>`;
  }
  s += `<div class="card"><h3>Plan semanal orientativo</h3><table class="tab">${planSemanal(e).map((t,i)=>`<tr><td>${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][i]}</td><td>${esc(t)}</td></tr>`).join('')}</table></div>
    <div class="card"><h3>Tu tabla física</h3><p class="peq">${FRANJA_NOMBRE[franja(e)]} años${sx==='f'?', baremo femenino':''}, al ${Math.round(coefFisico(e)*100)} %.</p><table class="tab">${pruebasFisicas(e,sx).map(p=>`<tr><td>${esc(p.nombre)}</td><td>${esc(fmtObj(p))}</td></tr>`).join('')}</table></div>`;
  return s;
}
function vistaNutricion(){
  const e = S.perfil ? edad() : 30, d = new Date(), disc = disciplinaDia(d, e);
  const menu = NUTRICION.menus[disc.abstinencia ? 4 : (d.getDay()+6)%7];
  return `<h1>Nutrición</h1>${NUTRICION.principio.map(([t,r])=>`<div class="card roja"><p>«${esc(t)}» <span class="ref">${r}</span></p></div>`).join('')}
    <div class="card"><h3>Hoy</h3>${disc.ayuno?`<p>${esc(NUTRICION.ayuno)}</p>`:''}${disc.abstinencia?`<p>${esc(NUTRICION.abstinencia)}</p>`:''}${!disc.ayuno&&!disc.abstinencia?'<p>Día sin ayuno ni abstinencia.</p>':''}${disc.ayunoGeneral&&!disc.ayuno?'<p class="peq">Hoy es día de ayuno, pero por tu edad no te obliga (c. 1254: del 21.º cumpleaños al comienzo de los 60 años).</p>':''}
      <p><b>Comida:</b> ${esc(menu[0])}<br><b>Cena:</b> ${esc(menu[1])}</p></div>
    <div class="card"><h3>Reglas de la templanza</h3><ul>${NUTRICION.reglas.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>
    <div class="card"><h3>Según tu edad (${FRANJA_NOMBRE[franja(e)]})</h3><p>${esc(NUTRICION.edad[franja(e)])}</p></div>
    <div class="card"><h3>Disciplina de la Iglesia</h3><p class="peq">Código de Derecho Canónico de 1917, vigente en 1962: abstinencia todos los viernes; ayuno y abstinencia el Miércoles de Ceniza, los viernes y sábados de Cuaresma, las Témporas y las vigilias de Pentecostés, la Asunción, Todos los Santos y Navidad; ayuno los demás días de Cuaresma. Cesan en domingos y fiestas de precepto fuera de Cuaresma; la vigilia no se anticipa. La abstinencia obliga desde los 7 años cumplidos; el ayuno, desde los 21 cumplidos hasta comenzar los 60. El Sábado Santo el ayuno termina a mediodía.</p></div>`;
}
function vistaCalendario(){
  const e = S.perfil ? edad() : 30; let s = `<h1>Calendario</h1><p class="peq">Próximos 45 días</p><div class="card"><table class="tab">`;
  for (let i=0;i<45;i++){
    const d = addDias(new Date(), i), di = disciplinaDia(d, e), k = `${d.getMonth()+1}-${d.getDate()}`;
    const m = [];
    if (di.fiesta) m.push(`<b class="rub">${esc(di.fiesta)}</b>`);
    if (SANTOS_CABALLEROS[k]) m.push(`<b>${esc(SANTOS_CABALLEROS[k][0])}</b>`);
    if (di.ayunoGeneral) m.push(`Ayuno${di.ayuno?'':' (no te obliga por edad)'}`);
    if (di.abstinencia) m.push('Abstinencia');
    if (di.motivo && (di.ayunoGeneral||di.abstinencia)) m.push(`<span class="peq">${esc(di.motivo)}</span>`);
    if (m.length) s += `<tr><td style="white-space:nowrap">${d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'})}</td><td>${m.join(' · ')}</td></tr>`;
  }
  return s + '</table></div>';
}
function vistaVirtudes(){
  return `<h1>Virtudes y vicios</h1><p>«Todo caballero debe conocer las siete virtudes, raíz y principio de todas las buenas costumbres.» <span class="ref">VI, §2</span></p>
    ${VIRTUDES.map(v=>`<div class="card"><h3>${esc(v.nombre)} <span class="ref">${v.ref}</span></h3><p>${esc(v.def)}</p><p class="peq">Arma: ${esc(ARMAS.find(a=>a.id===v.arma).nombre)}${v.vicio?` · contra la ${esc(v.vicio)}`:''} · <a href="#" data-a="leerPar" data-p="6" data-n="${v.ref.match(/§(\d+)/)[1]}">leer</a></p></div>`).join('')}
    <h2>Los ánimos y su remedio</h2><div class="card"><table class="tab">${ANIMOS.filter(a=>a.vicio||a.remedio.length).map(a=>`<tr><td>${esc(a.nombre)}</td><td>${a.vicio?esc(a.vicio)+' → ':''}${a.remedio.map(esc).join(', ')}</td><td class="ref">${esc(a.ref)}</td></tr>`).join('')}</table></div>`;
}
function vistaAvisos(){
  const A = S.ajustes;
  return `<h1>Avisos diarios</h1><p>Una aplicación web no puede programar avisos diarios por sí misma sin un servidor. La solución es añadir dos eventos diarios con alarma al calendario de tu teléfono: al pulsarlos, abren la app.</p>
    <div class="card"><label class="campo"><span>Vigilia de la mañana</span><input type="time" id="hm" value="${A.horaManana}"></label>
    <label class="campo"><span>Examen de la noche</span><input type="time" id="hn" value="${A.horaNoche}"></label>
    <button class="btn ancho" data-a="ics">Descargar avisos (.ics)</button>
    <p class="peq">Abre el archivo descargado: Android (Google Calendar) e iPhone (Calendario) lo importan y repiten el aviso cada día.</p></div>`;
}
function vistaCopia(){
  return `<h1>Copia de seguridad</h1><p>Tu progreso se guarda solo en este dispositivo. Descarga una copia y guárdala fuera del teléfono; para restaurarla, cárgala aquí.</p>
    <div class="card"><button class="btn ancho" data-a="exportar">Descargar copia</button>
    <p class="peq">Última copia: ${S.ultimaCopia ? deISO(S.ultimaCopia).toLocaleDateString('es-ES') : 'nunca'}</p>
    <label class="campo"><span>Restaurar desde una copia</span><input type="file" id="fimp" accept="application/json,.json"></label></div>`;
}
function vistaAjustes(){
  const A = S.ajustes, e = S.perfil ? edad() : 30;
  const disp = opcionalesDisponibles(e), mias = S.perfil ? (S.perfil.opcionales||[]) : [];
  return `<h1>Ajustes</h1>
    <div class="card"><label class="campo"><span>Tamaño de la letra: ${A.tam||19} px</span><input type="range" min="15" max="26" value="${A.tam||19}" data-a="tam" style="width:100%"></label>
    <label class="campo"><span>Lector</span><select data-a="cols"><option value="ambas" ${A.columnas==='ambas'?'selected':''}>Lemosín y español</option><option value="es" ${A.columnas==='es'?'selected':''}>Solo español</option><option value="lem" ${A.columnas==='lem'?'selected':''}>Solo lemosín</option></select></label></div>
    ${S.perfil ? `<div class="card"><h3>Disciplinas que practicas</h3><p class="peq">${e>=65?'Como el viejo caballero del Prólogo, las disciplinas de monta y armas se sustituyen por las del estudio y las artes.':'Multiplican la honra de los días superados en que las practiques.'}</p>
      <div class="chips">${disp.map(o=>`<button class="chip ${mias.includes(o.id)?'on':''}" data-a="miopc" data-v="${o.id}">${esc(o.nombre)} ×${o.mult}</button>`).join('')}</div>
      <p class="peq">${disp.map(o=>o.ref?`${esc(o.nombre)}: ${esc(o.ref)}`:'').filter(Boolean).join(' · ')}</p></div>` : ''}
    <div class="card"><h3>Modo de ensayo</h3><p class="peq">Permite recorrer la investidura cualquier día para conocerla. No altera las demás reglas.</p>
      <button class="btn sec" data-a="ensayo">${ENSAYO?'Desactivar':'Activar'} el modo de ensayo</button></div>
    <div class="card"><h3>Borrar todo</h3><p class="peq">Elimina el perfil y todo el progreso de este dispositivo.</p><button class="btn osc" data-a="borrar">${TMP.borrar?'Pulsa otra vez para confirmar':'Borrar todo'}</button></div>`;
}
function vistaAcerca(){
  return `<h1>Créditos</h1>
    <div class="cen"><img src="ornamento.png" alt="" style="width:60%;max-width:260px"></div>
    <div class="card roja"><h2>El fin de la Orden</h2>
      <p>«Los clérigos tienen ciencia y doctrina para amar, conocer y honrar a Dios y sus obras, y para enseñar a las gentes con el buen ejemplo.» Y así como ellos tienen orden y oficio para inclinar a las gentes a la devoción y a la buena vida, los caballeros tienen el suyo. <span class="ref">I, §10</span></p>
      <p>«Debe ser costumbre del caballero oír misa y sermón, adorar, rogar y temer a Dios; porque con ella piensa en la muerte y en la vileza de este mundo, pide la gloria celestial y teme las penas del infierno.» <span class="ref">VI, §17</span></p>
      <p>«Todo caballero debe conocer las siete virtudes, raíz y principio de todas las buenas costumbres y camino de la gloria celestial y perdurable.» <span class="ref">VI, §2</span></p>
      <p>Esta Orden no tiene otro fin que el del Libro: que el caballero conozca, ame, sirva y adore a Dios, y por ese camino alcance la vida eterna.</p></div>
    <div class="card"><h2>El Libro</h2>
      <p>Esta aplicación nace de la edición impresa:</p>
      <p class="cen"><b>Libro de la Orden de Caballería</b><br>Ramon Llull<br><i>Edición bilingüe lemosín-español. El original en letra gótica, la versión en redonda.</i><br>Traducción, advertencia y edición de Francisco de Paula Requena Paredes<br>Primera edición, 2026</p>
      ${LIBRO_URL ? `<p class="cen"><a class="btn" href="${LIBRO_URL}" target="_blank" rel="noopener">Comprar el libro impreso</a></p>` : ''}
      <p>Todas las divisas, pruebas y referencias de la app remiten a sus Partes y parágrafos. Quien quiera el texto entero, con sus capitulares, notas y glosario, lo tiene en el Libro.</p>
      <button class="btn sec" data-a="leer" data-v="parte0">Leer el Prólogo</button></div>
    <div class="card"><p>Traducción al español contemporáneo, advertencia, edición, capitulares, bandas y adornos, y esta aplicación: © 2026, Francisco de Paula Requena Paredes. El texto de Llull y los textos de la edición de 1901 son de dominio público.</p>
      <p>Tipografías UnifrakturMaguntia y EB Garamond, bajo licencia SIL Open Font License.</p>
      <p>Sugerencias: <a href="mailto:fprequenap@gmail.com">fprequenap@gmail.com</a></p></div>
    <div class="card"><p class="cen">«…que queda acabado a gloria y bendición de Dios nuestro Señor.» <span class="ref">VII, §9</span></p>
      <p class="cen got rub" style="font-size:1.6em;margin:4px 0">AMDG</p></div>
    <button class="btn sec" data-a="leer" data-v="aviso">Aviso legal completo</button>`;
}

/* =====================================================================
   ACCIONES
   ===================================================================== */
const ACC = {
  tab: el => go(el.dataset.v),
  sub: el => go(el.dataset.t, el.dataset.v),
  cerrarModal: () => cerrarModal(),
  crearPerfil: () => {
    const nombre = $('#pnom').value.trim(), sexo = $('#psex').value, nac = $('#pnac').value;
    if (!nombre || !nac) return toast('Escribe tu nombre y tu fecha de nacimiento.');
    const e = edadEn(nac);
    if (e < EDAD_MIN) return toast(`Aún no tienes la edad conveniente: se entra como escudero desde los ${EDAD_MIN} años (III, §5).`, 4000);
    S.perfil = { nombre, sexo, nac, opcionales:[] }; S.situacion = 'nuevo';
    anotar(`${nombre} se presenta a la Orden.`); guardar(); go('hoy','examen');
  },
  animo: el => { TMP.animo = el.dataset.v; render(); },
  circ: el => { TMP.circ = el.dataset.v; render(); },
  empezarDia: () => {
    const h = hoy(), an = TMP.animo || 'paz', ci = TMP.circ || 'ordinario';
    const d = generarDia(h, an, ci);
    d.divisa = divisaDelDia(h, an, ci); marcarUsada(h, d.divisa.idx);
    S.dias[h] = d; guardar(); render();
  },
  pr: el => { const d = S.dias[hoy()]; const p = d.pruebas[+el.dataset.i]; const v = el.dataset.v === '1'; p.ok = p.ok === v ? null : v; guardar(); render(); },
  ejer: el => { S.dias[hoy()].ejercicio = el.checked; guardar(); },
  opc: el => { const d = S.dias[hoy()], v = el.dataset.v; d.opcionales = d.opcionales.includes(v) ? d.opcionales.filter(x=>x!==v) : [...d.opcionales, v]; guardar(); render(); },
  fisica: () => { const d = S.dias[hoy()], v = numero($('#fisval').value); d.fisica.valor = v; d.fisica.ok = cumple(d.fisica, v); guardar(); render(); },
  examenNoche: el => abrirExamenNoche(el.dataset.v),
  nq: el => { const i = +el.dataset.i; TMP.noche.resp[i] = el.dataset.v === '1'; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  npr: el => { const d = S.dias[TMP.noche.fecha]; const p = d.pruebas[+el.dataset.i]; p.ok = el.dataset.v === '1'; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  cerrarNoche: () => {
    const N = TMP.noche, d = S.dias[N.fecha];
    if (N.resp.some(r => r === null)) return toast('Responde a todas las preguntas.');
    if (d.pruebas.some(p => p.ok === null)) return toast('Declara cada prueba: superada o no.');
    d.ejercicio = $('#nejer').checked;
    const falta = $('#nfalta').value;
    const r = cerrarDia(N.fecha, N.resp, falta);
    cerrarModal(); render();
    if (r && r.eventos.includes('expulsion')) toast('Expulsión de la Orden. La redención es siempre posible.', 4000);
    else if (r && r.eventos.includes('caida')) toast('No te has mantenido: pierdes con deshonor. Reconquístalo.', 4000);
    else if (r && r.eventos.includes('ascenso')) { toast(`Asciendes a ${nombreGrado()}.`, 4000); splash(); }
    else toast(d.superado ? `Día superado. Honra: +${d.honra}` : 'Día no superado.');
  },
  /* examen de ingreso */
  im: el => { borrador().moral[el.dataset.k] = el.dataset.v === '1'; guardar(); render(); },
  iv: el => { const B = borrador(), v = el.dataset.v; B.vicios = B.vicios.includes(v) ? B.vicios.filter(x=>x!==v) : [...B.vicios, v]; guardar(); render(); },
  iq: el => { borrador().qresp[el.dataset.q] = +el.dataset.v; guardar(); render(); },
  ipaso: el => {
    const B = borrador(), v = +el.dataset.v;
    if (B.paso === 0 && v === 1 && INGRESO.some(q => !q.obras && B.moral[q.id] === undefined)) return toast('Responde a todas las preguntas.');
    if (B.paso === 1 && v === 2 && B.quiz.some(q => B.qresp[q] === undefined)) return toast('Responde a todas las preguntas.');
    if (B.paso === 2) guardarMarcas();
    B.paso = v; guardar(); render(); window.scrollTo(0,0);
  },
  iguardarf: () => { guardarMarcas(); toast('Marcas guardadas.'); },
  ievaluar: () => {
    guardarMarcas();
    const B = borrador();
    const aciertos = B.quiz.filter(q => B.qresp[q] === PREGUNTAS[q][2]).length;
    const res = evaluarIngreso({ moral:B.moral, vicios:B.vicios, fisico:B.fisico, quiz:{ aciertos, total:B.quiz.length } });
    aplicarIngreso(res, B.tipo);
    TMP.resIngreso = res; S.borrador = null; guardar();
    go('hoy', 'examen');
  },
  reexUnidades: () => { S.reexUnidades = true; S.borrador = null; S.situacion = 'nuevo'; S.escuderia = { dias:0, inicio:null }; anotar('Repite el examen de ingreso por la corrección de unidades.'); guardar(); go('hoy','examen'); },
  finIngreso: () => { TMP.resIngreso = null; go('hoy'); },
  fiesta: el => { const F = proximasFiestas(new Date(), 6); señalarFiesta(F[+el.dataset.v]); render(); },
  cambiarFiesta: () => { S.investidura = null; guardar(); render(); },
  confPen: el => { S.penitencia.confesion = el.checked; guardar(); render(); },
  /* investidura */
  pasoInv: el => { S.investidura.pasos[el.dataset.v] = true; if (el.dataset.v==='armas' && S.blason) S.abatido = false; guardar(); render(); },
  vela: () => {
    const P4 = LIBRO.partes[4];
    modal(`<h2>Vela de armas</h2><p>«La noche anterior ha de ir a la iglesia a velar, estando en oración y contemplación, oyendo palabras de Dios y de la Orden de Caballería.» <span class="ref">IV, §3</span></p>
      ${[5,6,7].map(n=>`<div class="card"><span class="ref">IV, §${n}</span><p>${esc(P4.pars[n-1].es)}</p></div>`).join('')}
      <p class="peq">Puedes leer además el Libro entero durante la vela.</p>
      <button class="btn" data-a="velaHecha">He velado</button>`);
  },
  velaHecha: () => { S.investidura.pasos.vela = true; guardar(); cerrarModal(); render(); },
  cer: () => {
    TMP.cer = (TMP.cer||0) + 1;
    if (TMP.cer === 3) { document.body.classList.add('sacudir'); setTimeout(()=>document.body.classList.remove('sacudir'),600); if (navigator.vibrate) navigator.vibrate(180); }
    render();
  },
  compartir: async () => {
    if (!S.blason) return;
    const svg = logroSVG(S.blason, S.situacion==='orden'?S.grado:(edad()>=EDAD_CONDE?4:1), null);
    try {
      const blob = await svgAPng(svg, 1080, `${S.perfil.nombre}\n${nombreGrado()}`);
      const file = new File([blob], 'mis-armas.png', { type:'image/png' });
      if (navigator.canShare && navigator.canShare({ files:[file] })) await navigator.share({ files:[file], title:'Mis armas', text: blasonar(S.blason) });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mis-armas.png'; a.click(); }
    } catch(e){ toast('No se pudo generar la imagen.'); }
  },
  dadiva: () => {
    const t = $('#dadiva').value.trim(); if (!t) return toast('Anota la dádiva.');
    S.investidura.pasos.dadivas = t; completarInvestidura(); TMP.cer = 0; go('hoy'); splash();
  },
  /* constructor */
  bz: el => {
    const b = TMP.b, k = el.dataset.k, v = el.dataset.v, i = el.dataset.i;
    if (k === 'e') b.e[+i] = v; else if (k === 'num') b.num = +v; else if (k === 'bordura') b.bordura = v === '1'; else b[k] = v;
    if (k === 'mueble' && MUEBLES[v] && MUEBLES[v].metal && ESMALTES[b.em].t !== 'metal') b.em = 'oro';
    const y = window.scrollY; render(); window.scrollTo(0, y);
  },
  confirmarArmas: () => {
    const b = TMP.b; b.lema = ($('#lema').value || '').trim();
    if (validarBlason(b).length) return;
    S.blason = JSON.parse(JSON.stringify(b)); TMP.b = null;
    anotar(`Toma por armas: ${blasonar(S.blason)}`, 'honor');
    if (S.investidura) S.investidura.pasos.armas = true;
    guardar();
    go(S.situacion === 'aspirante' ? 'hoy' : 'armas', S.situacion === 'aspirante' ? 'investidura' : null);
  },
  /* lector */
  leer: el => go('libro', 'leer', el.dataset.v),
  leerPar: el => { go('libro', 'leer', 'parte' + el.dataset.p); setTimeout(() => { const t = document.getElementById(`p-${el.dataset.p}-${el.dataset.n}`); if (t) { t.scrollIntoView({ block:'start' }); window.scrollBy(0,-70); t.style.background = '#FFF3D6'; } }, 50); },
  buscar: () => { TMP.q = $('#qbus').value; go('libro', 'buscar'); },
  /* orden */
  marcasOrden: () => {
    const L = pruebasFisicas(edad(), S.perfil.sexo); let n = 0;
    document.querySelectorAll('[data-fo]').forEach(i => { const p = L.find(x => x.id === i.dataset.fo); if (i.value !== '' && cumple(p, i.value)) { S.prog.fisico[p.id] = true; n++; } });
    const a = comprobarAscenso(); guardar(); render();
    toast(a ? `Asciendes a ${nombreGrado()}.` : n ? `${n} prueba(s) superada(s).` : 'Ninguna marca alcanza el objetivo.');
    if (a) splash();
  },
  examenCondado: () => {
    const idx = PREGUNTAS.map((_,i)=>i).sort(()=>Math.random()-.5).slice(0,15);
    TMP.ec = { idx, r:{} };
    modal(`<h2>Examen de condado</h2><p class="peq">Nota mínima ${Math.round(notaMinima(4)*100)} %.</p>${idx.map((qi,j)=>{ const [q,ops,,ref]=PREGUNTAS[qi]; return `<div class="card"><p><b>${j+1}.</b> ${esc(q)} <span class="ref">${ref}</span></p><div class="chips" style="flex-direction:column;align-items:stretch">${ops.map((o,k)=>`<button class="chip" style="text-align:left" data-a="ecq" data-q="${qi}" data-v="${k}">${esc(o)}</button>`).join('')}</div></div>`; }).join('')}<button class="btn" data-a="ecFin">Entregar</button>`);
  },
  ecq: el => { TMP.ec.r[el.dataset.q] = +el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  ecFin: () => {
    const E = TMP.ec; if (E.idx.some(q => E.r[q] === undefined)) return toast('Responde a todas.');
    const nota = E.idx.filter(q => E.r[q] === PREGUNTAS[q][2]).length / E.idx.length;
    const ok = nota >= notaMinima(4);
    S.examenes.push({ fecha:hoy(), tipo:'condado', aprobado:ok, notaQuiz:nota });
    if (ok) { S.prog.examenCondado = true; anotar('Aprueba el examen de condado.', 'honor'); }
    else anotar(`No aprueba el examen de condado (${Math.round(nota*100)} %).`, 'info');
    const a = comprobarAscenso(); guardar(); cerrarModal(); render();
    toast(a ? `Asciendes a ${nombreGrado()}.` : ok ? 'Examen aprobado.' : `${Math.round(nota*100)} %: no alcanza la nota.`);
    if (a) splash();
  },
  /* más */
  rut: el => { TMP.rut = TMP.rut || { objetivo:'completa', duracion:30 }; TMP.rut[el.dataset.k] = el.dataset.k==='duracion' ? +el.dataset.v : el.dataset.v; render(); },
  genRutina: () => { const o = TMP.rut || { objetivo:'completa', duracion:30 }; TMP.rutina = generarRutina({ edad: S.perfil?edad():30, sexo: S.perfil?S.perfil.sexo:'m', objetivo:o.objetivo, duracion:o.duracion, semilla: Date.now()%100000 }); render(); },
  ics: () => {
    S.ajustes.horaManana = $('#hm').value || '07:00'; S.ajustes.horaNoche = $('#hn').value || '22:00'; guardar();
    const url = location.href.split('#')[0];
    const ev = (uid, hora, titulo, desc) => { const [h,m] = hora.split(':'); const d = hoy().replace(/-/g,''); return ['BEGIN:VEVENT',`UID:${uid}-${d}@codigo-llull`,`DTSTAMP:${d}T000000`,`DTSTART:${d}T${h}${m}00`,`DURATION:PT10M`,'RRULE:FREQ=DAILY',`SUMMARY:${titulo}`,`DESCRIPTION:${desc}`,`URL:${url}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${titulo}`,'TRIGGER:PT0M','END:VALARM','END:VEVENT'].join('\r\n'); };
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Codigo de Llull//ES','CALSCALE:GREGORIAN',
      ev('manana', S.ajustes.horaManana, 'Código de Llull: vigilia de la mañana', `Recibe tu divisa y tus pruebas. ${url}`),
      ev('noche', S.ajustes.horaNoche, 'Código de Llull: examen de la noche', `Examina el día. ${url}`),'END:VCALENDAR'].join('\r\n');
    descargar(new Blob([ics], { type:'text/calendar' }), 'codigo-llull-avisos.ics');
  },
  exportar: () => { S.ultimaCopia = hoy(); guardar(); descargar(new Blob([JSON.stringify(S)], { type:'application/json' }), `codigo-llull-copia-${hoy()}.json`); render(); },
  miopc: el => { const v = el.dataset.v, L = S.perfil.opcionales || []; S.perfil.opcionales = L.includes(v) ? L.filter(x=>x!==v) : [...L, v]; guardar(); render(); },
  ensayo: () => { ENSAYO = !ENSAYO; S.ajustes.ensayo = ENSAYO; guardar(); render(); },
  borrar: () => { if (!TMP.borrar) { TMP.borrar = true; render(); return; } localStorage.removeItem(CLAVE); location.reload(); }
};
function guardarMarcas(){ const B = borrador(); document.querySelectorAll('[data-f]').forEach(i => { B.fisico[i.dataset.f] = numero(i.value); }); guardar(); }
function descargar(blob, nombre){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && el.type !== 'checkbox')) return;
  if (el.tagName === 'A') e.preventDefault();
  const f = ACC[el.dataset.a]; if (f) f(el);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.a === 'cols') { S.ajustes.columnas = el.value; guardar(); render(); }
  if (el.dataset && el.dataset.a === 'tam') { S.ajustes.tam = +el.value; document.documentElement.style.setProperty('--fs', el.value + 'px'); guardar(); render(); }
  if (el.id === 'fimp' && el.files[0]) {
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o.v || !o.dias) throw 0; localStorage.setItem(CLAVE, JSON.stringify(o)); location.reload(); } catch(x){ toast('El archivo no es una copia válida.'); } };
    r.readAsText(el.files[0]);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'qbus') ACC.buscar(); });
function despuesDeRender(){}

/* ---------- arranque (al final: todas las constantes ya definidas) ---------- */
cargar();
ENSAYO = !!S.ajustes.ensayo;
document.documentElement.style.setProperty('--fs', (S.ajustes.tam||19) + 'px');
cerrarDiasAtrasados();
comprobarAcidia();
render();
splash();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js?v=5').then(r => { r.update(); }).catch(()=>{});
  // solo se recarga al actualizar una versión ya instalada, no en la primera visita
  const habia = !!navigator.serviceWorker.controller;
  let recargado = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (habia && !recargado) { recargado = true; location.reload(); } });
}

