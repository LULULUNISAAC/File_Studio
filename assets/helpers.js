// Small shared helpers — no analytics, no network calls, nothing phones home.

function formatBytes(bytes){
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(k));
  return `${parseFloat((bytes/Math.pow(k,i)).toFixed(1))} ${sizes[i]}`;
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

function setStatus(el, msg, kind){
  el.textContent = msg;
  el.classList.remove('ok','err');
  if (kind) el.classList.add(kind);
}

function setProgress(barEl, wrapEl, pct){
  wrapEl.classList.add('show');
  barEl.style.width = Math.max(0, Math.min(100,pct)) + '%';
  if (pct >= 100){
    setTimeout(()=> wrapEl.classList.remove('show'), 600);
  }
}

// Generic dropzone wiring: dz = dropzone element, input = file input, onFiles(fileList)
function wireDropzone(dz, input, onFiles){
  dz.addEventListener('click', ()=> input.click());
  input.addEventListener('change', (e)=> onFiles(Array.from(e.target.files)));
  ['dragenter','dragover'].forEach(evt=>{
    dz.addEventListener(evt, (e)=>{ e.preventDefault(); dz.classList.add('drag'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    dz.addEventListener(evt, (e)=>{ e.preventDefault(); dz.classList.remove('drag'); });
  });
  dz.addEventListener('drop', (e)=>{
    const files = Array.from(e.dataTransfer.files);
    onFiles(files);
  });
}

function readFileAsArrayBuffer(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
}

function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
