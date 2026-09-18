/* File Studio — shared helpers.
   No analytics, no network calls, nothing phones home.
   Everything here runs against files already in the page's memory. */

/* ---------------------------------------------------------
   Tool registry — single source of truth for the home grid,
   the "related tools" strip and the search box.
   --------------------------------------------------------- */
const TOOLS = [
  // --- Organise PDFs ---
  { id:'merge-pdf',        name:'Merge PDF',        cat:'Organise', desc:'Combine several PDFs into one, in the order you choose.' },
  { id:'split-pdf',        name:'Split PDF',        cat:'Organise', desc:'Pull out page ranges, or burst a PDF into single pages.' },
  { id:'organize-pdf',     name:'Rotate & reorder', cat:'Organise', desc:'Turn, move or delete pages on a visual page board.' },
  { id:'compress-pdf',     name:'Compress PDF',     cat:'Organise', desc:'Shrink a heavy PDF down to an email-friendly size.' },
  { id:'page-numbers',     name:'Page numbers',     cat:'Organise', desc:'Stamp page numbers anywhere on the page, your format.' },
  { id:'pdf-info',         name:'PDF details',      cat:'Organise', desc:'See and edit title, author, subject and keywords.' },

  // --- Protect & mark up ---
  { id:'redact-pdf',       name:'Redact PDF',       cat:'Protect',  desc:'Paint over anything private — the text underneath is destroyed.' },
  { id:'sign-pdf',         name:'Sign PDF',         cat:'Protect',  desc:'Draw or type a signature and drop it on the page.' },
  { id:'watermark-pdf',    name:'Watermark PDF',    cat:'Protect',  desc:'Lay text or a logo across every page, at any angle.' },
  { id:'extract-images',   name:'Extract images',   cat:'Protect',  desc:'Save the pictures embedded in a PDF as PNG files.' },

  // --- Convert to PDF ---
  { id:'image-to-pdf',     name:'Image → PDF',      cat:'To PDF',   desc:'Turn one or more photos into a single, clean PDF.' },
  { id:'word-to-pdf',      name:'Word → PDF',       cat:'To PDF',   desc:'Lay out a .docx file as a paginated PDF.' },
  { id:'excel-to-pdf',     name:'Excel → PDF',      cat:'To PDF',   desc:'Print a spreadsheet as a tidy PDF table.' },
  { id:'powerpoint-to-pdf',name:'PowerPoint → PDF', cat:'To PDF',   desc:'Flatten .pptx slides into one PDF, one slide per page.' },
  { id:'html-to-pdf',      name:'HTML → PDF',       cat:'To PDF',   desc:'Render a web page or pasted HTML into a PDF.' },
  { id:'markdown-to-pdf',  name:'Markdown → PDF',   cat:'To PDF',   desc:'Write in Markdown, get a typeset PDF back.' },

  // --- Convert from PDF ---
  { id:'pdf-to-images',    name:'PDF → Images',     cat:'From PDF', desc:'Export every page as a PNG, zipped for you.' },
  { id:'pdf-to-text',      name:'PDF → Text',       cat:'From PDF', desc:'Extract the text content of a PDF, page by page.' },
  { id:'pdf-to-word',      name:'PDF → Word',       cat:'From PDF', desc:'Rebuild the text as an editable Word document.' },
  { id:'pdf-to-excel',     name:'PDF → Excel',      cat:'From PDF', desc:'Detect table rows and columns and send them to a sheet.' },
  { id:'pdf-to-powerpoint',name:'PDF → PowerPoint', cat:'From PDF', desc:'Each page becomes a slide you can build on.' },
  { id:'pdf-to-html',      name:'PDF → HTML',       cat:'From PDF', desc:'Get a single web page that keeps the original layout.' },

  // --- Images & text ---
  { id:'photo-to-text',    name:'Photo → Text',     cat:'Everything else', desc:'Pull readable text out of a photo or scan with on-device OCR.' },
  { id:'image-converter',  name:'Image converter',  cat:'Everything else', desc:'Switch between JPG, PNG and WebP, resize, dial in quality.' },
  { id:'qr-generator',     name:'QR generator',     cat:'Everything else', desc:'Turn any link or line of text into a downloadable QR code.' },
  { id:'word-counter',     name:'Word counter',     cat:'Everything else', desc:'Words, characters and reading time, counted as you type.' },
];

