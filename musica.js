/* Código de Llull — música: el espíritu de la Orden de Caballería en todas las épocas.
   Solo entra lo que encarna el Código. Cada pieza abre la búsqueda en la plataforma elegida. */
'use strict';

const PLATAFORMAS = {
  spotify: { n:'Spotify', url: q => `https://open.spotify.com/search/${q}` },
  apple:   { n:'Apple Music', url: q => `https://music.apple.com/search?term=${q}` },
  youtube: { n:'YouTube Music', url: q => `https://music.youtube.com/search?q=${q}` }
};
const EPOCAS = { greg:'Gregoriano', med:'Medieval', pol:'Polifonía', bar:'Barroco', rom:'Romántico', xx:'Siglo XX', cine:'Cine', himno:'Himno' };

/* id: [título, autor, época, qué encarna, referencia del Libro] */
const OBRAS = {
  /* gregoriano */
  iamlucis:   ['Iam lucis orto sidere', 'canto gregoriano', 'greg', 'Himno de Prima: ofrecer a Dios el día antes que nada.', 'VI, §17'],
  splendor:   ['Splendor paternae gloriae', 'canto gregoriano', 'greg', 'Himno de Laudes de San Ambrosio: la luz que vence la noche.', 'VI, §17'],
  telucis:    ['Te lucis ante terminum', 'canto gregoriano', 'greg', 'Himno de Completas: guarda en la noche.', 'VI, §17'],
  alma:       ['Alma Redemptoris Mater', 'canto gregoriano', 'greg', 'Antífona mariana de Adviento y Navidad.', ''],
  avereg:     ['Ave Regina caelorum', 'canto gregoriano', 'greg', 'Antífona mariana de Cuaresma.', ''],
  reginacaeli:['Regina caeli', 'canto gregoriano', 'greg', 'Antífona mariana de Pascua.', ''],
  salve:      ['Salve Regina', 'canto gregoriano', 'greg', 'Antífona mariana del tiempo después de Pentecostés.', ''],
  venicreator:['Veni Creator Spiritus', 'canto gregoriano', 'greg', 'Invocación al Espíritu Santo: el caballero se deja gobernar por Él.', 'IV, §8'],
  venisancte: ['Veni Sancte Spiritus', 'canto gregoriano', 'greg', 'Secuencia de Pentecostés.', ''],
  tedeum:     ['Te Deum', 'canto gregoriano', 'greg', 'Acción de gracias de la Iglesia: investidura y ascensos.', 'IV, §13'],
  christus:   ['Christus vincit (Laudes regiae)', 'canto gregoriano', 'greg', 'Cristo vence, reina, impera: aclamación de los reyes cristianos.', 'II, §2'],
  vexilla:    ['Vexilla Regis prodeunt', 'canto gregoriano', 'greg', 'Avanzan los estandartes del Rey: la cruz como estandarte.', 'V, §19'],
  victimae:   ['Victimae paschali laudes', 'canto gregoriano', 'greg', 'Secuencia de Pascua: la muerte y la vida en duelo admirable.', ''],
  rorate:     ['Rorate caeli', 'canto gregoriano', 'greg', 'La espera de Adviento.', ''],
  attende:    ['Attende Domine', 'canto gregoriano', 'greg', 'Súplica penitencial de Cuaresma.', ''],
  parce:      ['Parce Domine', 'canto gregoriano', 'greg', 'Perdona, Señor, a Tu pueblo.', ''],
  ubicaritas: ['Ubi caritas et amor', 'canto gregoriano', 'greg', 'Donde hay caridad y amor, allí está Dios: contra la ira y la envidia.', 'VI, §5'],
  avemaris:   ['Ave maris stella', 'canto gregoriano', 'greg', 'Estrella del mar: guarda de la pureza.', 'VI, §10'],
  magnificat: ['Magnificat', 'canto gregoriano', 'greg', 'Derribó a los potentados de su trono y enalteció a los humildes.', 'VI, §13'],
  adoro:      ['Adoro te devote', 'canto gregoriano', 'greg', 'El verdadero tesoro: contra la codicia.', 'IV, §7'],
  pange:      ['Pange lingua gloriosi', 'canto gregoriano', 'greg', 'Himno del Corpus: el sacrificio del altar.', 'IV, §7'],
  mediavita:  ['Media vita in morte sumus', 'canto gregoriano', 'greg', 'En medio de la vida estamos en la muerte: las postrimerías.', 'IV, §5'],
  diesirae:   ['Dies irae', 'canto gregoriano', 'greg', 'El día del juicio: «vendrá y juzgará a buenos y malos».', 'IV, §5'],
  inparadisum:['In paradisum', 'canto gregoriano', 'greg', 'Al paraíso te lleven los ángeles: la muerte del justo.', 'IV, §5'],
  /* medieval */
  rosa:       ['Rosa das rosas (Cantiga 10)', 'Alfonso X el Sabio', 'med', 'Cantigas de Santa María, de los mismos años que el Libro.', ''],
  strela:     ['Santa Maria, strela do dia (Cantiga 100)', 'Alfonso X el Sabio', 'med', 'La estrella que guía en el camino.', ''],
  dumpater:   ['Dum pater familias (Ultreia)', 'Códice Calixtino', 'med', 'El himno de los peregrinos a Santiago: ¡adelante!', 'II, §2'],
  stella:     ['Stella splendens', 'Llibre Vermell de Montserrat', 'med', 'Canto de los peregrinos de Montserrat, en la Corona de Aragón.', ''],
  admortem:   ['Ad mortem festinamus', 'Llibre Vermell de Montserrat', 'med', 'Corremos hacia la muerte: el desprecio de la vanidad del mundo.', 'Prólogo'],
  setgoyts:   ['Los set goyts recomptarem', 'Llibre Vermell de Montserrat', 'med', 'Los siete gozos de la Virgen, en danza de peregrinos.', ''],
  cuncti:     ['Cuncti simus concanentes', 'Llibre Vermell de Montserrat', 'med', 'Danza de peregrinos: cantemos todos.', ''],
  estampie:   ['La quinte estampie real', 'anónimo, Manuscrit du Roi', 'med', 'Estampida del siglo XIII: el pulso de la cabalgada.', 'II, §10'],
  sibila:     ['El Cant de la Sibil·la', 'tradición de Mallorca', 'med', 'Se canta en Mallorca, la tierra de Llull, la noche de Navidad: el anuncio del Juicio.', 'IV, §5'],
  viderunt:   ['Viderunt omnes', 'Perotín', 'med', 'La escuela de Notre-Dame, en el París de San Luis.', ''],
  /* polifonía */
  hommejosq:  ['Missa L’homme armé super voces musicales', 'Josquin des Prez', 'pol', '«El hombre armado»: la misa sobre la canción del caballero.', ''],
  hommemor:   ['Missa L’homme armé', 'Cristóbal de Morales', 'pol', '«El hombre armado», en la polifonía española.', ''],
  parcemihi:  ['Parce mihi, Domine', 'Cristóbal de Morales', 'pol', 'Perdóname, Señor: la penitencia del caballero.', ''],
  miserere:   ['Miserere mei, Deus', 'Gregorio Allegri', 'pol', 'El salmo 50: la penitencia.', ''],
  magnummyst: ['O magnum mysterium', 'Tomás Luis de Victoria', 'pol', 'El gran misterio de la Navidad.', ''],
  oquam:      ['O quam gloriosum est regnum', 'Tomás Luis de Victoria', 'pol', 'El reino de los santos: Todos los Santos.', ''],
  officium:   ['Officium defunctorum', 'Tomás Luis de Victoria', 'pol', 'El oficio de difuntos.', ''],
  avevirgo:   ['Ave virgo sanctissima', 'Francisco Guerrero', 'pol', 'La Virgen, estrella del mar.', ''],
  /* barroco */
  combatt:    ['Il combattimento di Tancredi e Clorinda', 'Claudio Monteverdi', 'bar', 'El cruzado que mata en la ira y termina bautizando a quien venció.', 'VI, §15'],
  rinaldo:    ['Rinaldo: Marcha', 'Georg Friedrich Händel', 'bar', 'La marcha del cruzado de Godofredo de Bouillon.', 'II, §10'],
  comeif:     ['King Arthur: Come if you dare', 'Henry Purcell', 'bar', 'Los caballeros de Arturo a la batalla.', 'II, §10'],
  zadok:      ['Zadok the Priest', 'Georg Friedrich Händel', 'bar', 'La unción de Salomón: el rey sabio que juzga.', 'II, §9'],
  /* romántico y siglo XX */
  parsifalpre:['Parsifal: Preludio', 'Richard Wagner', 'rom', 'El Grial: la búsqueda del caballero puro.', 'VI, §10'],
  parsifalvs: ['Parsifal: Encantamiento del Viernes Santo', 'Richard Wagner', 'rom', 'La tierra reverdece cuando el caballero se redime.', 'VI, §4'],
  lohengrin:  ['Lohengrin: Preludio del acto I', 'Richard Wagner', 'rom', 'El Grial desciende: el caballero enviado a amparar.', 'II, §19'],
  infernem:   ['Lohengrin: In fernem Land', 'Richard Wagner', 'rom', 'El relato del Grial: el caballero que acude a defender a la indefensa.', 'II, §19'],
  tannhauser: ['Tannhäuser: Coro de los peregrinos', 'Richard Wagner', 'rom', 'El caballero caído que vuelve en penitencia.', ''],
  tristanpre: ['Tristán e Isolda: Preludio', 'Richard Wagner', 'rom', 'El pecado que deshizo la Tabla Redonda: aviso de la caída.', 'VI, §10'],
  sigfrido:   ['El ocaso de los dioses: Marcha fúnebre de Sigfrido', 'Richard Wagner', 'rom', 'La muerte del héroe.', ''],
  ofortuna:   ['Carmina Burana: O Fortuna', 'Carl Orff', 'xx', 'La rueda de la Fortuna: la carga, y la humildad en el triunfo.', 'VI, §13'],
  fortuneplango:['Carmina Burana: Fortune plango vulnera', 'Carl Orff', 'xx', 'Lloro las heridas de la Fortuna: quien hoy reina, mañana cae.', 'VI, §13'],
  quijote:    ['Don Quijote, Op. 35', 'Richard Strauss', 'xx', 'El caballero fuera de su tiempo, vencido y fiel.', ''],
  retablo:    ['El retablo de maese Pedro', 'Manuel de Falla', 'xx', 'Don Quijote acude a defender a Melisendra.', 'II, §19'],
  nevsky:     ['Alexander Nevsky: Levantaos, pueblo ruso', 'Serguéi Prokófiev', 'xx', 'Guardar la tierra.', 'II, §12'],
  /* cine */
  excalibur:  ['Excalibur (banda sonora)', 'Trevor Jones', 'cine', 'Investidura, gloria, caída, Grial y redención de la Tabla Redonda.', 'IV, §11'],
  nonnobis:   ['Henry V: Non nobis, Domine', 'Patrick Doyle', 'cine', 'No a nosotros, Señor: la humildad después de la victoria.', 'VI, §13'],
  elcid:      ['El Cid: Obertura', 'Miklós Rózsa', 'cine', 'El caballero castellano.', 'II, §10'],
  lotr:       ['El Señor de los Anillos: El retorno del Rey', 'Howard Shore', 'cine', 'Fidelidad hasta el final; el rey que vuelve.', 'VI, §4'],
  mision:     ['La misión: On Earth as It Is in Heaven', 'Ennio Morricone', 'cine', 'Dar la vida por los indefensos.', 'II, §19'],
  gabriel:    ['La misión: Gabriel’s Oboe', 'Ennio Morricone', 'cine', 'La paz del que ama.', 'VI, §5'],
  bandbro:    ['Band of Brothers: Requiem for a Soldier', 'Michael Kamen', 'cine', 'Lealtad entre compañeros de armas, hasta la muerte.', 'II, §8'],
  /* himno */
  muertefinal:['La muerte no es el final', 'Cesáreo Gabarain', 'himno', 'El homenaje a los caídos: la muerte honrosa.', 'II, §26']
};

