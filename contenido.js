/* Código de Llull — contenido doctrinal y de pruebas.
   Todas las referencias remiten al Libro de la Orden de Caballería (Parte, §). */
'use strict';

const VIRTUDES = [
  { id:'fe', nombre:'Fe', ref:'VI, §3', arma:'espada', vicio:null,
    def:'Por la fe ve el hombre espiritualmente a Dios y sus obras, creyendo en las cosas invisibles.' },
  { id:'esperanza', nombre:'Esperanza', ref:'VI, §4', arma:'misericordia', vicio:'acidia',
    def:'Por ella se acuerdan de Dios en la batalla y en sus cuitas, y por ella tienen socorro suyo.' },
  { id:'caridad', nombre:'Caridad', ref:'VI, §5', arma:'escudo', vicio:'avaricia',
    def:'El caballero sin caridad no puede estar sin crueldad, que no conviene con su oficio.' },
  { id:'justicia', nombre:'Justicia', ref:'VI, §6', arma:'lanza', vicio:'envidia',
    def:'La Caballería y la justicia se avienen tanto que no puede haber una sin la otra.' },
  { id:'prudencia', nombre:'Prudencia', ref:'VI, §7', arma:'yelmo', vicio:null,
    def:'Virtud por la que el hombre conoce el bien y el mal, y sabe amar aquel y aborrecer este.' },
  { id:'fortaleza', nombre:'Fortaleza', ref:'VI, §8', arma:'coraza', vicio:'lujuria',
    def:'Virtud que está en el corazón noble contra los siete pecados mortales.' },
  { id:'templanza', nombre:'Templanza', ref:'VI, §16', arma:'freno', vicio:'gula',
    def:'Virtud que está en medio de dos vicios, el de la demasía y el de la falta. Comprende la humildad contra la soberbia.' }
];
const VIRT_IDX = Object.fromEntries(VIRTUDES.map((v,i)=>[v.id,i]));

/* Ánimo con que amanece: vicio que acecha → virtudes de remedio (Parte VI) */
const ANIMOS = [
  { id:'paz',        nombre:'En paz',                      vicio:null,       remedio:[] , ref:'' },
  { id:'desalentado',nombre:'Desalentado o tibio',         vicio:'acidia',   remedio:['esperanza','fortaleza'], ref:'VI, §12' },
  { id:'airado',     nombre:'Airado',                      vicio:'ira',      remedio:['templanza','prudencia'], ref:'VI, §15' },
  { id:'engreido',   nombre:'Engreído por un éxito',       vicio:'soberbia', remedio:['humildad','templanza'], ref:'VI, §13' },
  { id:'codicioso',  nombre:'Inquieto por bienes',         vicio:'avaricia', remedio:['caridad','fortaleza'], ref:'VI, §11' },
  { id:'tentado',    nombre:'Tentado en la carne',         vicio:'lujuria',  remedio:['fortaleza','templanza'], ref:'VI, §10' },
  { id:'resentido',  nombre:'Resentido con otro',          vicio:'envidia',  remedio:['justicia','caridad'], ref:'VI, §14' },
  { id:'destemplado',nombre:'Desordenado en comer o beber',vicio:'gula',     remedio:['templanza'], ref:'VI, §9' },
  { id:'temeroso',   nombre:'Temeroso',                    vicio:null,       remedio:['fe','fortaleza'], ref:'VI, §§3, 8' }
];

const CIRCUNSTANCIAS = [
  { id:'ordinario',  nombre:'Día ordinario',              virt:[] },
  { id:'batalla',    nombre:'Batalla: conflicto o trabajo duro', virt:['fortaleza','prudencia'] },
  { id:'juicio',     nombre:'Juicio: decidir o mandar',   virt:['justicia','prudencia'] },
  { id:'corte',      nombre:'Corte: trato, honores',      virt:['humildad','templanza'] },
  { id:'camino',     nombre:'Camino: viaje',              virt:['esperanza','prudencia'] },
  { id:'debiles',    nombre:'Servicio a los débiles',     virt:['caridad','justicia'] },
  { id:'derrota',    nombre:'Derrota o fracaso',          virt:['esperanza','fe'] },
  { id:'enfermedad', nombre:'Enfermedad',                 virt:['esperanza','fortaleza'] },
  { id:'prosperidad',nombre:'Prosperidad',                virt:['templanza','caridad'] }
];

