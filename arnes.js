/* Código de Llull — «Mi arnés»: el escudero en perpunte y el caballero armado a caballo.
   «Tener aseado su arnés y herrar su caballo es oficio de caballero» (II, §31).
   Cada pieza brilla o se herrumbra según la balanza de la virtud que significa (Parte V). */
'use strict';

/* Pieza → balanzas que la limpian (se toma la peor) */
const PIEZA_BALANZAS = {
  yelmo:['magnanimidad'], lanza:['veracidad'], espada:['lealtad'], coraza:['castidad','fortaleza'],
  calzas:['fortaleza'], espuelas:['diligencia'], gola:['lealtad'], maza:['mansedumbre'],
  misericordia:['diligencia'], escudo:['benevolencia','largueza'], silla:['fortaleza'],
  freno:['mesa','cortesia'], testera:['mansedumbre'], guarniciones:['largueza'], perpunte:['diligencia'],
  blason:['lealtad'], estandarte:['lealtad']
};
const ESTADO_PIEZA = {
  virtud:   { n:'Reluciente', d:'La virtud está asentada: el arma brilla.' },
  dominio:  { n:'Limpia', d:'Se combate y se vence: el arma está limpia.' },
  amenaza:  { n:'Empañada', d:'El vicio asoma: el arma pierde el brillo.' },
  peligro:  { n:'Herrumbrosa', d:'Manda el vicio: el arma se oxida.' },
  aprendida:{ n:'Aprendida', d:'El escudero la conoce, pero aún no la ha ganado.' },
  abatida:  { n:'Abatida', d:'Armas abatidas por la caída.' }
};
function estadoPieza(id){
  if (S.situacion === 'expulsado' || S.abatido) return 'abatida';
  if (S.situacion !== 'orden') return 'aprendida';
  if (id === 'caballo') return estadoCaballo();
  const L = PIEZA_BALANZAS[id] || [];
  let peor = 'virtud';
  const orden = ['virtud','dominio','amenaza','peligro'];
  for (const b of L) { const z = zona(S.balanzas[b]); if (orden.indexOf(z) > orden.indexOf(peor)) peor = z; }
  return peor;
}
/* El caballo, por el ejercicio de los últimos siete días cerrados: «herrar su caballo» */
function estadoCaballo(){
  const fechas = Object.keys(S.dias).sort().slice(-7);
  if (!fechas.length) return 'dominio';
  const n = fechas.filter(f => S.dias[f].ejercicio).length;
  return n >= 7 ? 'virtud' : n >= 5 ? 'dominio' : n >= 3 ? 'amenaza' : 'peligro';
}

let _arnesUid = 0;
function defsArnes(id){
  return `<defs>
    <linearGradient id="${id}-rel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F7FA"/><stop offset=".45" stop-color="#B9C3CC"/><stop offset="1" stop-color="#7D8893"/></linearGradient>
    <linearGradient id="${id}-lim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9D0D6"/><stop offset="1" stop-color="#8A949D"/></linearGradient>
    <linearGradient id="${id}-emp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A9B92"/><stop offset="1" stop-color="#77786F"/></linearGradient>
    <pattern id="${id}-oxido" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#7C7B70"/><circle cx="4" cy="5" r="3.2" fill="#9A4A1C" opacity=".85"/><circle cx="12" cy="11" r="2.6" fill="#B0601F" opacity=".8"/><circle cx="11" cy="3" r="1.4" fill="#7A3512"/><circle cx="3" cy="13" r="1.6" fill="#8C4418"/></pattern>
    <pattern id="${id}-colch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#CDB98D"/><path d="M0,0 H10 M0,0 V10" stroke="#9C8559" stroke-width="1.2"/></pattern>
    <filter id="${id}-gris"><feColorMatrix type="saturate" values="0.15"/></filter>
  </defs>`;
}
function relleno(id, est){
  return { virtud:`url(#${id}-rel)`, dominio:`url(#${id}-lim)`, amenaza:`url(#${id}-emp)`, peligro:`url(#${id}-oxido)`, aprendida:'#A3A9AE', abatida:'#6E6E6A' }[est];
}
function brillo(est, x, y){
  if (est !== 'virtud') return '';
  return `<path d="M${x},${y-6} L${x+1.5},${y-1.5} L${x+6},${y} L${x+1.5},${y+1.5} L${x},${y+6} L${x-1.5},${y+1.5} L${x-6},${y} L${x-1.5},${y-1.5} Z" fill="#fff" opacity=".95"/>`;
}
const K = 'stroke="#1B1A1A" stroke-width="2" stroke-linejoin="round"';
function pieza(pid, contenido){ return `<g class="pz" data-a="pieza" data-v="${pid}" style="cursor:pointer">${contenido}</g>`; }

