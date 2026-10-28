/* Código de Llull — el retrato del caballero: medallón, rostro del escudero y lámina de investidura.
   La foto no sale del teléfono: se recorta, se reduce y se guarda en el propio dispositivo. */
'use strict';

const RETRATO_PX = 300;

/* Tratamiento de ilustración: tonos reducidos, paleta de pergamino y contorno en tinta */
function ilustrar(canvas){
  const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
  const im = ctx.getImageData(0, 0, W, H), d = im.data;
  const gris = new Float32Array(W * H);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) gris[p] = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
  const niveles = 6, paso = 255 / (niveles - 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y*W + x, i = p*4;
    // posterizado por canal, templado hacia el pergamino
    for (let c = 0; c < 3; c++) {
      const v = Math.round(d[i+c] / paso) * paso;
      const perg = [246, 236, 214][c];
      d[i+c] = v * 0.82 + perg * 0.18 * (v / 255);
    }
    // contorno (Sobel) en tinta
    if (x > 0 && y > 0 && x < W-1 && y < H-1) {
      const g = (dx, dy) => gris[(y+dy)*W + (x+dx)];
      const gx = -g(-1,-1) - 2*g(-1,0) - g(-1,1) + g(1,-1) + 2*g(1,0) + g(1,1);
      const gy = -g(-1,-1) - 2*g(0,-1) - g(1,-1) + g(-1,1) + 2*g(0,1) + g(1,1);
      const m = Math.sqrt(gx*gx + gy*gy);
      if (m > 110) { const k = Math.min(1, (m - 110) / 140) * 0.85; d[i] = d[i]*(1-k) + 27*k; d[i+1] = d[i+1]*(1-k) + 26*k; d[i+2] = d[i+2]*(1-k) + 26*k; }
    }
  }
  ctx.putImageData(im, 0, 0);
  return canvas;
}

/* Modal de recorte: arrastrar para encuadrar, deslizar para acercar */
function abrirRecorte(file){
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const R = TMP.recorte = { img, x:0, y:0, z:1 };
    const base = Math.max(RETRATO_PX / img.width, RETRATO_PX / img.height);
    R.base = base;
    R.x = (RETRATO_PX - img.width*base) / 2; R.y = (RETRATO_PX - img.height*base) / 2;
    modal(`<h2>Mi retrato</h2><p class="peq">Arrastra para encuadrar tu rostro dentro del círculo y ajusta el tamaño.</p>
      <div style="position:relative;width:${RETRATO_PX}px;max-width:100%;margin:0 auto;touch-action:none">
        <canvas id="rc" width="${RETRATO_PX}" height="${RETRATO_PX}" style="width:100%;border-radius:8px;background:#ddd;display:block"></canvas>
        <svg viewBox="0 0 300 300" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><path d="M0,0 H300 V300 H0 Z M150,18 A132,132 0 1 0 150.01,18 Z" fill="rgba(246,240,225,.75)" fill-rule="evenodd"/><circle cx="150" cy="150" r="132" fill="none" stroke="#9E1F17" stroke-width="3"/></svg>
      </div>
      <label class="campo"><span>Tamaño</span><input type="range" id="rz" min="1" max="4" step="0.01" value="1" style="width:100%"></label>
      <div class="fila"><button class="btn" data-a="guardarRetrato">Guardar retrato</button><button class="btn sec" data-a="cerrarModal">Cancelar</button></div>`);
    const cv = document.getElementById('rc');
    const dibuja = () => { const c = cv.getContext('2d'); c.fillStyle = '#ddd'; c.fillRect(0,0,RETRATO_PX,RETRATO_PX); const s = R.base*R.z; c.drawImage(img, R.x, R.y, img.width*s, img.height*s); };
    dibuja();
    let arr = null;
    const esc2 = () => RETRATO_PX / cv.getBoundingClientRect().width;
    cv.addEventListener('pointerdown', e => { arr = { x:e.clientX, y:e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!arr) return; const k = esc2(); R.x += (e.clientX-arr.x)*k; R.y += (e.clientY-arr.y)*k; arr = { x:e.clientX, y:e.clientY }; dibuja(); });
    cv.addEventListener('pointerup', () => { arr = null; });
    document.getElementById('rz').addEventListener('input', e => {
      const z0 = R.z, z1 = +e.target.value, c = RETRATO_PX/2;
      R.x = c - (c - R.x) * z1/z0; R.y = c - (c - R.y) * z1/z0; R.z = z1; dibuja();
    });
    R.dibuja = dibuja;
  };
  img.src = url;
}
function guardarRetrato(){
  const R = TMP.recorte; if (!R) return;
  const c = document.createElement('canvas'); c.width = c.height = RETRATO_PX;
  const x = c.getContext('2d'); x.fillStyle = '#F6F0E1'; x.fillRect(0,0,RETRATO_PX,RETRATO_PX);
  const s = R.base*R.z; x.drawImage(R.img, R.x, R.y, R.img.width*s, R.img.height*s);
  const natural = c.toDataURL('image/jpeg', 0.82);
  const ilustrado = ilustrar(c).toDataURL('image/jpeg', 0.85);
  S.perfil.retrato = { natural, ilustrado, fecha: hoyISO() };
  if (!S.perfil.estiloRetrato) S.perfil.estiloRetrato = 'ilustrado';
  guardar(); TMP.recorte = null;
}
function retratoURL(){
  const r = S.perfil && S.perfil.retrato; if (!r) return null;
  return S.perfil.estiloRetrato === 'natural' ? r.natural : r.ilustrado;
}

