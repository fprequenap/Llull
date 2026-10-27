/* Código de Llull — heráldica: constructor, dibujo SVG y blasonado. */
'use strict';

const ESMALTES = {
  oro:     { n:'oro',     t:'metal', c:'#D9A21B' },
  plata:   { n:'plata',   t:'metal', c:'#F3F1EA' },
  gules:   { n:'gules',   t:'color', c:'#B3201F' },
  azur:    { n:'azur',    t:'color', c:'#1E4C9A' },
  sinople: { n:'sinople', t:'color', c:'#2B7A3A' },
  sable:   { n:'sable',   t:'color', c:'#1B1A1A' },
  purpura: { n:'púrpura', t:'color', c:'#74407F' },
  arminos: { n:'armiños', t:'forro', c:'#F3F1EA' },
  veros:   { n:'veros',   t:'forro', c:'#1E4C9A' }
};
function contrasta(a, b){
  if (!a || !b) return true;
  const A = ESMALTES[a].t, B = ESMALTES[b].t;
  if (A === 'forro' || B === 'forro') return a !== b;
  return A !== B;
}

const FORMAS = { espanol:'Español (cuadrilongo, base redonda)', apuntado:'Apuntado (medieval, siglo XIII)', frances:'Francés moderno' };
const PARTICIONES = {
  pleno:'Pleno', partido:'Partido', cortado:'Cortado', tronchado:'Tronchado', tajado:'Tajado',
  cuartelado:'Cuartelado', terciado:'Terciado en faja', jironado:'Jironado de ocho'
};
const NUM_ESMALTES_PART = { pleno:1, partido:2, cortado:2, tronchado:2, tajado:2, cuartelado:2, terciado:3, jironado:2 };
const PIEZAS = {
  ninguna:{ n:'Ninguna' }, cruz:{ n:'Cruz', a:'una cruz' }, sotuer:{ n:'Sotuer', a:'un sotuer' }, palo:{ n:'Palo', a:'un palo' },
  faja:{ n:'Faja', a:'una faja' }, banda:{ n:'Banda', a:'una banda' }, barra:{ n:'Barra', a:'una barra' },
  cabrio:{ n:'Cabrio', a:'un cabrio' }, jefe:{ n:'Jefe', a:'jefe', zona:'arriba' }, campana:{ n:'Campaña', a:'campaña', zona:'abajo' }
};
const MUEBLES = {
  ninguno:  { n:'Ninguno' },
  castillo: { n:'Castillo', s:'un castillo', p:'castillos', tres:true },
  torre:    { n:'Torre', s:'una torre', p:'torres', tres:true, f:true },
  leon:     { n:'León rampante', s:'un león rampante', p:'leones rampantes' },
  aguila:   { n:'Águila explayada', s:'un águila explayada', p:'águilas explayadas', f:true },
  flordelis:{ n:'Flor de lis', s:'una flor de lis', p:'flores de lis', tres:true, f:true },
  venera:   { n:'Venera', s:'una venera', p:'veneras', tres:true, f:true },
  estrella: { n:'Estrella de seis rayos', s:'una estrella de seis rayos', p:'estrellas de seis rayos', tres:true, f:true },
  creciente:{ n:'Creciente', s:'un creciente', p:'crecientes', tres:true },
  roel:     { n:'Roel', s:'un roel', p:'roeles', tres:true },
  bezante:  { n:'Bezante', s:'un bezante', p:'bezantes', tres:true, metal:true },
  llave:    { n:'Llave', s:'una llave en palo', p:'llaves en palo', tres:true, f:true },
  espada:   { n:'Espada', s:'una espada en palo, la punta arriba', p:'espadas', f:true },
  santiago: { n:'Cruz de Santiago', s:'una cruz de Santiago', p:'cruces de Santiago', f:true },
  flordelisada:{ n:'Cruz flordelisada', s:'una cruz flordelisada', p:'cruces flordelisadas', f:true },
  caliz:    { n:'Cáliz', s:'un cáliz', p:'cálices', tres:true },
  arbol:    { n:'Árbol', s:'un árbol arrancado', p:'árboles' },
  caldera:  { n:'Caldera', s:'una caldera', p:'calderas', tres:true, f:true },
  sol:      { n:'Sol', s:'un sol', p:'soles' }
};
const CIMERAS = { plumas:'Penacho de tres plumas', vuelo:'Vuelo (dos alas)', cruz:'Cruz flordelisada' };

