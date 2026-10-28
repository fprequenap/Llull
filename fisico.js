/* Código de Llull — preparación física (III, §17; II, §10), ejercicios, nutrición y ayunos. */
'use strict';

/* Franjas de edad */
function franja(edad){
  if (edad < 30) return 'a';
  if (edad < 40) return 'b';
  if (edad < 50) return 'c';
  if (edad < 60) return 'd';
  if (edad < 65) return 'e';
  return 'f';
}
const FRANJA_NOMBRE = { a:'14–29', b:'30–39', c:'40–49', d:'50–59', e:'60–64', f:'65 y más' };

/* Coeficiente físico: solo edad, decreciente */
function coefFisico(edad){ return { a:1.30, b:1.22, c:1.15, d:1.07, e:1.00, f:1.00 }[franja(edad)]; }

/* Coeficiente moral: edad + grado, creciente */
function compEdad(edad){ return { a:0, b:4, c:8, d:11, e:15, f:15 }[franja(edad)]; }
function coefMoral(edad, grado){ return (100 + compEdad(edad) + GRADOS[grado].comp) / 100; }

/* Tabla base (100 %), varones */
const TABLA = {
  a:{ flex:30, sent:50, plancha:120, dom:5, carrera:[10,60], marcha:[8,12,90] },
  b:{ flex:25, sent:40, plancha:105, dom:3, carrera:[10,65], marcha:[8,12,95] },
  c:{ flex:20, sent:35, plancha:90,  dom:1, carrera:[6,40],  marcha:[6,10,75] },
  d:{ flex:15, sent:30, plancha:75,  dom:0, carrera:[6,45],  marcha:[6,8,80] },
  e:{ flex:10, sent:20, plancha:60,  dom:0, carrera:[3,25],  marcha:[4,6,60] },
  f:{ flex:10, sent:15, plancha:45,  dom:0, carrera:[3,40],  marcha:[3,4,50] }
};
const SUSPENSION_F = { a:30, b:25, c:20, d:15, e:0, f:0 };

