(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Typed terminal lines
  const lines = [
    'nmap -sV --script vuln target  # curious by default',
    'ssh pi@workbench  # soldering iron still warm',
    'grep -r "TODO: auth" .  # found one',
    'pio run -t upload  # flashing the next idea',
    'echo "4th of 27, national finals"'
  ];
  const el = document.getElementById('typed');
  if (reduce) {
    el.textContent = lines[0];
  } else {
    let l = 0, c = 0, del = false;
    (function tick() {
      const s = lines[l];
      el.textContent = s.slice(0, c);
      if (!del && c === s.length) { del = true; return setTimeout(tick, 1800); }
      if (del && c === 0) { del = false; l = (l + 1) % lines.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 18 : 42);
    })();
  }

  // Scroll reveal + stat counters
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(count);
    io.unobserve(e.target);
  }), { threshold: .15 });
  document.querySelectorAll('.section,.stats,.card,.timeline li').forEach(n => { n.classList.add('reveal'); io.observe(n); });

  function count(n) {
    const to = parseFloat(n.dataset.count), suf = n.dataset.suffix || '';
    const dec = String(to).includes('.') ? 1 : 0;
    if (reduce) { n.textContent = to.toFixed(dec) + suf; return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1200, 1);
      n.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // PCB trace background: traces grow from random pads, with pulses travelling along them
  const cv = document.getElementById('pcb'), ctx = cv.getContext('2d');
  let W, H, traces = [], pulses = [];
  const G = 28;
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    build();
  }
  function build() {
    traces = []; pulses = [];
    const n = Math.round(W * H / 26000);
    for (let i = 0; i < n; i++) {
      let x = Math.round(Math.random() * W / G) * G, y = Math.round(Math.random() * H / G) * G;
      const pts = [[x, y]];
      let dir = Math.random() < .5 ? 0 : 1;
      for (let k = 0; k < 4 + Math.random() * 4; k++) {
        const len = (2 + Math.floor(Math.random() * 6)) * G, sg = Math.random() < .5 ? -1 : 1;
        if (dir) y += sg * len; else x += sg * len;
        pts.push([x, y]);
        dir ^= 1;
        if (Math.random() < .3) dir ^= 1;
      }
      traces.push(pts);
    }
    traces.forEach((t, i) => { if (i % 3 === 0) pulses.push({ t, seg: 0, p: Math.random() }); });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,255,157,.13)'; ctx.fillStyle = 'rgba(0,255,157,.3)';
    traces.forEach(t => {
      ctx.beginPath(); ctx.moveTo(...t[0]);
      t.slice(1).forEach(p => ctx.lineTo(...p));
      ctx.stroke();
      [t[0], t[t.length - 1]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 6.3); ctx.fill(); });
    });
    pulses.forEach(u => {
      const a = u.t[u.seg], b = u.t[u.seg + 1];
      const x = a[0] + (b[0] - a[0]) * u.p, y = a[1] + (b[1] - a[1]) * u.p;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, 'rgba(0,255,157,.9)'); g.addColorStop(1, 'rgba(0,255,157,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, 6.3); ctx.fill();
      u.p += 4 / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
      if (u.p >= 1) { u.p = 0; u.seg = (u.seg + 1) % (u.t.length - 1); }
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener('resize', () => { size(); if (reduce) draw(); });
  size(); draw();

  // Konami code easter egg
  const code = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
  let seq = [];
  addEventListener('keydown', e => {
    seq.push(e.key); seq = seq.slice(-10);
    if (seq.join() === code) document.body.classList.toggle('konami');
  });
})();