function blasonVacio(){
  return { forma:'espanol', particion:'pleno', e:['azur','oro','gules'], pieza:'ninguna', ep:'oro',
           mueble:'castillo', em:'oro', num:1, bordura:false, eb:'gules', cimera:'plumas', lema:'' };
}

/* Validación con la regla de esmaltes; devuelve lista de errores */
function validarBlason(b){
  const err = [];
  const n = NUM_ESMALTES_PART[b.particion];
  const campos = b.e.slice(0, n);
  if (new Set(campos).size < n) err.push('Los cuarteles de la partición han de ser de esmaltes distintos.');
  const pleno = b.particion === 'pleno';
  if (b.pieza !== 'ninguna' && pleno && !contrasta(b.ep, campos[0])) err.push('Regla de esmaltes: la pieza no puede ir metal sobre metal ni color sobre color.');
  if (b.mueble !== 'ninguno') {
    if (MUEBLES[b.mueble].metal && ESMALTES[b.em].t !== 'metal') err.push('El bezante es siempre de metal.');
    if (pleno && !contrasta(b.em, campos[0])) err.push('Regla de esmaltes: la figura no puede ir metal sobre metal ni color sobre color.');
    if (b.pieza !== 'ninguna' && !PIEZAS[b.pieza].zona) err.push('Con esta pieza no cabe figura: elige jefe, campaña o ninguna pieza.');
    if (b.pieza !== 'ninguna' && PIEZAS[b.pieza].zona && !contrasta(b.ep, campos[0]) && pleno) {}
  }
  if (b.bordura && pleno && !contrasta(b.eb, campos[0])) err.push('Regla de esmaltes: la bordura no puede ir metal sobre metal ni color sobre color.');
  return err;
}

/* ---------- Blasonado ---------- */
function blasonar(b){
  const E = i => ESMALTES[b.e[i]].n, partes = [];
  const pleno = b.particion === 'pleno';
  let campo;
  switch (b.particion) {
    case 'pleno': campo = `En campo de ${E(0)}`; break;
    case 'cuartelado': campo = `Cuartelado: primero y cuarto, de ${E(0)}; segundo y tercero, de ${E(1)}`; break;
    case 'terciado': campo = `Terciado en faja: de ${E(0)}, de ${E(1)} y de ${E(2)}`; break;
    case 'jironado': campo = `Jironado de ocho piezas, de ${E(0)} y de ${E(1)}`; break;
    default: campo = `${PARTICIONES[b.particion]}: primero, de ${E(0)}; segundo, de ${E(1)}`;
  }
  partes.push(campo);
  const br = pleno ? '' : 'brochante sobre el todo, ';
  const pz = PIEZAS[b.pieza];
  if (b.pieza !== 'ninguna' && !pz.zona) partes.push(`${br}${pz.a} de ${ESMALTES[b.ep].n}`);
  if (b.mueble !== 'ninguno') {
    const m = MUEBLES[b.mueble];
    const txt = b.num === 3 && m.tres ? `tres ${m.p} de ${ESMALTES[b.em].n}, puest${m.f?'as':'os'} dos y una`.replace('dos y una', m.f?'dos y una':'dos y uno') : `${m.s} de ${ESMALTES[b.em].n}`;
    partes.push((pz.zona ? '' : br) + txt);
  }
  let s = partes.join(pleno ? ', ' : '; ');
  if (pz.zona) s += `; ${pz.a} de ${ESMALTES[b.ep].n}`;
  if (b.bordura) s += `; bordura de ${ESMALTES[b.eb].n}`;
  return s + '.';
}

