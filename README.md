# Código de Llull

**El *Libro de la Orden de Caballería* de Ramon Llull (hacia 1275) convertido en código diario del caballero.**

Aplicación web progresiva (PWA) en español. Cada día recuerda al caballero, o a la dama, su código de conducta según el ánimo y las circunstancias de ese día. Le propone pruebas morales y físicas y le examina por la noche. Desde el ingreso como escudero hasta el condado, la progresión sigue la letra del Libro.

Edición bilingüe lemosín-español: el original en letra gótica y la versión en redonda.

© 2026 Francisco de Paula Requena Paredes · A.M.D.G.

---

## Índice

1. [Instalación en GitHub Pages](#instalación-en-github-pages)
2. [Instalación en el teléfono](#instalación-en-el-teléfono)
3. [Cómo funciona](#cómo-funciona)
4. [Reglas de la Orden](#reglas-de-la-orden)
5. [Exigencia según la edad](#exigencia-según-la-edad)
6. [Tabla física](#tabla-física)
7. [El blasón](#el-blasón)
8. [Módulos complementarios](#módulos-complementarios)
9. [Archivos](#archivos)
10. [Datos y privacidad](#datos-y-privacidad)
11. [Actualizar la aplicación](#actualizar-la-aplicación)
12. [Fuentes y criterios](#fuentes-y-criterios)
13. [Derechos](#derechos)

---

## Instalación en GitHub Pages

1. Crea un repositorio público, por ejemplo `Codigo_de_Llull`.
2. Sube **todos los archivos sueltos en la raíz** del repositorio, sin subcarpetas.
3. Entra en **Settings › Pages**. En *Source* elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`, y pulsa **Save**.
4. En uno o dos minutos la aplicación estará en:
   `https://<usuario>.github.io/Codigo_de_Llull/`

Todas las rutas son relativas, así que funciona con cualquier nombre de repositorio.

## Instalación en el teléfono

- **Android (Chrome):** abre la dirección y elige *Menú › Instalar aplicación* (o *Añadir a pantalla de inicio*).
- **iPhone (Safari):** abre la dirección y elige *Compartir › Añadir a pantalla de inicio*.

Tras la primera carga funciona sin conexión.

---

## Cómo funciona

### Cada día

| Momento | Qué ocurre |
|---|---|
| **Vigilia de la mañana** | El usuario indica cómo amanece (en paz, desalentado, airado, engreído, inquieto por bienes, tentado, resentido, desordenado en la mesa, temeroso). Indica también qué le espera: batalla, juicio, corte, camino, servicio a los débiles, derrota, enfermedad o prosperidad. Recibe la **divisa del día**, tomada del Libro, y sus **pruebas**. |
| **Durante el día** | Pruebas morales (1, 2 o 3 según su exigencia) y, según el grado, pruebas de las armas (Parte V) o de los oficios (Parte II). Además: ejercicio diario obligatorio, prueba física de la tabla dos días por semana y disciplinas opcionales. |
| **Examen de la noche** | Preguntas de conciencia (3, 5 o 7), declaración de cada prueba, del ejercicio y de si ha habido falta grave. El día queda superado o no superado. |

### La divisa

- Hay 365 divisas extraídas del Libro, etiquetadas por virtud, arma y oficio. A lo largo del año recorren el Libro en orden.
- Si el ánimo o la circunstancia lo piden, la app elige la divisa que remedia el vicio que acecha (Parte VI), sin repetir dentro del año.
- En las fiestas de santos caballeros, la divisa es propia: San Jorge, San Fernando, Santiago, San Luis, San Miguel y San Martín.

---

## Reglas de la Orden

### Ingreso (Partes III y IV)

El examen comprende:
- **Costumbres y vida:** la Parte III íntegra: amor y temor de Dios, nobleza de corazón, intención, cargas y peligros, faltas contra la Orden, vanagloria y adulación. Incluye también el **paraje** o, en su defecto, nobles obras (§§8–10), los **medios** (§16) y una **carta de conducta**: once balanzas que recogen los vicios del §20 y los siete pecados capitales, respondidas por frecuencia en el último mes (nunca, alguna vez, a menudo, casi a diario). Una balanza en rojo impide la entrada.
- **Conocimientos:** los catorce artículos, los diez mandamientos y los siete sacramentos (IV, §§5–7), con la terminología del Libro («el sacrificio del altar»).
- **Cuerpo:** la tabla física de su edad y sexo (III, §17).

| Edad | Aprueba | No aprueba |
|---|---|---|
| 14–17 | Escudero hasta los 18 años y un año de escudería | Año de escudería |
| 18–59 | Es armado en una fiesta de precepto | Año de escudería (365 días superados) y nuevo examen |
| 60 o más | Es armado y recibe el **grado de conde** | No entra. Puede repetir el examen pasados 30 días |

El escudero no lleva blasón ni caballo. Durante su año aprende las 18 armas de la Parte V.

### Investidura (Parte IV)

Se señala una **fiesta de precepto**: las del Código de Derecho Canónico de 1917 (c. 1247) y Santiago Apóstol en España. La app guía los pasos en el orden del Libro.

- **Vigilia:** confesión, ayuno y vela de armas, con lectura de los artículos, los mandamientos y los sacramentos.
- **Día de la fiesta:** comunión; misa y ofrecimiento; juramento; ceñir la espada, el beso y la bofetada; elección de las armas; montar y mostrarse a las gentes; fiesta y dádivas.

### Grados (II, §6, y nota 15 de la edición de 1901)

| Varón | Mujer |
|---|---|
| Escudero | Escudera |
| Caballero de un escudo | Dama de la Orden |
| Valvasor | Valvasora |
| Comdor | Comdora |
| Conde | Condesa |

### Ascenso

No hay plazos: se asciende al superar pruebas. Llull exige las siete virtudes (VI, §2), así que no basta con sumar puntos.

| Hacia | Cada virtud probada (acumulado) | Además |
|---|---|---|
| Valvasor | 21 | Las 18 armas de la Parte V |
| Comdor | 49 | Los cinco oficios de la Parte II, 7 veces cada uno |
| Conde | 98 | Examen de conocimientos con la exigencia de conde |

En cada grado se exige, además, toda la tabla física de la edad.

### Caída, expulsión y redención

- **Pérdida de un grado:** quien supera los fallos tolerados en 20 días pierde el grado **con deshonor** y debe reconquistarlo. El caballero que cae vuelve a escudero con las **armas abatidas**. El escudero que no se mantiene vuelve a empezar su año.
- **Expulsión de la Orden:**
  - por **falta grave** declarada: traición, perjurio, robo, crueldad, abandono del débil, mentira grave, adulterio, blasfemia (III, §§18–20);
  - por **acidia**: 30 días sin examen (VI, §12).
- **Redención, siempre posible:** confesión, penitencia (40 días superados por falta grave, 30 por acidia) y examen de reingreso. Las armas no se rediseñan: se restituyen al ser armado de nuevo.

### Honra

- 10 puntos por cada prueba superada.
- Las disciplinas opcionales multiplican la honra de un día superado (tope ×2,5). Nunca compensan un fallo.
- Investidura: 500 puntos. Ascenso: 1.000 puntos.

---

## Las balanzas

«La templanza es virtud que está en medio de dos vicios, uno por demasía y otro por defecto» (VI, §16). Cada virtud es el fiel entre dos vicios:

| Balanza | Defecto | Exceso | Referencia |
|---|---|---|---|
| Templanza en la mesa | Descuido del cuerpo | Gula y embriaguez | VI, §§9, 16 |
| Castidad | Frialdad con los tuyos | Lujuria | VI, §10 |
| Largueza | Avaricia | Prodigalidad | VI, §11; V, §14 |
| Mansedumbre | Consentir la injusticia | Ira y crueldad | VI, §§5, 15 |
| Magnanimidad y humildad | Pusilanimidad: conformarse con poco | Soberbia y vanagloria | VI, §13; III, §19 |
| Fortaleza | Cobardía | Temeridad | II, §18; V, §14 |
| Diligencia | Acidia y pereza | Agitación sin oración | VI, §12; V, §7 |
| Benevolencia | Indiferencia | Envidia | VI, §14 |
| Veracidad | Mentira y disimulo | Jactancia y exageración | V, §3 |
| Lealtad | Deslealtad y perjurio | Servilismo y adulación | II, §§8, 32; III, §19 |
| Cortesía | Rusticidad: palabra soez y desaliño | Afectación y ostentación | VI, §20; III, §20 |

- **Zonas:** virtud (blanco), dominio (verde), amenaza (ámbar) y peligro (rojo), a cada lado del fiel.
- **Cada noche**, el examen pregunta por la conducta del día en dos o tres balanzas: la más inclinada, la del ánimo de la mañana y una rotatoria. Las respuestas mueven el fiel.
- **Cada día**, la balanza más inclinada recibe una prueba que empuja hacia el medio **desde su lado**: no se combate igual la ira que el consentimiento de la injusticia.
- **El hábito no se borra con el perdón:** la confesión perdona la culpa, pero el fiel solo vuelve al medio con actos contrarios.
- **Regla del rojo:** las balanzas son guía, salvo que el fiel llegue al rojo más de 3 veces (quedarse en el rojo 7 noches seguidas cuenta como una vez más). Entonces se pierde el empleo inmediato inferior; del escudero, la expulsión. El recuento vuelve a cero en cada cambio de grado.
- **Medición:** cada 30 días la app pide una medición de conducta (carta de frecuencias del último mes), y puede hacerse cuando se quiera. Coloca las balanzas donde uno está; si alguna entra en el rojo, cuenta. La primera carta de un miembro antiguo es solo informativa.
- **Puntos de lucha:** cada balanza indica cuántos puntos faltan hasta la zona mejor y hasta el medio, y cuántas noches limpias supone (una noche sin falta acerca el fiel 8 puntos; la prueba del día superada, 6).
- **Cercanía a la Orden:** 100 % menos la desviación media de las once balanzas; 100 % es tenerlas todas en el fiel. Se compara con la medición anterior.
- **Escala graduada:** bajo cada balanza, una regla de 100 (defecto) a 100 (exceso) con las zonas marcadas y la posición del fiel; debajo, cómo combatir el lado hacia el que se inclina.
- **No retroactividad:** quien ya estaba en la Orden conservó su grado; el recuento de rojos empezó en cero, y la carta de conducta que hacen los miembros antiguos es solo informativa.

## Mi arnés

«Tener aseado su arnés y herrar su caballo es oficio de caballero» (II, §31). En Hoy y en Armas aparece la figura del usuario:

- **Escudero:** de pie, en perpunte (V, §17) y sin caballo; cada arma aprendida se le coloca sin brillo.
- **Caballero:** armado y a caballo, con su blasón en el escudo y en la gualdrapa. Cada pieza refleja la balanza de la virtud que significa: reluciente (virtud), limpia (dominio), empañada (amenaza) o herrumbrosa (peligro). El caballo, por el ejercicio de los últimos siete días.
- **Grados:** cimera (valvasor), pendón en la lanza (comdor), corona y manto (conde).
- **Caída o expulsión:** de pie, con las armas abatidas.
- Al tocar una pieza se abre su significación (Parte V), su balanza y cómo limpiarla.

## Padrino, evolución y voz

- **Padrino:** el caballero elige como padrino a uno de los mejores caballeros de la Historia, escribiendo él mismo el nombre (IV, §9). Le arma en la investidura, preside sus ascensos y cada noche le pregunta qué diría de su día.
- **Evolución:** gráfico de la cercanía a la Orden y de cada balanza, noche a noche, con las mediciones mensuales marcadas.
- **El Libro en voz alta:** el parágrafo completo de la divisa del día, cualquier cita, cada parágrafo del lector y cada Parte entera pueden escucharse con la voz del teléfono, en español, en lemosín o en ambas lenguas (Ajustes o selector del lector). El lemosín se lee con la voz que el teléfono tenga para el código «ca»; si no la tiene, se avisa y se lee en español. Mientras se lee, un botón fijo permite parar.

## Mi retrato

En Más › Ajustes se puede añadir una foto del rostro: se encuadra con el dedo y se guarda reducida (unos 10 KB) solo en el teléfono; entra en la copia de seguridad y se puede cambiar o quitar.

- **Estilo:** ilustrado (tonos reducidos, paleta de pergamino y contorno en tinta) o foto natural.
- **Medallón:** el retrato en orla de gules y oro, en la pantalla de arranque y en Mis armas.
- **El escudero:** su rostro es el retrato; lleva el yelmo en la mano durante su año de escudería.
- **Lámina de investidura:** imagen para compartir el día de la investidura (IV, §12), con el retrato, las armas, el grado, la fiesta, la fecha, el padrino y el blasonado. En Mis armas, «Lámina de mi grado» genera la del grado actual.
- Los estados de caída y deshonor nunca se aplican al rostro: solo a las armas.

## Uso diario

- **Guía de primer uso:** cuatro pantallas con citas del Libro (la Orden, el día, las balanzas, la caída y la redención). Aparece la primera vez y puede verse de nuevo en Más › Guía de la Orden.
- **Hoy, según el momento del día:** por la mañana arriba la divisa, el deseo y las pruebas; desde las 19:00 (o tres horas antes de la hora del examen nocturno), el examen sube a continuación de la divisa. El cuerpo, la mesa y el arnés van plegados, con un resumen en una línea; el cuerpo se abre solo si hay una prueba física pendiente.
- **Almacenamiento:** un año de uso ocupa unos 360 KB. Los días de hace más de 400 se compactan a su resumen (superado, honra, ejercicio, deseo); la evolución conserva un punto por semana y todas las mediciones.
- **Breviario sin conexión:** al cargar el día, se guarda también el mes siguiente.

## La vida en la Orden

- **Datos protegidos:** al abrir, la app pide al navegador que no borre sus datos aunque falte espacio (más fiable con la app instalada; el estado se ve en Copia de seguridad). Si la última copia tiene más de 30 días, avisa al abrir, una vez al día.
- **Breviario Romano de 1962:** en Hoy aparece el día litúrgico según el Breviario (por ejemplo, «Santos Simón y Judas, Apóstoles · II clase»), con enlaces a Laudes y a Completas; el examen de la noche enlaza también con Completas. Los datos se leen de la app del Breviario, en el mismo sitio web, y quedan guardados para usarlos sin conexión.
- **Aniversario de la investidura:** durante la semana del aniversario, Hoy propone una vela breve (IV, §§11–12) y la renovación del juramento (+100 de honra).
- **Lámina del año:** grado, cercanía a la Orden, balanzas en el fiel, días y pruebas superados, honra ganada y hechos señalados del último año, con el retrato y las armas. En el aniversario y en Orden.
- **Mi crónica:** el historial contado como crónica, año por año, con los grandes deseos ofrecidos; se puede escuchar y descargar. Las faltas graves figuran solo como «falta grave», sin detalle.
- **Preparar la confesión:** examen por los diez mandamientos (IV, §6), los siete pecados capitales (VI, §§9–15) y los deberes del oficio (Parte II), con las balanzas que señalan frentes abiertos y el acto de contrición. Nada de lo que se marca se guarda. Enlazado desde la vigilia de la investidura y desde la penitencia.

## El deseo

No se trata de apagar el deseo, sino de cambiar lo que se desea: no conformarse con poco cuando se puede alcanzar el Cielo. Cada mañana, la tarjeta *Sursum corda* propone una aspiración de la Escritura o de los santos y pide formular «mi gran deseo de hoy». Cada noche, la primera pregunta es si uno se dejó gobernar por el Espíritu Santo o por sus gustos. *Ad maiora natus sum* (San Estanislao de Kostka).

## Exigencia según la edad

La exigencia física **baja** con la edad y la moral **sube** con la edad y el grado.

**Coeficiente físico (solo depende de la edad):**

| Edad | 14–29 | 30–39 | 40–49 | 50–59 | 60 o más |
|---|---|---|---|---|---|
| Exigencia | 130 % | 122 % | 115 % | 107 % | 100 % |

**Coeficiente moral = 100 % + componente de edad + componente de grado:**

| Edad | 14–29 | 30–39 | 40–49 | 50–59 | 60 o más |
|---|---|---|---|---|---|
| Componente | +0 | +4 | +8 | +11 | +15 |

| Grado | Escudero | Caballero | Valvasor | Comdor | Conde |
|---|---|---|---|---|---|
| Componente | +0 | +4 | +8 | +11 | +15 |

Ejemplos:
- Escudero de 25 años: 100 % en virtudes y 130 % en lo físico.
- Conde de 60 años: 130 % en virtudes y 100 % en lo físico.

**Qué determina el coeficiente moral:**

| Elemento | Regla |
|---|---|
| Nota mínima de los exámenes | 70 % × coeficiente |
| Fallos tolerados en 20 días | 5 ÷ coeficiente, redondeado hacia abajo |
| Pruebas morales diarias | 1; 2 desde el 115 %; 3 desde el 130 % |
| Preguntas del examen nocturno | 3; 5 desde el 115 %; 7 desde el 130 % |

---

## Tabla física

Valores base (100 %) para varones. A esta tabla se aplica el coeficiente físico de la edad.

| Prueba | 14–29 | 30–39 | 40–49 | 50–59 | 60–64 | 65 o más |
|---|---|---|---|---|---|---|
| Flexiones | 30 | 25 | 20 | 15 | 10 | 10 inclinadas |
| Sentadillas | 50 | 40 | 35 | 30 | 20 | 15 a silla |
| Plancha | 2:00 | 1:45 | 1:30 | 1:15 | 1:00 | 0:45 |
| Dominadas | 5 | 3 | 1 | — | — | — |
| Carrera | 10 km, 60 min | 10 km, 65 min | 6 km, 40 min | 6 km, 45 min | 3 km, 25 min | 3 km a paso vivo, 40 min |
| Marcha con arnés | 8 km, 12 kg, 90 min | 8 km, 12 kg, 95 min | 6 km, 10 kg, 75 min | 6 km, 8 kg, 80 min | 4 km, 6 kg, 60 min | 3 km, 4 kg, 50 min |

**Baremo femenino:**
- flexiones al 60 %;
- sentadillas y plancha al 90 %;
- suspensión en barra en lugar de dominadas;
- tiempos de carrera y marcha un 12 % más largos;
- 2 kg menos de carga en la marcha.

**Disciplinas opcionales (II, §10).** Multiplican la honra:

| Disciplina | Multiplicador |
|---|---|
| Equitación | ×1,5 |
| Esgrima | ×1,4 |
| Caza, con licencia | ×1,3 |
| Lucha o artes marciales | ×1,3 |
| Tiro con arco | ×1,2 |
| Natación | ×1,2 |
| Montañismo | ×1,2 |

A partir de los 65 años, como el viejo caballero del Prólogo, las disciplinas de monta y armas se sustituyen por estas:

| Disciplina | Multiplicador |
|---|---|
| Lectura | ×1,5 |
| Escritura | ×1,4 |
| Enseñar a otro | ×1,4 |
| Artes | ×1,3 |
| Caligrafía | ×1,2 |

---

## El blasón

El blasón se compone el día de la investidura. **La heráldica es perpetua**: una vez confirmadas, las armas no cambian; al ascender solo se añaden ornamentos.

**Elementos para componerlo:**
- **Formas:** español, apuntado (siglo XIII) y francés moderno.
- **Particiones:** pleno, partido, cortado, tronchado, tajado, cuartelado, terciado en faja y jironado de ocho.
- **Esmaltes:**
  - metales: oro y plata;
  - colores: gules, azur, sinople, sable y púrpura;
  - forros: armiños y veros.
- **Piezas:** cruz, sotuer, palo, faja, banda, barra, cabrio, jefe, campaña y bordura.
- **Figuras:** castillo, torre, león rampante, águila explayada, flor de lis, venera, estrella de seis rayos, creciente, roel, bezante, llave, espada, cruz de Santiago, cruz flordelisada, cáliz, árbol, caldera y sol (una figura, o tres puestas dos y una).
- **Cimera y lema.**

La app aplica la **regla de esmaltes** (no se pone metal sobre metal ni color sobre color) y escribe el **blasonado** automáticamente.

**Ornamentos por grado:**

| Grado | Ornamentos exteriores |
|---|---|
| Caballero o dama | Yelmo |
| Valvasor | + lambrequines y cimera |
| Comdor | + pendones cruzados |
| Conde | + corona condal (18 perlas, 9 vistas) y manto de gules forrado de armiños |

La corona condal es la de la heráldica española. Los ornamentos de valvasor y comdor son convención de esta Orden.

**Cómo se ve el escudo según la situación:**
- **Escudero:** escudo raso.
- **Caído o expulsado:** armas abatidas (escudo invertido, en gris y con crespón).

El blasón aparece al abrir la aplicación y en *Mis armas*, y puede compartirse como imagen.

---

## Módulos complementarios

- **Libro:** lector bilingüe con capitulares, prólogo y advertencia de 1901, notas, glosario y buscador. Puede mostrar ambas lenguas, solo el español o solo el lemosín.
- **Ejercicios:** rutinas a petición según edad, sexo y objetivo (completa, fuerza, resistencia, movilidad), de 20, 30 o 45 minutos. Incluye un plan semanal y la tabla física personal.
- **Nutrición:** la templanza en la mesa (VI, §§9, 16), con reglas, orientación por edad y menú del día.
- **Calendario:** fiestas de precepto, santos caballeros, ayunos y abstinencias según el Código de Derecho Canónico de 1917 (cc. 1250–1254):
  - abstinencia todos los viernes;
  - ayuno y abstinencia el Miércoles de Ceniza, los viernes y sábados de Cuaresma, las Témporas (según las rúbricas de 1960) y las vigilias de Pentecostés, la Asunción, Todos los Santos y Navidad;
  - edades: abstinencia desde los 7 años cumplidos; ayuno desde los 21 cumplidos hasta comenzar los 60.
- **Avisos diarios:** genera un archivo `.ics` con dos eventos diarios con alarma, para la vigilia de la mañana y el examen de la noche, que se importa en el calendario del teléfono. Una PWA no puede programar avisos locales diarios sin un servidor.
- **Copia de seguridad:** exporta e importa el progreso en un archivo JSON. Si pasan más de 30 días sin copia, la app lo recuerda.
- **Modo de ensayo** (Más › Ajustes): permite recorrer la investidura cualquier día. El resto de las reglas no cambia.

---

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura y estilos |
| `app.js` | Interfaz |
| `motor.js` | Reglas de la Orden: estado, días, grados, caída, expulsión, redención e investidura |
| `contenido.js` | Virtudes, ánimos, circunstancias, pruebas, armas, oficios, preguntas, examen de ingreso y grados |
| `fisico.js` | Tabla física, coeficientes, ejercicios, nutrición y calendario litúrgico |
| `blason.js` | Heráldica: dibujo SVG, regla de esmaltes y blasonado |
| `arnes.js` | Mi arnés: el escudero y el caballero armado, con el estado de cada pieza |
| `retrato.js` | Mi retrato: recorte, medallón y lámina de investidura |
| `cronica.js` | Protección de datos, Breviario, aniversario, lámina del año, crónica y confesión |
| `data.js` | Texto íntegro del Libro y las 365 divisas |
| `sw.js` | Service worker: funcionamiento sin conexión y actualización |
| `llull.webmanifest` | Manifiesto de la PWA |
| `cap-*.png`, `banda.png`, `ornamento.png` | Capitulares y adornos de la edición |
| `icon-*.png`, `apple-touch-icon.png` | Iconos |
| `*.woff2` | Tipografías UnifrakturMaguntia y EB Garamond |

La app no tiene dependencias externas ni usa servidor.

---

## Datos y privacidad

Todo se guarda **solo en el dispositivo** (`localStorage`). No se envía nada a ningún servidor.

Si se borra el navegador, o se pierde o cambia el teléfono, el progreso se pierde. Por eso conviene descargar la copia de seguridad con regularidad (*Más › Copia de seguridad*).

---

## Actualizar la aplicación

1. Modifica los archivos.
2. En `sw.js`, cambia la constante `VERSION` (por ejemplo, de `llull-v10` a `llull-v11`).
3. En `app.js`, cambia el parámetro del registro del service worker (por ejemplo, `sw.js?v=4` → `sw.js?v=5`).
4. Sube los archivos al repositorio.

Los usuarios reciben la nueva versión automáticamente al abrir la app con conexión.

---

## Fuentes y criterios

- **Texto:** *Libro de la Orden de Caballería*, de Ramon Llull, en edición bilingüe. Todas las referencias de la app remiten a Parte y parágrafo.
- **Divisas:** el etiquetado de virtudes, armas y oficios se hizo de forma automática y está pendiente de revisión por el autor. La revisión se hace en `Codigo_Llull_revision_divisas.csv`. Incluye como divisas los catorce artículos, los diez mandamientos y los siete sacramentos de IV, §§5–7.
- **Humildad:** se contabiliza dentro de la templanza (Santo Tomás, *Suma Teológica* II-II, q. 161, a. 4).
- **Grados:** se sigue el original (*Comtes, Comdors, Varvessors*) y la nota 15 de la edición de 1901.
- **Disciplina eclesiástica:** Código de Derecho Canónico de 1917, vigente en 1962.

---

## Créditos

Esta aplicación nace de la edición impresa del **Libro de la Orden de Caballería** de Ramon Llull: edición bilingüe lemosín-español, con traducción, advertencia y edición de Francisco de Paula Requena Paredes (primera edición, 2026). Todas las divisas, pruebas y referencias de la app remiten a sus Partes y parágrafos.

El fin de la Orden es el del Libro: que el caballero conozca, ame, sirva y adore a Dios, y por ese camino alcance la vida eterna.

> «Los clérigos tienen ciencia y doctrina para amar, conocer y honrar a Dios y sus obras.» (I, §10)
>
> «Debe ser costumbre del caballero oír misa y sermón, adorar, rogar y temer a Dios; porque con ella piensa en la muerte y en la vileza de este mundo, pide la gloria celestial y teme las penas del infierno.» (VI, §17)
>
> «Todo caballero debe conocer las siete virtudes, raíz y principio de todas las buenas costumbres y camino de la gloria celestial y perdurable.» (VI, §2)

Libro impreso: [https://amzn.eu/d/0c8yaSr1](https://amzn.eu/d/0c8yaSr1). El enlace está en la constante `LIBRO_URL`, al principio de `app.js`.

## Derechos

El texto de Ramon Llull y los textos de la edición de 1901 son de dominio público.

Son obra protegida, © 2026 Francisco de Paula Requena Paredes:
- la traducción al español contemporáneo;
- la advertencia del traductor;
- la edición;
- las capitulares, bandas y adornos;
- la aplicación.

Reservados todos los derechos.

Tipografías UnifrakturMaguntia y EB Garamond, bajo licencia SIL Open Font License.

Sugerencias: fprequenap@gmail.com

**AMDG**