/* Escudo pequeño con el blasón (o raso) */
function escudoPequeno(id, b, x, y, w, invertido){
  const s = w / 200;
  const inner = b ? escudoSVG(b, id + 'e') : escudoSVG(blasonVacio(), id + 'e', { blanco:true });
  const t = invertido ? `translate(${x} ${y + 240*s}) scale(${s} ${-s})` : `translate(${x} ${y}) scale(${s})`;
  return `<g transform="${t}">${inner}</g>`;
}

/* ---------- el escudero, de pie, en perpunte ---------- */
function escuderoSVG(id){
  const tiene = a => S.situacion === 'expulsado' || S.abatido ? !!S.blason || !!S.armasConocidas[a] : !!S.armasConocidas[a];
  const est = S.situacion === 'expulsado' || S.abatido ? 'abatida' : 'aprendida';
  const F = relleno(id, est);
  let s = '';
  // lanza (detrás)
  if (tiene('lanza')) s += pieza('lanza', `<path d="M44,24 L44,286" stroke="#7A4E25" stroke-width="5"/><path d="M44,6 L38,26 L50,26 Z" fill="${F}" ${K}/>`);
  // piernas (calzas de tela) y zapatos
  s += `<path d="M80,170 L76,262 L92,262 L97,170 Z" fill="#6B4A2E" ${K}/><path d="M103,170 L108,262 L124,262 L120,170 Z" fill="#6B4A2E" ${K}/>
        <path d="M72,262 H94 V272 H68 Z" fill="#2B211A" ${K}/><path d="M106,262 H128 V272 H104 Z" fill="#2B211A" ${K}/>`;
  if (tiene('calzas')) s += pieza('calzas', `<path d="M80,176 L77,258 L92,258 L96,176 Z" fill="${F}" ${K}/><path d="M104,176 L108,258 L123,258 L119,176 Z" fill="${F}" ${K}/>`);
  if (tiene('espuelas')) s += pieza('espuelas', `<path d="M68,268 l-10,0 M132,268 l10,0" stroke="#B8913A" stroke-width="3"/><circle cx="56" cy="268" r="4" fill="none" stroke="#B8913A" stroke-width="2"/><circle cx="144" cy="268" r="4" fill="none" stroke="#B8913A" stroke-width="2"/>`);
  // perpunte (siempre: V, §17)
  s += pieza('perpunte', `<path d="M68,62 L132,62 L142,176 L58,176 Z" fill="url(#${id}-colch)" ${K}/>`);
  if (tiene('coraza')) s += pieza('coraza', `<path d="M72,66 L128,66 L132,126 L68,126 Z" fill="${F}" ${K}/><path d="M100,70 V122" stroke="#1B1A1A" stroke-width="1"/>`);
  // brazos
  s += `<path d="M68,64 L48,140 L60,144 L80,82 Z" fill="url(#${id}-colch)" ${K}/><path d="M132,64 L152,140 L140,144 L120,82 Z" fill="url(#${id}-colch)" ${K}/>
        <circle cx="52" cy="146" r="7" fill="#E2B48C" ${K}/><circle cx="148" cy="146" r="7" fill="#E2B48C" ${K}/>`;
  // cinto, espada, maza, misericordia
  s += `<path d="M64,150 H136" stroke="#5B3B1E" stroke-width="6"/>`;
  if (tiene('espada')) s += pieza('espada', `<path d="M74,152 L62,236" stroke="#3A2A1C" stroke-width="7" stroke-linecap="round"/><path d="M66,146 L86,150" stroke="#B8913A" stroke-width="4"/><circle cx="77" cy="141" r="4" fill="#B8913A" ${K}/>`);
  if (tiene('maza')) s += pieza('maza', `<path d="M124,152 L130,196" stroke="#5B3B1E" stroke-width="4"/><circle cx="131" cy="202" r="8" fill="${F}" ${K}/>`);
  if (tiene('misericordia')) s += pieza('misericordia', `<path d="M110,152 L112,178" stroke="#5B3B1E" stroke-width="3"/><path d="M106,174 L118,172 L116,184 Z" fill="${F}" ${K}/>`);
  // cabeza: el escudero va a cara descubierta (con su retrato, si lo tiene) y lleva el yelmo en la mano
  const ret = typeof retratoURL === 'function' ? retratoURL() : null;
  if (ret) s += `<defs><clipPath id="${id}-cara"><circle cx="100" cy="36" r="20"/></clipPath></defs><image href="${ret}" x="80" y="16" width="40" height="40" clip-path="url(#${id}-cara)" preserveAspectRatio="xMidYMid slice"/><circle cx="100" cy="36" r="20" fill="none" ${K}/>`;
  else s += `<circle cx="100" cy="38" r="17" fill="#E2B48C" ${K}/><path d="M83,34 C84,20 116,20 117,34 C112,26 88,26 83,34 Z" fill="#5B3B1E"/><circle cx="94" cy="40" r="1.6" fill="#1B1A1A"/><circle cx="106" cy="40" r="1.6" fill="#1B1A1A"/>`;
  if (tiene('yelmo')) s += pieza('yelmo', `<g transform="translate(150 150) scale(.62)"><path d="M-18,-20 L18,-20 C22,-8 22,10 18,22 L-18,22 C-22,10 -22,-8 -18,-20 Z" fill="${F}" ${K}/><path d="M-16,-2 H16" stroke="#1B1A1A" stroke-width="3"/><path d="M0,2 V18 M-6,8 h-6 M6,8 h6" stroke="#1B1A1A" stroke-width="1.4"/></g>`);
  if (tiene('gola')) s += pieza('gola', `<path d="M86,56 L114,56 L118,68 L82,68 Z" fill="${F}" ${K}/>`);
  // escudo raso (o invertido si abatido)
  if (tiene('escudo')) s += pieza('escudo', escudoPequeno(id, (S.abatido || S.situacion==='expulsado') ? S.blason : null, 136, 96, 44, S.abatido || S.situacion==='expulsado'));
  const filtro = est === 'abatida' ? ` filter="url(#${id}-gris)"` : '';
  return `<svg viewBox="0 0 200 290" width="100%" style="max-width:260px;display:block;margin:0 auto" role="img" aria-label="El escudero">${defsArnes(id)}<g${filtro}>${s}</g></svg>`;
}

