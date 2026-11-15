/* Điện tử cơ bản MĐ13 — lõi mô phỏng: tiện ích, ký hiệu linh kiện, đồ thị, vòng lặp. */
(function () {
  "use strict";
  var DT = (window.DT = { sims: {}, NOW: 0 });
  var RM = (DT.RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var E = (DT.E = function (id) { return document.getElementById(id); });
  var root = document.documentElement, cs = null;
  var cssv = (DT.cssv = function (n) { if (!cs) cs = getComputedStyle(root); return cs.getPropertyValue("--dt-" + n).trim(); });
  var clamp = (DT.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); });
  var num = (DT.num = function (x, d) {
    d = d || 3; if (!isFinite(x)) return "∞";
    var s = String(+x.toPrecision(d)); if (s.indexOf("e") >= 0) s = x.toFixed(0);
    return s.replace(".", ",");
  });
  DT.eng = function (v, u, d) {
    if (!isFinite(v)) return "∞ " + u; var a = Math.abs(v); if (a < 1e-13) return "0 " + u;
    if (u === "F" && a >= 1e-3) return num(v / 1e-6, d) + " µF";
    var P = [[1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
    for (var i = 0; i < P.length; i++) if (a >= P[i][0] * 0.9995) return num(v / P[i][0], d) + " " + P[i][1] + u;
    return num(v / 1e-12, d) + " p" + u;
  };

  /* ---------- ký hiệu linh kiện (vẽ đè lên dây liền) ---------- */
  var S = (DT.S = {
    wire: function (p, id) { return '<polyline class="w" points="' + p + '"/>' + (id ? '<polyline class="fl" id="' + id + '" points="' + p + '" style="opacity:0"/>' : ""); },
    res: function (x, y, o, l, v) {
      return o === "h"
        ? '<rect class="cp" x="' + (x - 22) + '" y="' + (y - 8) + '" width="44" height="16" rx="1"/><text x="' + x + '" y="' + (y - 13) + '" text-anchor="middle">' + l + "</text>" + (v ? '<text class="v" id="' + v + '" x="' + x + '" y="' + (y + 24) + '" text-anchor="middle"></text>' : "")
        : '<rect class="cp" x="' + (x - 8) + '" y="' + (y - 22) + '" width="16" height="44" rx="1"/><text x="' + (x + 14) + '" y="' + (y - 2) + '">' + l + "</text>" + (v ? '<text class="v" id="' + v + '" x="' + (x + 14) + '" y="' + (y + 13) + '"></text>' : "");
    },
    cap: function (x, y, o, l, v) {
      return o === "h"
        ? '<rect class="bg" x="' + (x - 5) + '" y="' + (y - 13) + '" width="10" height="26"/><path class="ln" d="M' + (x - 5) + " " + (y - 13) + "V" + (y + 13) + "M" + (x + 5) + " " + (y - 13) + "V" + (y + 13) + '"/><text x="' + x + '" y="' + (y - 18) + '" text-anchor="middle">' + l + "</text>"
        : '<rect class="bg" x="' + (x - 13) + '" y="' + (y - 5) + '" width="26" height="10"/><path class="ln" d="M' + (x - 13) + " " + (y - 5) + "H" + (x + 13) + "M" + (x - 13) + " " + (y + 5) + "H" + (x + 13) + '"/><text x="' + (x + 18) + '" y="' + (y - 2) + '">' + l + "</text>" + (v ? '<text class="v" id="' + v + '" x="' + (x + 18) + '" y="' + (y + 13) + '"></text>' : "");
    },
    /* diode chỉ hướng d (xuống), u (lên), r (phải), l (trái) */
    dio: function (x, y, dir, l, zener, id) {
      var g = dir === "d" ? 0 : dir === "u" ? 180 : dir === "r" ? -90 : 90;
      return '<g transform="translate(' + x + " " + y + ") rotate(" + g + ')"><path class="cp"' + (id ? ' id="' + id + '"' : "") + ' d="M-9 -8H9L0 8Z"/><path class="ln" d="M-9 8H9' + (zener ? "M-9 8v-4M9 8v4" : "") + '"/></g>' + (l ? '<text x="' + (x + 15) + '" y="' + (y + 4) + '">' + l + "</text>" : "");
    },
    led: function (x, y, dir, l, id) { return '<circle id="' + id + '" class="off" cx="' + x + '" cy="' + y + '" r="15" stroke="var(--dt-ink)" stroke-width="1.2"/>' + S.dio(x, y, dir, "") + '<text x="' + (x + 21) + '" y="' + (y + 4) + '">' + l + "</text>"; },
    src: function (x, y, l, sym) { return '<circle class="cp" cx="' + x + '" cy="' + y + '" r="17"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" style="font-size:15px">' + (sym || "±") + '</text><text x="' + (x - 24) + '" y="' + (y + 4) + '" text-anchor="end">' + l + "</text>"; },
    gnd: function (x, y) { return '<path class="ln" d="M' + (x - 11) + " " + y + "H" + (x + 11) + "M" + (x - 7) + " " + (y + 5) + "H" + (x + 7) + "M" + (x - 3) + " " + (y + 10) + "H" + (x + 3) + '"/>'; },
    node: function (x, y) { return '<circle class="ink" cx="' + x + '" cy="' + y + '" r="3"/>'; },
    term: function (x, y, l, side) { return '<circle class="cp" cx="' + x + '" cy="' + y + '" r="4.5"/><text x="' + (side === "r" ? x + 10 : x - 10) + '" y="' + (y + 4) + '" text-anchor="' + (side === "r" ? "start" : "end") + '">' + l + "</text>"; },
    txt: function (x, y, t, c, a) { return '<text class="' + (c || "") + '" x="' + x + '" y="' + y + '" text-anchor="' + (a || "start") + '">' + t + "</text>"; },
    val: function (x, y, id, a) { return '<text class="v" id="' + id + '" x="' + x + '" y="' + y + '" text-anchor="' + (a || "start") + '"></text>'; },
    /* NPN: m=1 là bản đối xứng (base bên phải). Cực: B(x∓18,y) C(x±10,y-18) E(x±10,y+18) */
    npn: function (x, y, m, l) {
      var k = m ? -1 : 1;
      return '<circle class="cp" cx="' + x + '" cy="' + y + '" r="19"/><path class="ln" d="M' + (x - 18 * k) + " " + y + "H" + (x - 6 * k) + "M" + (x - 6 * k) + " " + (y - 11) + "V" + (y + 11) + "M" + (x - 6 * k) + " " + (y - 5) + "L" + (x + 10 * k) + " " + (y - 18) + "M" + (x - 6 * k) + " " + (y + 5) + "L" + (x + 10 * k) + " " + (y + 18) + '"/><path class="ink" d="M' + (x + 10 * k) + " " + (y + 18) + "l" + -8 * k + " -1l" + 4 * k + ' -6z"/>' + (l ? '<text x="' + (x + (m ? -26 : 24)) + '" y="' + (y + 4) + '" text-anchor="' + (m ? "end" : "start") + '">' + l + "</text>" : "");
    },
    /* MOSFET kênh N. Cực: G(x-18,y) D(x+10,y-18) S(x+10,y+18) */
    nmos: function (x, y, l) { return '<circle class="cp" cx="' + x + '" cy="' + y + '" r="19"/><path class="ln" d="M' + (x - 18) + " " + y + "H" + (x - 8) + "M" + (x - 8) + " " + (y - 10) + "V" + (y + 10) + "M" + (x - 3) + " " + (y - 12) + "V" + (y + 12) + "M" + (x - 3) + " " + (y - 9) + "H" + (x + 10) + "V" + (y - 18) + "M" + (x - 3) + " " + (y + 9) + "H" + (x + 10) + "V" + (y + 18) + '"/><text x="' + (x + 24) + '" y="' + (y + 4) + '">' + l + "</text>"; },
    /* op amp. Cực: −(x,y-15) +(x,y+15) ra(x+56,y) */
    opa: function (x, y) { return '<path class="cp" d="M' + x + " " + (y - 32) + "V" + (y + 32) + "L" + (x + 56) + " " + y + 'Z"/><text x="' + (x + 6) + '" y="' + (y - 11) + '" style="font-size:14px">−</text><text x="' + (x + 6) + '" y="' + (y + 20) + '" style="font-size:14px">+</text>'; }
  });
  DT.svg = function (w, h, inner, label) { return '<svg class="sch" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + (label || "Sơ đồ mạch") + '">' + inner + "</svg>"; };

  /* ---------- dòng điện chuyển động ---------- */
  var off = {};
  DT.flow = function (id, level, dt) {
    var el = E(id); if (!el) return; var on = Math.abs(level) > 0.004; el.style.opacity = on ? 1 : 0; if (!on) return;
    if (!RM) { off[id] = (off[id] || 0) - level * 70 * dt; el.style.strokeDashoffset = off[id]; }
  };
  DT.lvl = function (i, ref) { return Math.abs(i) < ref * 1e-3 ? 0 : (i < 0 ? -1 : 1) * clamp(0.18 + 0.9 * Math.abs(i) / ref, 0, 1.7); };

  /* ---------- đồ thị ---------- */
  DT.plot = function (cv, o) {
    var r = cv.getBoundingClientRect(); if (r.width < 10) return; var dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, r.width, r.height);
    var L = 46, Rr = 12, T = 10, B = 30, W = r.width - L - Rr, H = r.height - T - B;
    var X = function (x) { return L + (x - o.x0) / (o.x1 - o.x0) * W; }, Y = function (y) { return T + H - (y - o.y0) / (o.y1 - o.y0) * H; };
    var ink = cssv("ink"), mut = cssv("muted"), line = cssv("grid"), i;
    c.font = "11px " + cssv("mono"); c.lineWidth = 1; c.strokeStyle = line; c.fillStyle = mut;
    var nx = o.nx || 5, ny = o.ny || 4;
    for (i = 0; i <= nx; i++) { var x = o.x0 + (o.x1 - o.x0) * i / nx; c.beginPath(); c.moveTo(X(x), T); c.lineTo(X(x), T + H); c.stroke(); c.textAlign = "center"; c.fillText(num(x, 3), X(x), T + H + 14); }
    for (i = 0; i <= ny; i++) { var y = o.y0 + (o.y1 - o.y0) * i / ny; c.beginPath(); c.moveTo(L, Y(y)); c.lineTo(L + W, Y(y)); c.stroke(); c.textAlign = "right"; c.fillText(num(y, 3), L - 6, Y(y) + 4); }
    c.textAlign = "right"; c.fillText(o.xl || "", L + W, T + H + 27); c.textAlign = "left"; c.fillText(o.yl || "", L + 4, T + 11);
    (o.h || []).forEach(function (h) { c.strokeStyle = cssv(h.c || "muted"); c.setLineDash([5, 4]); c.beginPath(); c.moveTo(L, Y(h.y)); c.lineTo(L + W, Y(h.y)); c.stroke(); c.setLineDash([]); c.fillStyle = cssv(h.c || "muted"); c.textAlign = "right"; c.fillText(h.t || "", L + W - 4, Y(h.y) - 4); });
    (o.v || []).forEach(function (v) { c.strokeStyle = cssv(v.c || "muted"); c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(v.x), T); c.lineTo(X(v.x), T + H); c.stroke(); c.setLineDash([]); c.fillStyle = cssv(v.c || "muted"); c.textAlign = "left"; c.fillText(v.t || "", X(v.x) + 4, T + H - 5); });
    c.save(); c.beginPath(); c.rect(L, T, W, H); c.clip();
    o.s.forEach(function (s) {
      c.strokeStyle = cssv(s.c); c.lineWidth = s.w || 2; c.globalAlpha = s.a || 1; c.setLineDash(s.d || []); c.beginPath();
      s.p.forEach(function (q, k) { if (k) c.lineTo(X(q[0]), Y(q[1])); else c.moveTo(X(q[0]), Y(q[1])); }); c.stroke();
    });
    c.globalAlpha = 1; c.setLineDash([]); c.restore();
    (o.m || []).forEach(function (m) { c.fillStyle = cssv(m.c || "dot"); c.strokeStyle = ink; c.lineWidth = 1.2; c.beginPath(); c.arc(X(m.x), Y(m.y), 5, 0, 6.3); c.fill(); c.stroke(); });
    c.strokeStyle = mut; c.lineWidth = 1; c.strokeRect(L, T, W, H);
  };

  /* ---------- điều khiển ---------- */
  var SL = {};
  DT.sl = function (id, label, min, max, step, val, unit, log) {
    SL[id] = { log: log, unit: unit }; var v = log ? Math.log10(val) : val, a = log ? Math.log10(min) : min, b = log ? Math.log10(max) : max;
    return '<label for="' + id + '"><span>' + label + '<output id="' + id + '_o"></output></span><input type="range" id="' + id + '" min="' + a + '" max="' + b + '" step="' + (log ? 0.01 : step) + '" value="' + v + '"></label>';
  };
  var V = (DT.V = function (id) { var x = parseFloat(E(id).value); return SL[id].log ? +Math.pow(10, x).toPrecision(2) : x; });
  DT.showSliders = function () { for (var id in SL) { var e = E(id); if (!e) continue; var u = SL[id].unit; E(id + "_o").textContent = typeof u === "function" ? u(V(id)) : DT.eng(V(id), u); } };
  /* nhóm nút chọn một */
  DT.seg = function (id, opts, cur) {
    return '<div class="seg" id="' + id + '" data-v="' + cur + '" role="group">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + "</button>"; }).join("") + "</div>";
  };
  DT.segV = function (id) { return E(id).dataset.v; };
  DT.segSet = function (id, v) { var g = E(id); g.dataset.v = v; g.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === v)); }); };
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".seg button"); if (!b) return;
    var g = b.parentNode; DT.segSet(g.id, b.dataset.v); g.dispatchEvent(new CustomEvent("segchange", { bubbles: true }));
  });
  DT.tile = function (id, l) { return '<div class="tile"><small>' + l + '</small><b id="' + id + '">–</b></div>'; };
  DT.set = function (id, t) { var e = E(id); if (e && e.textContent !== t) e.textContent = t; };
  DT.pill = function (id, cls, t) { var e = E(id); if (!e) return; e.className = "pill " + cls; if (e.textContent !== t) e.textContent = t; };
  DT.leg = function (a) { return '<div class="legend">' + a.map(function (x) { return '<span><i style="background:var(--dt-' + x[0] + ')"></i>' + x[1] + "</span>"; }).join("") + "</div>"; };
  DT.reg = function (k, o) { DT.sims[k] = o; };

  /* ---------- gắn mô phỏng và vòng lặp ---------- */
  var live = [], last = 0;
  function loop(ts) {
    var dt = Math.min(0.1, (ts - last) / 1000); last = ts; DT.NOW += dt; cs = null;
    for (var i = 0; i < live.length; i++) { var s = live[i]; if (!s.vis || !s.sim.draw) continue; try { s.sim.draw(DT.NOW, dt); } catch (e) { if (!s.err) { s.err = 1; console.error("sim " + s.key, e); } } }
    requestAnimationFrame(loop);
  }
  DT.start = function () {
    document.querySelectorAll("[data-sim]").forEach(function (el) {
      var key = el.getAttribute("data-sim"), sim = DT.sims[key];
      if (!sim) { el.innerHTML = '<p class="note">Mô phỏng đang được cập nhật.</p>'; return; }
      el.innerHTML = sim.html(); var rec = { key: key, sim: sim, el: el, vis: true }; live.push(rec);
    });
    live.forEach(function (r) { if (r.sim.init) r.sim.init(r.el); });
    DT.showSliders(); document.addEventListener("input", DT.showSliders);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { live.forEach(function (r) { if (r.el === e.target) r.vis = e.isIntersecting; }); }); }, { rootMargin: "200px" });
      live.forEach(function (r) { io.observe(r.el); });
    }
    last = performance.now(); requestAnimationFrame(loop);
  };
  var started = false;
  function go() { if (started) return; started = true; DT.start(); }
  if (document.readyState === "complete") go(); else { document.addEventListener("DOMContentLoaded", go); window.addEventListener("load", go); }
})();