/* Siete piezas por ánimo, mezclando épocas: una por día, en rotación semanal */
const MUSICA_ANIMO = {
  paz:         ['rosa','stella','avevirgo','gabriel','setgoyts','oquam','parsifalvs'],
  desalentado: ['venicreator','dumpater','strela','lotr','christus','nevsky','iamlucis'],
  airado:      ['ubicaritas','miserere','parcemihi','combatt','parsifalvs','gabriel','telucis'],
  engreido:    ['magnificat','nonnobis','ofortuna','fortuneplango','mediavita','admortem','diesirae'],
  codicioso:   ['adoro','pange','mision','fortuneplango','ubicaritas','parsifalpre','admortem'],
  tentado:     ['avemaris','parsifalpre','rosa','salve','avevirgo','lohengrin','venicreator'],
  resentido:   ['ubicaritas','mision','combatt','parcemihi','gabriel','miserere','magnificat'],
  destemplado: ['attende','parce','admortem','mediavita','fortuneplango','iamlucis','tannhauser'],
  temeroso:    ['christus','hommejosq','hommemor','vexilla','nevsky','elcid','excalibur']
};
const MUSICA_CIRC = {
  batalla:['ofortuna','elcid','nevsky','comeif'], juicio:['zadok','diesirae'], corte:['nonnobis','magnificat'],
  camino:['dumpater','strela','quijote'], debiles:['infernem','mision','retablo'], derrota:['quijote','lotr','parsifalvs'],
  enfermedad:['parsifalvs','salve'], prosperidad:['fortuneplango','ofortuna','nonnobis']
};
const MUSICA_MOMENTO = {
  manana:     ['iamlucis','splendor','strela'],
  ejercicio:  ['estampie','cuncti','admortem','rinaldo','comeif','elcid','nevsky','ofortuna'],
  vela:       ['venicreator','parsifalpre','lohengrin','telucis'],
  investidura:['excalibur','tedeum','christus','hommejosq','zadok'],
  ascenso:    ['tedeum','nonnobis','ofortuna','zadok'],
  caida:      ['tristanpre','parce','miserere'],
  penitencia: ['tannhauser','miserere','attende','parcemihi','parsifalvs'],
  difuntos:   ['inparadisum','officium','diesirae','sigfrido','bandbro','muertefinal']
};
const MUSICA_TIEMPO = {
  adviento:['rorate','alma'], navidad:['sibila','magnummyst','alma'], cuaresma:['attende','mediavita'],
  pasion:['vexilla','parcemihi'], pascua:['victimae','reginacaeli'], pentecostes:['venisancte','venicreator'],
  difuntos:['oquam','inparadisum','officium','muertefinal']
};
const MUSICA_SANTOS = { '7-25':['dumpater'], '5-30':['rosa'], '8-25':['viderunt'], '9-29':['christus'], '4-23':['christus'], '11-11':['mision'] };