/* Pruebas morales diarias, por virtud (la humildad cuenta en templanza: STh II-II q.161 a.4) */
const PRUEBAS = {
  fe: [
    ['Ofrecimiento de obras','Al levantarte, ofrece a Dios el trabajo del día antes de cualquier otra cosa.','VI, §17'],
    ['Santa Misa','Asiste hoy a la Santa Misa, o, si no te es posible, haz comunión espiritual y lee el Evangelio del día.','VI, §17'],
    ['Los catorce artículos','Recita despacio los catorce artículos de la fe tal como los da Llull.','IV, §5'],
    ['Confesar la fe','No calles hoy tu fe cuando la ocasión lo pida: santíguate en público, bendice la mesa, responde con verdad.','II, §3'],
    ['Ángelus','Reza el Ángelus a mediodía donde estés.',''],
    ['Visita al Santísimo','Haz una visita al Santísimo Sacramento, aunque sea breve.','IV, §7'],
    ['Defensa de la fe','Si oyes hoy burla de la fe, respóndela con razón y sin ira.','II, §2'],
    ['Rosario','Reza el santo Rosario, o al menos un misterio con atención.',''],
    ['Examen de la fe','Lee un capítulo de los Evangelios y anota una cosa que debas creer o hacer.','VI, §3'],
    ['Señal de la cruz','Haz la señal de la cruz al salir de casa, al comenzar el trabajo y antes de dormir.','V, §2'],
    ['Temor de Dios','Evita hoy una ocasión de pecado que sueles consentir.','III, §2'],
    ['Oración por la Iglesia','Ofrece una oración por el Papa, los obispos y los sacerdotes.','II, §4']
  ],
  esperanza: [
    ['Acordarse de Dios en el trabajo','En el momento más duro del día, detente y encomiéndalo a Dios.','VI, §4'],
    ['No quejarse','Pasa el día entero sin una sola queja de palabra.','VI, §12'],
    ['Terminar lo empezado','Acaba hoy una tarea que tenías abandonada por desgana.','VI, §12'],
    ['Madrugar','Levántate a la hora fijada, sin conceder minutos a la pereza.','VI, §12'],
    ['Animar a otro','Da ánimo verdadero a alguien que esté abatido.','VI, §4'],
    ['Confianza en la prueba','Ante una contrariedad, di: «Hágase tu voluntad» y sigue trabajando.','VI, §4'],
    ['Orden del día','Escribe por la mañana las tres cosas principales del día y cúmplelas.','VI, §12'],
    ['Las postrimerías','Medita cinco minutos sobre la muerte, el juicio, el infierno y la gloria.','IV, §5'],
    ['Trabajo bien hecho','Haz hoy tu trabajo con la perfección con que lo harías ante tu señor.','VI, §18'],
    ['Contra la tristeza','Cuando te venga la tristeza, haz un acto de servicio en lugar de rumiarla.','VI, §12']
  ],
  caridad: [
    ['Limosna','Da hoy una limosna concreta, en dinero o en especie, sin que se sepa.','VII, §3'],
    ['Amparar al desvalido','Ayuda hoy a un anciano, un enfermo o un necesitado con un acto concreto.','II, §19'],
    ['Visita','Llama o visita a alguien que esté solo.','II, §19'],
    ['Perdón','Perdona de corazón una ofensa y no vuelvas a mencionarla.','VI, §5'],
    ['Palabra amable','No digas hoy ninguna palabra áspera a los de tu casa.','VI, §5'],
    ['Largueza','Comparte algo tuyo que te cueste dar.','VI, §11'],
    ['Corrección fraterna','Si debes corregir a alguien, hazlo a solas, con verdad y sin humillarle.','VI, §5'],
    ['Oración por los enemigos','Reza por quien te ha hecho daño.','VI, §5'],
    ['Servicio oculto','Haz en casa un trabajo que nadie te ha pedido y que nadie verá.','I, §9'],
    ['Defender al ausente','No consientas que se murmure de un ausente en tu presencia.','II, §19'],
    ['Paciencia con el pesado','Escucha con atención a quien suele aburrirte.','VI, §5']
  ],
  justicia: [
    ['Verdad entera','No digas hoy ninguna mentira, ni siquiera de conveniencia.','V, §3'],
    ['Palabra cumplida','Cumple hoy un compromiso que tenías pendiente.','II, §32'],
    ['Dar a cada uno lo suyo','Paga hoy una deuda o devuelve algo prestado.','V, §2'],
    ['Juicio recto','Antes de juzgar a alguien, oye su razón.','VI, §19'],
    ['Lealtad al señor','Trabaja hoy con lealtad para quien te paga, sin hurtarle tiempo.','II, §8'],
    ['Contra la murmuración','No hables mal de nadie en todo el día.','II, §29'],
    ['Honrar padre y madre','Honra hoy a tus padres con un acto concreto; si han muerto, reza por ellos.','IV, §6'],
    ['Reconocer el error','Reconoce ante quien corresponda un error tuyo.','VI, §6'],
    ['Defensa del justo','Defiende a quien sea tratado injustamente en tu presencia.','II, §9'],
    ['Bien común','Haz hoy algo por el bien común: tu calle, tu parroquia, tu trabajo.','VI, §20'],
    ['Sin envidia','Alégrate sinceramente de un bien ajeno y dilo.','VI, §14']
  ],
  prudencia: [
    ['Consejo','Antes de una decisión importante, pide consejo a alguien sabio.','VI, §7'],
    ['Lectura del Libro','Lee un capítulo del Libro de la Orden de Caballería con atención.','I, §13'],
    ['Callar a tiempo','Calla hoy una vez en que ibas a hablar de más.','VI, §7'],
    ['Previsión','Prepara esta noche lo que necesitas mañana.','V, §7'],
    ['Estudio','Dedica media hora al estudio de tu oficio o de la doctrina.','I, §10'],
    ['Examen de una decisión','Escribe los pros y contras de una decisión pendiente antes de tomarla.','VI, §7'],
    ['Huir de la ocasión','Aléjate de una ocasión de pecado antes de que llegue.','VI, §7'],
    ['Cordura con el ardimiento','En un arrebato de entusiasmo, espera a mañana para resolver.','II, §18'],
    ['Enseñar','Enseña algo útil a alguien más joven.','I, §12'],
    ['Orden en las cuentas','Revisa tus gastos de la semana.','V, §16']
  ],
  fortaleza: [
    ['Lo difícil primero','Comienza el día por la tarea que más te cuesta.','VI, §8'],
    ['Ducha fría','Termina tu aseo con agua fría.','VI, §8'],
    ['Resistir la tentación','Ante la primera tentación del día, apártate de inmediato.','VI, §10'],
    ['Decir la verdad incómoda','Di hoy una verdad que debías decir y venías callando.','V, §3'],
    ['Sufrir sin quejarse','Soporta una molestia del día sin decirla a nadie.','V, §17'],
    ['Pureza de la mirada','Guarda la vista: nada impuro en pantallas ni en la calle.','VI, §10'],
    ['Ayuno de pantallas','Pasa hoy dos horas seguidas sin teléfono ni pantalla.','VI, §8'],
    ['Constancia','Cumple el ejercicio de hoy aunque no tengas ganas.','II, §10'],
    ['Dar la cara','Afronta hoy una conversación difícil que venías aplazando.','II, §27'],
    ['Firmeza en el bien','Mantente en lo justo aunque te cueste aprecio.','II, §17'],
    ['Cuidado del arnés','Ordena y limpia tus cosas: ropa, herramientas, lugar de trabajo.','II, §31']
  ],
  templanza: [
    ['Sobriedad en la mesa','Come hoy sin repetir y sin picar entre horas.','VI, §9'],
    ['Sin alcohol','No tomes hoy ninguna bebida alcohólica.','VI, §9'],
    ['Mortificación pequeña','Prívate hoy de un gusto lícito: un dulce, un café, un capricho.','VI, §16'],
    ['Humildad','No hables de ti mismo ni de tus méritos en todo el día.','VI, §13'],
    ['Ceder el puesto','Cede a otro el mejor sitio, el turno o la razón en algo menor.','VI, §13'],
    ['Mansedumbre','Cuando te irrites, cuenta hasta diez y responde con calma.','VI, §15'],
    ['Medida en el gasto','No compres nada que no sea necesario.','VI, §16'],
    ['Vestido decoroso','Viste con decoro y sin ostentación.','III, §20'],
    ['Lengua limpia','Ninguna palabra soez en todo el día.','III, §20'],
    ['Hora de dormir','Acuéstate a la hora fijada.','VI, §16'],
    ['Silencio','Guarda quince minutos de silencio interior, sin ruido ni pantalla.','VI, §16'],
    ['Aceptar la corrección','Recibe una crítica sin justificarte.','VI, §13']
  ]
};