/* Pruebas de la tabla con el objetivo ya calculado para edad, sexo y coeficiente */
function pruebasFisicas(edad, sexo){
  const fr = franja(edad), t = TABLA[fr], k = coefFisico(edad), fem = sexo === 'f', mayor = fr === 'f';
  const L = [];
  const reps = (base, fac) => Math.ceil(base * (fac||1) * k);
  L.push({ id:'flex', nombre: mayor ? 'Flexiones inclinadas (manos en mesa o banco)' : 'Flexiones seguidas', unidad:'rep', obj: reps(t.flex, fem?0.6:1), tipo:'min' });
  L.push({ id:'sent', nombre: mayor ? 'Sentadillas a silla (levantarse y sentarse)' : 'Sentadillas seguidas', unidad:'rep', obj: reps(t.sent, fem?0.9:1), tipo:'min' });
  const amin = s => Math.ceil(s / 60 * 100) / 100;   // segundos → minutos decimales, redondeo hacia arriba
  L.push({ id:'plancha', nombre:'Plancha abdominal', unidad:'min', obj: amin(t.plancha * (fem?0.9:1) * k), tipo:'min' });
  if (fem && SUSPENSION_F[fr] > 0) L.push({ id:'dom', nombre:'Suspensión en barra', unidad:'min', obj: amin(SUSPENSION_F[fr]*k), tipo:'min' });
  else if (!fem && t.dom > 0) L.push({ id:'dom', nombre:'Dominadas', unidad:'rep', obj: reps(t.dom), tipo:'min' });
  const tf = fem ? 1.12 : 1;
  L.push({ id:'carrera', nombre: mayor ? `Marcha a paso vivo, ${t.carrera[0]} km` : `Carrera, ${t.carrera[0]} km`, unidad:'min', obj: Math.floor(t.carrera[1]*tf/k), tipo:'max' });
  const carga = Math.max(2, t.marcha[1] - (fem?2:0));
  L.push({ id:'marcha', nombre:`Marcha con arnés: ${t.marcha[0]} km con ${carga} kg`, unidad:'min', obj: Math.floor(t.marcha[2]*tf/k), tipo:'max' });
  return L;
}
function fmtObj(p){
  if (p.unidad === 'min') return (p.tipo === 'max' ? 'menos de ' : 'al menos ') + numES(p.obj) + ' min';
  return `${p.obj}`;
}
/* Números con coma o punto decimal (el teclado numérico de Android usa coma) */
function numero(v){ if (v == null) return null; const n = parseFloat(String(v).trim().replace(',', '.')); return isNaN(n) ? null : n; }
function numES(n){ return Number(n).toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function cumple(p, valor){ const v = numero(valor); if (v == null) return false; return p.tipo === 'max' ? v <= p.obj : v >= p.obj; }

/* Disciplinas opcionales (II, §10) — multiplican la honra del día */
const OPCIONALES = [
  { id:'equitacion', nombre:'Equitación', mult:1.5, ref:'«correr a caballo» (II, §10)', joven:true },
  { id:'esgrima', nombre:'Esgrima, histórica u olímpica', mult:1.4, ref:'«la esgrima» (II, §10)', joven:true },
  { id:'caza', nombre:'Caza, con licencia', mult:1.3, ref:'«cazar ciervos, osos, jabalíes» (II, §10)', joven:true },
  { id:'lucha', nombre:'Lucha o artes marciales', mult:1.3, ref:'«andar con armas, los torneos» (II, §10)', joven:true },
  { id:'arco', nombre:'Tiro con arco', mult:1.2, ref:'«otros ejercicios semejantes» (II, §10)' },
  { id:'natacion', nombre:'Natación', mult:1.2, ref:'«otros ejercicios semejantes» (II, §10)' },
  { id:'montana', nombre:'Montañismo', mult:1.2, ref:'«otros ejercicios semejantes» (II, §10)' },
  /* el viejo caballero: «leía un libro que tenía en el regazo» (Prólogo) */
  { id:'lectura', nombre:'Lectura (el Libro, la Escritura, los Padres)', mult:1.5, ref:'el viejo caballero leía junto a la fuente (Prólogo)', mayor:true },
  { id:'escritura', nombre:'Escritura', mult:1.4, ref:'el libro escrito para el escudero (Prólogo)', mayor:true },
  { id:'ensenar', nombre:'Enseñar a otro', mult:1.4, ref:'el viejo caballero adoctrina al escudero (Prólogo)', mayor:true },
  { id:'artes', nombre:'Pintura, música o artes', mult:1.3, ref:'', mayor:true },
  { id:'caligrafia', nombre:'Copia o caligrafía', mult:1.2, ref:'', mayor:true }
];
function opcionalesDisponibles(edad){
  const mayor = edad >= 65;
  return OPCIONALES.filter(o => mayor ? !o.joven : !o.mayor);
}
const TOPE_MULT = 2.5;

/* ---------- Biblioteca de ejercicios ---------- */
/* g: grupo; n: nivel 1-3; m65: apto para mayores de 65; u: rep|s */
const EJERCICIOS = [
  // calentamiento
  { id:'movart', g:'cal', nombre:'Movilidad articular', d:'Círculos de cuello, hombros, cadera, rodillas y tobillos, 10 en cada sentido.', u:'min', base:3, m65:true },
  { id:'marchasitio', g:'cal', nombre:'Marcha en el sitio', d:'Elevando rodillas y braceando.', u:'min', base:2, m65:true },
  { id:'saltoscomba', g:'cal', nombre:'Saltos suaves o comba', d:'Saltos bajos sobre la punta de los pies.', u:'min', base:2, m65:false },
  // fuerza tren superior
  { id:'flexiones', g:'sup', nombre:'Flexiones', d:'Cuerpo recto, pecho al suelo, codos a 45°.', u:'rep', base:12, n:2 },
  { id:'flexrodillas', g:'sup', nombre:'Flexiones con rodillas apoyadas', d:'Igual que la flexión, apoyando las rodillas.', u:'rep', base:10, n:1 },
  { id:'flexinclin', g:'sup', nombre:'Flexiones inclinadas', d:'Manos sobre mesa o banco firme.', u:'rep', base:10, n:1, m65:true },
  { id:'fondos', g:'sup', nombre:'Fondos en silla', d:'Manos en el borde de una silla, bajar doblando codos.', u:'rep', base:10, n:2 },
  { id:'dominadas', g:'sup', nombre:'Dominadas', d:'Desde suspensión completa, barbilla sobre la barra.', u:'rep', base:4, n:3 },
  { id:'remomesa', g:'sup', nombre:'Remo invertido bajo mesa', d:'Tumbado bajo una mesa firme, tirar del pecho hacia el borde.', u:'rep', base:10, n:2 },
  { id:'pikepush', g:'sup', nombre:'Flexiones en pica', d:'Cadera alta, cabeza hacia el suelo entre las manos.', u:'rep', base:8, n:3 },
  { id:'parapared', g:'sup', nombre:'Empuje contra pared', d:'De pie frente a la pared, flexión de brazos.', u:'rep', base:12, n:1, m65:true },
  // tren inferior
  { id:'sentadillas', g:'inf', nombre:'Sentadillas', d:'Pies al ancho de hombros, bajar hasta muslos paralelos.', u:'rep', base:20, n:1 },
  { id:'zancadas', g:'inf', nombre:'Zancadas alternas', d:'Paso largo, rodilla trasera cerca del suelo.', u:'rep', base:12, n:2 },
  { id:'sentsalto', g:'inf', nombre:'Sentadilla con salto', d:'Sentadilla y salto vertical controlado.', u:'rep', base:10, n:3 },
  { id:'bulgara', g:'inf', nombre:'Sentadilla búlgara', d:'Pie trasero sobre una silla, bajar en vertical.', u:'rep', base:8, n:3 },
  { id:'sentsilla', g:'inf', nombre:'Levantarse de la silla', d:'Sin ayuda de las manos, despacio.', u:'rep', base:10, n:1, m65:true },
  { id:'gemelos', g:'inf', nombre:'Elevación de talones', d:'De pie, subir y bajar sobre las puntas.', u:'rep', base:20, n:1, m65:true },
  { id:'puente', g:'inf', nombre:'Puente de glúteo', d:'Tumbado boca arriba, elevar la cadera.', u:'rep', base:15, n:1, m65:true },
  { id:'escalon', g:'inf', nombre:'Subir escalón', d:'Subir y bajar un escalón alternando pierna.', u:'rep', base:12, n:1, m65:true },
  // tronco
  { id:'plancha', g:'tro', nombre:'Plancha', d:'Sobre antebrazos, cuerpo recto, sin hundir la cadera.', u:'s', base:40, n:1 },
  { id:'planchalat', g:'tro', nombre:'Plancha lateral', d:'Sobre un antebrazo, cuerpo alineado; cada lado.', u:'s', base:25, n:2 },
  { id:'escaladores', g:'tro', nombre:'Escaladores', d:'En plancha alta, llevar rodillas al pecho alternando.', u:'s', base:30, n:2 },
  { id:'superman', g:'tro', nombre:'Superman', d:'Boca abajo, elevar brazos y piernas a la vez.', u:'rep', base:12, n:1 },
  { id:'birddog', g:'tro', nombre:'Perro de muestra', d:'A cuatro patas, extender brazo y pierna contrarios.', u:'rep', base:10, n:1, m65:true },
  { id:'planchainc', g:'tro', nombre:'Plancha inclinada', d:'Antebrazos sobre una mesa.', u:'s', base:30, n:1, m65:true },
  // resistencia
  { id:'carrera', g:'res', nombre:'Carrera continua', d:'Ritmo que permita hablar con frases cortas.', u:'min', base:20, n:2 },
  { id:'intervalos', g:'res', nombre:'Carrera a intervalos', d:'1 min rápido, 2 min suave.', u:'min', base:16, n:3 },
  { id:'marchaviva', g:'res', nombre:'Marcha a paso vivo', d:'Paso largo y rápido, brazos activos.', u:'min', base:25, n:1, m65:true },
  { id:'marchacarga', g:'res', nombre:'Marcha con mochila cargada', d:'Mochila ajustada a la espalda; el arnés del caballero.', u:'min', base:30, n:2 },
  { id:'burpees', g:'res', nombre:'Burpees', d:'Sentadilla, plancha, flexión, salto.', u:'rep', base:10, n:3 },
  { id:'escaleras', g:'res', nombre:'Subir escaleras', d:'Tramos continuos a ritmo constante.', u:'min', base:8, n:2 },
  { id:'bici', g:'res', nombre:'Bicicleta', d:'Ritmo sostenido.', u:'min', base:30, n:1, m65:true },
  // movilidad / equilibrio
  { id:'estiram', g:'mov', nombre:'Estiramientos generales', d:'Isquiotibiales, cuádriceps, pecho, espalda: 30 s cada uno.', u:'min', base:5, m65:true },
  { id:'equilibrio', g:'mov', nombre:'Equilibrio sobre un pie', d:'Junto a un apoyo; cada pie.', u:'s', base:30, m65:true },
  { id:'gatovaca', g:'mov', nombre:'Gato y vaca', d:'A cuatro patas, arquear y redondear la espalda.', u:'rep', base:10, m65:true },
  { id:'caderas', g:'mov', nombre:'Apertura de caderas', d:'Zancada profunda sostenida; cada lado.', u:'s', base:30 },
  { id:'respiracion', g:'mov', nombre:'Respiración y recogimiento', d:'Respiración lenta; puede acompañarse de una oración.', u:'min', base:2, m65:true }
];

/* Genera una sesión: objetivo fuerza | resistencia | movilidad | completa; duración en minutos */
function generarRutina(opts){
  const { edad, sexo, objetivo, duracion, semilla } = opts;
  const mayor = edad >= 65;
  const k = coefFisico(edad) * (sexo === 'f' ? 0.9 : 1);
  const nivel = mayor ? 1 : (edad < 40 ? 3 : edad < 55 ? 2 : 1);
  let r = semilla || Date.now();
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const apto = e => (mayor ? e.m65 : true) && (e.n == null || e.n <= nivel);
  const pick = (g, n) => {
    const c = EJERCICIOS.filter(e => e.g === g && apto(e));
    const out = [];
    while (out.length < n && c.length) out.push(c.splice(Math.floor(rnd()*c.length),1)[0]);
    return out;
  };
  const dosis = e => {
    let v = e.base;
    if (e.u === 'rep' || e.u === 's') v = Math.max(1, Math.round(e.base * k));
    return e.u === 'rep' ? `${v} rep.` : e.u === 's' ? `${v} s` : `${v} min`;
  };
  const cal = pick('cal', 2), vuelta = [EJERCICIOS.find(e=>e.id==='estiram'), EJERCICIOS.find(e=>e.id==='respiracion')];
  let principal = [], series = 3, formato = '';
  const tiempo = duracion - 10;
  if (objetivo === 'fuerza') { principal = [...pick('sup',2), ...pick('inf',2), ...pick('tro',1)]; series = tiempo >= 30 ? 4 : 3; formato = `${series} vueltas al circuito, 60 s de descanso entre vueltas`; }
  else if (objetivo === 'resistencia') { principal = pick('res', 1); const extra = pick('res',1).filter(e=>e.u==='rep'); principal = principal.concat(extra); series = 1; formato = `Bloque continuo de ${tiempo} min`; }
  else if (objetivo === 'movilidad') { principal = [...pick('mov',3), ...pick('tro',1)]; series = 2; formato = '2 vueltas, sin prisa'; }
  else { principal = [pick('sup',1)[0], pick('inf',1)[0], pick('tro',1)[0], pick('res',1)[0]].filter(Boolean); series = tiempo >= 30 ? 3 : 2; formato = `${series} vueltas, 45 s de descanso entre ejercicios`; }
  const map = e => ({ nombre:e.nombre, d:e.d, dosis: (objetivo==='resistencia' && e.u==='min') ? `${tiempo} min` : dosis(e) });
  return { nivel, calentamiento: cal.map(map), principal: principal.map(map), vuelta: vuelta.map(map), formato };
}

/* Plan semanal orientativo */
function planSemanal(edad){
  if (edad >= 65) return ['Marcha a paso vivo + equilibrio','Fuerza suave','Marcha','Movilidad','Fuerza suave','Marcha larga','Domingo: descanso del Señor, paseo en familia'];
  if (edad >= 50) return ['Fuerza','Carrera o marcha','Movilidad','Fuerza','Marcha con arnés','Disciplina opcional o carrera','Domingo: descanso del Señor, paseo'];
  return ['Fuerza','Carrera','Fuerza','Intervalos','Fuerza y tronco','Marcha con arnés o disciplina opcional','Domingo: descanso del Señor, paseo'];
}

/* ---------- Nutrición: la templanza en la mesa ---------- */
const NUTRICION = {
  principio: [
    ['La gula engendra flaqueza de corazón por el hartazgo y el embarazo del cuerpo; trae pobreza por el gasto excesivo.','VI, §9'],
    ['El caballero bien acostumbrado debe ser templado en el ardimiento, en el comer y beber, en el hablar.','VI, §16']
  ],
  reglas: [
    'Comer a horas fijas: tres comidas, sin picar entre horas.',
    'Levantarse de la mesa con un poco de apetito; no repetir.',
    'Base diaria: verduras, legumbres, fruta, pan, aceite de oliva.',
    'Proteína en cada comida principal: pescado, huevos, legumbres, carne con moderación.',
    'Agua como bebida ordinaria. Vino, si se toma, con la comida y con medida; nunca destilados en exceso.',
    'Pocos dulces y ultraprocesados; los dulces quedan para las fiestas.',
    'Bendecir la mesa y dar gracias al terminar.'
  ],
  edad: {
    a:'Edad de crecimiento y de mayor trabajo físico: no restringir la energía en días de entrenamiento; legumbres, cereales, huevos y lácteos en abundancia.',
    b:'Mantener el peso de combate: cantidades medidas, cenas ligeras, verduras en cada comida.',
    c:'Vigilar el exceso de sal, de azúcar y de alcohol; aumentar pescado azul y verduras.',
    d:'Más proteína y menos harinas refinadas; pescado azul dos o tres veces por semana.',
    e:'Proteína repartida en las tres comidas, lácteos para el calcio, beber agua aunque no haya sed.',
    f:'Proteína en cada comida, calcio y vitamina D (lácteos, pescado, sol de la mañana), hidratación vigilada y comidas fáciles de masticar. Si sigues un tratamiento médico o una dieta prescrita, prevalece el criterio de tu médico.'
  },
  ayuno: 'Día de ayuno (CIC 1917, c. 1251): una sola comida completa al día; se permiten además dos colaciones pequeñas, por la mañana y por la noche, que juntas no igualen la comida principal.',
  abstinencia: 'Día de abstinencia (CIC 1917, c. 1250): no se come carne ni caldo de carne. Se permiten huevos, lácteos y condimentos de grasa animal.',
  fiesta: 'Día de fiesta: comer con alegría, en familia, y con la misma medida.',
  menus: [
    ['Lentejas con verduras; pescado a la plancha y ensalada','Crema de calabacín; tortilla francesa'],
    ['Garbanzos con espinacas; fruta','Merluza al horno con patata; yogur'],
    ['Arroz con verduras y pollo','Sopa de verduras; queso fresco y pan'],
    ['Judías verdes con patata; filete de ternera','Ensalada completa con huevo duro'],
    ['Potaje de vigilia (garbanzos, bacalao y espinacas)','Sardinas o boquerones; ensalada de tomate'],
    ['Paella de pescado; fruta','Revuelto de setas; pan'],
    ['Cocido o asado de domingo, con medida','Fruta y un vaso de leche']
  ]
};

/* ---------- Calendario: Pascua, fiestas de precepto, ayuno y abstinencia (CIC 1917, cc. 1247–1254) ---------- */
function pascua(y){
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
        h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
        mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;
  return new Date(y, mes-1, dia);
}
function addDias(d,n){ const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n); return x; }
function mismaFecha(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function fiestaPrecepto(d){
  for (const [m,dd,n] of FIESTAS_FIJAS) if (d.getMonth()+1===m && d.getDate()===dd) return n;
  const P = pascua(d.getFullYear());
  for (const [off,n] of FIESTAS_MOVILES) if (mismaFecha(addDias(P,off), d)) return n;
  return null;
}
function proximasFiestas(desde, n){
  const L = []; let d = addDias(desde, 2);
  for (let i=0; i<400 && L.length<n; i++, d=addDias(d,1)) { const f = fiestaPrecepto(d); if (f) L.push({ fecha:new Date(d), nombre:f }); }
  return L;
}
function domingoN(desde, n){ /* n-ésimo domingo a partir de 'desde' (inclusive si es domingo) */
  let d = new Date(desde); while (d.getDay()!==0) d = addDias(d,1); return addDias(d, 7*(n-1));
}
function temporas(y){
  const P = pascua(y), L = [];
  const add = base => { L.push(addDias(base,3), addDias(base,5), addDias(base,6)); };
  add(addDias(P,-42));                 // 1.er domingo de Cuaresma
  add(addDias(P,49));                  // Pentecostés
  add(domingoN(new Date(y,8,1),3));    // 3.er domingo de septiembre (rúbricas de 1960)
  const adv1 = (()=>{ let d=new Date(y,11,24); while(d.getDay()!==0) d=addDias(d,-1); return addDias(d,-21); })();
  add(addDias(adv1,14));               // 3.er domingo de Adviento
  return L;
}
/* Devuelve {ayuno, abstinencia, motivo, cuaresma} para una fecha y edad */
function disciplinaDia(d, edad){
  const y = d.getFullYear(), P = pascua(y), ceniza = addDias(P,-46), sabSanto = addDias(P,-1);
  const enCuaresma = d >= ceniza && d <= sabSanto;
  const dom = d.getDay()===0, fiesta = fiestaPrecepto(d);
  let ay=false, ab=false, motivo=[];
  if (d.getDay()===5) { ab=true; motivo.push('viernes'); }
  if (mismaFecha(d,ceniza)) { ay=ab=true; motivo.push('Miércoles de Ceniza'); }
  if (enCuaresma && !dom) { ay=true; if (d.getDay()===5||d.getDay()===6) ab=true; motivo.push('Cuaresma'); }
  if (temporas(y).some(t=>mismaFecha(t,d))) { ay=ab=true; motivo.push('Témporas'); }
  const vigilias = [[addDias(P,48),'vigilia de Pentecostés'],[new Date(y,7,14),'vigilia de la Asunción'],[new Date(y,9,31),'vigilia de Todos los Santos'],[new Date(y,11,24),'vigilia de Navidad']];
  for (const [v,n] of vigilias) if (mismaFecha(v,d)) { ay=ab=true; motivo.push(n); }
  // c. 1252 §4: cesa en domingos y fiestas de precepto, salvo en Cuaresma; la vigilia no se anticipa
  if ((dom || fiesta) && !enCuaresma) { ay=false; ab=false; motivo=[]; }
  if (dom) { ay=false; ab=false; }
  // c. 1254: abstinencia desde los 7 años cumplidos; ayuno desde los 21 cumplidos hasta comenzar los 60
  const obligAb = edad >= 7, obligAy = edad >= 21 && edad < 59;
  return { ayuno: ay && obligAy, abstinencia: ab && obligAb, ayunoGeneral: ay, motivo: [...new Set(motivo)].join(', '), cuaresma: enCuaresma, fiesta };
}