/* El eje: Excalibur — la historia de la Tabla Redonda en los momentos de la app */
const EJE_EXCALIBUR = [
  ['Vela de armas', 'parsifalpre', 'El Grial: la búsqueda que empieza.'],
  ['Investidura', 'excalibur', 'El momento de ser armado.'],
  ['Ascenso, batalla, prueba física', 'ofortuna', 'La carga; y la rueda que sube y baja.'],
  ['Caída por vicio, balanza en rojo', 'tristanpre', 'El pecado que deshizo la Tabla Redonda.'],
  ['Penitencia y redención', 'parsifalvs', 'La tierra que reverdece cuando el caballero se redime.'],
  ['Expulsión, difuntos', 'sigfrido', 'La muerte del héroe.']
];

/* Vínculos que el caballero puede dar a sus propias piezas */
const VINCULOS = [
  ...ANIMOS.map(a => [a.id, a.nombre]),
  ['manana','Mañana'], ['noche','Noche'], ['ejercicio','Ejercicio y marcha'],
  ['batalla','Batalla'], ['camino','Camino'], ['debiles','Servicio a los débiles'], ['derrota','Derrota'], ['prosperidad','Prosperidad'],
  ['vela','Vela de armas'], ['investidura','Investidura'], ['ascenso','Ascenso'], ['penitencia','Penitencia']
];
function cancioneroInicial(){ return [{ id:'c1', t:'Exploradores', c:'Loquillo', v:['camino','ejercicio'] }]; }

