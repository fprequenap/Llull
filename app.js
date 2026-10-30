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
function go(tab, sub, arg){ if (!(tab==='libro' && sub==='leer')) TMP.volver = null; RUTA = { tab, sub:sub||null, arg:arg||null }; render(); window.scrollTo(0,0); }
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
  d.innerHTML = `${retratoURL() ? `<div style="margin-bottom:-6px">${medallonSVG(130)}</div>` : ''}${logroSVG(E.b, E.g, E.e)}<div class="nom">${esc(S.perfil.nombre)}</div><div class="gr">${esc(nombreGrado())}</div>
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
  s += `<div class="card" id="brevDia" data-f="${h}" style="padding:10px 14px"><span class="peq">Breviario Romano…</span></div>`;
  s += tarjetaAniversario();
  if (S.ultimaCopia == null || difDias(S.ultimaCopia, h) > 30) s += `<div class="aviso">Haz una copia de seguridad de tu progreso: si pierdes o cambias el teléfono, se pierde. <a href="#" data-a="sub" data-t="mas" data-v="copia">Hacer copia</a></div>`;
  if (S.cartaInicial && medicionPendiente() && ['orden','escudero','aspirante','expulsado'].includes(S.situacion)) s += `<div class="aviso">Toca la medición mensual de tus balanzas y tu retiro del mes. <a href="#" data-a="abrirCarta">Medirme ahora</a> · ${enlaceMeditacion('Meditación')}</div>`;
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
    <p>Con sesenta años o más, quien supera el examen es armado y recibe el grado de conde.</p>
    <p>La virtud está en el medio, entre dos vicios (VI, §16): tu combate se mide en balanzas que se templan cada día.</p>
    <p><b>Desea a lo grande.</b> No se trata de apagar el deseo, sino de ordenarlo: no conformarse con poco cuando se puede alcanzar el Cielo, y dejarse gobernar por el Espíritu Santo. <i>Ad maiora natus sum.</i></p></div>
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
        <p>Sin blasón ni caballo. Un año de días superados para ser ${fem()?'examinada de nuevo y armada':'examinado de nuevo y armado'}.</p>
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
        <label class="fila"><input type="checkbox" data-a="confPen" ${P.confesion?'checked':''} style="width:24px;height:24px"> Me he confesado</label> <a href="#" data-a="sub" data-t="mas" data-v="confesion">Preparar la confesión</a>
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
    if (['escudero','aspirante','orden','expulsado'].includes(S.situacion)) s += `<details class="card plegable"><summary>Mi arnés · <span class="peq">toca para verlo</span></summary>${tarjetaArnes(true).replace(/^<div class="card">/, '<div>')}</details>`;
    return s;
  }
  const dv = d.divisa;
  const A = ANIMOS.find(a=>a.id===d.animo), C = CIRCUNSTANCIAS.find(c=>c.id===d.circ);
  s += `<div class="card roja">${dv.santo ? `<div class="tag v">${esc(dv.santo)}</div>` : ''}
    <p class="divisa${/^[…«]/.test(dv.t)?' sin':''}">${esc(dv.t)}</p><div class="ref">${esc(dv.ref)}${dv.p!=null?` · <a href="#" data-a="leerPar" data-p="${dv.p}" data-n="${dv.n}">leer el parágrafo</a>`:''}${vozDisponible()?` · <a href="#" ${dv.p!=null?`data-a="vozPars" data-p="${dv.p}" data-n="${dv.n}"`:`data-a="voz" data-t="${esc(dv.t)}"`}>escuchar el parágrafo</a>`:''}</div>
    ${A && A.vicio ? `<p class="peq" style="margin-top:8px">Amaneces ${esc(A.nombre.toLowerCase())}: acecha la ${esc(A.vicio)}. Remedio: ${A.remedio.map(esc).join(' y ')} (${esc(A.ref)}).</p>` : ''}
    ${C && C.id!=='ordinario' ? `<p class="peq">${esc(C.nombre)}.</p>` : ''}</div>`;
  const cDivisa = s; s = '';
  const cDeseo = tarjetaDeseo(h, d), cPend = pendienteAyer();
  // pruebas
  let cPruebas = `<div class="card"><h2>Pruebas del día</h2>${d.pruebas.map((p,i)=>`
    <div class="prueba"><div class="txt"><span class="tag v">${esc(p.tipo==='moral'?(VIRTUDES[VIRT_IDX[p.v]]||{}).nombre:p.tipo==='arma'?'Arma':p.tipo==='balanza'?'Balanza':'Oficio')}</span><b>${esc(p.t)}</b><span>${esc(p.d)}</span> ${p.ref?`<span class="ref">${esc(p.ref)}</span>`:''}</div>
      ${d.cerrado ? `<div>${p.ok?'✔︎':'✘'}</div>` : `<div class="tri"><button class="si ${p.ok===true?'on':''}" data-a="pr" data-i="${i}" data-v="1" aria-label="Superada">✔︎</button><button class="no ${p.ok===false?'on':''}" data-a="pr" data-i="${i}" data-v="0" aria-label="No superada">✘</button></div>`}
    </div>`).join('')}</div>`;
  // ejercicio y física (plegable)
  const opc = (S.perfil.opcionales||[]).map(id => OPCIONALES.find(o=>o.id===id)).filter(Boolean);
  let cCuerpo = `<span class="ref">II, §10; III, §17</span>
    <label class="fila"><input type="checkbox" data-a="ejer" ${d.ejercicio?'checked':''} ${d.cerrado?'disabled':''} style="width:26px;height:26px"> Ejercicio diario hecho: al menos ${edad()>=60?20:30} minutos</label>
    <div class="fila" style="margin-top:8px"><button class="btn sec" data-a="sub" data-t="mas" data-v="ejercicios">Pedir una rutina</button></div>`;
  if (d.fisica) {
    const p = d.fisica;
    cCuerpo += `<div class="prueba" style="margin-top:8px"><div class="txt"><span class="tag v">Prueba física</span><b>${esc(p.nombre)}</b><span>Objetivo: ${esc(fmtObj(p))}${p.unidad==='rep'?' repeticiones':''}</span></div></div>
      <div class="fila"><input type="text" inputmode="decimal" id="fisval" placeholder="Tu marca (${p.unidad==='min'?'minutos, p. ej. 1,5':'repeticiones'})" value="${p.valor!=null?numES(p.valor):''}" ${d.cerrado?'disabled':''} style="flex:1"><button class="btn sec" data-a="fisica" ${d.cerrado?'disabled':''}>Anotar</button></div>
      ${p.ok!=null ? `<p class="${p.ok?'':'rub'}">${p.ok?'Superada.':'No alcanzada.'}</p>`:''}`;
  }
  if (opc.length) cCuerpo += `<p style="margin-bottom:2px">Disciplinas practicadas hoy (multiplican la honra):</p><div class="chips">${opc.map(o=>`<button class="chip ${d.opcionales.includes(o.id)?'on':''}" data-a="opc" data-v="${o.id}" ${d.cerrado?'disabled':''}>${esc(o.nombre)} ×${o.mult}</button>`).join('')}</div>`;
  else cCuerpo += `<p class="peq">Si practicas equitación, esgrima u otras disciplinas, márcalas en Más › Ajustes: multiplican la honra.</p>`;
  const fisPend = d.fisica && d.fisica.ok == null && !d.cerrado;
  const resumenCuerpo = `Ejercicio: ${d.ejercicio ? 'hecho' : 'pendiente'}${d.fisica ? ` · prueba física: ${d.fisica.ok == null ? 'pendiente' : d.fisica.ok ? 'superada' : 'no alcanzada'}` : ''}`;
  cCuerpo = `<details class="card plegable" ${fisPend ? 'open' : ''}><summary>El cuerpo · <span class="peq">${resumenCuerpo}</span></summary><div style="margin-top:8px">${cCuerpo}</div></details>`;
  let cMesa = '';
  if (disc.ayuno || disc.abstinencia || disc.fiesta) cMesa = `<details class="card plegable"><summary>La mesa de hoy · <span class="peq">${[disc.ayuno?'ayuno':'',disc.abstinencia?'abstinencia':'',disc.fiesta&&!disc.ayuno?'fiesta':''].filter(Boolean).join(' y ')}</span></summary><p>${disc.ayuno?esc(NUTRICION.ayuno)+' ':''}${disc.abstinencia?esc(NUTRICION.abstinencia)+' ':''}${disc.fiesta&&!disc.ayuno?esc(NUTRICION.fiesta):''}</p><p class="peq">${esc(disc.motivo)}</p></details>`;
  // examen
  let cExamen;
  if (!d.cerrado) cExamen = `<div class="card"><h2>Examen de la noche</h2><p>Antes de dormir, examina el día y declara qué pruebas superaste. <a href="${enlaceHora(h,'C')}" target="_blank" rel="noopener">Rezar Completas</a></p><button class="btn ancho osc" data-a="examenNoche" data-v="${h}">Hacer el examen</button></div>`;
  else cExamen = `<div class="card ${d.superado?'oro':'negra'}"><h2>Día ${d.superado?'superado':'no superado'}</h2><p>Honra ganada: ${d.honra}${d.opcionales.length&&d.superado?` (×${multiplicador(d).toFixed(2)})`:''}</p></div>`;
  // orden según el momento del día: por la noche, el examen sube
  const hn = parseInt((S.ajustes.horaNoche || '22:00').split(':')[0], 10);
  const noche = new Date().getHours() >= Math.min(19, hn - 3);
  const arnes = ['escudero','aspirante','orden','expulsado'].includes(S.situacion) ? `<details class="card plegable"><summary>Mi arnés · <span class="peq">toca para verlo</span></summary>${tarjetaArnes(true).replace(/^<div class="card">/, '<div>')}</details>` : '';
  const cMusica = tarjetaMusica(h, d);
  const orden = (noche || d.cerrado) ? [cDivisa, cPend, cExamen, cPruebas, cDeseo, cMusica, cCuerpo, cMesa, arnes] : [cDivisa, cPend, cDeseo, cPruebas, cMusica, cCuerpo, cMesa, cExamen, arnes];
  return orden.join('');
}
function pendienteAyer(){
  const y = hoyISO(new Date(Date.now()-86400000));
  const d = S.dias[y];
  if (d && !d.cerrado) return `<div class="aviso">No hiciste el examen de ayer. <a href="#" data-a="examenNoche" data-v="${y}">Hacerlo ahora</a></div>`;
  return '';
}

/* ---------- guía de primer uso ---------- */
const GUIA = [
  { t:'La Orden de Caballería', cita:['Mira bien, escudero, lo que has de hacer si tomas la Orden de Caballería; pues al hacerte caballero recibes a la par la honra y la servidumbre que corresponden a los amigos de la Caballería.','I, §7'],
    p:['Esta app convierte el Libro de Llull en tu código de cada día.','Se entra por examen: costumbres y vida (Parte III), conocimientos (Parte IV) y cuerpo (III, §17). Si lo superas, eres armado en una fiesta de precepto; si no, sirves un año como escudero.','Los grados son los del Libro (II, §6): escudero, caballero de un escudo, valvasor, comdor y conde.'], img:'ornamento' },
  { t:'El día del caballero', cita:['Debe ser costumbre del caballero oír misa y sermón, adorar, rogar y temer a Dios.','VI, §17'],
    p:['Por la mañana dices cómo amaneces y qué te espera: recibes la divisa del día, sacada del Libro, y tus pruebas.','Ofreces tu gran deseo del día y, con el Breviario, rezas Laudes.','Por la noche haces examen: declaras tus pruebas y tu conducta, y el día queda superado o no.'] },
  { t:'Las balanzas', cita:['La templanza es virtud que está en medio de dos vicios, uno por demasía y otro por defecto.','VI, §16'],
    p:['Cada virtud es el fiel entre dos vicios. Once balanzas miden tu combate: virtud, dominio, amenaza y peligro.','Cada noche se mueven con tu conducta; cada mes te mides de nuevo.','Tu arnés brilla o se herrumbra según ellas: «tener aseado su arnés es oficio de caballero» (II, §31).'], img:'balanza' },
  { t:'Caída y redención', cita:['El caballero ha de tener mayor horror al vituperio de las gentes que a la muerte.','III, §15'],
    p:['Quien no se mantiene pierde el grado y debe reconquistarlo. La falta grave y la acidia llevan a la expulsión.','La redención es siempre posible: confesión, penitencia y nuevo examen.','No apagues el deseo: desea a lo grande y déjate gobernar por el Espíritu Santo. Ad maiora natus sum.'] }
];
function abrirGuia(i){
  i = Math.max(0, Math.min(GUIA.length - 1, i || 0)); TMP.guia = i;
  const G = GUIA[i];
  const img = G.img === 'ornamento' ? '<div class="cen"><img src="ornamento.png" alt="" style="width:70%;max-width:280px"></div>'
    : G.img === 'balanza' ? escalaSVG(30, BALANZAS[3]) : '';
  modal(`<div class="peq cen">${GUIA.map((_,k)=>k===i?'●':'○').join(' ')}</div>${img}<h1 class="cen" style="font-size:1.6em">${esc(G.t)}</h1>
    <div class="card roja"><p>«${esc(G.cita[0])}» <span class="ref">${esc(G.cita[1])}</span></p></div>
    ${G.p.map(x=>`<p>${esc(x)}</p>`).join('')}
    <div class="fila" style="justify-content:space-between;margin-top:10px">
      ${i>0?`<button class="btn sec" data-a="guia" data-v="${i-1}">‹ Anterior</button>`:'<button class="btn sec" data-a="finGuia">Saltar</button>'}
      ${i<GUIA.length-1?`<button class="btn" data-a="guia" data-v="${i+1}">Siguiente ›</button>`:'<button class="btn" data-a="finGuia">Empezar</button>'}</div>`);
}

/* ---------- el deseo: Sursum corda ---------- */
function tarjetaDeseo(h, d){
  const [t, ref] = ASPIRACIONES[hash(h + 'sursum') % ASPIRACIONES.length];
  return `<div class="card oro"><h2>Sursum corda</h2><p class="divisa" style="font-size:1.1em">${esc(t)}</p><div class="ref">${esc(ref)}</div>
    <p style="margin-top:10px">No apagues el deseo: desea a lo grande. Ven, Espíritu Santo, gobierna hoy mi corazón.</p>
    ${d.deseo ? `<p><b>Mi gran deseo de hoy:</b> ${esc(d.deseo)}</p>` : `<label class="campo"><span>Mi gran deseo de hoy</span><input type="text" id="deseo" maxlength="140" placeholder="¿Qué deseas hoy a lo grande?"></label><button class="btn sec" data-a="deseo">Ofrecerlo</button>`}</div>`;
}

/* ---------- las balanzas: dibujo y carta de conducta ---------- */
function balanzaSVG(v, B, peq){
  v = v || 0; const Z = zonaObj(v), a = v * 0.22, r = a * Math.PI / 180;
  const cx = 100, cy = 34, L = 70;
  const xl = cx - L*Math.cos(r), yl = cy - L*Math.sin(r), xr = cx + L*Math.cos(r), yr = cy + L*Math.sin(r);
  const plato = (x, y) => `<path d="M${x-14},${y+30} L${x},${y} L${x+14},${y+30}" stroke="#5B4A33" stroke-width="1.2" fill="none"/><path d="M${x-20},${y+30} Q${x},${y+44} ${x+20},${y+30} Z" fill="#B8913A" stroke="#5B4A33" stroke-width="1.5"/>`;
  let arco = '';
  for (const [i, z] of ZONAS.entries()) {
    const a0 = (i ? ZONAS[i-1].hasta : 0) * 0.22, a1 = Math.min(z.hasta, 100) * 0.22;
    for (const sg of [-1, 1]) {
      const p = ang => [cx + 26*Math.sin(sg*ang*Math.PI/180), cy - 26*Math.cos(sg*ang*Math.PI/180)];
      const [x0,y0] = p(a0), [x1,y1] = p(a1);
      arco += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A26,26 0 0 ${sg>0?1:0} ${x1.toFixed(1)},${y1.toFixed(1)}" stroke="${z.c}" stroke-width="7" fill="none"${z.borde?` style="stroke:${z.c}"`:''}/>`;
    }
  }
  const nx = cx + 30*Math.sin(r), ny = cy - 30*Math.cos(r);
  return `<svg viewBox="0 0 200 ${peq?92:118}" width="100%" style="max-width:${peq?220:300}px;display:block;margin:0 auto" role="img" aria-label="${esc(B.nombre)}: ${esc(Z.n)}">
    <path d="M${cx},${cy} L${cx},104 M80,108 H120" stroke="#5B4A33" stroke-width="4" stroke-linecap="round"/>
    ${arco}<path d="M${cx},${cy-26} v-4" stroke="#5B4A33" stroke-width="1.5"/>
    <path d="M${xl.toFixed(1)},${yl.toFixed(1)} L${xr.toFixed(1)},${yr.toFixed(1)}" stroke="#5B4A33" stroke-width="4" stroke-linecap="round"/>
    ${plato(xl, yl)}${plato(xr, yr)}
    <path d="M${cx},${cy} L${nx.toFixed(1)},${ny.toFixed(1)}" stroke="${Z.id==='virtud'?'#5B4A33':Z.c}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4.5" fill="#B8913A" stroke="#5B4A33" stroke-width="1.5"/>
    ${peq?'':`<text x="22" y="116" font-size="9" fill="#6B5E4B" font-family="EB Garamond,serif">${esc(B.def.n.split(':')[0])}</text><text x="178" y="116" font-size="9" fill="#6B5E4B" text-anchor="end" font-family="EB Garamond,serif">${esc(B.exc.n.split(':')[0])}</text>`}
  </svg>`;
}
/* ---------- Mi arnés ---------- */
function tarjetaArnes(compacta){
  const caballero = S.situacion === 'orden' && !S.abatido;
  const sub = caballero ? 'Cada pieza brilla o se herrumbra según la balanza de la virtud que significa.' :
    (S.situacion === 'expulsado' || S.abatido) ? `Armas abatidas: se te restituirán al ser ${fem()?'armada':'armado'} de nuevo.` :
    `En perpunte y sin caballo. Llevas ${Object.keys(S.armasConocidas).length} de ${ARMAS.length} armas aprendidas; el caballo y las demás llegan con la investidura.`;
  return `<div class="card"><h2>Mi arnés</h2><p class="peq">«Tener aseado su arnés y herrar su caballo es oficio de caballero.» <span class="ref">II, §31</span></p>
    <div style="max-width:${compacta?360:440}px;margin:0 auto">${arnesSVG()}</div>
    <p class="peq cen">${sub} Toca una pieza para ver su significación${caballero?' y cómo limpiarla':''}.</p>
    ${caballero ? `<p class="peq cen">${['virtud','dominio','amenaza','peligro'].map(z=>`<b>${ESTADO_PIEZA[z].n}</b>: ${ZONAS.find(x=>x.id===z).n.toLowerCase()}`).join(' · ')} · el caballo, por el ejercicio de los últimos siete días</p>` : ''}</div>`;
}
function abrirPieza(id){
  const A = ARMAS.find(a => a.id === id) || { nombre: id === 'perpunte' ? 'Perpunte' : id, sig:'', n:17 };
  const est = estadoPieza(id), E = ESTADO_PIEZA[est];
  const bals = (PIEZA_BALANZAS[id] || []).map(b => BALANZAS.find(x => x.id === b)).filter(Boolean);
  let h = `<h2>${esc(A.nombre)}</h2><p>${esc(A.sig)} <span class="ref">V, §${A.n}</span></p>
    <p><b>Estado: ${esc(E.n)}.</b> ${esc(E.d)}</p>`;
  if (id === 'caballo' && S.situacion === 'orden') h += `<p>El caballo se mantiene con el ejercicio: «herrar su caballo es oficio de caballero» (II, §31). Cuenta el ejercicio de los últimos siete días.</p>`;
  if (S.situacion === 'orden' && bals.length) h += bals.map(B => { const v = S.balanzas[B.id] || 0, Z = zonaObj(v);
    return `<div class="card"><b>${esc(B.nombre)}</b> · <span style="color:${Z.id==='virtud'?'#6B5E4B':Z.c}">${esc(Z.n)}</span> <span class="ref">${esc(B.ref)}</span>${escalaSVG(v,B)}
      ${Z.id!=='virtud' ? `<p style="margin:4px 0 2px">Para limpiarla, contra ${esc(ladoNombre(B,v).split(':')[0].toLowerCase())}:</p><ul style="margin:0;padding-left:20px">${B[v>0?'exc':'def'].p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Reluce: guárdala así.</p>'}</div>`; }).join('');
  h += `<button class="btn ancho" data-a="cerrarModal">‹ Volver</button>`;
  modal(h);
}

/* ---------- el padrino: lo elige el caballero ---------- */
function campoPadrino(){
  return `<label class="campo"><span>Nombre de tu padrino</span><input type="text" id="padrino" maxlength="60" placeholder="Escribe el nombre que elijas" value="${esc(S.perfil.padrino||'')}"></label><button class="btn" data-a="guardarPadrino">Tomarlo por padrino</button>`;
}
function tarjetaPadrino(){
  if (!S.perfil || !['escudero','aspirante','orden','expulsado'].includes(S.situacion)) return '';
  if (S.perfil.padrino && !TMP.editPadrino) return `<div class="card"><h2>Mi padrino</h2><p><b>${esc(S.perfil.padrino)}</b></p><p class="peq">Te arma en la investidura, preside tus ascensos y cada noche te pregunta qué diría de tu día.</p><button class="btn sec" data-a="editPadrino">Cambiar de padrino</button></div>`;
  return `<div class="card"><h2>Mi padrino</h2><p>Elige como padrino a uno de los mejores caballeros de la Historia: el que tú quieras. Te armará en la investidura (IV, §9), presidirá tus ascensos y cada noche te preguntará qué diría de tu día.</p>${campoPadrino()}</div>`;
}

/* ---------- evolución ---------- */
function tarjetaEvolucion(){
  const ser = S.serie || [];
  if (ser.length < 2) return S.cartaInicial ? `<div class="card"><h2>Evolución</h2><p class="peq">El gráfico aparecerá cuando haya al menos dos días examinados.</p></div>` : '';
  const sel = TMP.evo || 'cercania';
  const opciones = [['cercania','Cercanía a la Orden'], ...BALANZAS.map(B => [B.id, B.nombre])];
  const B = BALANZAS.find(x => x.id === sel);
  const pts = ser.slice(-180);
  const W = 340, H = 170, x0 = 30, x1 = 330, y0 = 12, y1 = 140;
  const X = i => x0 + (pts.length === 1 ? 0 : i / (pts.length - 1)) * (x1 - x0);
  let bandas = '', eje = '', linea = '', marcas = '';
  if (!B) {
    const Y = c => y1 - (Math.max(0, Math.min(100, c)) / 100) * (y1 - y0);
    for (const [a, b, col] of [[85,100,'#F3F1EA'],[70,85,'#2F6B37'],[55,70,'#C98A12'],[0,55,'#B3201F']]) bandas += `<rect x="${x0}" y="${Y(b)}" width="${x1-x0}" height="${Y(a)-Y(b)}" fill="${col}" opacity=".18"/>`;
    for (const t of [0,25,50,75,100]) eje += `<text x="${x0-4}" y="${Y(t)+3}" text-anchor="end" font-size="8" fill="#6B5E4B">${t}</text><path d="M${x0},${Y(t)} H${x1}" stroke="#D9CCB0" stroke-width=".5"/>`;
    linea = pts.map((p,i) => `${i?'L':'M'}${X(i).toFixed(1)},${Y(p.c).toFixed(1)}`).join(' ');
    marcas = pts.map((p,i) => p.m ? `<circle cx="${X(i).toFixed(1)}" cy="${Y(p.c).toFixed(1)}" r="3.5" fill="#9E1F17" stroke="#fff" stroke-width="1"/>` : '').join('');
  } else {
    const Y = v => (y0 + y1) / 2 - (Math.max(-100, Math.min(100, v)) / 100) * (y1 - y0) / 2;
    for (const [a, b, z] of [[70,100,3],[45,70,2],[20,45,1],[-20,20,0],[-45,-20,1],[-70,-45,2],[-100,-70,3]]) bandas += `<rect x="${x0}" y="${Y(b)}" width="${x1-x0}" height="${Y(a)-Y(b)}" fill="${ZONAS[z].c}" opacity="${z?'.22':'.6'}"/>`;
    eje = `<text x="${x0-4}" y="${Y(85)+3}" text-anchor="end" font-size="8" fill="#6B5E4B">exc.</text><text x="${x0-4}" y="${Y(-85)+3}" text-anchor="end" font-size="8" fill="#6B5E4B">def.</text><path d="M${x0},${Y(0)} H${x1}" stroke="#5B4A33" stroke-width="1"/>`;
    linea = pts.map((p,i) => `${i?'L':'M'}${X(i).toFixed(1)},${Y((p.b||{})[B.id]||0).toFixed(1)}`).join(' ');
    marcas = pts.map((p,i) => p.m ? `<circle cx="${X(i).toFixed(1)}" cy="${Y((p.b||{})[B.id]||0).toFixed(1)}" r="3.5" fill="#9E1F17" stroke="#fff" stroke-width="1"/>` : '').join('');
  }
  const f0 = deISO(pts[0].f).toLocaleDateString('es-ES',{day:'numeric',month:'short'}), f1 = deISO(pts[pts.length-1].f).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
  return `<div class="card"><h2>Evolución</h2>
    <select data-a="evo" style="margin-bottom:6px">${opciones.map(([k,n])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(n)}</option>`).join('')}</select>
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolución de ${esc(B?B.nombre:'la cercanía a la Orden')}">
      ${bandas}${eje}<path d="${linea}" fill="none" stroke="#1B1A1A" stroke-width="2" stroke-linejoin="round"/>${marcas}
      <text x="${x0}" y="${H-12}" font-size="8.5" fill="#6B5E4B">${f0}</text><text x="${x1}" y="${H-12}" text-anchor="end" font-size="8.5" fill="#6B5E4B">${f1}</text></svg>
    <p class="peq">${B ? 'Por encima del medio, el exceso; por debajo, el defecto. La franja clara es la virtud.' : 'Porcentaje de cercanía a lo que la Orden pide de ti, noche a noche.'} Los puntos rojos son mediciones mensuales.</p></div>`;
}

/* ---------- el Libro en voz alta ---------- */
function vozDisponible(){ return 'speechSynthesis' in window; }
/* Lectura: textos = [{t, lengua:'es'|'lem'}]. El lemosín se lee con la voz que el teléfono tenga para el código «ca». */
function vozPara(lengua){
  const voces = speechSynthesis.getVoices();
  if (lengua === 'lem') return voces.find(v => /^ca/i.test(v.lang)) || null;
  return voces.find(v => /^es-ES/i.test(v.lang)) || voces.find(v => /^es/i.test(v.lang)) || null;
}
function leerEnVoz(textos){
  if (!vozDisponible()) return;
  speechSynthesis.cancel();
  const hayVoces = speechSynthesis.getVoices().length > 0;
  let lista = textos.map(x => typeof x === 'string' ? { t:x, lengua:'es' } : x);
  if (hayVoces && lista.some(x => x.lengua === 'lem') && !vozPara('lem')) {
    toast('Tu teléfono no tiene instalada una voz para el lemosín (código «ca»). Puedes añadirla en los ajustes de voz del sistema; mientras, se lee en español.', 6000);
    lista = lista.filter(x => x.lengua !== 'lem');
    if (!lista.length) return;
  }
  lista.forEach((x, i) => {
    const u = new SpeechSynthesisUtterance(x.t);
    u.lang = x.lengua === 'lem' ? 'ca-ES' : 'es-ES';
    const v = vozPara(x.lengua); if (v) { try { u.voice = v; } catch(e){} }
    u.rate = x.lengua === 'lem' ? 0.9 : 0.95;
    if (i === lista.length - 1) { u.onend = ocultarParar; u.onerror = ocultarParar; }
    speechSynthesis.speak(u);
  });
  mostrarParar();
}
function mostrarParar(){
  ocultarParar();
  const b = document.createElement('button');
  b.id = 'vozStop'; b.className = 'btn osc'; b.textContent = '■ Parar la lectura';
  b.style.cssText = 'position:fixed;right:16px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:80;box-shadow:0 2px 10px rgba(0,0,0,.3)';
  b.addEventListener('click', () => { speechSynthesis.cancel(); ocultarParar(); });
  document.body.appendChild(b);
}
function ocultarParar(){ const b = document.getElementById('vozStop'); if (b) b.remove(); }
function textosDePars(P, ns){
  const modo = S.ajustes.voz || 'es', L = [];
  for (const n of ns) {
    const x = P.pars.find(y => y.n === n); if (!x) continue;
    if (modo !== 'es') L.push({ t:x.lem, lengua:'lem' });
    if (modo !== 'lem') L.push({ t:x.es, lengua:'es' });
  }
  return L;
}
function selectorVoz(){
  const m = S.ajustes.voz || 'es';
  return `<select data-a="vozModo" style="width:auto" aria-label="Lengua de la lectura"><option value="es" ${m==='es'?'selected':''}>Leer en español</option><option value="lem" ${m==='lem'?'selected':''}>Leer en lemosín</option><option value="ambas" ${m==='ambas'?'selected':''}>Lemosín y español</option></select>`;
}

/* Regla graduada de −100 (defecto) a +100 (exceso), con las zonas a cada lado del fiel */
function escalaSVG(v, B){
  v = Math.max(-100, Math.min(100, v || 0));
  const x0 = 12, w = 316, X = t => x0 + (t + 100) / 200 * w;
  const tramos = [[-100,-70,3],[-70,-45,2],[-45,-20,1],[-20,20,0],[20,45,1],[45,70,2],[70,100,3]];
  let band = '', rot = '';
  for (const [a, b, z] of tramos) {
    const Z = ZONAS[z];
    band += `<rect x="${X(a)}" y="22" width="${X(b)-X(a)}" height="16" fill="${Z.c}"/>`;
    const n = { 0:'Virtud', 1:'Dominio', 2:'Amenaza', 3:'Peligro' }[z];
    rot += `<text x="${(X(a)+X(b))/2}" y="18" text-anchor="middle" font-size="9" fill="#6B5E4B" font-family="EB Garamond,serif">${n}</text>`;
  }
  let ticks = '';
  for (const t of [-100,-70,-45,-20,0,20,45,70,100]) ticks += `<path d="M${X(t)},38 v5" stroke="#5B4A33" stroke-width="${t===0?2:1}"/><text x="${X(t)}" y="52" text-anchor="middle" font-size="8" fill="#6B5E4B" font-family="EB Garamond,serif">${Math.abs(t)}</text>`;
  const Zv = zonaObj(v), mx = X(v);
  return `<svg viewBox="0 0 340 74" width="100%" style="display:block;margin:6px 0 4px" role="img" aria-label="Escala: ${esc(Zv.n)}, ${Math.abs(Math.round(v))} puntos ${v>0?'hacia el exceso':v<0?'hacia el defecto':'en el fiel'}">
    ${rot}${band}<rect x="${x0}" y="22" width="${w}" height="16" fill="none" stroke="#5B4A33" stroke-width="1"/>
    <path d="M${X(0)},20 v20" stroke="#5B4A33" stroke-width="2"/>${ticks}
    <path d="M${mx-7},8 L${mx+7},8 L${mx},20 Z" fill="${Zv.id==='virtud'?'#1B1A1A':Zv.c}" stroke="#1B1A1A" stroke-width="1"/>
    <path d="M${mx},20 v20" stroke="#1B1A1A" stroke-width="3"/>
    <text x="${x0}" y="68" font-size="9.5" fill="#3A2F27" font-family="EB Garamond,serif">◀ ${esc(B.def.n.split(':')[0])}</text>
    <text x="${x0+w}" y="68" text-anchor="end" font-size="9.5" fill="#3A2F27" font-family="EB Garamond,serif">${esc(B.exc.n.split(':')[0])} ▶</text></svg>`;
}
function tarjetaCombate(){
  if (!['orden','escudero','aspirante','expulsado'].includes(S.situacion)) return '';
  const lista = BALANZAS.map(B => ({ B, v: S.balanzas[B.id] || 0 })).sort((a,b) => Math.abs(b.v) - Math.abs(a.v));
  const c = cercania(S.balanzas), M = S.mediciones || [], ant = M.length ? M[M.length-1] : null;
  const cAnt = M.length >= 2 ? cercania(M[M.length-2].bal) : null;
  const prox = proximaMedicion();
  let s = `<div class="card roja"><h2>Mi combate: las balanzas</h2>
    <p class="peq">«La templanza es virtud que está en medio de dos vicios, uno por demasía y otro por defecto.» <span class="ref">VI, §16</span></p>`;
  if (!S.cartaInicial) s += `<div class="aviso">Tus balanzas están en el medio porque aún no te has medido. La primera carta de conducta es informativa: no cambia tu grado ni cuenta rojos.</div><button class="btn" data-a="abrirCarta">Medirme ahora</button>`;
  else {
    const Zc = c >= 85 ? ZONAS[0] : c >= 70 ? ZONAS[1] : c >= 55 ? ZONAS[2] : ZONAS[3];
    s += `<div style="background:#fff;border:1px solid var(--linea);border-radius:10px;padding:12px;margin:8px 0">
      <div class="peq">Cercanía a lo que la Orden pide de ti</div>
      <div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:2.4em;font-weight:600;white-space:nowrap;color:${Zc.id==='virtud'?'#2F6B37':Zc.c}">${c} %</span>
        ${cAnt!=null?`<span class="peq">${c>cAnt?'▲ +'+(c-cAnt):c<cAnt?'▼ '+(c-cAnt):'='} desde la medición anterior (${cAnt} %)</span>`:''}</div>
      <div class="barra" style="height:12px"><i style="width:${c}%;background:${Zc.id==='virtud'?'#2F6B37':Zc.c}"></i></div>
      <p style="margin:6px 0 0">${esc(juicioCercania(c))}</p>
      <p class="peq" style="margin:4px 0 0">100 % es tener todas las balanzas en el fiel. Se calcula con la posición actual, que se mueve cada noche.</p></div>
      <p class="peq">Última medición: ${deISO(ultimaMedicion()).toLocaleDateString('es-ES')} · próxima: <b>${prox.toLocaleDateString('es-ES')}</b>${medicionPendiente()?' (pendiente)':''} · Rojos: <b>${S.rojos||0}</b> de ${ROJOS_MAX} tolerados</p>
      <button class="btn ${medicionPendiente()?'':'sec'}" data-a="abrirCarta">${medicionPendiente()?'Hacer la medición del mes':'Medirme ahora'}</button>`;
  }
  s += `<p class="peq" style="margin-top:10px">${ZONAS.map(z=>`<span class="sw" style="background:${z.c};width:14px;height:14px"></span> ${z.n}`).join(' · ')}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:10px;margin-top:6px">${lista.map(({B,v})=>{ const Z = zonaObj(v), P = puntosLucha(v);
      const vAnt = ant ? (M.length >= 2 ? (M[M.length-2].bal[B.id]||0) : null) : null;
      const tend = vAnt == null ? '' : Math.abs(v) < Math.abs(vAnt) ? ' <span style="color:#2F6B37">▼ mejora</span>' : Math.abs(v) > Math.abs(vAnt) ? ' <span style="color:#B3201F">▲ empeora</span>' : '';
      return `<div style="border:1px solid var(--linea);border-radius:8px;padding:8px 10px 10px;background:#fff">
        <div style="display:flex;gap:10px;align-items:center"><div style="width:84px;flex:none">${balanzaSVG(v,B,true)}</div>
          <div style="flex:1;font-size:.92em"><b>${esc(B.nombre)}</b><br><span style="color:${Z.id==='virtud'?'#6B5E4B':Z.c};font-weight:600">${esc(Z.n)}</span>${v?` · ${esc(ladoNombre(B,v).split(':')[0].toLowerCase())}`:''}${tend}</div></div>
        ${escalaSVG(v,B)}
        <div style="font-size:.86em">
        ${P.objetivo ? `<span style="font-size:.95em">Lucha: <b>${P.hastaZona}</b> pts hasta ${esc(P.objetivo.n.toLowerCase())} (≈${P.noches} ${P.noches===1?'noche limpia':'noches limpias'}) · ${P.hastaMedio} hasta el medio</span><br>` : '<span style="font-size:.95em">En el fiel: guárdalo</span><br>'}
        ${Z.id!=='virtud' ? `<details style="margin-top:4px"><summary style="cursor:pointer;color:var(--rojo)">Cómo combatir ${esc(ladoNombre(B,v).split(':')[0].toLowerCase())}</summary><ul style="margin:4px 0 0;padding-left:20px">${B[v>0?'exc':'def'].p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="peq" style="margin:4px 0 0">Para meditarlo: ${enlaceMeditacion()}</p></details>` : ''}
        <span class="ref">${esc(B.ref)}</span></div></div>`; }).join('')}</div>
    <p class="peq" style="margin-top:8px">Una noche sin falta en esa balanza acerca el fiel 8 puntos; su prueba del día superada, 6 más.</p></div>`;
  return s;
}
function cartaCompleta(c){ return BALANZAS.every(B => c[B.id] && c[B.id].exc != null && c[B.id].def != null); }
function cartaHTML(c, accion){
  return BALANZAS.map(B => `<div class="card"><b>${esc(B.nombre)}</b> <span class="ref">${esc(B.ref)}</span>
    ${['exc','def'].map(l => `<p style="margin:8px 0 2px">…${esc(B[l].q)}</p><div class="chips">${FREC_MES.map(([n,v]) => `<button class="chip ${c[B.id]&&c[B.id][l]===v?'on':''}" data-a="${accion}" data-b="${B.id}" data-l="${l}" data-v="${v}">${n}</button>`).join('')}</div>`).join('')}</div>`).join('');
}

/* ---------- examen de la noche ---------- */
function modal(html){ cerrarModal(); const m = document.createElement('div'); m.className='modal'; m.id='modal'; m.innerHTML = `<div class="hoja">${html}</div>`; m.addEventListener('click', e => { if (e.target === m) cerrarModal(); }); document.body.appendChild(m); enlazarCitas(m); }
function cerrarModal(){ const m = $('#modal'); if (m) m.remove(); }
function abrirExamenNoche(fecha){
  const d = S.dias[fecha]; if (!d) return;
  const virt = [...new Set(d.pruebas.map(p=>p.v).filter(v=>EXAMEN[v]))];
  if (!virt.length) virt.push('fe');
  const n = numPreguntasNoche(), qs = [];
  let i = 0; const sem = hash(fecha);
  while (qs.length < n && i < 50) { const v = virt[i % virt.length]; const L = EXAMEN[v]; const q = L[(sem + i) % L.length]; if (!qs.includes(q)) qs.push(q); i++; }
  const bals = balanzasDeLaNoche(fecha);
  TMP.noche = { fecha, qs, resp: qs.map(()=>null), bals, bal:{}, espiritu:null };
  modal(`<h2>Examen de la noche</h2><p class="peq">${esc(deISO(fecha).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}</p>${S.perfil.padrino ? `<p><i>¿Qué diría ${esc(S.perfil.padrino)} de tu día?</i></p>` : ''}
    <details class="card plegable"><summary>Música para el examen</summary>${filaPieza('telucis', 'Completas')}${filaPieza(antifonaMariana(deISO(fecha)), 'antífona de la noche')}${propiasDe(['noche']).map(x => filaPropia(x, 'tuya')).join('')}<p class="peq">Para un examen más hondo: ${enlaceMeditacion()}</p></details>
    <div class="card roja"><p><b>¿Me dejé gobernar hoy por el Espíritu Santo, o por mis gustos?</b> ${d.deseo?`<br><span class="peq">Esta mañana deseaste: «${esc(d.deseo)}»</span>`:''}</p>
      <div class="chips"><button class="chip" data-a="nesp" data-v="si">Por el Espíritu</button><button class="chip" data-a="nesp" data-v="medias">A medias</button><button class="chip" data-a="nesp" data-v="no">Por mis gustos</button></div></div>
    <h3>Las balanzas</h3><p class="peq">Hoy…</p>${bals.map(id=>{ const B = BALANZAS.find(x=>x.id===id); return `<div class="card"><b>${esc(B.nombre)}</b> <span class="ref">${esc(B.ref)}</span>
      ${['exc','def'].map(l=>`<p style="margin:8px 0 2px">…${esc(B[l].q)} <span class="peq">(${esc(B[l].n.toLowerCase())})</span></p><div class="chips">${FREC_HOY.map(([n,v])=>`<button class="chip" data-a="nbal" data-b="${id}" data-l="${l}" data-v="${v}">${n}</button>`).join('')}</div>`).join('')}</div>`; }).join('')}
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
    S.borrador = { paso:0, moral:{}, vicios:[], bal:{}, quiz:idx, qresp:{}, fisico:{}, inicio:hoy(), tipo: S.situacion==='expulsado'?'reingreso':'ingreso' };
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
      <p>La virtud está en el medio, entre dos vicios (VI, §16). Responde por tu conducta en el <b>último mes</b>, no por cómo te ves: con qué frecuencia…</p></div>`;
    s += cartaHTML(B.bal || (B.bal = {}), 'ib');
    s += `<button class="btn ancho" data-a="ipaso" data-v="1">Siguiente: conocimientos</button>`;
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
  let s = `<h1>Investidura</h1>${S.perfil.padrino ? '' : `<div class="card roja"><h3>Tu padrino</h3><p>Llull quiere que arme al escudero un caballero que tenga en sí la virtud y el orden de la Caballería (IV, §9). Elige como padrino a uno de los mejores caballeros de la Historia.</p>${campoPadrino()}</div>`}<p>Fiesta de ${esc(S.investidura.nombre)}, ${deISO(S.investidura.fecha).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}.</p>${banda()}`;
  const puedeV = ENSAYO || I.vigilia || I.dia, puedeD = ENSAYO || I.dia;
  const vigiliaHecha = PASOS_INVESTIDURA.filter(p=>p.dia===-1).every(p=>paso[p.id]);
  for (const p of PASOS_INVESTIDURA) {
    const hab = p.dia === -1 ? puedeV : (puedeD && vigiliaHecha);
    const hecho = !!paso[p.id];
    let accion = '';
    if (!hecho && hab) {
      if (p.id === 'vela') accion = `<button class="btn sec" data-a="vela">Comenzar la vela</button><details class="plegable" style="margin-top:8px"><summary>Música para la vela</summary>${lista(MUSICA_MOMENTO.vela)}${propiasDe(['vela']).map(x => filaPropia(x, 'tuya')).join('')}</details><p class="peq" style="margin-top:6px">Para la vela: ${enlaceMeditacion()}</p>`;
      else if (p.id === 'juramento') accion = `<div class="card" style="background:#fff"><p><i>${esc(JURAMENTO)}</i></p></div><button class="btn" data-a="pasoInv" data-v="juramento">Lo juro</button>`;
      else if (p.id === 'ceremonia') accion = ceremoniaHTML() + `<details class="plegable" style="margin-top:8px"><summary>Música para la investidura</summary>${lista(MUSICA_MOMENTO.investidura)}${propiasDe(['investidura']).map(x => filaPropia(x, 'tuya')).join('')}</details>`;
      else if (p.id === 'armas') accion = S.blason ? `<p>Tus armas, abatidas por tu caída, te son restituidas.</p><div class="logro">${logroSVG(S.blason,1,null)}</div><button class="btn" data-a="pasoInv" data-v="armas">Recibir mis armas</button>` : `<button class="btn" data-a="sub" data-t="armas" data-v="constructor">Componer mis armas</button>`;
      else if (p.id === 'mostrarse') accion = `${retratoURL() ? '' : '<p class="peq">Si añades tu retrato en Más › Ajustes, aparecerá en la lámina.</p>'}<div class="fila"><button class="btn" data-a="laminaInvestidura">Compartir la lámina de investidura</button><button class="btn sec" data-a="compartir">Solo mis armas</button><button class="btn sec" data-a="pasoInv" data-v="mostrarse">Hecho</button></div>`;
      else if (p.id === 'dadivas') accion = `<label class="campo"><span>¿Qué dádiva has repartido?</span><input type="text" id="dadiva" maxlength="120"></label><button class="btn" data-a="dadiva">Anotar y terminar</button>`;
      else if (p.id === 'confesion') accion = `<div class="fila"><button class="btn sec" data-a="sub" data-t="mas" data-v="confesion">Preparar la confesión</button><button class="btn sec" data-a="pasoInv" data-v="confesion">Hecho</button></div>`;
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
  const pad = S.perfil.padrino || 'Tu padrino';
  const pasos = [['Ceñir la espada',`${pad} te ciñe la espada, en que se te significan la castidad y la justicia.`],['El beso',`${pad} te da un beso, en señal de caridad.`],['La bofetada','Recibes una bofetada, para que recuerdes lo que prometes, el gran cargo a que te obligas y el gran honor que recibes.']];
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
/* El original lleva también su capitular iluminada (la de su propia inicial, que no siempre coincide con la del español) */
const CAPITULARES = ['A','D','E','F','O','P','S','T'];
function lemTexto(x){
  const L = (x.lem || '').charAt(0);
  if (x.cap && CAPITULARES.includes(L)) return `<img class="cap" src="cap-${L}.png" alt="${esc(L)}">` + esc(x.lem.slice(1).replace(/^\s+/, ''));
  return esc(x.lem);
}
function parrafoTexto(x){
  let es = esc(x.es);
  if (x.cap) es = `<img class="cap" src="${x.cap}" alt="${esc(x.es[0])}">` + es.slice(1);
  return es;
}
function vistaLeer(k){
  const col = S.ajustes.columnas || 'ambas';
  const cls = col === 'es' ? 'es' : col === 'lem' ? 'lem' : '';
  const nav = `<div class="fila" style="margin-bottom:8px">${TMP.volver?'<button class="btn" data-a="volverCita">‹ Volver</button>':''}<button class="btn sec" data-a="tab" data-v="libro">Índice</button>
    <select data-a="cols" style="width:auto;flex:1"><option value="ambas" ${col==='ambas'?'selected':''}>Lemosín y español</option><option value="es" ${col==='es'?'selected':''}>Solo español</option><option value="lem" ${col==='lem'?'selected':''}>Solo lemosín</option></select></div>`;
  let s = nav + (TMP.volver ? '<button class="btn volverflot" data-a="volverCita">‹ Volver</button>' : '');
  if (k.startsWith('parte')) {
    const P = LIBRO.partes[+k.slice(5)];
    s += `<div class="lector ${cls}">`;
    if (P.invocacion) s += `<div class="par"><div class="lem rub">${esc(P.invocacion.lem)}</div><div class="es rub"><i>${esc(P.invocacion.es)}</i></div></div>`;
    s += `<div class="titlem">${esc(P.tituloLem||'')}</div><div class="tit">${esc(P.nombre)}${P.id?'. '+esc(P.titulo):''}</div>${banda()}`;
    if (vozDisponible()) s += `<div class="fila" style="justify-content:center;margin-bottom:6px">${selectorVoz()}<button class="btn sec" data-a="vozPars" data-p="${P.id}" data-n="">Escuchar esta parte</button><button class="btn sec" data-a="vozParar">Parar</button></div>`;
    for (const x of P.pars) s += `<div class="par" id="p-${P.id}-${x.n}"><div class="lem">${lemTexto(x)}</div><div class="es">${x.n>1||P.id===0&&!x.cap?`<span class="num">${x.n}.</span>`:''}${parrafoTexto(x)}${vozDisponible()?` <a href="#" class="peq" data-a="vozPars" data-p="${P.id}" data-n="${x.n}" aria-label="Escuchar el parágrafo ${x.n}">▶ escuchar</a>`:''}</div></div>`;
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
  let s = `<h1>Mis armas</h1>` + (['escudero','aspirante','orden','expulsado'].includes(S.situacion) ? tarjetaArnes(false) : '');
  if (E.e === 'blanco') s += `<div class="card"><div class="logro">${logroSVG(null,0,'blanco')}</div><p>«Las armas en el escudo, la silla y el perpunte se dan al caballero para que sea alabado por los ardimientos que emprenda.» <span class="ref">V, §18</span></p><p>${S.situacion==='orden'?'':'El escudero no lleva blasón. Elegirás tus armas el día de tu investidura.'}</p>
    ${S.situacion==='orden' && !S.blason ? '<button class="btn" data-a="sub" data-t="armas" data-v="constructor">Componer mis armas</button>' : ''}</div>`;
  else if (E.e === 'abatido') s += `<div class="card negra"><div class="logro">${logroSVG(S.blason,0,'abatido')}</div><p>Armas abatidas. Te serán restituidas cuando reconquistes la caballería.</p></div>`;
  else s += `<div class="card">${retratoURL() ? `<div class="cen">${medallonSVG(150)}</div>` : `<p class="peq cen">Añade tu retrato en Más › Ajustes para verlo junto a tus armas y en tu lámina.</p>`}<div class="logro">${logroSVG(S.blason,S.grado,null)}</div><p class="cen"><i>${esc(blasonar(S.blason))}</i></p>
    <p class="peq cen">Ornamentos de ${esc(nombreGrado())}: ${['','yelmo','yelmo, lambrequines y cimera','yelmo, lambrequines, cimera y pendones','corona condal, manto, yelmo, lambrequines, cimera y pendones'][S.grado]}. La corona de conde (18 perlas, 9 vistas) es la de la heráldica española; los ornamentos de valvasor y comdor son convención de esta Orden.</p>
    <div class="fila" style="justify-content:center"><button class="btn" data-a="compartir">Compartir mis armas</button><button class="btn sec" data-a="laminaGrado">Lámina de mi grado</button></div></div>`;
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
  if (RUTA.sub === 'cronica') return vistaCronica();
  if (!S.perfil) return `<p>Preséntate primero al examen.</p>`;
  const e = edad();
  let s = `<h1>La Orden</h1>` + tarjetaCombate() + tarjetaEvolucion() + tarjetaPadrino() + `<div class="card oro"><h2>${esc(nombreGrado())}</h2>
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
    <div class="fila"><button class="btn sec" data-a="sub" data-t="orden" data-v="cronica">Mi crónica</button>${S.situacion==='orden'?'<button class="btn sec" data-a="laminaAnual">Lámina del año</button>':''}<button class="btn sec" data-a="sub" data-t="orden" data-v="reglas">Las reglas de la Orden</button></div>`;
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
  <div class="card"><h3>Las balanzas (VI, §16)</h3><p>Cada virtud es el fiel entre dos vicios, uno por defecto y otro por exceso. Once balanzas recogen los siete pecados capitales y los vicios del III, §20. El fiel se mueve cada noche según tu conducta y se acerca al medio con las pruebas superadas; la confesión perdona la culpa, pero el hábito solo se templa con actos contrarios.</p>
  <p>Zonas: virtud (blanco), dominio (verde), amenaza (ámbar) y peligro (rojo). Las balanzas son guía, salvo una regla: si el fiel llega al rojo más de ${ROJOS_MAX} veces, se pierde el empleo inmediato inferior; de escudero, la expulsión. Quedarse en el rojo también cuenta: cada 7 noches seguidas en rojo, una vez más. El recuento vuelve a cero en cada cambio de grado.</p>
  <p>En el examen de ingreso, una balanza en rojo impide la entrada. Esta regla no es retroactiva: quien ya estaba en la Orden conserva su grado, y el recuento de rojos empezó de cero al introducirse.</p></div>
  <div class="card"><h3>El deseo</h3><p>No se trata de apagar el deseo, sino de cambiar lo que se desea: no conformarse con poco cuando se puede alcanzar el Cielo. La ascética de las pruebas sirve a ese fin: dejarse gobernar por el Espíritu Santo. <i>Ad maiora natus sum.</i></p></div>
  <div class="card"><h3>Honra</h3><p>10 puntos por prueba superada. Las disciplinas opcionales multiplican la honra de un día superado (tope ×${TOPE_MULT}); nunca compensan un fallo. Investidura: 500. Ascenso: 1000.</p></div>`;
}