/* Las armas del caballero y su significación (Parte V) */
const ARMAS = [
  { id:'espada', n:2, nombre:'Espada', sig:'Formada a semejanza de una cruz: así como Cristo venció en la cruz la muerte, el caballero con la espada debe vencer a los enemigos de la cruz; sus dos cortes, la Caballería y la justicia.', virtud:'fe',
    prueba:'Reza ante un crucifijo y renueva el propósito de mantener la justicia.' },
  { id:'lanza', n:3, nombre:'Lanza', sig:'La verdad, que es cosa derecha que no se tuerce y antecede a la falsedad; el hierro, la fuerza que la verdad tiene sobre la falsedad.', virtud:'justicia',
    prueba:'Ni una mentira en todo el día, ni de palabra ni de omisión.' },
  { id:'yelmo', n:4, nombre:'Yelmo', sig:'La vergüenza, sin la cual el caballero no puede ser obediente a la Orden.', virtud:'prudencia',
    prueba:'Guarda la vista y las palabras: nada de lo que debieras avergonzarte.' },
  { id:'coraza', n:5, nombre:'Coraza', sig:'Castillo y muralla contra los vicios y las faltas.', virtud:'fortaleza',
    prueba:'Identifica tu vicio dominante y opón hoy un acto contrario.' },
  { id:'calzas', n:6, nombre:'Calzas de hierro', sig:'Que con su espada, lanza, maza y demás armas ha de hacer seguros los caminos.', virtud:'justicia',
    prueba:'Ayuda a alguien en su camino: oriéntale, acompáñale, llévale.' },
  { id:'espuelas', n:7, nombre:'Espuelas', sig:'La diligencia, la cautela y el cuidado que le incumben para tener honrada su Orden.', virtud:'prudencia',
    prueba:'Haz hoy sin demora todo lo que te toque, sin dejar nada para mañana.' },
  { id:'gola', n:8, nombre:'Gola', sig:'La obediencia: así como la gola rodea el cuello para defenderlo, la obediencia lo mantiene dentro de la Orden.', virtud:'templanza',
    prueba:'Obedece hoy con prontitud a quien te corresponda, sin réplica.' },
  { id:'maza', n:9, nombre:'Maza', sig:'La fortaleza del corazón, que defiende al caballero de todos los vicios y fortifica las virtudes.', virtud:'fortaleza',
    prueba:'Resiste tres veces una tentación concreta y anótalo.' },
  { id:'misericordia', n:10, nombre:'Misericordia (hacha)', sig:'Que no debe fiarse de sus armas ni de su fuerza, sino acercarse tanto a Dios por la esperanza que, con Dios y con ella, combata a sus enemigos.', virtud:'esperanza',
    prueba:'En la mayor dificultad del día, no confíes en tus fuerzas: encomiéndala a Dios antes de actuar.' },
  { id:'escudo', n:11, nombre:'Escudo', sig:'Su oficio: así como el escudo se interpone entre el caballero y su enemigo, el caballero es el medio entre el rey y su pueblo.', virtud:'caridad',
    prueba:'Defiende hoy a alguien de una injusticia, aunque te cueste.' },
  { id:'silla', n:12, nombre:'Silla', sig:'La seguridad del corazón y la carga de la Caballería.', virtud:'fortaleza',
    prueba:'Asume hoy una responsabilidad que otros rehúyen.' },
  { id:'caballo', n:13, nombre:'Caballo', sig:'La nobleza del ánimo; y que, montado, esté más alto, sea visto de lejos y sea el primero en lo tocante al honor de la Orden.', virtud:'caridad',
    prueba:'Sirve hoy a otro como si tú fueras su escudero.' },
  { id:'freno', n:14, nombre:'Freno y riendas', sig:'Que refrene su boca de palabras feas y falsas, sus manos de dar tanto que después haya de pedir, y su ardimiento para que no proceda sin cordura.', virtud:'templanza',
    prueba:'Ni una palabra fea, ni una falsa, ni un gasto sin razón.' },
  { id:'testera', n:15, nombre:'Testera', sig:'Que ningún caballero debe usar de las armas sin razón.', virtud:'prudencia',
    prueba:'Antes de actuar con fuerza o con autoridad, examina si tienes razón.' },
  { id:'guarniciones', n:16, nombre:'Guarniciones', sig:'Que guarde y conserve sus bienes para que basten al oficio.', virtud:'templanza',
    prueba:'Pon orden en tus bienes: revisa cuentas y repara algo estropeado.' },
  { id:'perpunte', n:17, nombre:'Perpunte', sig:'Los grandes trabajos que ha de sufrir para honrar la Orden.', virtud:'fortaleza',
    prueba:'Acepta hoy un trabajo penoso sin decirlo.' },
  { id:'blason', n:18, nombre:'Armas del escudo', sig:'Para que sea alabado por los ardimientos que emprenda y, si es cobarde, flaco o desobediente, vituperado.', virtud:'justicia',
    prueba:'Haz hoy algo que honre tu nombre y tus armas.' },
  { id:'estandarte', n:19, nombre:'Estandarte', sig:'Que los caballeros deben sostener el honor del señor y de su tierra.', virtud:'fe',
    prueba:'Haz algo concreto por el honor de tu patria o de tu casa.' }
];