/* ---------- Dibujo ---------- */
let _uid = 0;
const SH = {
  espanol: 'M0,0 H200 V140 A100,100 0 0 1 0,140 Z',
  apuntado: 'M0,0 H200 V95 C200,165 150,212 100,240 C50,212 0,165 0,95 Z',
  frances: 'M0,0 H200 V200 Q200,222 178,222 H122 Q100,222 100,240 Q100,222 78,222 H22 Q0,222 0,200 Z'
};
function pinta(esm, id){ return ESMALTES[esm].t === 'forro' ? `url(#${id}-${esm})` : ESMALTES[esm].c; }
function patrones(id){
  return `<pattern id="${id}-arminos" width="34" height="40" patternUnits="userSpaceOnUse">
    <rect width="34" height="40" fill="#F3F1EA"/>
    <g fill="#1B1A1A"><path d="M8,6 l-3,12 l3,-3 l3,3 z"/><circle cx="8" cy="5" r="1.6"/><circle cx="5" cy="7" r="1.4"/><circle cx="11" cy="7" r="1.4"/>
    <path d="M25,26 l-3,12 l3,-3 l3,3 z"/><circle cx="25" cy="25" r="1.6"/><circle cx="22" cy="27" r="1.4"/><circle cx="28" cy="27" r="1.4"/></g></pattern>
  <pattern id="${id}-veros" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="40" height="40" fill="#F3F1EA"/>
    <path d="M0,20 L5,15 V5 L10,0 L15,5 V15 L20,20 Z M20,40 L25,35 V25 L30,20 L35,25 V35 L40,40 Z M-20,40 L-15,35 V25 L-10,20 L-5,25 V35 L0,40 Z" fill="#1E4C9A"/>
    <path d="M20,20 L25,15 V5 L30,0 L35,5 V15 L40,20 Z M0,40 L5,35 V25 L10,20 L15,25 V35 L20,40 Z" fill="#1E4C9A"/></pattern>`;
}
function campos(b, id){
  const P = i => pinta(b.e[i], id);
  switch (b.particion) {
    case 'partido': return `<rect width="200" height="240" fill="${P(0)}"/><rect x="100" width="100" height="240" fill="${P(1)}"/>`;
    case 'cortado': return `<rect width="200" height="240" fill="${P(0)}"/><rect y="120" width="200" height="120" fill="${P(1)}"/>`;
    case 'tronchado': return `<rect width="200" height="240" fill="${P(0)}"/><polygon points="0,0 200,240 0,240" fill="${P(1)}"/>`;
    case 'tajado': return `<rect width="200" height="240" fill="${P(0)}"/><polygon points="200,0 200,240 0,240" fill="${P(1)}"/>`;
    case 'cuartelado': return `<rect width="200" height="240" fill="${P(0)}"/><rect x="100" width="100" height="120" fill="${P(1)}"/><rect y="120" width="100" height="120" fill="${P(1)}"/>`;
    case 'terciado': return `<rect width="200" height="80" fill="${P(0)}"/><rect y="80" width="200" height="80" fill="${P(1)}"/><rect y="160" width="200" height="80" fill="${P(2)}"/>`;
    case 'jironado': {
      let s = `<rect width="200" height="240" fill="${P(0)}"/>`;
      const c = [100,110], pts = [[100,-10],[210,-10],[210,110],[210,250],[100,250],[-10,250],[-10,110],[-10,-10]];
      for (let i=0;i<8;i+=2){ const a=pts[i], d=pts[(i+1)%8]; s += `<polygon points="${c} ${a} ${d}" fill="${P(1)}"/>`; }
      return s;
    }
    default: return `<rect width="200" height="240" fill="${P(0)}"/>`;
  }
}
function pieza(b, id){
  const f = pinta(b.ep, id), st = 'stroke="#1B1A1A" stroke-width="1.5"';
  switch (b.pieza) {
    case 'cruz': return `<path d="M80,-5 H120 V90 H205 V130 H120 V245 H80 V130 H-5 V90 H80 Z" fill="${f}" ${st}/>`;
    case 'sotuer': return `<g ${st}><polygon points="-10,10 10,-10 210,230 190,250" fill="${f}"/><polygon points="190,-10 210,10 10,250 -10,230" fill="${f}"/></g>`;
    case 'palo': return `<rect x="70" y="-5" width="60" height="250" fill="${f}" ${st}/>`;
    case 'faja': return `<rect x="-5" y="85" width="210" height="60" fill="${f}" ${st}/>`;
    case 'banda': return `<polygon points="-10,20 20,-10 215,215 185,250" fill="${f}" ${st}/>`;
    case 'barra': return `<polygon points="180,-10 210,20 15,250 -15,215" fill="${f}" ${st}/>`;
    case 'cabrio': return `<polygon points="100,70 210,190 210,235 100,115 -10,235 -10,190" fill="${f}" ${st}/>`;
    case 'jefe': return `<rect x="-5" y="-5" width="210" height="77" fill="${f}" ${st}/>`;
    case 'campana': return `<rect x="-5" y="172" width="210" height="80" fill="${f}" ${st}/>`;
    default: return '';
  }
}