/* =====================================================================
   MÁS
   ===================================================================== */
function vistaMas(){
  const sub = RUTA.sub;
  const V = { ejercicios:vistaEjercicios, nutricion:vistaNutricion, calendario:vistaCalendario, virtudes:vistaVirtudes, confesion:vistaConfesion, musica:vistaMusica, meditacion:vistaMeditacion, avisos:vistaAvisos, copia:vistaCopia, ajustes:vistaAjustes, acerca:vistaAcerca }[sub];
  if (V) return `<button class="btn sec" data-a="tab" data-v="mas">‹ Más</button>` + V();
  return `<h1>Más</h1><div class="card lista">
    <a href="#" data-a="sub" data-t="mas" data-v="ejercicios"><b>Ejercicios</b><br><span class="peq">Rutinas para mantener la forma, según tu edad y tu grado</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="nutricion"><b>Nutrición</b><br><span class="peq">La templanza en la mesa (VI, §§9, 16)</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="calendario"><b>Calendario</b><br><span class="peq">Fiestas de precepto, ayunos y abstinencias</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="meditacion"><b>Meditación</b><br><span class="peq">Mons. González Chaves · Gladium et Spes · Vida de Nuestro Señor Jesucristo</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="musica"><b>Música</b><br><span class="peq">El espíritu de la Orden en todas las épocas · Mi cancionero</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="virtudes"><b>Virtudes y vicios</b><br><span class="peq">Parte VI</span></a>
    <a href="#" data-a="verGuia"><b>Guía de la Orden</b><br><span class="peq">Cómo funciona la app, en cuatro pantallas</span></a>
    <a href="#" data-a="sub" data-t="mas" data-v="confesion"><b>Preparar la confesión</b><br><span class="peq">Mandamientos, pecados y deberes del oficio (IV, §1)</span></a>
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
  s += `<details class="card plegable"><summary>Música para el ejercicio y la marcha</summary>${lista(MUSICA_MOMENTO.ejercicio)}${propiasDe(['ejercicio','batalla']).map(x => filaPropia(x, 'tuya')).join('')}</details>`;
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
    <p class="peq">Almacenamiento protegido frente a borrados del sistema: <b>${S.persistente ? 'sí' : 'no concedido'}</b>${S.persistente ? '' : ' (instala la app desde el navegador para que el teléfono lo conceda)'}.</p>
    <label class="campo"><span>Restaurar desde una copia</span><input type="file" id="fimp" accept="application/json,.json"></label></div>`;
}
function vistaAjustes(){
  const A = S.ajustes, e = S.perfil ? edad() : 30;
  const disp = opcionalesDisponibles(e), mias = S.perfil ? (S.perfil.opcionales||[]) : [];
  return `<h1>Ajustes</h1>
    <div class="card"><h3>Música</h3><p class="peq">Plataforma en la que se abren las piezas.</p><div class="chips">${Object.entries(PLATAFORMAS).map(([k, p]) => `<button class="chip ${(S.ajustes.plataforma||'spotify')===k?'on':''}" data-a="plataforma" data-v="${k}">${p.n}</button>`).join('')}</div></div>
    ${S.perfil ? `<div class="card"><h3>Mi retrato</h3>
      ${retratoURL() ? `<div class="cen">${medallonSVG(150)}</div>
        <div class="chips" style="justify-content:center"><button class="chip ${S.perfil.estiloRetrato!=='natural'?'on':''}" data-a="estiloRetrato" data-v="ilustrado">Ilustrado</button><button class="chip ${S.perfil.estiloRetrato==='natural'?'on':''}" data-a="estiloRetrato" data-v="natural">Foto natural</button></div>` : '<p>Tu rostro aparecerá en el medallón, en tu figura de escudero y en la lámina de investidura.</p>'}
      <label class="btn sec" style="cursor:pointer">${retratoURL()?'Cambiar retrato':'Añadir retrato'}<input type="file" id="fret" accept="image/*" style="display:none"></label>
      ${retratoURL() ? '<button class="btn sec" data-a="borrarRetrato">Quitar retrato</button>' : ''}
      <p class="peq">La foto se recorta, se reduce y se guarda solo en este teléfono; entra en la copia de seguridad.</p></div>` : ''}
    <div class="card"><label class="campo"><span>Tamaño de la letra: ${A.tam||19} px</span><input type="range" min="15" max="26" value="${A.tam||19}" data-a="tam" style="width:100%"></label>
    ${vozDisponible() ? `<label class="campo"><span>Lectura en voz alta</span>${selectorVoz().replace('style="width:auto"','')}</label>` : ''}
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
    if (N.bals.some(id => !N.bal[id] || N.bal[id].exc == null || N.bal[id].def == null)) return toast('Responde a las preguntas de las balanzas.');
    if (!N.espiritu) return toast('Responde a la primera pregunta: ¿quién te gobernó hoy?');
    d.espiritu = N.espiritu;
    const falta = $('#nfalta').value;
    const r = cerrarDia(N.fecha, N.resp, falta, N.bal);
    cerrarModal(); render();
    if (r && r.eventos.includes('expulsion')) toast('Expulsión de la Orden. La redención es siempre posible.', 4000);
    else if (r && r.eventos.includes('degradacion')) toast(`Más de ${ROJOS_MAX} veces en el rojo: degradación. Reconquístalo.`, 4500);
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
    if (B.paso === 0 && v === 1 && (INGRESO.some(q => !q.obras && B.moral[q.id] === undefined) || !cartaCompleta(B.bal || {}))) return toast('Responde a todas las preguntas.');
    if (B.paso === 1 && v === 2 && B.quiz.some(q => B.qresp[q] === undefined)) return toast('Responde a todas las preguntas.');
    if (B.paso === 2) guardarMarcas();
    B.paso = v; guardar(); render(); window.scrollTo(0,0);
  },
  iguardarf: () => { guardarMarcas(); toast('Marcas guardadas.'); },
  ievaluar: () => {
    guardarMarcas();
    const B = borrador();
    const aciertos = B.quiz.filter(q => B.qresp[q] === PREGUNTAS[q][2]).length;
    const res = evaluarIngreso({ moral:B.moral, vicios:[], bal:B.bal || {}, fisico:B.fisico, quiz:{ aciertos, total:B.quiz.length } });
    aplicarIngreso(res, B.tipo);
    TMP.resIngreso = res; S.borrador = null; guardar();
    go('hoy', 'examen');
  },
  reexUnidades: () => { S.reexUnidades = true; S.borrador = null; S.situacion = 'nuevo'; S.escuderia = { dias:0, inicio:null }; anotar('Repite el examen de ingreso por la corrección de unidades.'); guardar(); go('hoy','examen'); },
  ib: el => { const B = borrador(); B.bal = B.bal || {}; const o = B.bal[el.dataset.b] = B.bal[el.dataset.b] || {}; o[el.dataset.l] = +el.dataset.v; guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); },
  cb: el => { const C = TMP.carta; const o = C[el.dataset.b] = C[el.dataset.b] || {}; o[el.dataset.l] = +el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  abrirCarta: () => { TMP.carta = {}; modal(`<h2>Medición de conducta</h2><p>${S.cartaInicial ? 'Mide tu conducta del <b>último mes</b>. Las balanzas se colocan donde estás hoy; si alguna entra en el rojo, cuenta como tal.' : 'Esta primera carta es informativa: sitúa tus balanzas, pero no altera tu grado ni cuenta como rojo.'} Responde por lo que hiciste, no por cómo te ves: con qué frecuencia…</p>${cartaHTML({}, 'cb')}<button class="btn ancho" data-a="guardarCarta">Colocar mis balanzas</button>`); },
  guardarCarta: () => { if (!cartaCompleta(TMP.carta)) return toast('Responde a todas las preguntas.'); const e = aplicarMedicion(TMP.carta); cerrarModal(); render();
    if (e === 'expulsion') toast('Expulsión de la Orden. La redención es siempre posible.', 4500); else if (e === 'degradacion') toast(`Más de ${ROJOS_MAX} veces en el rojo: degradación. Reconquístalo.`, 4500); else toast(`Cercanía a la Orden: ${cercania(S.balanzas)} %`); },
  nbal: el => { const N = TMP.noche; const o = N.bal[el.dataset.b] = N.bal[el.dataset.b] || {}; o[el.dataset.l] = +el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  nesp: el => { TMP.noche.espiritu = el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); el.classList.add('on'); },
  deseo: () => { const d = S.dias[hoy()]; d.deseo = ($('#deseo').value || '').trim(); guardar(); toast('Que así sea.'); render(); },
  pieza: el => abrirPieza(el.dataset.v),
  guardarPadrino: () => { const v = ($('#padrino').value || '').trim(); if (!v) return toast('Escribe el nombre de tu padrino.'); S.perfil.padrino = v; TMP.editPadrino = false; anotar(`Toma por padrino a ${v}.`, 'honor'); guardar(); render(); },
  editPadrino: () => { TMP.editPadrino = true; render(); },
  voz: el => leerEnVoz([el.dataset.t]),
  vozPars: el => { const P = LIBRO.partes[+el.dataset.p]; const ns = el.dataset.n ? el.dataset.n.split(',').map(Number) : P.pars.map(x=>x.n); leerEnVoz(textosDePars(P, ns)); },
  vozParar: () => { if (vozDisponible()) speechSynthesis.cancel(); ocultarParar(); },
  guardarRetrato: () => { guardarRetrato(); cerrarModal(); render(); toast('Retrato guardado.'); },
  estiloRetrato: el => { S.perfil.estiloRetrato = el.dataset.v; guardar(); render(); },
  borrarRetrato: () => { if (!TMP.borrarRet) { TMP.borrarRet = true; toast('Pulsa otra vez para quitar el retrato.'); return; } TMP.borrarRet = false; delete S.perfil.retrato; guardar(); render(); },
  laminaInvestidura: () => compartirLamina({ titulo: fem() ? 'Armada dama de la Orden' : 'Armado caballero de la Orden', grado: edad() >= EDAD_CONDE ? 4 : 1, fiesta: S.investidura.nombre, fecha: S.investidura.fecha }),
  laminaGrado: () => compartirLamina({ titulo: 'Grado en la Orden de Caballería', grado: S.grado, fiesta: null, fecha: hoy() }),
  renovar: () => { renovarJuramento(); render(); toast('Juramento renovado. +100 de honra.'); },
  laminaAnual: async () => { try { const b = await laminaAnualPNG(); await compartirBlob(b, 'lamina-del-ano.png', 'Un año en la Orden'); } catch(e){ toast('No se pudo generar la lámina.'); } },
  leerCronica: () => leerEnVoz(cronicaTexto().map(p => ({ t:p.t, lengua:'es' }))),
  descargarCronica: () => { const t = cronicaTexto().map(p => p.h ? `\n${p.t.toUpperCase()}\n` : p.t).join('\n\n'); compartirBlob(new Blob([t], { type:'text/plain;charset=utf-8' }), 'cronica.txt', 'Crónica'); },
  meConfese: () => { marcarConfesion(); toast('Que Dios te bendiga.'); go(S.situacion === 'aspirante' && S.investidura ? 'hoy' : 'hoy', S.situacion === 'aspirante' && S.investidura ? 'investidura' : null); },
  guia: el => abrirGuia(+el.dataset.v),
  finGuia: () => { S.guiaVista = true; guardar(); cerrarModal(); },
  verGuia: () => abrirGuia(0),
  irMeditacion: () => { cerrarModal(); cerrarCita(); go('mas', 'meditacion'); },
  plataforma: el => { S.ajustes.plataforma = el.dataset.v; guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); },
  npV: el => { const N = TMP.nuevaPieza = TMP.nuevaPieza || { t:'', c:'', u:'', v:[] }; N.t = ($('#npT')||{}).value || N.t; N.c = ($('#npC')||{}).value || N.c; N.u = ($('#npU')||{}).value || N.u; const v = el.dataset.v; N.v = N.v.includes(v) ? N.v.filter(x => x !== v) : [...N.v, v]; const y = window.scrollY; render(); window.scrollTo(0, y); },
  npAdd: () => {
    const N = TMP.nuevaPieza || { v:[] }, t = ($('#npT').value || '').trim(), c = ($('#npC').value || '').trim(), uTxt = ($('#npU') || {}).value || '', u = enlaceLimpio(uTxt);
    if (uTxt.trim() && !u) return toast('El enlace debe empezar por https://');
    if (!t) return toast('Escribe el título de la pieza.');
    if (!N.v || !N.v.length) return toast('Elige al menos un ánimo o momento.');
    S.cancionero = S.cancionero || [];
    S.cancionero.push(Object.assign({ id:'c' + Date.now().toString(36), t, c, v:[...N.v] }, u ? { u } : {}));
    TMP.nuevaPieza = null; guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); toast('Añadida a Mi cancionero.');
  },
  impPegar: () => { const t = ($('#impTxt') || {}).value || ''; if (!t.trim()) return toast('Pega primero la lista.'); prepararImport(t); const y = window.scrollY; render(); window.scrollTo(0, y); },
  impSel: el => { const x = TMP.imp && TMP.imp.items[+el.dataset.v]; if (x) x.sel = !x.sel; const y = window.scrollY; render(); window.scrollTo(0, y); },
  impTodas: el => { (TMP.imp ? TMP.imp.items : []).forEach(x => x.sel = el.dataset.v === '1'); const y = window.scrollY; render(); window.scrollTo(0, y); },
  impVer: () => { TMP.imp.ver = true; const y = window.scrollY; render(); window.scrollTo(0, y); },
  impV: el => { const I = TMP.imp, v = el.dataset.v; I.v = I.v.includes(v) ? I.v.filter(x => x !== v) : [...I.v, v]; const y = window.scrollY; render(); window.scrollTo(0, y); },
  impNo: () => { TMP.imp = null; const y = window.scrollY; render(); window.scrollTo(0, y); },
  impAdd: () => {
    const I = TMP.imp; if (!I) return;
    const sel = I.items.filter(x => x.sel);
    if (!sel.length) return toast('No hay ninguna canción marcada.');
    if (!I.v.length) return toast('Elige al menos un ánimo o momento.');
    S.cancionero = S.cancionero || [];
    const base = Date.now().toString(36);
    sel.forEach((x, k) => S.cancionero.push({ id:'c' + base + k.toString(36), t:x.t, c:x.c, v:[...I.v] }));
    TMP.imp = null; guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); toast(`${sel.length} añadidas a Mi cancionero.`);
  },
  verCan: () => { TMP.verCan = true; const y = window.scrollY; render(); window.scrollTo(0, y); },
  editPropia: el => { TMP.editPropia = TMP.editPropia === el.dataset.v ? null : el.dataset.v; const y = window.scrollY; render(); window.scrollTo(0, y); },
  pvV: el => { const x = (S.cancionero || []).find(z => z.id === el.dataset.id); if (!x) return; const v = el.dataset.v; x.v = (x.v || []).includes(v) ? x.v.filter(z => z !== v) : [...(x.v || []), v]; guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); },
  borrarPropia: el => { const id = el.dataset.v; if (TMP.borrarPropia !== id) { TMP.borrarPropia = id; const y = window.scrollY; render(); window.scrollTo(0, y); return; } TMP.borrarPropia = null; S.cancionero = (S.cancionero || []).filter(x => x.id !== id); guardar(); const y = window.scrollY; render(); window.scrollTo(0, y); },
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
  cita: el => abrirCita(el.dataset.cit),
  cerrarCita: () => cerrarCita(),
  citaLibro: el => {
    TMP.volver = { ruta: { ...RUTA }, y: window.scrollY, modal: !!document.getElementById('modal') };
    cerrarCita(); cerrarModal();
    ACC.leerPar(el);
  },
  volverCita: () => {
    const V = TMP.volver; TMP.volver = null; if (!V) return;
    RUTA = V.ruta; render(); window.scrollTo(0, V.y);
    if (V.modal && RUTA.tab === 'hoy' && TMP.noche) abrirExamenNoche(TMP.noche.fecha);
  },
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
  if (el.id === 'fcan' && el.files && el.files[0]) {
    const r = new FileReader();
    r.onload = () => { prepararImport(textoDeArchivo(r.result)); if (!TMP.imp.items.length && !TMP.imp.repetidas) toast('No encuentro canciones en ese archivo.'); const y = window.scrollY; render(); window.scrollTo(0, y); };
    r.readAsArrayBuffer(el.files[0]); el.value = ''; return;
  }
  if (el.id === 'fret' && el.files && el.files[0]) { abrirRecorte(el.files[0]); el.value = ''; return; }
  if (el.dataset && el.dataset.a === 'vozModo') { S.ajustes.voz = el.value; guardar(); document.querySelectorAll('select[data-a=vozModo]').forEach(x => x.value = el.value); return; }
  if (el.dataset && el.dataset.a === 'evo') { TMP.evo = el.value; const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  if (el.dataset && el.dataset.a === 'cols') { S.ajustes.columnas = el.value; guardar(); render(); }
  if (el.dataset && el.dataset.a === 'tam') { S.ajustes.tam = +el.value; document.documentElement.style.setProperty('--fs', el.value + 'px'); guardar(); render(); }
  if (el.id === 'fimp' && el.files[0]) {
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o.v || !o.dias) throw 0; localStorage.setItem(CLAVE, JSON.stringify(o)); location.reload(); } catch(x){ toast('El archivo no es una copia válida.'); } };
    r.readAsText(el.files[0]);
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'qbus') ACC.buscar(); if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('cita')) abrirCita(e.target.dataset.cit); });
function despuesDeRender(){ enlazarCitas($('#app')); rellenarBreviario(); }

/* ---------- citas del Libro: toda referencia (Parte, §) abre el parágrafo ---------- */
const ROMANOS = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7 };
const RE_CITA = /(Prólogo, §§?\s?|\b(?:Parte )?(VII|VI|IV|V|III|II|I), §§?\s?)(\d+(?:\s?[–-]\s?\d+)?(?:,\s?\d+(?:\s?[–-]\s?\d+)?)*)/g;
function parseNums(t){
  const L = [];
  for (const trozo of t.split(',')) {
    const m = trozo.trim().match(/^(\d+)(?:\s?[–-]\s?(\d+))?$/); if (!m) continue;
    const a = +m[1], b = m[2] ? +m[2] : a;
    for (let i = a; i <= b && i < a + 40; i++) L.push(i);
  }
  return L;
}
function enlazarCitas(root){
  if (!root) return;
  // referencias marcadas: <span class="ref">III, §2</span>, «Prólogo»
  root.querySelectorAll('.ref').forEach(el => {
    if (el.closest('a,button') || el.dataset.cit) return;
    const t = el.textContent.trim();
    if (t === 'Prólogo') { el.dataset.cit = '0:'; el.classList.add('cita'); el.dataset.a = 'cita'; }
  });
  // cualquier texto con la forma «III, §2», «Parte VI, §9», «IV, §§5–7», «VI, §§3, 8»
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n =>
    (!n.parentElement || n.parentElement.closest('a,button,input,textarea,select,option,.cita,.lector,svg')) ? NodeFilter.FILTER_REJECT :
    (RE_CITA.test(n.nodeValue) ? (RE_CITA.lastIndex = 0, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT) });
  const nodos = []; while (w.nextNode()) nodos.push(w.currentNode);
  for (const n of nodos) {
    const txt = n.nodeValue, frag = document.createDocumentFragment(); let ult = 0, m;
    RE_CITA.lastIndex = 0;
    while ((m = RE_CITA.exec(txt))) {
      const parte = m[2] ? ROMANOS[m[2]] : 0, nums = parseNums(m[3]);
      if (!nums.length || !LIBRO.partes[parte]) continue;
      frag.appendChild(document.createTextNode(txt.slice(ult, m.index)));
      const a = document.createElement('span');
      a.className = 'cita'; a.dataset.a = 'cita'; a.dataset.cit = `${parte}:${nums.join(',')}`; a.setAttribute('role','link'); a.tabIndex = 0;
      a.textContent = m[0]; frag.appendChild(a); ult = m.index + m[0].length;
    }
    if (ult === 0) continue;
    frag.appendChild(document.createTextNode(txt.slice(ult)));
    n.parentNode.replaceChild(frag, n);
  }
}
function abrirCita(cit){
  const [p, ns] = cit.split(':'); const P = LIBRO.partes[+p];
  const nums = ns ? ns.split(',').map(Number) : P.pars.map(x => x.n);
  const col = S.ajustes.columnas || 'ambas', cls = col === 'es' ? 'es' : col === 'lem' ? 'lem' : '';
  const pars = nums.map(n => P.pars.find(x => x.n === n)).filter(Boolean);
  cerrarCita();
  const c = document.createElement('div'); c.className = 'modal'; c.id = 'cita'; c.style.zIndex = 65;
  c.innerHTML = `<div class="hoja"><div class="fila" style="justify-content:space-between;margin-bottom:6px">
      <button class="btn" data-a="cerrarCita">‹ Volver</button>${vozDisponible()?`<button class="btn sec" data-a="vozPars" data-p="${p}" data-n="${nums.join(',')}">Escuchar</button>`:''}</div>${vozDisponible()?`<div class="fila" style="margin-bottom:6px">${selectorVoz()}`:'<div>'}<button class="btn sec" data-a="citaLibro" data-p="${p}" data-n="${pars.length?pars[0].n:1}">Abrir en el Libro</button></div>
    <h2>${esc(P.nombre)}${P.id?'. '+esc(P.titulo):''}</h2>
    <div class="lector ${cls}">${pars.map(x=>`<div class="par"><div class="lem">${lemTexto(x)}</div><div class="es"><span class="num">§${x.n}.</span> ${parrafoTexto(x)}</div></div>`).join('')}</div>
    <div class="fila" style="margin-top:12px"><button class="btn ancho" data-a="cerrarCita">‹ Volver</button></div></div>`;
  c.addEventListener('click', e => { if (e.target === c) cerrarCita(); });
  document.body.appendChild(c);
}
function cerrarCita(){ const c = document.getElementById('cita'); if (c) c.remove(); }

/* ---------- arranque (al final: todas las constantes ya definidas) ---------- */
cargar();
ENSAYO = !!S.ajustes.ensayo;
document.documentElement.style.setProperty('--fs', (S.ajustes.tam||19) + 'px');
cerrarDiasAtrasados();
comprobarAcidia();
render();
splash();
asegurarPersistencia();
avisoCopiaAlAbrir();
if (!S.guiaVista) setTimeout(() => { if (!document.getElementById('modal')) abrirGuia(0); }, S.perfil ? 2700 : 400);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js?v=20').then(r => { r.update(); }).catch(()=>{});
  // solo se recarga al actualizar una versión ya instalada, no en la primera visita
  const habia = !!navigator.serviceWorker.controller;
  let recargado = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (habia && !recargado) { recargado = true; location.reload(); } });
}