/* ---------- tiempo litúrgico y antífona mariana de Completas ---------- */
function inicioAdviento(y){ let d = new Date(y, 11, 24); while (d.getDay() !== 0) d = addDias(d, -1); return addDias(d, -21); }
function tiempoLiturgico(d){
  const y = d.getFullYear(), P = pascua(y), adv = inicioAdviento(y);
  const md = (d.getMonth()+1) * 100 + d.getDate();
  if (md === 1101 || md === 1102) return 'difuntos';
  if (d >= adv && md <= 1224) return 'adviento';
  if (md >= 1224 || md <= 106) return 'navidad';
  if (d >= addDias(P, -14) && d < P) return 'pasion';
  if (d >= addDias(P, -46) && d < P) return 'cuaresma';
  if (d >= addDias(P, 49) && d <= addDias(P, 55)) return 'pentecostes';
  if (d >= P && d < addDias(P, 49)) return 'pascua';
  return null;
}
function antifonaMariana(d){
  const y = d.getFullYear(), P = pascua(y), md = (d.getMonth()+1) * 100 + d.getDate();
  if (d >= inicioAdviento(y) || md <= 202) return 'alma';
  if (d < P) return 'avereg';
  if (d <= addDias(P, 55)) return 'reginacaeli';
  return 'salve';
}