/* Figuras en caja 100×100; se dibujan dos veces: contorno sable y relleno del esmalte */
function figura(tipo, fill){
  const K = '#1B1A1A';
  const capa = (col, extra) => {
    const sw = w => `stroke="${col}" stroke-width="${w + extra}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const fl = `fill="${col}" stroke="${col}" stroke-width="${extra}" stroke-linejoin="round"`;
    switch (tipo) {
      case 'leon': return `
        <path ${sw(8)} d="M47,38 L30,42 L22,35"/><path ${sw(7)} d="M50,46 L34,56 L27,51"/>
        <path ${sw(8)} d="M60,70 L54,85 L44,90"/><path ${sw(8)} d="M66,67 L74,84 L84,88"/>
        <path ${sw(4)} d="M68,62 C92,58 70,32 86,22"/><path ${fl} d="M86,22 l6,-6 l-1,8 l7,-1 l-8,5 z"/>
        <ellipse ${fl} cx="56" cy="53" rx="13" ry="23" transform="rotate(-25 56 53)"/>
        <path ${fl} d="M40,10 l4,6 l6,-3 l-1,7 l7,2 l-6,4 l4,6 l-7,0 l-1,7 l-5,-5 l-5,5 l-1,-7 l-7,0 l4,-6 l-6,-4 l7,-2 l-1,-7 l6,3 z"/>
        <circle ${fl} cx="39" cy="24" r="9"/><ellipse ${fl} cx="29" cy="28" rx="7" ry="5"/>`;
      case 'aguila': return `
        <path ${fl} d="M44,40 L8,18 L12,28 L4,30 L12,38 L6,44 L16,48 L12,56 L44,58 Z"/>
        <path ${fl} d="M56,40 L92,18 L88,28 L96,30 L88,38 L94,44 L84,48 L88,56 L56,58 Z"/>
        <ellipse ${fl} cx="50" cy="52" rx="10" ry="20"/>
        <path ${fl} d="M42,70 L36,90 L50,82 L64,90 L58,70 Z"/>
        <path ${sw(4)} d="M44,68 L34,76 M56,68 L66,76"/>
        <circle ${fl} cx="46" cy="27" r="8"/><path ${fl} d="M39,27 L31,30 L38,32 Z"/>`;
      case 'castillo': return `<path ${fl} d="M14,88 V48 H22 V40 H28 V48 H34 V40 H40 V30 H38 V20 H44 V26 H48 V20 H52 V26 H56 V20 H62 V30 H60 V40 H66 V48 H72 V40 H78 V48 H86 V88 Z"/>`;
      case 'torre': return `<path ${fl} d="M28,90 V34 H24 V18 H32 V24 H38 V18 H46 V24 H54 V18 H62 V24 H68 V18 H76 V34 H72 V90 Z"/>`;
      case 'flordelis': return `
        <path ${fl} d="M50,6 C40,22 38,38 45,54 H55 C62,38 60,22 50,6 Z"/>
        <path ${fl} d="M45,52 C30,54 16,46 16,30 C10,42 14,58 32,62 H45 Z"/>
        <path ${fl} d="M55,52 C70,54 84,46 84,30 C90,42 86,58 68,62 H55 Z"/>
        <rect ${fl} x="30" y="58" width="40" height="9" rx="2"/>
        <path ${fl} d="M45,67 C44,78 38,86 30,90 C42,92 50,84 50,74 C50,84 58,92 70,90 C62,86 56,78 55,67 Z"/>`;
      case 'venera': return `<path ${fl} d="M50,90 L36,82 L14,44 C20,18 80,18 86,44 L64,82 Z"/><path ${fl} d="M36,82 L24,90 L30,78 Z M64,82 L76,90 L70,78 Z"/>`;
      case 'estrella': { let p=''; for(let i=0;i<12;i++){ const r=i%2?18:44, a=Math.PI/6*i-Math.PI/2; p+=`${(50+r*Math.cos(a)).toFixed(1)},${(50+r*Math.sin(a)).toFixed(1)} `;} return `<polygon ${fl} points="${p}"/>`; }
      case 'creciente': return `<path ${fl} d="M14,40 A38,38 0 0 0 86,40 A32,30 0 0 1 14,40 Z"/>`;
      case 'roel': case 'bezante': return `<circle ${fl} cx="50" cy="50" r="38"/>`;
      case 'llave': return `<path ${sw(8)} d="M50,30 V90 M50,74 H62 M50,84 H64"/><circle ${sw(7)} cx="50" cy="18" r="11"/>`;
      case 'espada': return `<path ${fl} d="M46,8 L50,2 L54,8 V66 H46 Z"/><rect ${fl} x="26" y="64" width="48" height="7" rx="2"/><rect ${fl} x="46" y="71" width="8" height="16"/><circle ${fl} cx="50" cy="91" r="6"/>`;
      case 'santiago': return `<path ${fl} d="M47,30 V70 L50,96 L53,70 V30 Z"/>
        <path ${fl} d="M50,4 C44,12 44,22 47,30 H53 C56,22 56,12 50,4 Z"/>
        <path ${fl} d="M47,34 H22 C16,26 8,30 8,36 C8,42 16,46 22,38 H47 Z"/><path ${fl} d="M53,34 H78 C84,26 92,30 92,36 C92,42 84,46 78,38 H53 Z"/>
        <path ${fl} d="M42,64 H58 V69 H42 Z"/>`;
      case 'flordelisada': {
        const lis = (x,y,r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path ${fl} d="M0,-14 C-5,-6 -5,0 -3,4 H3 C5,0 5,-6 0,-14 Z M-3,2 C-10,2 -14,-4 -13,-10 C-17,-2 -12,6 -3,6 Z M3,2 C10,2 14,-4 13,-10 C17,-2 12,6 3,6 Z"/></g>`;
        return `<path ${fl} d="M44,22 H56 V44 H78 V56 H56 V80 H44 V56 H22 V44 H44 Z"/>${lis(50,14,0)}${lis(50,88,180)}${lis(14,50,-90)}${lis(86,50,90)}`;
      }
      case 'caliz': return `<path ${fl} d="M26,12 H74 C74,40 62,52 54,54 V74 C54,78 70,80 72,90 H28 C30,80 46,78 46,74 V54 C38,52 26,40 26,12 Z"/>`;
      case 'arbol': return `<path ${fl} d="M45,90 L47,60 L40,56 L46,54 L48,46 H52 L54,54 L60,56 L53,60 L55,90 Z"/><circle ${fl} cx="34" cy="38" r="17"/><circle ${fl} cx="66" cy="38" r="17"/><circle ${fl} cx="50" cy="24" r="19"/><path ${sw(4)} d="M40,92 L45,86 M60,92 L55,86"/>`;
      case 'caldera': return `<path ${fl} d="M18,36 H82 C82,66 70,84 50,84 C30,84 18,66 18,36 Z"/><path ${sw(4)} d="M18,36 C14,22 32,16 34,30 M82,36 C86,22 68,16 66,30"/><path ${sw(4)} d="M38,84 L34,92 M62,84 L66,92"/>`;
      case 'sol': { let r=''; for(let i=0;i<16;i++){ const a=Math.PI/8*i, x1=50+28*Math.cos(a), y1=50+28*Math.sin(a), x2=50+46*Math.cos(a), y2=50+46*Math.sin(a); r+=`<path ${sw(5)} d="M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}"/>`;} return r+`<circle ${fl} cx="50" cy="50" r="27"/>`; }
      default: return '';
    }
  };
  const detalle = {
    castillo:`<path fill="${K}" d="M44,88 V74 A6,6 0 0 1 56,74 V88 Z"/><rect fill="${K}" x="47" y="34" width="6" height="9" rx="3"/><rect fill="${K}" x="23" y="58" width="5" height="9" rx="2.5"/><rect fill="${K}" x="72" y="58" width="5" height="9" rx="2.5"/>`,
    torre:`<path fill="${K}" d="M44,90 V74 A6,6 0 0 1 56,74 V90 Z"/><rect fill="${K}" x="47" y="40" width="6" height="11" rx="3"/>`,
    venera:`<path stroke="${K}" stroke-width="1.5" fill="none" d="M50,86 V24 M50,86 L32,28 M50,86 L68,28 M50,86 L20,40 M50,86 L80,40"/>`,
    caldera:`<path stroke="${K}" stroke-width="1.5" fill="none" d="M18,44 H82"/>`,
    aguila:`<circle cx="44" cy="25" r="1.8" fill="${K}"/>`,
    leon:`<circle cx="37" cy="22" r="1.6" fill="${K}"/><path d="M24,31 l6,-1" stroke="#B3201F" stroke-width="2.5"/>`
  };
  return `<g>${capa(K,3)}</g><g>${capa(fill,0)}</g>${detalle[tipo]||''}`;
}
function muebles(b, id){
  if (b.mueble === 'ninguno') return '';
  const pz = PIEZAS[b.pieza], f = pinta(b.em, id);
  let zona = { cx:100, cy: b.forma==='apuntado'?104:114, s:156 };
  if (pz.zona === 'arriba') zona = { cx:100, cy:b.forma==='apuntado'?138:150, s:118 };
  if (pz.zona === 'abajo') zona = { cx:100, cy:86, s:118 };
  if (b.bordura) zona.s *= 0.82;
  const n = (b.num === 3 && MUEBLES[b.mueble].tres) ? 3 : 1;
  const pos = n === 1 ? [[zona.cx, zona.cy, zona.s]] :
    [[zona.cx-zona.s*0.27, zona.cy-zona.s*0.22, zona.s*0.48],[zona.cx+zona.s*0.27, zona.cy-zona.s*0.22, zona.s*0.48],[zona.cx, zona.cy+zona.s*0.27, zona.s*0.48]];
  return pos.map(([x,y,s]) => `<g transform="translate(${(x-s/2).toFixed(1)} ${(y-s/2).toFixed(1)}) scale(${(s/100).toFixed(3)})">${figura(b.mueble, f)}</g>`).join('');
}
function escudoSVG(b, id, opts={}){
  const clip = `${id}-clip`;
  const blanco = opts.blanco;
  let inner = blanco ? `<rect width="200" height="240" fill="#F3F1EA"/>` : campos(b,id) + pieza(b,id) + muebles(b,id);
  if (!blanco && b.bordura) inner += `<path d="${SH[b.forma]}" fill="none" stroke="${pinta(b.eb,id)}" stroke-width="40"/><path d="${SH[b.forma]}" fill="none" stroke="#1B1A1A" stroke-width="42" stroke-opacity="0" />` + `<path d="${insetPath(b.forma)}" fill="none" stroke="#1B1A1A" stroke-width="1.5"/>`;
  return `<clipPath id="${clip}"><path d="${SH[b.forma]}"/></clipPath>
    <g clip-path="url(#${clip})">${inner}</g>
    <path d="${SH[b.forma]}" fill="none" stroke="#1B1A1A" stroke-width="3"/>
    ${blanco ? '' : `<path d="${SH[b.forma]}" fill="url(#${id}-brillo)" opacity=".35"/>`}`;
}
function insetPath(forma){
  // contorno interior aproximado de la bordura (20 px)
  return { espanol:'M20,20 H180 V140 A80,80 0 0 1 20,140 Z',
           apuntado:'M20,20 H180 V95 C180,152 140,192 100,216 C60,192 20,152 20,95 Z',
           frances:'M20,20 H180 V196 Q180,202 174,202 H118 Q100,202 100,214 Q100,202 82,202 H26 Q20,202 20,196 Z' }[forma];
}

