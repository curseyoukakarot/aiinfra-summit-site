/* AIS6 exploding cube — live replacement for videos/cube-fig-black-v4.*
   Renders on a transparent canvas so the section background shows through.
   Edit the CONFIG block to change dates, text, or colors. */
(function () {
  'use strict';
  if (!window.THREE) return;
  var canvas = document.getElementById('cube-fig');
  if (!canvas) return;

  // ---------------- CONFIG ----------------
  var CFG = {
    a1: 'AI', a2: 'INFRA',      // title face
    b1: 'Dec 03/', b2: '2026',  // date face
    accent: '#5DFF4E',          // text + fracture faces
    cube: '#000000',            // cube body
    loop: 10,                   // seconds per loop
    turns: 1,                   // full rotations per loop
    density: 6,                 // fracture cuts per axis
    seed: 11
  };

  var S = 2, H = S / 2, TEX = 1024;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function smoother(x) { x = clamp(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9.6);
  var group = new THREE.Group();
  scene.add(group);

  function makeTex() {
    var c = document.createElement('canvas');
    c.width = c.height = TEX;
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return { canvas: c, ctx: c.getContext('2d'), tex: t };
  }
  var texA = makeTex(), texB = makeTex(), texBlank = makeTex();
  var FONT = '"gv", "Geist", Arial, sans-serif'; // site's local Geist face

  function drawTitle() {
    var x = texA.ctx;
    x.fillStyle = CFG.cube; x.fillRect(0, 0, TEX, TEX);
    x.fillStyle = CFG.accent;
    x.font = '800 172px ' + FONT;
    x.textBaseline = 'alphabetic';
    x.fillText(CFG.a1, 150, 430);
    x.fillText(CFG.a2, 150, 604);
    texA.tex.needsUpdate = true;
  }
  function drawDate() {
    var x = texB.ctx;
    x.fillStyle = CFG.cube; x.fillRect(0, 0, TEX, TEX);
    x.fillStyle = CFG.accent;
    x.font = '700 118px ' + FONT;
    x.textBaseline = 'alphabetic';
    x.fillText(CFG.b1, 150, 500);
    x.fillText(CFG.b2, 430, 632);
    texB.tex.needsUpdate = true;
  }
  function drawBlank() {
    var x = texBlank.ctx;
    x.fillStyle = CFG.cube; x.fillRect(0, 0, TEX, TEX);
    texBlank.tex.needsUpdate = true;
  }
  function redrawAll() { drawTitle(); drawDate(); drawBlank(); renderOnce(); }
  drawTitle(); drawDate(); drawBlank();
  if (document.fonts && document.fonts.ready) {
    Promise.all([
      document.fonts.load('800 172px "gv"'),
      document.fonts.load('700 118px "gv"')
    ]).then(redrawAll).catch(function () {});
    document.fonts.ready.then(redrawAll).catch(function () {});
  }

  var matA = new THREE.MeshBasicMaterial({ map: texA.tex });
  var matB = new THREE.MeshBasicMaterial({ map: texB.tex });
  var matBlank = new THREE.MeshBasicMaterial({ map: texBlank.tex });
  var matAccent = new THREE.MeshBasicMaterial({ color: CFG.accent });
  var matBlack = new THREE.MeshBasicMaterial({ color: CFG.cube });
  var sideMats = [matB, matB, matBlank, matBlank, matA, matA]; // px nx py ny pz nz

  var uvMap = [
    function (p) { return [(H - p.z) / S, (p.y + H) / S]; },
    function (p) { return [(p.z + H) / S, (p.y + H) / S]; },
    function (p) { return [(p.x + H) / S, (H - p.z) / S]; },
    function (p) { return [(p.x + H) / S, (p.z + H) / S]; },
    function (p) { return [(p.x + H) / S, (p.y + H) / S]; },
    function (p) { return [(H - p.x) / S, (p.y + H) / S]; }
  ];

  var shards = [], lastAssembled = null;
  var AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];

  function makeCuts(n, rng) {
    var cuts = [], i, c;
    for (i = 0; i < n; i++) {
      if (cuts.length && rng() < 0.38) {
        c = clamp(cuts[cuts.length - 1] + 0.022 + 0.05 * rng(), 0.04, 0.96);
      } else {
        c = 0.07 + 0.86 * rng();
      }
      cuts.push(c);
    }
    cuts.sort(function (a, b) { return a - b; });
    var out = [0];
    for (i = 0; i < cuts.length; i++) {
      if (cuts[i] - out[out.length - 1] >= 0.02) out.push(cuts[i]);
    }
    out.push(1);
    return out;
  }

  function addShard(dims, center, mats, uvSide, motion, rng) {
    var geo = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
    if (uvSide >= 0) {
      var pos = geo.attributes.position, uv = geo.attributes.uv;
      var p = new THREE.Vector3();
      for (var v = uvSide * 4; v < uvSide * 4 + 4; v++) {
        p.set(pos.getX(v) + center[0], pos.getY(v) + center[1], pos.getZ(v) + center[2]);
        var st = uvMap[uvSide](p);
        uv.setXY(v, st[0], st[1]);
      }
      uv.needsUpdate = true;
    }
    var mesh = new THREE.Mesh(geo, mats);
    mesh.position.set(center[0], center[1], center[2]);
    group.add(mesh);

    var perp1 = AXES[(motion.axis + 1) % 3], perp2 = AXES[(motion.axis + 2) % 3];
    var lat = perp1.clone().multiplyScalar((rng() - 0.5) * 0.2)
      .add(perp2.clone().multiplyScalar((rng() - 0.5) * 0.2));
    shards.push({
      mesh: mesh,
      base: new THREE.Vector3(center[0], center[1], center[2]),
      dir: AXES[motion.axis].clone().multiplyScalar(motion.sign),
      axis: motion.axis,
      dist: motion.dist,
      str: Math.min(motion.str, 14),
      lat: lat,
      delay: rng() * 0.045
    });
  }

  function buildFracture() {
    var rng = mulberry32(CFG.seed);
    var i, a, k;

    for (var side = 0; side < 6; side++) {
      var n = side >> 1;
      var sgn = (side % 2 === 0) ? 1 : -1;
      var a1 = (n + 1) % 3, a2 = (n + 2) % 3;
      var cutsU = makeCuts(CFG.density, rng), cutsV = makeCuts(CFG.density, rng);
      for (var iu = 0; iu < cutsU.length - 1; iu++)
        for (var iv = 0; iv < cutsV.length - 1; iv++) {
          var u0 = cutsU[iu] * S - H, u1 = cutsU[iu + 1] * S - H;
          var v0 = cutsV[iv] * S - H, v1 = cutsV[iv + 1] * S - H;
          var th = (0.025 + 0.05 * rng()) * S;
          var dims = [0, 0, 0], center = [0, 0, 0];
          dims[n] = th; dims[a1] = u1 - u0; dims[a2] = v1 - v0;
          center[n] = sgn * (H - th / 2);
          center[a1] = (u0 + u1) / 2; center[a2] = (v0 + v1) / 2;

          var mats = [matAccent, matAccent, matAccent, matAccent, matAccent, matAccent];
          mats[side] = sideMats[side];
          mats[side ^ 1] = matBlack;

          var axis, sign;
          if (rng() < 0.4) { axis = n; sign = sgn; }
          else {
            axis = rng() < 0.5 ? a1 : a2;
            var cc = center[axis];
            sign = Math.abs(cc) < 0.06 ? (rng() < 0.5 ? -1 : 1) : (cc >= 0 ? 1 : -1);
          }
          var dist = (0.22 + 0.95 * Math.pow(rng(), 1.5)) * (axis === n ? 0.55 + 0.5 * rng() : 0.5 + rng());
          var str = axis === n ? 1 + Math.pow(rng(), 2) * 3 : 1 + Math.pow(rng(), 1.8) * 7;
          if (rng() < 0.12) { dist *= 0.15; str = 1; }
          addShard(dims, center, mats, side, { axis: axis, sign: sign, dist: dist, str: str }, rng);
        }
    }

    var beamCount = 90 + CFG.density * 8;
    for (i = 0; i < beamCount; i++) {
      a = (rng() * 3) | 0;
      var b1 = (a + 1) % 3, b2 = (a + 2) % 3;
      var dimsB = [0, 0, 0], centerB = [0, 0, 0];
      dimsB[a] = (0.18 + 0.65 * rng()) * S;
      dimsB[b1] = (0.02 + 0.07 * Math.pow(rng(), 1.3)) * S;
      dimsB[b2] = (0.02 + 0.07 * Math.pow(rng(), 1.3)) * S;
      for (k = 0; k < 3; k++) {
        var m = H - dimsB[k] / 2 - 0.02;
        centerB[k] = (rng() * 2 - 1) * Math.max(m, 0);
      }
      var blackPair = rng() < 0.5 ? b1 : b2;
      var matsB = [matAccent, matAccent, matAccent, matAccent, matAccent, matAccent];
      matsB[blackPair * 2] = matBlack; matsB[blackPair * 2 + 1] = matBlack;
      if (rng() < 0.35) {
        var other = blackPair === b1 ? b2 : b1;
        matsB[other * 2] = matBlack; matsB[other * 2 + 1] = matBlack;
      }
      var cvB = centerB[a];
      var signB = Math.abs(cvB) < 0.05 ? (rng() < 0.5 ? -1 : 1) : (cvB >= 0 ? 1 : -1);
      addShard(dimsB, centerB, matsB, -1,
        { axis: a, sign: signB, dist: 0.3 + 1.05 * Math.pow(rng(), 1.4), str: 1.5 + Math.pow(rng(), 1.6) * 8 }, rng);
    }

    for (i = 0; i < 9; i++) {
      a = (rng() * 3) | 0;
      var dimsC = [(0.12 + 0.2 * rng()) * S, (0.12 + 0.2 * rng()) * S, (0.12 + 0.2 * rng()) * S];
      var centerC = [0, 0, 0];
      for (k = 0; k < 3; k++) {
        var m2 = H - dimsC[k] / 2 - 0.02;
        centerC[k] = (rng() * 2 - 1) * Math.max(m2, 0) * 0.7;
      }
      var accPair = (rng() * 3) | 0;
      var matsC = [matBlack, matBlack, matBlack, matBlack, matBlack, matBlack];
      matsC[accPair * 2] = matAccent; matsC[accPair * 2 + 1] = matAccent;
      addShard(dimsC, centerC, matsC, -1,
        { axis: a, sign: rng() < 0.5 ? -1 : 1, dist: 0.12 + 0.3 * rng(), str: 1 + rng() * 0.6 }, rng);
    }
  }
  buildFracture();

  var coverCube = new THREE.Mesh(new THREE.BoxGeometry(S, S, S), sideMats);
  group.add(coverCube);

  // ---------------- animation ----------------
  var ES = 0.16, EE = 0.30, RS = 0.78, RE = 0.93, DRIFT = 0.38;
  function env(tt) {
    if (tt < ES || tt >= RE) return 0;
    if (tt < EE) return smoother((tt - ES) / (EE - ES));
    if (tt < RS) return 1 + DRIFT * ((tt - EE) / (RS - EE));
    return (1 + DRIFT) * (1 - smoother((tt - RS) / (RE - RS)));
  }

  var qBase = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.34, -0.72, 0.02));
  var spinAxis = new THREE.Vector3(0.35, 1, 0.22).normalize();
  var qSpin = new THREE.Quaternion(), qWx = new THREE.Quaternion(), qWz = new THREE.Quaternion();
  var X_AXIS = new THREE.Vector3(1, 0, 0), Z_AXIS = new THREE.Vector3(0, 0, 1);
  var TAU = Math.PI * 2;
  var playhead = 0, lastNow = 0, rafId = 0, inView = true;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function update(tt) {
    qSpin.setFromAxisAngle(spinAxis, TAU * CFG.turns * tt);
    qWx.setFromAxisAngle(X_AXIS, 0.10 * Math.sin(2 * TAU * tt + 1.3));
    qWz.setFromAxisAngle(Z_AXIS, 0.07 * Math.sin(TAU * tt + 4.2));
    group.quaternion.copy(qBase).multiply(qSpin).multiply(qWx).multiply(qWz);

    var assembled = tt < ES || tt >= RE + 0.05;
    if (lastAssembled !== assembled) {
      lastAssembled = assembled;
      coverCube.visible = assembled;
      for (var j = 0; j < shards.length; j++) shards[j].mesh.visible = !assembled;
    }
    if (!assembled) {
      for (var i = 0; i < shards.length; i++) {
        var s = shards[i];
        var b = env((tt - s.delay + 1) % 1);
        var m = Math.min(b, 1);
        var d = s.dist * b;
        s.mesh.position.set(
          s.base.x + s.dir.x * d + s.lat.x * m,
          s.base.y + s.dir.y * d + s.lat.y * m,
          s.base.z + s.dir.z * d + s.lat.z * m
        );
        var sc = 1 + (s.str - 1) * m * (1 + 0.25 * Math.max(0, b - 1));
        if (s.axis === 0) s.mesh.scale.set(sc, 1, 1);
        else if (s.axis === 1) s.mesh.scale.set(1, sc, 1);
        else s.mesh.scale.set(1, 1, sc);
      }
    }
    renderer.render(scene, camera);
  }
  function renderOnce() { update(playhead); }

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (!lastNow) lastNow = now;
    var dt = Math.min(0.1, (now - lastNow) / 1000);
    lastNow = now;
    playhead = (playhead + dt / CFG.loop) % 1;
    update(playhead);
  }
  function start() {
    if (rafId || (reducedMotion && reducedMotion.matches)) return;
    lastNow = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  function fit() {
    var host = canvas.parentElement;
    var r = host.getBoundingClientRect();
    var size = Math.max(2, Math.round(Math.min(r.width, r.height) || r.width));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderOnce();
  }
  window.addEventListener('resize', fit);
  if ('ResizeObserver' in window) {
    new ResizeObserver(fit).observe(canvas.parentElement);
  }
  fit();

  // static pose for reduced motion; animate otherwise, pausing offscreen
  if (reducedMotion && reducedMotion.matches) {
    playhead = 0.05;
    renderOnce();
  } else {
    start();
  }
  if (reducedMotion && reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', function (e) {
      if (e.matches) { stop(); playhead = 0.05; renderOnce(); }
      else if (inView) start();
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { rootMargin: '100px' }).observe(canvas);
  }

  window.__cubeFig = {
    seek: function (tt) { playhead = ((tt % 1) + 1) % 1; renderOnce(); return playhead; },
    cfg: CFG
  };
})();