/* ---------- el caballero, armado, a caballo (mira a la diestra del escudo: a la izquierda) ---------- */
function caballeroSVG(id){
  const g = S.grado, b = S.blason || blasonVacio();
  const E = p => estadoPieza(p), F = p => relleno(id, E(p));
  const col = k => { const e = ESMALTES[b.e[k] || 'gules']; return e.t === 'forro' ? (b.e[k]==='arminos' ? '#F3F1EA' : '#1E4C9A') : e.c; };
  const c1 = col(0), c2 = (b.e[1] && b.e[1] !== b.e[0]) ? col(1) : (ESMALTES[b.em] ? ESMALTES[b.em].c : '#D9A21B');
  const ec = E('caballo'), pelo = { virtud:'#7A4526', dominio:'#6E4127', amenaza:'#5E4636', peligro:'#4E4038' }[ec] || '#6E4127';
  let s = '';
  // manto (conde)
  if (g >= 4) s += `<path d="M206,64 C246,74 262,118 256,160 C248,150 236,150 228,160 C226,130 222,104 204,84 Z" fill="#9E1C1C" ${K}/><path d="M256,160 C248,150 236,150 228,160" fill="none" stroke="#F3F1EA" stroke-width="5"/>`;
  // cola y patas lejanas
  s += `<path d="M262,156 C290,166 296,206 284,244 C278,222 270,196 256,178 Z" fill="#2B1D14" ${K}/>`;
  s += `<path d="M146,200 L144,256 L153,256 L156,202 Z" fill="${pelo}" ${K} opacity=".85"/><path d="M248,194 L258,254 L267,254 L259,192 Z" fill="${pelo}" ${K} opacity=".85"/>`;
  // cuerpo, cuello, cabeza
  s += `<g class="pz" data-a="pieza" data-v="caballo" style="cursor:pointer"><path d="M110,160 C112,134 150,127 192,131 C238,134 266,146 268,170 C270,196 246,211 205,211 C164,213 124,208 112,190 Z" fill="${pelo}" ${K}/>
        <path d="M120,168 C110,142 98,120 86,104 L106,88 C120,108 136,128 150,140 Z" fill="${pelo}" ${K}/>
        <path d="M104,86 L80,96 C64,104 48,112 40,123 C36,129 41,135 50,134 C64,132 80,124 94,116 L108,98 Z" fill="${pelo}" ${K}/>
        <path d="M100,86 l-3,-13 l9,9 z" fill="${pelo}" ${K}/><circle cx="74" cy="104" r="2" fill="#1B1A1A"/>
        <path d="M106,88 C118,104 132,122 148,136" stroke="#2B1D14" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  // patas cercanas y cascos (herrados según el ejercicio)
  const herr = ec === 'peligro' ? '#5E4B3C' : '#1B1A1A';
  s += `<path d="M126,198 L120,260 L131,260 L138,202 Z" fill="${pelo}" ${K}/><path d="M232,198 C238,224 236,240 240,260 L251,260 C249,236 252,222 246,196 Z" fill="${pelo}" ${K}/>
        <path d="M118,258 H133 V267 H116 Z M238,258 H253 V267 H236 Z M142,254 H155 V262 H141 Z M256,252 H269 V260 H255 Z" fill="${herr}"/>`;
  // guarniciones (gualdrapa con los esmaltes del blasón)
  s += pieza('guarniciones', `<path d="M108,150 C130,128 232,126 264,146 L268,212 C254,224 244,212 232,226 C220,212 208,226 196,214 C184,228 172,214 160,228 C148,214 136,226 124,212 C118,220 112,214 110,206 Z" fill="${c1}" ${K}/>
        <path d="M110,200 C130,214 150,206 170,214 C190,206 214,214 232,208 C246,214 258,206 268,204" fill="none" stroke="${c2}" stroke-width="6"/>${brillo(E('guarniciones'), 250, 160)}`);
  // testera y freno
  s += pieza('testera', `<path d="M86,98 L58,110 L46,122 L52,128 L92,110 Z" fill="${F('testera')}" ${K}/>${brillo(E('testera'), 70, 112)}`);
  s += pieza('freno', `<path d="M94,114 L56,128 M100,92 L92,116" stroke="#3A2A1C" stroke-width="2.5" fill="none"/><path d="M50,130 C90,136 130,126 158,112" stroke="#3A2A1C" stroke-width="2" fill="none"/><circle cx="54" cy="129" r="3" fill="${F('freno')}" ${K}/>`);
  // silla
  s += pieza('silla', `<path d="M150,142 C150,122 160,118 168,128 L198,128 C202,114 214,112 214,128 L212,144 Z" fill="#6B3E1E" ${K}/>`);
  // escudo (blasón) — detrás del brazo
  s += pieza('escudo', escudoPequeno(id, S.blason, 204, 78, 48, false) + brillo(E('escudo'), 240, 86));
  // pierna del caballero (calzas, espuela)
  s += pieza('calzas', `<path d="M178,128 L198,134 L174,170 L156,164 Z" fill="${F('calzas')}" ${K}/><path d="M156,162 L174,168 L168,206 L152,206 Z" fill="${F('calzas')}" ${K}/><path d="M150,204 L170,204 L172,213 L142,213 Z" fill="${F('calzas')}" ${K}/>${brillo(E('calzas'), 162, 186)}`);
  s += pieza('espuelas', `<path d="M172,208 L184,210" stroke="#B8913A" stroke-width="3"/><circle cx="188" cy="210" r="4.5" fill="none" stroke="#B8913A" stroke-width="2"/>`);
  // espada en la vaina, maza y misericordia
  s += pieza('espada', `<path d="M170,138 L130,182" stroke="#3A2A1C" stroke-width="7" stroke-linecap="round"/><path d="M164,128 L180,144" stroke="${E('espada')==='peligro'?'#8C4418':'#B8913A'}" stroke-width="4"/><circle cx="175" cy="129" r="4" fill="${F('espada')}" ${K}/>${brillo(E('espada'), 175, 129)}`);
  s += pieza('maza', `<path d="M150,140 L140,162" stroke="#5B3B1E" stroke-width="4"/><circle cx="138" cy="166" r="7" fill="${F('maza')}" ${K}/>${brillo(E('maza'), 136, 163)}`);
  s += pieza('misericordia', `<path d="M206,132 L214,150" stroke="#5B3B1E" stroke-width="3"/><path d="M210,146 L222,148 L216,158 Z" fill="${F('misericordia')}" ${K}/>`);
  // cuerpo: perpunte, coraza, gola
  s += pieza('perpunte', `<path d="M168,126 L210,126 L216,146 L162,146 Z" fill="url(#${id}-colch)" ${K}/>`);
  s += pieza('coraza', `<path d="M168,70 C164,95 166,115 172,130 L206,130 C210,110 210,92 204,70 Z" fill="${F('coraza')}" ${K}/><path d="M186,74 V128" stroke="#1B1A1A" stroke-width="1"/>${brillo(E('coraza'), 196, 84)}`);
  s += pieza('gola', `<path d="M175,58 L199,58 L203,72 L171,72 Z" fill="${F('gola')}" ${K}/>`);
  // brazo con la lanza
  s += pieza('lanza', `<path d="M232,94 L22,120" stroke="#7A4E25" stroke-width="6" stroke-linecap="round"/><path d="M22,120 L40,111 L42,123 Z" fill="${F('lanza')}" ${K}/>${brillo(E('lanza'), 30, 117)}
        ${g >= 3 ? `<path d="M48,116 L92,110 L84,120 L94,128 L50,126 Z" fill="${c1}" ${K}/><path d="M50,121 L88,117" stroke="${c2}" stroke-width="3"/>` : ''}`);
  s += `<path d="M178,78 L152,102 L160,112 L186,92 Z" fill="${F('coraza')}" ${K}/><circle cx="154" cy="108" r="6" fill="${F('coraza')}" ${K}/>`;
  // yelmo, cimera y corona
  s += pieza('yelmo', `<path d="M172,26 L202,26 C206,38 206,50 202,60 L172,60 C168,50 168,38 172,26 Z" fill="${F('yelmo')}" ${K}/><path d="M168,40 H190" stroke="#1B1A1A" stroke-width="3"/><path d="M174,47 h6 M174,52 h6" stroke="#1B1A1A" stroke-width="1.3"/>${brillo(E('yelmo'), 196, 32)}`);
  if (g >= 2) s += `<g stroke="#1B1A1A" stroke-width="1.6"><path d="M187,26 C182,10 186,-2 190,-8 C194,4 194,14 189,26 Z" fill="${c2}"/><path d="M185,26 C172,16 166,6 164,-2 C174,6 182,14 187,26 Z" fill="${c1}"/><path d="M190,26 C202,16 208,6 210,-2 C200,6 192,14 190,26 Z" fill="${c1}"/></g>`;
  if (g >= 4) { let p=''; for (let i=0;i<5;i++) p += `<circle cx="${175+i*6}" cy="21" r="2.4" fill="#F3F1EA" stroke="#1B1A1A" stroke-width=".8"/>`; s += `<path d="M171,23 H203 V28 H171 Z" fill="#D9A21B" stroke="#1B1A1A" stroke-width="1.2"/>${p}`; }
  return `<svg viewBox="0 -12 300 285" width="100%" style="max-width:420px;display:block;margin:0 auto" role="img" aria-label="El caballero armado">${defsArnes(id)}${s}</svg>`;
}

function arnesSVG(){
  const id = 'ar' + (++_arnesUid);
  return S.situacion === 'orden' && !S.abatido ? caballeroSVG(id) : escuderoSVG(id);
}