/* ---------- abrir una pieza ---------- */
function urlPieza(t, c){
  const q = encodeURIComponent(`${t} ${c}`.replace(/\s*\(.*?\)\s*/g, ' ').trim());
  const P = PLATAFORMAS[(S.ajustes && S.ajustes.plataforma) || 'spotify'] || PLATAFORMAS.spotify;
  return P.url(q);
}
function filaPieza(id, motivo){
  const p = OBRAS[id]; if (!p) return '';
  return `<div class="prueba"><a class="btn sec" style="min-width:44px;padding:0 12px" href="${urlPieza(p[0], p[1])}" target="_blank" rel="noopener" aria-label="Escuchar ${esc(p[0])}">▶</a>
    <div class="txt"><b>${esc(p[0])}</b><span class="peq">${esc(p[1])} · <span class="tag">${EPOCAS[p[2]]}</span>${motivo ? ` · ${esc(motivo)}` : ''}</span><br><span>${esc(p[3])}</span>${p[4] ? ` <span class="ref">${esc(p[4])}</span>` : ''}</div></div>`;
}
function filaPropia(x, motivo){
  return `<div class="prueba"><a class="btn sec" style="min-width:44px;padding:0 12px" href="${urlPieza(x.t, x.c)}" target="_blank" rel="noopener" aria-label="Escuchar ${esc(x.t)}">▶</a>
    <div class="txt"><b>${esc(x.t)}</b><span class="peq">${esc(x.c)} · <span class="tag v">Mi cancionero</span>${motivo ? ` · ${esc(motivo)}` : ''}</span></div></div>`;
}
function lista(ids, motivo){ return ids.map(id => filaPieza(id, motivo)).join(''); }
function propiasDe(vinc){ return (S.cancionero || []).filter(x => (x.v || []).some(v => vinc.includes(v))); }