/* Los oficios del caballero (Parte II) — bloque para Comdor */
const OFICIOS = [
  { id:'fe', nombre:'Sostener la santa fe católica', ref:'II, §2', pruebas:[
    'Enseña a alguien una oración o un artículo de la fe.','Asiste a la Santa Misa en día laborable.','Defiende la fe con razones en una conversación.',
    'Lee y medita una página del Catecismo Romano.','Reza por la conversión de un infiel o de un alejado.','Coopera con tu parroquia en una tarea concreta.','Da testimonio de tu fe ante quien no la tiene.' ]},
  { id:'senor', nombre:'Defender a su señor terrenal', ref:'II, §8', pruebas:[
    'Cumple tu trabajo con lealtad completa a quien sirves.','Defiende la buena fama de tu superior ausente.','Cumple una orden justa que te desagrada.',
    'Aconseja con verdad a tu superior, aunque no le guste.','Cumple las leyes justas aunque nadie vigile.','Reza por los gobernantes.','Ofrece tu ayuda en una tarea que no te corresponde.' ]},
  { id:'justicia', nombre:'Mantener la justicia', ref:'II, §9', pruebas:[
    'Resuelve con equidad una disputa entre otros.','Repara un daño que hayas causado.','Denuncia por el cauce debido una injusticia de la que seas testigo.',
    'Paga lo justo, sin regatear al pobre.','Da a cada uno su derecho en tu casa y en tu trabajo.','No aceptes un favor que te comprometa.','Reconoce públicamente el mérito ajeno.' ]},
  { id:'debiles', nombre:'Amparar a viudas, huérfanos y desvalidos', ref:'II, §19', pruebas:[
    'Visita a una viuda o a un anciano solo.','Ayuda a un huérfano o a un niño desatendido.','Socorre a un pobre con lo que necesite.',
    'Acompaña a un enfermo.','Defiende a quien no puede defenderse.','Dedica una hora a una obra de caridad.','Da de comer a quien tiene hambre.' ]},
  { id:'tierra', nombre:'Guardar la tierra y los caminos', ref:'II, §§12, 22', pruebas:[
    'Haz algo por la seguridad de tu calle o tu barrio.','Ayuda a un vecino en una necesidad.','Cuida un bien común: limpia, repara, avisa.',
    'Conoce y honra la historia de tu tierra.','Participa en una obra de tu comunidad.','Protege a los tuyos con un acto de previsión.','Enseña a un joven el amor a su patria.' ]}
];