/* Medallón: el retrato en orla de gules y oro */
let _medUid = 0;
function medallonSVG(tam){
  const u = retratoURL(); if (!u) return '';
  const id = 'md' + (++_medUid);
  let perlas = ''; for (let i = 0; i < 24; i++) { const a = i/24*Math.PI*2; perlas += `<circle cx="${(100+92*Math.cos(a)).toFixed(1)}" cy="${(100+92*Math.sin(a)).toFixed(1)}" r="2.6" fill="#F3E3A8" stroke="#8A6A10" stroke-width=".6"/>`; }
  return `<svg viewBox="0 0 200 200" width="${tam||120}" height="${tam||120}" style="width:${tam||120}px;height:${tam||120}px" role="img" aria-label="Retrato de ${esc(S.perfil.nombre)}">
    <defs><clipPath id="${id}"><circle cx="100" cy="100" r="78"/></clipPath></defs>
    <circle cx="100" cy="100" r="99" fill="#9E1F17"/><circle cx="100" cy="100" r="86" fill="#D9A21B" stroke="#1B1A1A" stroke-width="1.5"/>
    ${perlas}
    <image href="${u}" x="22" y="22" width="156" height="156" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="#1B1A1A" stroke-width="2.5"/></svg>`;
}

/* ---------- Lámina de investidura y de grado (imagen para compartir: IV, §12) ---------- */
function cargarImagen(src){ return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }); }
async function laminaPNG(opc){
  /* opc: { titulo, grado, fiesta, fecha } */
  const W = 1080, H = 1560, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  try { await Promise.all([document.fonts.load('80px UnifrakturMaguntia'), document.fonts.load('40px "EB Garamond"'), document.fonts.load('italic 40px "EB Garamond"'), document.fonts.load('600 40px "EB Garamond"')]); } catch(e){}
  // pergamino y orla
  x.fillStyle = '#F6F0E1'; x.fillRect(0,0,W,H);
  x.strokeStyle = '#9E1F17'; x.lineWidth = 18; x.strokeRect(30,30,W-60,H-60);
  x.strokeStyle = '#1B1A1A'; x.lineWidth = 3; x.strokeRect(58,58,W-116,H-116);
  x.strokeStyle = '#B8891F'; x.lineWidth = 2; x.strokeRect(70,70,W-140,H-140);
  try { const orn = await cargarImagen('ornamento.png'); const w = 520, h = w*orn.height/orn.width; x.drawImage(orn, (W-w)/2, 92, w, h); } catch(e){}
  const centro = (t, y, font, color) => { x.font = font; x.fillStyle = color; x.textAlign = 'center'; x.fillText(t, W/2, y); };
  const envolver = (t, y, font, color, ancho, lh) => { x.font = font; const pal = t.split(' '); let lin = '', yy = y; for (const p of pal) { const prueba = lin ? lin + ' ' + p : p; if (x.measureText(prueba).width > ancho && lin) { centro(lin, yy, font, color); lin = p; yy += lh; } else lin = prueba; } if (lin) centro(lin, yy, font, color); return yy; };
  centro('Libro de la Orden de Caballería', 330, '64px UnifrakturMaguntia', '#9E1F17');
  centro(opc.titulo, 400, 'italic 40px "EB Garamond", Georgia, serif', '#3A2F27');
  // retrato y armas
  const u = retratoURL();
  const svgArmas = logroSVG(S.blason, opc.grado, null);
  const armas = await cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgArmas));
  if (u) {
    const med = await cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(medallonSVG(360).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')));
    x.drawImage(med, 120, 450, 360, 360);
    x.drawImage(armas, 560, 420, 400, 520);
  } else x.drawImage(armas, (W-440)/2, 420, 440, 572);
  // nombre y grado
  const yNom = u ? 1010 : 1040;
  centro(S.perfil.nombre, yNom, '600 62px "EB Garamond", Georgia, serif', '#1B1A1A');
  centro(gradoNombre(opc.grado), yNom + 74, '58px UnifrakturMaguntia', '#9E1F17');
  let y = yNom + 140;
  if (opc.fiesta) { centro(`En la fiesta de ${opc.fiesta}`, y, '36px "EB Garamond", Georgia, serif', '#3A2F27'); y += 46; }
  centro(deISO(opc.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }), y, '36px "EB Garamond", Georgia, serif', '#3A2F27'); y += 46;
  if (S.perfil.padrino) { centro(`Padrino: ${S.perfil.padrino}`, y, 'italic 36px "EB Garamond", Georgia, serif', '#3A2F27'); y += 46; }
  if (S.blason) { y = envolver(blasonar(S.blason), y + 6, 'italic 26px "EB Garamond", Georgia, serif', '#6B5E4B', W - 280, 32) + 56; }
  y = envolver('«…para que todos sepan que es caballero y que está obligado a sostener y defender el honor de la Caballería.» (IV, §12)', Math.max(y, H - 260), '28px "EB Garamond", Georgia, serif', '#9E1F17', W - 260, 36);
  centro('AMDG', Math.min(Math.max(y + 60, H - 150), H - 105), '40px UnifrakturMaguntia', '#9E1F17');
  return new Promise((ok, ko) => c.toBlob(b => b ? ok(b) : ko(new Error('png')), 'image/png'));
}
async function compartirLamina(opc){
  try {
    const blob = await laminaPNG(opc);
    const nombre = 'lamina-' + (opc.fiesta ? 'investidura' : 'grado') + '.png';
    const file = new File([blob], nombre, { type:'image/png' });
    if (navigator.canShare && navigator.canShare({ files:[file] })) await navigator.share({ files:[file], title: opc.titulo, text: `${S.perfil.nombre}, ${gradoNombre(opc.grado)}` });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(), 1000); }
  } catch(e){ toast('No se pudo generar la lámina.'); }
}

function gradoNombre(g){ const G = GRADOS[g]; return fem() ? G.f : G.m; }