/* ---------- la música del día ---------- */
function semanaDelAno(d){ return Math.floor(diaDelAno(d) / 7); }
function musicaDelDia(h, dia){
  const d = deISO(h), dow = (d.getDay() + 6) % 7, rot = (dow + semanaDelAno(d)) % 7;
  const filas = [], vinc = [];
  const an = (dia && dia.animo) || 'paz', ci = dia && dia.circ;
  const A = ANIMOS.find(a => a.id === an);
  const hn = parseInt(((S.ajustes && S.ajustes.horaNoche) || '22:00').split(':')[0], 10);
  const noche = new Date().getHours() >= Math.min(19, hn - 3);
  // contexto de la Orden
  const I = typeof estadoInvestidura === 'function' ? estadoInvestidura() : null;
  const hoyEv = (S.historial || []).filter(x => x.fecha === h);
  if (S.situacion === 'aspirante' && I && I.vigilia) { filas.push(['vela', 'Vela de armas']); vinc.push('vela'); }
  if (S.situacion === 'aspirante' && I && I.dia) { filas.push(['investidura', 'Investidura']); vinc.push('investidura'); }
  if (hoyEv.some(x => /^Asciende|^Armad/.test(x.evento))) { filas.push(['ascenso', 'Ascenso']); vinc.push('ascenso'); }
  if (hoyEv.some(x => /rojo|Pierde con deshonor|Degradación/.test(x.evento))) filas.push(['caida', 'Caída']);
  if (S.situacion === 'expulsado') { filas.push(['penitencia', 'Penitencia']); vinc.push('penitencia'); }
  let s = '';
  for (const [m, n] of filas) s += lista(MUSICA_MOMENTO[m].slice(0, 2), n);
  // ánimo
  const L = MUSICA_ANIMO[an] || MUSICA_ANIMO.paz;
  s += filaPieza(L[rot % L.length], A && A.vicio ? `contra la ${A.vicio}` : 'para hoy');
  vinc.push(an);
  // circunstancia
  if (ci && MUSICA_CIRC[ci]) { const C = MUSICA_CIRC[ci]; s += filaPieza(C[rot % C.length], (CIRCUNSTANCIAS.find(c => c.id === ci) || {}).nombre); vinc.push(ci); }
  // tiempo litúrgico y santos
  const T = tiempoLiturgico(d);
  if (T) { const TL = MUSICA_TIEMPO[T]; s += filaPieza(TL[dow % TL.length], 'tiempo litúrgico'); }
  const k = `${d.getMonth()+1}-${d.getDate()}`;
  if (MUSICA_SANTOS[k]) s += filaPieza(MUSICA_SANTOS[k][0], SANTOS_CABALLEROS[k] ? SANTOS_CABALLEROS[k][0] : 'santo del día');
  // momento
  if (noche) { s += filaPieza('telucis', 'Completas') + filaPieza(antifonaMariana(d), 'antífona de la noche'); vinc.push('noche'); }
  else { const M = MUSICA_MOMENTO.manana; s += filaPieza(M[dow % M.length], 'mañana'); vinc.push('manana'); }
  // cancionero propio
  s += propiasDe(vinc).map(x => filaPropia(x, 'tuya')).join('');
  return s;
}
function tarjetaMusica(h, dia){
  const plat = PLATAFORMAS[(S.ajustes && S.ajustes.plataforma) || 'spotify'];
  return `<details class="card plegable"><summary>Música del día · <span class="peq">${esc(plat.n)}</span></summary>
    <div style="margin-top:6px">${musicaDelDia(h, dia)}</div>
    <p class="peq" style="margin-top:6px"><a href="#" data-a="sub" data-t="mas" data-v="musica">Toda la música y Mi cancionero</a> · cambia la plataforma allí.</p></details>`;
}