const TOOL_CATS = ['Organise','Protect','To PDF','From PDF','Everything else'];

/* ---------------------------------------------------------
   Page chrome — nav + footer, injected so every page stays
   in sync when a link changes.
   --------------------------------------------------------- */
function base(){ return document.body.dataset.base || ''; }

function buildChrome(){
  const b = base();
  const nav = document.getElementById('chrome-nav');
  if (nav){
    nav.className = 'nav';
    nav.innerHTML = `<div class="wrap nav-inner">
      <a class="brand" href="${b}index.html"><span class="brand-mark"></span> File Studio</a>
      <nav class="nav-links">
        <a href="${b}index.html">Tools</a>
        <a href="${b}privacy.html">Privacy</a>
        <a href="${b}about.html">About</a>
      </nav>
    </div>`;
  }
  const foot = document.getElementById('chrome-footer');
  if (foot){
    foot.className = 'footer';
    foot.innerHTML = `<span>Founded by <strong>Isaac Lun</strong> — all rights reserved © 2026</span>
      <span class="footer-links">
        <a href="${b}index.html">Tools</a><a href="${b}privacy.html">Privacy</a><a href="${b}about.html">About</a>
      </span>
      <span>Nothing leaves your device.</span>`;
  }
  const rel = document.getElementById('related');
  if (rel) buildRelated(rel);
}

function buildRelated(el){
  const b = base();
  const here = location.pathname.split('/').pop().replace('.html','');
  const me = TOOLS.find(t=> t.id === here);
  if (!me) return;
  const peers = TOOLS.filter(t=> t.cat === me.cat && t.id !== me.id).slice(0,4);
  if (!peers.length) return;
  el.innerHTML = `<div class="wrap related-inner">
    <h2>More ${me.cat === 'Everything else' ? 'tools' : me.cat.toLowerCase()} tools</h2>
    <div class="related-row">${peers.map(t=>
      `<a class="related-card" href="${b}tools/${t.id}.html"><span>${t.name}</span><em>${t.desc}</em></a>`).join('')}
    </div></div>`;
}

document.addEventListener('DOMContentLoaded', buildChrome);

/* ---------------------------------------------------------
   Small utilities
   --------------------------------------------------------- */
function formatBytes(bytes){
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(k));
  return `${parseFloat((bytes/Math.pow(k,i)).toFixed(1))} ${sizes[i]}`;
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

function setStatus(el, msg, kind){
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('ok','err');
  if (kind) el.classList.add(kind);
}

function setProgress(barEl, wrapEl, pct){
  wrapEl.classList.add('show');
  barEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
  if (pct >= 100) setTimeout(()=> wrapEl.classList.remove('show'), 700);
}

