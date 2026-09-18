/* File Studio — background object.
   A wireframe solid built, rotated and projected by hand on a 2D canvas.
   No WebGL, no libraries: ~150 lines of maths and a draw loop. */

(function(){
  const canvas = document.getElementById('bg3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- geometry: an icosahedron, subdivided once into an icosphere ---- */
  function icosphere(subdiv){
    const t = (1 + Math.sqrt(5)) / 2;
    let verts = [
      [-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],
      [0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],
      [t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]
    ].map(normalize);
    let faces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    for (let s=0; s<subdiv; s++){
      const cache = {}, next = [];
      const mid = (a,b)=>{
        const key = a<b ? a+'_'+b : b+'_'+a;
        if (key in cache) return cache[key];
        const v = normalize([
          (verts[a][0]+verts[b][0])/2,
          (verts[a][1]+verts[b][1])/2,
          (verts[a][2]+verts[b][2])/2
        ]);
        verts.push(v);
        return (cache[key] = verts.length - 1);
      };
      faces.forEach(([a,b,c])=>{
        const ab = mid(a,b), bc = mid(b,c), ca = mid(c,a);
        next.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);
      });
      faces = next;
    }
    const edgeSet = new Set(), edges = [];
    faces.forEach(f=>{
      [[f[0],f[1]],[f[1],f[2]],[f[2],f[0]]].forEach(([a,b])=>{
        const key = a<b ? a+'_'+b : b+'_'+a;
        if (!edgeSet.has(key)){ edgeSet.add(key); edges.push([a,b]); }
      });
    });
    return { verts, edges };
  }
  function normalize(v){
    const l = Math.hypot(v[0],v[1],v[2]);
    return [v[0]/l, v[1]/l, v[2]/l];
  }

  const shell = icosphere(1);   // outer cage
  const core  = icosphere(0);   // inner solid, counter-rotating

  /* a thin halo of points that drifts on its own ring */
  const motes = Array.from({length: 46}, (_,i)=>({
    a: (i/46) * Math.PI * 2,
    r: 1.55 + Math.random()*0.5,
    tilt: (Math.random()-0.5) * 0.9,
    speed: 0.12 + Math.random()*0.22
  }));

  /* ---- transforms ---- */
  function rotate(v, rx, ry, rz){
    let [x,y,z] = v;
    let c = Math.cos(rx), s = Math.sin(rx);
    [y,z] = [y*c - z*s, y*s + z*c];
    c = Math.cos(ry); s = Math.sin(ry);
    [x,z] = [x*c + z*s, -x*s + z*c];
    c = Math.cos(rz); s = Math.sin(rz);
    [x,y] = [x*c - y*s, x*s + y*c];
    return [x,y,z];
  }

  let W=0, H=0, R=1, cx=0, cy=0, radius=0;
  function resize(){
    const rect = canvas.getBoundingClientRect();
    R = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(rect.width, 1); H = Math.max(rect.height, 1);
    canvas.width = Math.floor(W*R); canvas.height = Math.floor(H*R);
    ctx.setTransform(R,0,0,R,0,0);
    cx = W/2; cy = H/2;
    radius = Math.min(W,H) * 0.29;
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* pointer parallax — the object leans toward the cursor */
  let px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e)=>{
    tx = (e.clientX / window.innerWidth  - 0.5) * 0.7;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.7;
  }, { passive:true });

  const FOCAL = 3.1;
  function project(v, scale){
    const depth = FOCAL / (FOCAL - v[2]);
    return { x: cx + v[0]*scale*depth, y: cy + v[1]*scale*depth, d: depth };
  }

  function drawMesh(mesh, rx, ry, rz, scale, opts){
    const pts = mesh.verts.map(v=> project(rotate(v, rx, ry, rz), scale));
    const depths = mesh.verts.map(v=> rotate(v, rx, ry, rz)[2]);
    mesh.edges.forEach(([a,b])=>{
      const dz = (depths[a] + depths[b]) / 2;          // -1 (far) .. 1 (near)
      const t = (dz + 1) / 2;
      ctx.globalAlpha = opts.alpha * (0.12 + t * 0.88);
      ctx.lineWidth = opts.width * (0.5 + t);
      ctx.strokeStyle = opts.color;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    });
    if (opts.nodes){
      pts.forEach((p,i)=>{
        const t = (depths[i] + 1) / 2;
        if (t < 0.55) return;
        ctx.globalAlpha = opts.alpha * (t - 0.5) * 1.6;
        ctx.fillStyle = opts.nodeColor || opts.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1 + t*1.4, 0, Math.PI*2);
        ctx.fill();
      });
    }
  }

  let t0 = performance.now(), time = 0, raf = null;
  function frame(now){
    const dt = Math.min((now - t0)/1000, 0.05);
    t0 = now;
    time += dt;

    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;

    ctx.clearRect(0,0,W,H);

    /* breathing scale so the object drifts toward and away from you */
    const breathe = 1 + Math.sin(time*0.42) * 0.09;
    const drift = Math.sin(time*0.23) * radius * 0.06;
    ctx.save();
    ctx.translate(drift, Math.cos(time*0.31) * radius * 0.05);

    // halo ring of motes
    motes.forEach(m=>{
      const a = m.a + time * m.speed;
      const v = rotate([Math.cos(a)*m.r, Math.sin(m.tilt)*0.9, Math.sin(a)*m.r],
                       py*0.6 + 0.35, time*0.16 + px*0.6, 0);
      const p = project(v, radius*breathe);
      const t = (v[2] + 1.8) / 3.6;
      ctx.globalAlpha = 0.10 + t*0.5;
      ctx.fillStyle = t > 0.62 ? '#7C5CFF' : '#F2F2F0';
      ctx.beginPath(); ctx.arc(p.x, p.y, 0.7 + t*1.5, 0, Math.PI*2); ctx.fill();
    });

    // outer cage — slow, wide tumble
    drawMesh(shell,
      time*0.17 + py, time*0.26 + px, Math.sin(time*0.13)*0.5,
      radius*breathe,
      { color:'#F2F2F0', width:0.75, alpha:0.42, nodes:true, nodeColor:'#7C5CFF' });

    // inner core — faster, opposite direction
    drawMesh(core,
      -time*0.48 + py*0.5, -time*0.35 - px*0.5, time*0.22,
      radius*0.46*(2 - breathe),
      { color:'#7C5CFF', width:1.15, alpha:0.75, nodes:false });

    ctx.globalAlpha = 1;
    ctx.restore();

    raf = requestAnimationFrame(frame);
  }

  function start(){ if (!raf && !reduced){ t0 = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop(){ if (raf){ cancelAnimationFrame(raf); raf = null; } }

  if (reduced){ time = 2.4; frame(performance.now()); stop(); }
  else start();

  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
})();
