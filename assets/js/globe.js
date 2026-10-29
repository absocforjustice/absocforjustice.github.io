/* AFJ campaigns globe — a dotted world that spins, with the six campaigns marked.
   Plain canvas, no libraries. Drag to turn it; tap a label to jump to that campaign. */
(function () {
  "use strict";

  var canvas = document.getElementById("afj-globe");
  if (!canvas || !window.AFJ_LAND) return;
  var ctx = canvas.getContext("2d");
  var wrap = canvas.parentNode;

  var D = Math.PI / 180;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Campaign markers: [label, number, lon, lat, anchor id, label offset dx, dy]
  var PLACES = [
    ["Britain", "01", -1.5, 52.5, "britain", -1, -0.6],
    ["Palestine", "02", 35.0, 31.6, "palestine", -1, 0.35],
    ["Lebanon", "03", 35.6, 33.9, "lebanon", -1, -1.2],
    ["Azerbaijan", "04", 49.9, 40.4, "azerbaijan", 1, -1.3],
    ["Bahrain", "05", 50.6, 26.2, "bahrain", 1, 1.2],
    ["Pakistan", "06", 70.1, 33.9, "pakistan", 1, 1.0],
    ["Jannat al-Baqi", "07", 39.6, 24.5, "baqi", -1, 2.8],
    ["Nigeria", "08", 7.7, 11.1, "nigeria", -1, 0.1],
    ["Afghanistan", "09", 67.0, 34.6, "hazara", 1, -0.4]
  ].map(function (p) {
    return { name: p[0], num: p[1], lam: p[2] * D, phi: p[3] * D, id: p[4], dx: p[5], dy: p[6] };
  });

  // Land dots
  var L = window.AFJ_LAND, n = L.length / 3;
  var lam = new Float32Array(n), sphi = new Float32Array(n), cphi = new Float32Array(n), hl = new Uint8Array(n);
  for (var i = 0; i < n; i++) {
    var lo = L[i * 3] / 10 * D, la = L[i * 3 + 1] / 10 * D;
    lam[i] = lo; sphi[i] = Math.sin(la); cphi[i] = Math.cos(la); hl[i] = L[i * 3 + 2];
  }

  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  var rot = 22 * D;           // centre longitude (22°E faces the viewer to start, so Britain and the Middle East are both in view)
  var tilt = 22 * D;          // look slightly down on the northern hemisphere
  var stp = Math.sin(tilt), ctp = Math.cos(tilt);
  var speed = 10 * D;         // degrees per second
  var vel = 0, dragging = false, lastX = 0, hoverPause = 0, last = 0, visible = true;
  var hits = [];

  function size() {
    var r = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.width;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.height = H + "px";
    R = W * 0.38; cx = W / 2; cy = H / 2;
  }

  function project(l, sp, cp) {
    var dl = l - rot, cdl = Math.cos(dl);
    var z = stp * sp + ctp * cp * cdl;              // >0 = facing us
    return [cp * Math.sin(dl), ctp * sp - stp * cp * cdl, z];
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Outer glow
    var glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.45);
    glow.addColorStop(0, "rgba(200,162,74,0.32)");
    glow.addColorStop(0.35, "rgba(200,162,74,0.10)");
    glow.addColorStop(1, "rgba(200,162,74,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, 7); ctx.fill();

    // Sphere
    var sph = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    sph.addColorStop(0, "#7a2a2d");
    sph.addColorStop(0.55, "#4a1316");
    sph.addColorStop(1, "#22070a");
    ctx.fillStyle = sph; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

    // Dots: far side first (faint), then near side
    var ds = Math.max(1.1, R / 150);
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < n; i++) {
        var p = project(lam[i], sphi[i], cphi[i]);
        var front = p[2] > 0;
        if ((pass === 0) === front) continue;
        var x = cx + R * p[0], y = cy - R * p[1];
        if (!front) {
          ctx.fillStyle = "rgba(239,230,215,0.06)";
          ctx.fillRect(x - ds * 0.4, y - ds * 0.4, ds * 0.8, ds * 0.8);
          continue;
        }
        var k = 0.35 + 0.65 * p[2];
        if (hl[i]) {
          ctx.fillStyle = "rgba(232,196,104," + (0.55 + 0.45 * p[2]).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(x, y, ds * (0.75 + 0.45 * p[2]), 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(247,240,228," + (0.22 + 0.6 * p[2]).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(x, y, ds * 0.55 * k + 0.25, 0, 7); ctx.fill();
        }
      }
    }

    // Rim light
    ctx.strokeStyle = "rgba(232,196,104,0.55)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();

    // Orbit ring (tilted ellipse), back half behind, front half in front of markers
    var ringT = (t / 1000) * 0.6;
    function ring(start, end, alpha) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.38);
      ctx.strokeStyle = "rgba(200,162,74," + alpha + ")"; ctx.lineWidth = 1.1;
      ctx.setLineDash([2, 7]); ctx.lineDashOffset = -ringT * 20;
      ctx.beginPath(); ctx.ellipse(0, 0, R * 1.32, R * 0.36, 0, start, end); ctx.stroke();
      ctx.restore();
    }
    ring(Math.PI, Math.PI * 2, 0.35);

    // Markers + labels
    hits = [];
    var pulse = (t / 1000) % 1.6 / 1.6;
    ctx.font = "600 " + Math.max(11, Math.round(R / 15)) + "px Inter, system-ui, sans-serif";
    ctx.textBaseline = "middle";
    PLACES.forEach(function (pl) {
      var p = project(pl.lam, Math.sin(pl.phi), Math.cos(pl.phi));
      if (p[2] <= 0.05) return;
      var a = Math.min(1, (p[2] - 0.05) / 0.25);
      var x = cx + R * p[0], y = cy - R * p[1];

      // pulse
      ctx.strokeStyle = "rgba(232,196,104," + (a * (1 - pulse)).toFixed(3) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 3 + pulse * R * 0.07, 0, 7); ctx.stroke();
      ctx.fillStyle = "rgba(255,236,190," + a + ")";
      ctx.beginPath(); ctx.arc(x, y, Math.max(2.6, R / 70), 0, 7); ctx.fill();

      // label
      var fs = Math.max(11, Math.round(R / 15));
      var tw = ctx.measureText(pl.name).width;
      var nw = ctx.measureText(pl.num).width;
      var pw = tw + nw + fs * 1.6, ph = fs * 1.9;
      var off = R * 0.16;
      var lx = pl.dx > 0 ? x + off : x - off - pw;
      var ly = y + pl.dy * off - ph / 2;
      lx = Math.max(4, Math.min(W - pw - 4, lx));
      ctx.globalAlpha = a;
      ctx.strokeStyle = "rgba(232,196,104,0.75)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(pl.dx > 0 ? lx : lx + pw, ly + ph / 2); ctx.stroke();
      roundRect(lx, ly, pw, ph, ph / 2);
      ctx.fillStyle = "rgba(251,246,236,0.96)"; ctx.fill();
      ctx.fillStyle = "#a9863a"; ctx.fillText(pl.num, lx + fs * 0.6, ly + ph / 2 + 0.5);
      ctx.fillStyle = "#3f1113"; ctx.fillText(pl.name, lx + fs * 0.6 + nw + fs * 0.4, ly + ph / 2 + 0.5);
      ctx.globalAlpha = 1;
      if (a > 0.5) hits.push({ x: lx, y: ly, w: pw, h: ph, id: pl.id, mx: x, my: y });
    });

    ring(0, Math.PI, 0.6);
  }

  function frame(t) {
    if (!last) last = t;
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!dragging) {
      if (Math.abs(vel) > 0.0001) { rot -= vel * dt; vel *= Math.pow(0.04, dt); }
      if (!hoverPause && !reduce) rot += speed * dt;
    }
    draw(t);
    if (visible) requestAnimationFrame(frame);
  }

  function hitAt(e) {
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if ((x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) ||
          Math.hypot(x - h.mx, y - h.my) < 12) return h;
    }
    return null;
  }

  var downX = 0, downT = 0;
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true; lastX = downX = e.clientX; downT = performance.now(); vel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (dragging) {
      var dx = e.clientX - lastX; lastX = e.clientX;
      var d = -dx / R; rot += d; vel = -d / 0.016;
      if (reduce) draw(performance.now());
      return;
    }
    var h = hitAt(e);
    canvas.style.cursor = h ? "pointer" : "grab";
    hoverPause = h ? 1 : 0;
  });
  function up(e) {
    if (!dragging) return;
    dragging = false;
    var moved = Math.abs(e.clientX - downX), quick = performance.now() - downT < 400;
    if (moved < 6 && quick) {
      var h = hitAt(e);
      if (h) {
        vel = 0;
        var target = document.getElementById(h.id);
        if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", "#" + h.id);
      }
    }
  }
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", function () { hoverPause = 0; });

  // Only animate while the globe is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      var was = visible; visible = en[0].isIntersecting;
      if (visible && !was) { last = 0; requestAnimationFrame(frame); }
    }).observe(canvas);
  }

  window.addEventListener("resize", function () { size(); draw(performance.now()); });
  size();
  if (reduce) { draw(0); } else { requestAnimationFrame(frame); }
})();