/* Examen de conocimientos (Parte IV y doctrina del Libro) */
const PREGUNTAS = [
  ['¿Cuántos artículos de la fe enumera Llull?',['Doce','Catorce','Diez','Siete'],1,'IV, §5'],
  ['¿Cuántos de esos artículos pertenecen a la divinidad?',['Siete','Cinco','Tres','Diez'],0,'IV, §5'],
  ['Según Llull, ¿qué significa que Dios es «recreador»?',['Que creó el mundo','Que redimió al linaje humano del pecado de Adán y Eva','Que juzgará a buenos y malos','Que dará la gloria'],1,'IV, §5'],
  ['El primer artículo de la humanidad de Cristo es…',['Que nació','Que fue concebido por obra del Espíritu Santo','Que resucitó','Que subió al cielo'],1,'IV, §5'],
  ['¿Para qué descendió el alma de Cristo a los infiernos, según el Libro?',['Para juzgar a los condenados','Para sacar a Adán, Abraham y los profetas que creyeron en su venida','Para vencer a Lucifer','No lo dice'],1,'IV, §5'],
  ['El último artículo es que Cristo…',['Subió al cielo','Vendrá en el día del juicio y juzgará a buenos y malos','Resucitó','Envió el Espíritu Santo'],1,'IV, §5'],
  ['¿Cuántos mandamientos dio Dios a Moisés en el Sinaí?',['Siete','Diez','Doce','Catorce'],1,'IV, §6'],
  ['El segundo mandamiento, según Llull, es…',['No matarás','No jurarás en vano','Santificarás las fiestas','Honrarás a tu padre y a tu madre'],1,'IV, §6'],
  ['El octavo mandamiento es…',['No hurtarás','No darás falso testimonio','No codiciarás los bienes de tu prójimo','No fornicarás'],1,'IV, §6'],
  ['¿Cuántos sacramentos tiene la santa madre Iglesia?',['Cinco','Siete','Diez','Tres'],1,'IV, §7'],
  ['¿Con qué nombre designa Llull a la Eucaristía entre los sacramentos?',['La comunión','El sacrificio del altar','La cena','El pan bendito'],1,'IV, §7'],
  ['Según el Libro, ¿qué grados confiere el obispo en el sacramento del orden?',['Sacerdote, diácono y subdiácono','Obispo y presbítero','Lector y acólito','Solo sacerdote'],0,'IV, §7'],
  ['¿Cuántas son las virtudes que todo caballero debe conocer?',['Tres','Siete','Cuatro','Doce'],1,'VI, §2'],
  ['¿Cuáles son las teologales?',['Fe, esperanza y caridad','Justicia, prudencia y fortaleza','Fe, justicia y templanza','Humildad, paciencia y caridad'],0,'VI, §2'],
  ['¿Cuántos son los pecados mortales contra los que está la fortaleza?',['Cinco','Siete','Diez','Tres'],1,'VI, §8'],
  ['¿Qué significa la espada?',['La fuerza','La cruz de Cristo y, con sus dos cortes, la justicia','El linaje','El poder del rey'],1,'V, §2'],
  ['¿Qué significa la lanza?',['La verdad','La victoria','La obediencia','La nobleza'],0,'V, §3'],
  ['¿Qué significa el yelmo?',['La sabiduría','La vergüenza','La fe','La fortaleza'],1,'V, §4'],
  ['¿Qué significa la gola?',['La paciencia','La obediencia','La templanza','La caridad'],1,'V, §8'],
  ['¿Qué significan las espuelas?',['La velocidad','La diligencia, la cautela y el cuidado','La riqueza','El valor'],1,'V, §7'],
  ['¿Qué significa el caballo?',['La nobleza del ánimo','La riqueza','La guerra','El señorío'],0,'V, §13'],
  ['¿Qué significa el freno?',['Que refrene su boca y sus manos','La obediencia al rey','La templanza en la mesa','La prudencia en la guerra'],0,'V, §14'],
  ['¿Qué arma significa la misericordia de Dios cuando faltan las demás?',['La maza','La misericordia, esto es, el hacha','El escudo','La espada'],1,'V, §10'],
  ['¿Qué día conviene para armar caballero?',['Cualquier domingo','Una de las fiestas de precepto del año','El cumpleaños del escudero','El día que elija el señor'],1,'IV, §2'],
  ['¿Qué ha de hacer el escudero la noche anterior a la investidura?',['Celebrar un banquete','Velar en la iglesia en oración y contemplación','Dormir para estar descansado','Ejercitarse en las armas'],1,'IV, §3'],
  ['¿Qué ha de hacer el escudero antes de entrar en la Orden?',['Pagar un tributo','Confesarse y recibir el cuerpo sacramentado de Jesucristo','Vencer en un torneo','Jurar ante el rey'],1,'IV, §1'],
  ['¿Qué significa la bofetada en la investidura?',['Castigo','Que recuerde lo que promete, el gran cargo y el gran honor','Desprecio','Costumbre sin sentido'],1,'IV, §11'],
  ['¿Qué significa el beso en la investidura?',['La caridad','La amistad del rey','La obediencia','La paz con los enemigos'],0,'IV, §11'],
  ['Al ceñir la espada se significan…',['La riqueza y el poder','La castidad y la justicia','La fuerza y el valor','La nobleza y el linaje'],1,'IV, §11'],
  ['¿Qué debe hacer el nuevo caballero tras ser armado?',['Retirarse a orar','Montar a caballo y mostrarse a las gentes','Partir a la guerra','Volver a su casa'],1,'IV, §12'],
  ['¿Qué ha de repartir el nuevo caballero el día de su investidura?',['Nada','Dádivas','Armas','Tierras'],1,'IV, §13'],
  ['¿Cuál es el primer oficio del caballero?',['Servir al rey','Sostener la santa fe católica','Hacer la guerra','Cazar'],1,'II, §2'],
  ['¿A quiénes debe amparar el caballero?',['A los ricos','A las viudas, los huérfanos y los desvalidos','A los clérigos solamente','A sus vasallos solamente'],1,'II, §19'],
  ['¿Qué es lo primero que se pregunta al escudero en su examen?',['Si tiene caballo','Si ama y teme a Dios','Si es rico','Si sabe combatir'],1,'III, §2'],
  ['¿Dónde ha de buscarse la nobleza de corazón?',['En el vestido y el caballo','En la fe, la esperanza, la caridad, la justicia, la fortaleza y la lealtad','En el linaje solamente','En la riqueza'],1,'III, §4'],
  ['Según Llull, ¿qué es el paraje?',['La riqueza','Honor antiguo continuado','La fuerza del cuerpo','El favor del rey'],1,'III, §8'],
  ['¿Qué debe doler más al caballero que el hambre, la sed, el calor o el frío?',['La derrota','La vergüenza','La pobreza','La enfermedad'],1,'III, §15'],
  ['¿Quiénes son, con los caballeros, los dos oficios más nobles?',['Los reyes','Los clérigos','Los jueces','Los mercaderes'],1,'II, §4'],
  ['La acidia es el vicio por el que el hombre…',['Come en demasía','Ama el mal y aborrece el bien','Desea lo ajeno','Se enfurece'],1,'VI, §12'],
  ['La templanza está…',['En el extremo de la abstinencia','En medio de dos vicios: la demasía y la falta','En la fuerza del cuerpo','En la obediencia'],1,'VI, §16'],
  ['¿Qué pone Llull como costumbre del caballero respecto de Dios?',['Oír misa y sermón, adorar, rogar y temer a Dios','Peregrinar a Roma','Ayunar cada día','Construir iglesias'],0,'VI, §17'],
  ['¿Dónde estaba el viejo caballero cuando llegó el escudero?',['En la corte del rey','Junto a una fuente, en su ermita del bosque','En un torneo','En un castillo'],1,'Prólogo'],
  ['¿Bajo los condes, qué grados de caballería nombra Llull?',['Duques y marqueses','Comdores y varvasores','Barones y señores','Infanzones e hidalgos'],1,'II, §6']
];