/* ---------- pantalla Música (Más) ---------- */
function vistaMusica(){
  const plat = (S.ajustes && S.ajustes.plataforma) || 'spotify';
  const nuevo = TMP.nuevaPieza || { t:'', c:'', v:[] };
  const sec = (t, html, abierto) => `<details class="card plegable"${abierto ? ' open' : ''}><summary>${t}</summary><div style="margin-top:6px">${html}</div></details>`;
  let s = `<h1>Música</h1>
    <div class="card roja"><p>El espíritu de la Orden de Caballería en todas las épocas: del gregoriano y las <i>Cantigas</i> a Wagner, el cine y lo que tú añadas. Solo entra lo que encarna el Código: una virtud, un oficio o un momento del camino del caballero.</p>
      <p class="peq">Cada pieza abre la búsqueda en la plataforma que elijas.</p>
      <div class="chips">${Object.entries(PLATAFORMAS).map(([k, p]) => `<button class="chip ${plat===k?'on':''}" data-a="plataforma" data-v="${k}">${p.n}</button>`).join('')}</div></div>`;
  // Mi cancionero
  const C = S.cancionero || [];
  s += sec('Mi cancionero', `<p class="peq">Tus propias piezas: elige a qué ánimo o momento corresponde cada una, y aparecerán en la música del día.</p>
    ${C.length ? C.map(x => `<div class="prueba"><a class="btn sec" style="min-width:44px;padding:0 12px" href="${urlPieza(x.t, x.c)}" target="_blank" rel="noopener">▶</a>
      <div class="txt"><b>${esc(x.t)}</b><span class="peq">${esc(x.c)}</span><br><span class="peq">${(x.v||[]).map(v => esc((VINCULOS.find(z => z[0]===v)||[,v])[1])).join(' · ') || 'sin vínculo'}</span></div>
      <button class="btn sec" data-a="borrarPropia" data-v="${esc(x.id)}" aria-label="Quitar">${TMP.borrarPropia===x.id?'¿Quitar?':'✕'}</button></div>`).join('') : '<p>Aún no has añadido piezas.</p>'}
    <h3 style="margin-top:12px">Añadir una pieza</h3>
    <label class="campo"><span>Título</span><input type="text" id="npT" maxlength="80" value="${esc(nuevo.t)}"></label>
    <label class="campo"><span>Autor o intérprete</span><input type="text" id="npC" maxlength="60" value="${esc(nuevo.c)}"></label>
    <p class="peq" style="margin:4px 0">¿Para qué ánimo o momento?</p>
    <div class="chips">${VINCULOS.map(([k, n]) => `<button class="chip ${nuevo.v.includes(k)?'on':''}" data-a="npV" data-v="${k}">${esc(n)}</button>`).join('')}</div>
    <button class="btn" data-a="npAdd">Añadir a Mi cancionero</button>`, true);
  // eje Excalibur
  s += sec('El eje: Excalibur', `<p class="peq"><i>Excalibur</i> (Boorman, 1981) cuenta el camino del Código: la investidura, la gloria de la Orden, el pecado que hiere al rey y arruina la tierra, la búsqueda del Grial, la redención y la muerte del rey. Su música marca los grandes momentos de la app.</p>
    ${EJE_EXCALIBUR.map(([m, id, d]) => filaPieza(id, m)).join('')}`);
  // momentos y ceremonias
  const nombresM = { manana:'Mañana', ejercicio:'Ejercicio y marcha con arnés', vela:'Vela de armas', investidura:'Investidura', ascenso:'Ascenso', caida:'Caída', penitencia:'Penitencia y redención', difuntos:'Difuntos y caídos' };
  s += sec('Momentos y ceremonias', Object.entries(nombresM).map(([k, n]) => `<h3 style="margin-top:10px">${n}</h3>${lista(MUSICA_MOMENTO[k])}`).join('')
    + `<h3 style="margin-top:10px">Noche: Completas</h3>${filaPieza('telucis')}${['alma','avereg','reginacaeli','salve'].map(id => filaPieza(id)).join('')}`);
  // por ánimo
  s += sec('Por ánimo', ANIMOS.map(a => `<h3 style="margin-top:10px">${esc(a.nombre)}${a.vicio ? ` <span class="peq">· contra la ${esc(a.vicio)}</span>` : ''}</h3>${lista(MUSICA_ANIMO[a.id] || [])}`).join(''));
  // tiempos litúrgicos
  const nombresT = { adviento:'Adviento', navidad:'Navidad', cuaresma:'Cuaresma', pasion:'Tiempo de Pasión', pascua:'Pascua', pentecostes:'Pentecostés', difuntos:'Todos los Santos y Difuntos' };
  s += sec('Tiempos litúrgicos', Object.entries(nombresT).map(([k, n]) => `<h3 style="margin-top:10px">${n}</h3>${lista(MUSICA_TIEMPO[k])}`).join(''));
  return s;
}