function wireDropzone(dz, input, onFiles){
  dz.addEventListener('click', ()=> input.click());
  dz.addEventListener('keydown', (e)=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); input.click(); } });
  dz.tabIndex = 0;
  input.addEventListener('change', (e)=>{ onFiles(Array.from(e.target.files)); input.value=''; });
  ['dragenter','dragover'].forEach(evt=> dz.addEventListener(evt, (e)=>{ e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt=> dz.addEventListener(evt, (e)=>{ e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e)=> onFiles(Array.from(e.dataTransfer.files)));
}

function readFileAsArrayBuffer(file){
  return new Promise((res, rej)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsArrayBuffer(file); });
}
function readFileAsDataURL(file){
  return new Promise((res, rej)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
}
function readFileAsText(file){
  return new Promise((res, rej)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsText(file); });
}

function isPdf(f){ return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'); }
function baseName(name){ return name.replace(/\.[^/.]+$/, ''); }

/* Parse "1-3, 5, 8-" into a zero-based page index array. */
function parseRanges(str, pageCount){
  const out = [];
  if (!str || !str.trim()) return Array.from({length:pageCount}, (_,i)=>i);
  str.split(/[,\s]+/).filter(Boolean).forEach(part=>{
    const m = part.match(/^(\d+)?\s*-\s*(\d+)?$/);
    if (m){
      const a = m[1] ? parseInt(m[1]) : 1;
      const b = m[2] ? parseInt(m[2]) : pageCount;
      for (let i=Math.min(a,b); i<=Math.max(a,b); i++) if (i>=1 && i<=pageCount) out.push(i-1);
    } else {
      const n = parseInt(part);
      if (!isNaN(n) && n>=1 && n<=pageCount) out.push(n-1);
    }
  });
  return [...new Set(out)];
}

/* pdf.js setup + page rendering */
function usePdfJs(){
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
async function loadPdfJsDoc(file){
  const bytes = await readFileAsArrayBuffer(file);
  return pdfjsLib.getDocument({ data: bytes }).promise;
}
async function renderPageToCanvas(page, scale){
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}
function canvasToBlob(canvas, type='image/png', quality){
  return new Promise(res=> canvas.toBlob(res, type, quality));
}

/* pdf-lib standard fonts only cover WinAnsi — swap anything else
   for a placeholder so a stray emoji can't break a whole export. */
function winAnsi(str){
  return (str||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"')
    .replace(/[\u2013\u2014]/g,'-').replace(/\u2026/g,'...').replace(/\t/g,'    ')
    .replace(/[^\x00-\xFF]/g,'?');
}

/* Wrap text to a width for pdf-lib drawing. */
function wrapText(text, font, size, maxWidth){
  const lines = [];
  (text||'').split('\n').forEach(para=>{
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length){ lines.push(''); return; }
    let line = '';
    words.forEach(w=>{
      const test = line ? line + ' ' + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line){ lines.push(line); line = w; }
      else line = test;
    });
    lines.push(line);
  });
  return lines;
}

/* Turn a list of canvases into a PDF (used by every "render then export" tool). */
async function canvasesToPdfBytes(canvases, { jpeg = true, quality = 0.85 } = {}){
  const { PDFDocument } = PDFLib;
  const pdf = await PDFDocument.create();
  for (const c of canvases){
    const blob = await canvasToBlob(c, jpeg ? 'image/jpeg' : 'image/png', jpeg ? quality : undefined);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const img = jpeg ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x:0, y:0, width: img.width, height: img.height });
  }
  return pdf.save();
}

/* Render an offscreen DOM element into A4 PDF pages via html2canvas. */
async function elementToPdfBytes(el, { margin = 40, pageSize = [595.28, 841.89], scale = 2 } = {}){
  const canvas = await html2canvas(el, { scale, backgroundColor:'#ffffff', useCORS:true, logging:false });
  const { PDFDocument } = PDFLib;
  const pdf = await PDFDocument.create();
  const [pw, ph] = pageSize;
  const usableW = pw - margin*2, usableH = ph - margin*2;
  const pxPerPt = canvas.width / usableW;
  const sliceH = Math.floor(usableH * pxPerPt);
  let y = 0;
  while (y < canvas.height){
    const h = Math.min(sliceH, canvas.height - y);
    const slice = document.createElement('canvas');
    slice.width = canvas.width; slice.height = h;
    const ctx = slice.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,slice.width,slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    const blob = await canvasToBlob(slice, 'image/jpeg', 0.92);
    const img = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const page = pdf.addPage([pw, ph]);
    page.drawImage(img, { x: margin, y: ph - margin - (h/pxPerPt), width: usableW, height: h/pxPerPt });
    y += h;
  }
  return pdf.save();
}

/* A clean white sheet to render HTML into before converting. */
function makePrintSheet(html, widthPx = 794){
  const holder = document.createElement('div');
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${widthPx}px;background:#fff;color:#111;
    font:15px/1.65 'Inter',system-ui,sans-serif;padding:0;`;
  holder.innerHTML = `<div class="print-sheet">${html}</div>`;
  document.body.appendChild(holder);
  return holder;
}