/* Examen de ingreso — Parte III íntegra */
const INGRESO = [
  { id:'amor_dios', t:'¿Amas y temes a Dios?', ok:true, elim:true, ref:'III, §2' },
  { id:'nobleza', t:'¿Buscas la nobleza en tu corazón y en tus obras, y no en el vestido, el dinero o la apariencia?', ok:true, ref:'III, §§3–4' },
  { id:'vida', t:'¿Es tu vida y tus costumbres digna de ser examinada sin vergüenza?', ok:true, ref:'III, §11' },
  { id:'intencion', t:'¿Pretendes la Orden para ser rico, para señorear o para ser honrado sin honrar a la Caballería?', ok:false, elim:true, ref:'III, §13' },
  { id:'cargas', t:'¿Conoces y aceptas el gran cargo y los peligros de la Orden, teniendo mayor horror a la vergüenza que a la muerte?', ok:true, ref:'III, §15' },
  { id:'falta', t:'¿Has cometido alguna maldad o engaño grave contra la Orden de Caballería —traición, perjurio, robo— sin haberla reparado?', ok:false, elim:true, ref:'III, §18' },
  { id:'paraje', t:'¿Procedes de linaje honrado —honor antiguo continuado, esto es, paraje—?', paraje:true, ref:'III, §8' },
  { id:'obras', t:'Si no procedes de paraje: ¿te acreditan muchas y nobles obras y costumbres, por las que la Orden consiente al de linaje recién honrado?', obras:true, ref:'III, §10' },
  { id:'medios', t:'¿Tienes armas y medios bastantes para sostener tu estado y tu oficio sin vivir del engaño ni de lo ajeno?', ok:true, elim:true, ref:'III, §16' }
];
const VICIOS_P20 = ['orgulloso','mal educado','sucio en palabras','sucio en vestidos','de corazón cruel','avaro','mentiroso','desleal','perezoso','iracundo','lujurioso','borracho','glotón','perjuro'];

/* Faltas graves: causan expulsión (II; III, §§18–20) */
const FALTAS_GRAVES = [
  'Traición a quien debes lealtad','Perjurio: jurar en falso','Robo o fraude','Crueldad con el débil',
  'Abandonar a quien debías amparar','Mentira grave en perjuicio de otro','Adulterio o lujuria grave','Blasfemia o apostasía'
];

/* Examen de la noche: preguntas por virtud */
const EXAMEN = {
  fe: ['¿Me acordé de Dios al levantarme y al acostarme?','¿Confesé mi fe cuando hubo ocasión?','¿Recé con atención?','¿Hice algo que ofendiera a Dios?','¿Asistí a Misa o hice comunión espiritual?','¿Temí a Dios más que al juicio de los hombres?','¿Defendí la fe o callé por respeto humano?'],
  esperanza: ['¿Me quejé hoy?','¿Confié en Dios en la dificultad?','¿Cumplí mis deberes con diligencia?','¿Me dejé vencer por la tristeza o la pereza?','¿Terminé lo que empecé?','¿Pensé en mi fin último?','¿Animé a alguien?'],
  caridad: ['¿Ayudé a alguien necesitado?','¿Perdoné?','¿Hablé con dulzura a los de mi casa?','¿Fui generoso?','¿Juzgué con dureza a alguien?','¿Recé por quien me ofendió?','¿Hice algún bien oculto?'],
  justicia: ['¿Dije alguna mentira?','¿Cumplí mi palabra?','¿Di a cada uno lo suyo?','¿Murmuré de alguien?','¿Fui leal a quien sirvo?','¿Defendí al tratado injustamente?','¿Envidié el bien ajeno?'],
  prudencia: ['¿Pensé antes de hablar?','¿Pedí consejo antes de decidir?','¿Huí de las ocasiones de pecado?','¿Aproveché el tiempo?','¿Estudié o leí algo provechoso?','¿Me precipité en algún juicio?','¿Preparé el día de mañana?'],
  fortaleza: ['¿Hice primero lo más difícil?','¿Resistí la tentación?','¿Guardé la pureza de la mirada?','¿Dije la verdad que debía decir?','¿Sufrí sin quejarme?','¿Cumplí el ejercicio del día?','¿Afronté lo que temía?'],
  templanza: ['¿Comí y bebí con medida?','¿Hablé de mí mismo o de mis méritos?','¿Me enfadé?','¿Gasté en algo innecesario?','¿Usé palabras soeces?','¿Acepté la corrección?','¿Guardé el silencio debido?']
};

/* Grados de la Orden (II, §6; nota 15 de 1901) */
const GRADOS = [
  { id:0, m:'Escudero', f:'Escudera', comp:0 },
  { id:1, m:'Caballero de un escudo', f:'Dama de la Orden', corto_m:'Caballero', corto_f:'Dama', comp:4 },
  { id:2, m:'Valvasor', f:'Valvasora', comp:8 },
  { id:3, m:'Comdor', f:'Comdora', comp:11 },
  { id:4, m:'Conde', f:'Condesa', comp:15 }
];
/* Pruebas de cada virtud necesarias para ascender desde el grado anterior (acumulado 21 / 49 / 98) */
const REQ_VIRT = { 2:21, 3:28, 4:49 };
const REQ_OFICIO = 7;

/* Fiestas de precepto (CIC 1917, c. 1247 §1, y Santiago Apóstol en España) */
const FIESTAS_FIJAS = [
  [1,1,'Circuncisión del Señor'],[1,6,'Epifanía del Señor'],[3,19,'San José'],[6,29,'San Pedro y San Pablo'],
  [7,25,'Santiago Apóstol, patrón de España'],[8,15,'Asunción de la Santísima Virgen'],[11,1,'Todos los Santos'],
  [12,8,'Inmaculada Concepción'],[12,25,'Natividad del Señor']
];
const FIESTAS_MOVILES = [[39,'Ascensión del Señor'],[60,'Corpus Christi']];