/* Ornamentos exteriores según el grado */
function yelmo(){
  return `<g transform="translate(148 50) scale(1.3)">
    <path d="M10,96 C2,70 6,30 34,14 C52,4 70,8 76,26 L80,52 L74,58 L78,80 C80,92 72,98 60,98 Z" fill="#9AA4AE" stroke="#1B1A1A" stroke-width="3"/>
    <path d="M30,46 H78 M30,58 H76 M34,70 H78" stroke="#1B1A1A" stroke-width="3"/>
    <path d="M22,30 C36,16 54,12 68,18" stroke="#E7EBEE" stroke-width="3" fill="none" opacity=".8"/>
    <path d="M0,104 H80" stroke="#1B1A1A" stroke-width="6" stroke-linecap="round"/></g>`;
}
function lambrequines(c1, c2){
  const hoja = (s) => `<g transform="${s}"><path d="M196,150 C150,140 120,120 112,90 C130,110 150,112 160,104 C130,96 118,70 124,48 C138,78 160,88 176,86 C160,70 162,52 170,40 C176,70 190,90 200,100 Z" fill="${c1}" stroke="#1B1A1A" stroke-width="2.5"/>
     <path d="M190,140 C156,130 136,116 126,98 C146,112 164,114 172,108 C150,96 142,80 144,66 C156,86 172,94 186,92 Z" fill="${c2}" stroke="#1B1A1A" stroke-width="1.5"/></g>`;
  return hoja('') + hoja('translate(400 0) scale(-1 1)');
}
function cimera(tipo, c1, c2){
  if (tipo === 'vuelo') return `<g transform="translate(200 62)"><path d="M-4,8 C-30,-6 -44,-40 -36,-62 C-30,-44 -20,-40 -14,-46 C-20,-30 -14,-14 -4,-4 Z" fill="${c1}" stroke="#1B1A1A" stroke-width="2.5"/><path d="M4,8 C30,-6 44,-40 36,-62 C30,-44 20,-40 14,-46 C20,-30 14,-14 4,-4 Z" fill="${c1}" stroke="#1B1A1A" stroke-width="2.5"/></g>`;
  if (tipo === 'cruz') return `<g transform="translate(176 6) scale(.48)">${figura('flordelisada', c1)}</g>`;
  return `<g transform="translate(200 66)" stroke="#1B1A1A" stroke-width="2.5">
    <path d="M0,0 C-6,-20 -2,-44 0,-60 C6,-40 8,-18 0,0 Z" fill="${c2}"/>
    <path d="M-4,0 C-22,-12 -34,-34 -38,-50 C-24,-38 -10,-22 -4,0 Z" fill="${c1}"/>
    <path d="M4,0 C22,-12 34,-34 38,-50 C24,-38 10,-22 4,0 Z" fill="${c1}"/></g>`;
}
function coronaCondal(){
  let perlas=''; for(let i=0;i<9;i++){ const x=128+i*18; perlas+=`<path d="M${x},166 V156" stroke="#8A6A10" stroke-width="2.5"/><circle cx="${x}" cy="151" r="5.5" fill="#F3F1EA" stroke="#1B1A1A" stroke-width="1.5"/>`; }
  return `<g>${perlas}<path d="M122,166 H278 V180 H122 Z" fill="#D9A21B" stroke="#1B1A1A" stroke-width="2"/>
    <circle cx="160" cy="173" r="3.2" fill="#B3201F"/><circle cx="200" cy="173" r="3.6" fill="#1E4C9A"/><circle cx="240" cy="173" r="3.2" fill="#2B7A3A"/></g>`;
}
function pendones(c1, c2){
  const pen = (s) => `<g transform="${s}"><path d="M76,470 L338,30" stroke="#5B3B1E" stroke-width="5" stroke-linecap="round"/>
    <path d="M338,30 l-1,-16 l8,12 z" fill="#9AA4AE" stroke="#1B1A1A" stroke-width="1.5"/>
    <path d="M330,46 L392,52 L370,64 L390,78 L318,72 Z" fill="${c1}" stroke="#1B1A1A" stroke-width="2"/>
    <path d="M326,58 L376,63" stroke="${c2}" stroke-width="5"/></g>`;
  return pen('') + pen('translate(400 0) scale(-1 1)');
}
function manto(id){
  return `<path d="M200,92 C120,92 40,120 26,140 L14,480 C80,500 140,470 200,486 C260,470 320,500 386,480 L374,140 C360,120 280,92 200,92 Z" fill="url(#${id}-arminos)" stroke="#1B1A1A" stroke-width="2"/>
    <path d="M200,92 C120,92 40,120 26,140 L14,480 C40,488 52,470 60,452 C64,300 70,190 120,140 C150,116 176,108 200,108 C224,108 250,116 280,140 C330,190 336,300 340,452 C348,470 360,488 386,480 L374,140 C360,120 280,92 200,92 Z" fill="#9E1C1C" stroke="#1B1A1A" stroke-width="2"/>
    <path d="M160,92 C170,70 230,70 240,92" fill="#9E1C1C" stroke="#1B1A1A" stroke-width="2"/>`;
}
function cinta(texto){
  if (!texto) return '';
  const t = texto.replace(/[<>&]/g,'');
  return `<g><path d="M70,446 L52,476 L82,476 Z M330,446 L348,476 L318,476 Z" fill="#E9E2CF" stroke="#1B1A1A" stroke-width="2"/>
    <path d="M80,436 Q200,456 320,436 L320,470 Q200,490 80,470 Z" fill="#F3EEDF" stroke="#1B1A1A" stroke-width="2"/>
    <text x="200" y="463" text-anchor="middle" font-family="'EB Garamond',Georgia,serif" font-size="${t.length>30?13:16}" fill="#7A1712" font-style="italic" letter-spacing=".5">${t}</text></g>`;
}

