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
- **Costumbres y vida:** la Parte III íntegra: amor y temor de Dios, nobleza de corazón, intención, cargas y peligros, faltas contra la Orden, vanagloria y adulación. Incluye también el **paraje** o, en su defecto, nobles obras (§§8–10), los **medios** (§16) y los vicios del §20.
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
2. En `sw.js`, cambia la constante `VERSION` (por ejemplo, de `llull-v6` a `llull-v7`).
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