/* Santos caballeros: divisa propia ese día */
const SANTOS_CABALLEROS = {
  '4-23':['San Jorge, mártir','Al caballero se da espada, formada a semejanza de una cruz, para significar que, así como nuestro Señor Jesucristo venció en la cruz la muerte en que habíamos incurrido por el pecado de Adán, así el caballero con la espada debe vencer y destruir a los enemigos de la cruz.','V, §2'],
  '5-30':['San Fernando, rey','Si el rey, el príncipe y el señor de una tierra deben ser caballeros, pues sin ese honor no merecen ser señores de estados, se sigue que los caballeros deben ser honrados por los reyes y altos barones.','VII, §2'],
  '7-25':['Santiago Apóstol, patrón de España','Oficio de caballero es sostener la santa fe católica.','II, §2'],
  '8-25':['San Luis, rey de Francia','Por los caballeros ha de sostenerse la justicia; porque, así como el oficio de los jueces es juzgar, el de los caballeros es mantenerla.','II, §9'],
  '9-29':['San Miguel Arcángel','La fortaleza es virtud que está en el corazón noble contra los siete pecados mortales.','VI, §8'],
  '11-11':['San Martín de Tours','Oficio de caballero es amparar a las viudas, los huérfanos y los desvalidos.','II, §19']
};

/* =====================================================================
   LAS BALANZAS: cada virtud es el fiel entre dos vicios (VI, §16: «la templanza
   está en medio de dos vicios, uno por demasía y otro por defecto»).
   v ∈ [−100, +100]: negativo = defecto; positivo = exceso; 0 = el medio.
   q: preguntas de conducta (examen de ingreso, carta y examen nocturno).
   p: pruebas que empujan hacia el medio desde cada lado.
   ===================================================================== */
const BALANZAS = [
  { id:'mesa', virtud:'templanza', nombre:'Templanza en la mesa', ref:'VI, §§9, 16',
    def:{ n:'Descuido del cuerpo', q:'¿descuidaste el sustento y el descanso que tu oficio necesita?',
      p:['Haz hoy las tres comidas a su hora, con gratitud.','Bendice la mesa y come con calma, en compañía.','Duerme las horas que tu oficio necesita.'] },
    exc:{ n:'Gula y embriaguez', q:'¿comiste o bebiste más de lo necesario, o bebiste hasta perder el dominio?',
      p:['Come sin repetir y sin picar entre horas.','No tomes hoy ninguna bebida alcohólica.','Levántate de la mesa con un poco de apetito.'] } },
  { id:'castidad', virtud:'fortaleza', nombre:'Castidad', ref:'VI, §10',
    def:{ n:'Frialdad con los tuyos', q:'¿fuiste frío o desabrido con el afecto que debes a tu esposa y a los tuyos?',
      p:['Ten hoy un gesto concreto de afecto con los tuyos.','Dedica una hora sin pantallas a tu familia.','Di a alguien de tu casa algo que le agradeces.'] },
    exc:{ n:'Lujuria', q:'¿consentiste miradas, pensamientos o contenidos impuros?',
      p:['Guarda la vista en pantallas y en la calle todo el día.','Ante la primera tentación, apártate y reza un Avemaría.','Deja el teléfono fuera del dormitorio esta noche.'] } },
  { id:'largueza', virtud:'caridad', nombre:'Largueza', ref:'VI, §11; V, §14',
    def:{ n:'Avaricia', q:'¿te negaste a dar o a compartir cuando podías y debías?',
      p:['Da hoy una limosna concreta, sin que se sepa.','Comparte algo tuyo que te cueste dar.','Paga a tiempo y sin regatear al pobre.'] },
    exc:{ n:'Prodigalidad', q:'¿gastaste o diste sin medida, de modo que luego te falte para tu deber?',
      p:['No compres nada que no sea necesario.','Revisa tus gastos de la semana.','Antes de un gasto o una dádiva grande, espera un día y pide consejo.'] } },
  { id:'mansedumbre', virtud:'templanza', nombre:'Mansedumbre', ref:'VI, §§5, 15',
    def:{ n:'Consentir la injusticia', q:'¿callaste o consentiste una injusticia que debías corregir?',
      p:['Defiende hoy a quien sea tratado injustamente.','Corrige con verdad y caridad lo que venías tolerando.','Da la cara en el asunto que venías evitando.'] },
    exc:{ n:'Ira y crueldad', q:'¿alzaste la voz, respondiste con ira o trataste a alguien con dureza?',
      p:['Cuenta hasta diez antes de responder, y responde con calma.','Pide perdón a quien trataste con dureza.','Ni una palabra áspera a los de tu casa.'] } },
  { id:'magnanimidad', virtud:'esperanza', nombre:'Magnanimidad y humildad', ref:'VI, §13; III, §19',
    def:{ n:'Pusilanimidad: conformarse con poco', q:'¿te conformaste con poco, renunciaste a algo grande por miedo o comodidad, o te dejaste abatir?',
      p:['Emprende hoy algo grande que venías aplazando por miedo.','Pide a Dios algo grande, no solo lo pequeño.','Ofrece el trabajo del día por una intención grande: la Iglesia, tu patria, la conversión de alguien.'] },
    exc:{ n:'Soberbia y vanagloria', q:'¿buscaste ser alabado, te pusiste por encima de otros o hablaste de tus méritos?',
      p:['No hables de ti ni de tus méritos en todo el día.','Cede el mejor sitio, el turno o la razón en algo menor.','Haz un bien sin que nadie lo sepa.'] } },
  { id:'fortaleza', virtud:'fortaleza', nombre:'Fortaleza', ref:'II, §18; V, §14',
    def:{ n:'Cobardía', q:'¿huiste de un deber, de una verdad o de un peligro por miedo?',
      p:['Afronta hoy lo que temes.','Di la verdad que venías callando.','Haz primero lo más difícil.'] },
    exc:{ n:'Temeridad', q:'¿actuaste con arrojo sin cordura, exponiéndote a ti o a otros sin necesidad?',
      p:['Antes de actuar con fuerza, pide consejo.','Espera a mañana para resolver lo que hoy te arrebata.','Conduce, entrena y trabaja sin exponerte sin necesidad.'] } },
  { id:'diligencia', virtud:'esperanza', nombre:'Diligencia', ref:'VI, §12; V, §7',
    def:{ n:'Acidia y pereza', q:'¿dejaste por desgana lo que debías hacer, o te pesó el bien espiritual?',
      p:['Levántate a la hora fijada, sin conceder minutos.','Termina una tarea que tenías abandonada.','Reza aunque no tengas ganas.'] },
    exc:{ n:'Agitación sin oración', q:'¿te arrastraron la prisa y el trabajo hasta no tener tiempo para Dios ni para los tuyos?',
      p:['Guarda quince minutos de oración en silencio.','Deja el trabajo a su hora y dedica la tarde a los tuyos.','Haz una sola cosa cada vez, con atención.'] } },
  { id:'benevolencia', virtud:'justicia', nombre:'Benevolencia', ref:'VI, §14',
    def:{ n:'Indiferencia', q:'¿te fue indiferente la necesidad o la alegría de los que te rodean?',
      p:['Interésate de verdad por alguien de tu entorno.','Felicita a alguien por un logro.','Acompaña a alguien en una pena.'] },
    exc:{ n:'Envidia', q:'¿te entristeció el bien de otro o te alegró su mal?',
      p:['Alégrate de un bien ajeno y dilo.','Reza por aquel a quien envidias.','Habla bien de un rival.'] } },
  { id:'veracidad', virtud:'justicia', nombre:'Veracidad', ref:'V, §3',
    def:{ n:'Mentira y disimulo', q:'¿dijiste alguna mentira o callaste una verdad debida?',
      p:['Ni una mentira hoy, ni de conveniencia.','Di la verdad que debías.','Reconoce ante quien corresponda un error tuyo.'] },
    exc:{ n:'Jactancia y exageración', q:'¿exageraste, presumiste o dijiste más de lo que era?',
      p:['Cuenta las cosas sin adornarlas.','No hables de lo que no sabes.','Calla una vez en que ibas a presumir.'] } },
  { id:'lealtad', virtud:'justicia', nombre:'Lealtad', ref:'II, §§8, 32; III, §19',
    def:{ n:'Deslealtad y perjurio', q:'¿faltaste a tu palabra, a un compromiso o a la lealtad debida?',
      p:['Cumple hoy un compromiso pendiente.','Defiende la buena fama de quien sirves.','Sé puntual en todo.'] },
    exc:{ n:'Servilismo y adulación', q:'¿adulaste o diste la razón por agradar, contra lo verdadero?',
      p:['Di con respeto lo que piensas, aunque no agrade.','No alabes lo que no merece alabanza.','Aconseja con verdad a quien sirves.'] } },
  { id:'cortesia', virtud:'templanza', nombre:'Cortesía', ref:'VI, §20; III, §20',
    def:{ n:'Rusticidad: palabra soez y desaliño', q:'¿usaste palabras soeces o descuidaste tu aseo y tu porte?',
      p:['Ninguna palabra soez en todo el día.','Viste con aseo y decoro.','Saluda y agradece a cada persona con quien trates.'] },
    exc:{ n:'Afectación y ostentación', q:'¿buscaste lucirte en el vestir, en el gasto o en las maneras?',
      p:['Viste con sencillez, sin ostentación.','No hables de lo que tienes ni de lo que gastas.','Trata igual al humilde que al importante.'] } }
];
/* Zonas de la balanza: el fiel en el medio, la amenaza y el peligro a cada lado */
const ZONAS = [
  { id:'virtud', n:'Virtud', hasta:20, c:'#F3F1EA', borde:'#8A7B63' },
  { id:'dominio', n:'Dominio', hasta:45, c:'#2F6B37' },
  { id:'amenaza', n:'Amenaza', hasta:70, c:'#C98A12' },
  { id:'peligro', n:'Peligro', hasta:101, c:'#B3201F' }
];
/* Frecuencias del examen de conducta (último mes) y del examen nocturno (hoy) */
const FREC_MES = [['Nunca',0],['Alguna vez',30],['A menudo',55],['Casi a diario',85]];
const FREC_HOY = [['No',0],['Una vez',8],['Varias veces',18]];
const ROJOS_MAX = 3;   // al alcanzar el rojo más de tres veces, degradación