/* Logro completo. estado: 'blanco' (escudero) | 'abatido' | normal; grado 1..4 */
function logroSVG(b, grado, estado){
  const id = 'h' + (++_uid);
  const defs = `<defs>${patrones(id)}<linearGradient id="${id}-brillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
    <filter id="${id}-gris"><feColorMatrix type="saturate" values="0.1"/></filter></defs>`;
  b = b || blasonVacio();
  if (estado === 'blanco') {
    return `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo raso">${defs}
      <g transform="translate(100 140)">${escudoSVG(b,id,{blanco:true})}</g>
      <text x="200" y="430" text-anchor="middle" font-family="'EB Garamond',Georgia,serif" font-size="18" fill="#6B5E4B" font-style="italic">Escudo raso: sin armas hasta ser armado</text></svg>`;
  }
  if (estado === 'abatido') {
    return `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Armas abatidas">${defs}
      <g filter="url(#${id}-gris)" transform="rotate(180 200 260)"><g transform="translate(100 140)">${escudoSVG(b,id)}</g></g>
      <path d="M60,150 L340,420 M70,140 L350,410" stroke="#111" stroke-width="22" opacity=".85"/>
      <text x="200" y="470" text-anchor="middle" font-family="'EB Garamond',Georgia,serif" font-size="20" fill="#3A2E25">Armas abatidas</text></svg>`;
  }
  const c1 = ESMALTES[b.e[0]].t==='forro' ? '#1E4C9A' : ESMALTES[b.e[0]].c;
  const metal = ['oro','plata'].includes(b.e[0]) ? (b.e[1] && ESMALTES[b.e[1]].t==='color' ? ESMALTES[b.e[1]].c : '#B3201F') : c1;
  const m2 = ESMALTES[b.em] ? (ESMALTES[b.em].t==='forro' ? '#F3F1EA' : ESMALTES[b.em].c) : '#D9A21B';
  const colorL = ESMALTES[b.e[0]].t==='metal' ? metal : c1;
  const metalL = ESMALTES[b.e[0]].t==='metal' ? ESMALTES[b.e[0]].c : (ESMALTES[b.em]&&ESMALTES[b.em].t==='metal'? ESMALTES[b.em].c : '#D9A21B');
  let s = `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Armas">${defs}`;
  if (grado >= 4) s += manto(id);
  if (grado >= 3) s += pendones(colorL, metalL);
  if (grado >= 2) s += lambrequines(colorL, metalL);
  if (grado >= 1) s += `<g transform="translate(0 ${grado>=4?-22:0})">${grado>=2?cimera(b.cimera, colorL, metalL):''}${yelmo()}</g>`;
  s += `<g transform="translate(100 180)">${escudoSVG(b,id)}</g>`;
  if (grado >= 4) s += `<g transform="translate(0 -2)">${coronaCondal()}</g>`;
  s += cinta(b.lema);
  return s + '</svg>';
}

/* Exportar a PNG (para compartir: «montar y mostrarse a las gentes», IV, §12) */
function svgAPng(svg, ancho, pie){
  return new Promise((ok, ko) => {
    const alto = Math.round(ancho * 1.45);
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = ancho; c.height = alto;
      const x = c.getContext('2d');
      x.fillStyle = '#F6F0E1'; x.fillRect(0,0,ancho,alto);
      const w = ancho*0.9, h = w*1.3;
      x.drawImage(img, (ancho-w)/2, ancho*0.05, w, h);
      if (pie) { x.fillStyle = '#7A1712'; x.textAlign='center'; x.font = `600 ${Math.round(ancho/22)}px 'EB Garamond', Georgia, serif`;
        pie.split('\n').forEach((l,i)=> x.fillText(l, ancho/2, ancho*0.05 + h + ancho*0.07 + i*ancho*0.06)); }
      c.toBlob(b => b ? ok(b) : ko(new Error('png')), 'image/png');
    };
    img.onerror = ko; img.src = url;
  });
}