/* SURSUM CORDA: no apagar el deseo, sino ordenarlo hacia lo más alto */
const ASPIRACIONES = [
  ['Nos hiciste, Señor, para ti, y nuestro corazón está inquieto hasta que descanse en ti.','San Agustín, Confesiones, I, 1'],
  ['Ad maiora natus sum: nací para cosas mayores.','San Estanislao de Kostka'],
  ['¡Oh almas criadas para estas grandezas y para ellas llamadas!, ¿qué hacéis?, ¿en qué os entretenéis?','San Juan de la Cruz, Cántico espiritual, canción 39, 7'],
  ['Abre tu boca y yo la llenaré.','Salmo 80, 11'],
  ['Deléitate en el Señor, y te dará lo que pide tu corazón.','Salmo 36, 4'],
  ['Los que se dejan guiar por el Espíritu de Dios, esos son hijos de Dios.','Romanos 8, 14'],
  ['Caminad según el Espíritu, y no satisfaréis los deseos de la carne.','Gálatas 5, 16'],
  ['Fuego vine a traer a la tierra, ¿y qué quiero sino que arda?','Lucas 12, 49'],
  ['Buscad primero el reino de Dios y su justicia, y todo lo demás se os dará por añadidura.','Mateo 6, 33'],
  ['Sed perfectos, como vuestro Padre celestial es perfecto.','Mateo 5, 48'],
  ['Ensancha el espacio de tu tienda.','Isaías 54, 2'],
  ['Una grande y muy determinada determinación de no parar hasta llegar a ella.','Santa Teresa de Jesús, Camino de perfección, 21, 2'],
  ['Todo caballero debe conocer las siete virtudes, raíz y principio de todas las buenas costumbres y camino de la gloria celestial y perdurable.','Llull, VI, §2'],
  ['Ad maiorem Dei gloriam.','San Ignacio de Loyola'],
  ['Veni, Sancte Spiritus, reple tuorum corda fidelium, et tui amoris in eis ignem accende.','Antífona de Pentecostés']
];
