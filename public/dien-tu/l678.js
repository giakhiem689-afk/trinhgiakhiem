/* Bài 6, Bài 7, Bài 8 */
(function () {
  "use strict";
  var DT = window.DT, E = DT.E, S = DT.S, svg = DT.svg, sl = DT.sl, V = DT.V, tile = DT.tile, set = DT.set, pill = DT.pill, eng = DT.eng, num = DT.num, flow = DT.flow, lvl = DT.lvl, plot = DT.plot, leg = DT.leg, clamp = DT.clamp, seg = DT.seg, segV = DT.segV;

  /* ================= 555 ASTABLE ================= */
  DT.reg("astable", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(560, 300,
        S.wire("130,30 310,30") + S.wire("130,30 130,205", "f_c") + S.wire("130,205 130,110 250,110", "f_d") + S.wire("130,205 130,265") + S.wire("130,195 250,195") + S.wire("205,195 205,152 250,152") + S.wire("310,30 310,80") + S.wire("310,225 310,265") + S.wire("370,152 480,152 480,265", "f_o") + S.wire("130,265 480,265") +
        '<rect class="cp" x="250" y="80" width="120" height="145" rx="4"/><text x="310" y="134" text-anchor="middle" style="font-weight:600;font-size:14px">NE555</text><text class="m" x="256" y="114">7 DISCH</text><text class="m" x="256" y="156">6 THRES</text><text class="m" x="256" y="199">2 TRIG</text><text class="m" x="364" y="156" text-anchor="end">OUT 3</text><text class="m" x="310" y="94" text-anchor="middle">8 VCC</text><text class="m" x="310" y="219" text-anchor="middle">1 GND</text>' +
        S.res(130, 68, "v", "RA") + S.res(130, 152, "v", "RB") + S.cap(130, 232, "v", "C", "f_vc") + S.res(425, 152, "h", "470 Ω") + S.led(480, 210, "d", "LED", "f_l") +
        S.node(130, 110) + S.node(130, 195) + S.node(205, 195) + S.gnd(310, 265) + S.txt(316, 26, "+5 V", "m") + S.val(64, 114, "f_st", "middle")) +
        '<div class="ctl">' + sl("f_ra", "RA", 1e3, 1e5, 0, 1e4, "Ω", 1) + sl("f_rb", "RB", 1e3, 2e5, 0, 6.8e4, "Ω", 1) + sl("f_cc", "C", 1e-7, 1e-4, 0, 1e-6, "F", 1) + '</div><p class="note" id="f_slow"></p></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Điện áp tụ và ngõ ra</h4><canvas id="f_cv"></canvas>' + leg([["sig1", "điện áp trên tụ C"], ["sig2", "OUT (chân 3)"]]) +
        '<div class="tiles">' + tile("f_t1", "tcao") + tile("f_t2", "tthấp") + tile("f_t3", "Chu kỳ T") + tile("f_t4", "Tần số") + tile("f_t5", "Duty cycle") + '</div></div>' +
        '<div class="panel"><h4>Bên trong IC lúc này</h4><div class="tiles">' + tile("f_i1", "So sánh trên (2/3 VCC)") + tile("f_i2", "So sánh dưới (1/3 VCC)") + tile("f_i3", "Chốt trạng thái") + tile("f_i4", "Transistor xả (chân 7)") + '</div></div></div></div>';
    },
    draw: function (t, dt) {
      var RA = V("f_ra"), RB = V("f_rb"), C = V("f_cc"), Vc = 5, tH = 0.693 * (RA + RB) * C, tL = 0.693 * RB * C, T = tH + tL, k = T < 0.8 ? 1.6 / T : 1, ph = DT.RM ? tH * 0.5 : ((t / k) % T), hi = ph < tH;
      set("f_t1", eng(tH, "s")); set("f_t2", eng(tL, "s")); set("f_t3", eng(T, "s")); set("f_t4", eng(1 / T, "Hz")); set("f_t5", num(tH / T * 100, 3) + "%");
      set("f_slow", k > 1.01 ? "Tần số cao nên hình được chiếu chậm " + num(k, 2) + " lần." : "Đang chạy theo thời gian thực."); set("f_st", hi ? "đang nạp" : "đang xả");
      E("f_l").setAttribute("class", hi ? "glow" : "off"); flow("f_c", hi ? 1 : 0, dt); flow("f_d", hi ? 0 : 1.2, dt); flow("f_o", hi ? 0.9 : 0, dt);
      var vc = function (q) { return q < tH ? Vc - (2 * Vc / 3) * Math.exp(-q / ((RA + RB) * C)) : (2 * Vc / 3) * Math.exp(-(q - tH) / (RB * C)); }, p = [], po = [], N = 300;
      for (var i = 0; i <= N; i++) { var x = 2 * T * i / N, q = x % T; p.push([x, vc(q)]); po.push([x, q < tH ? 3.6 : 0.1]); }
      var u = vc(ph); set("f_vc", eng(u, "V"));
      set("f_i1", u >= 2 * Vc / 3 - 0.02 ? "vừa vượt: RESET" : "chưa vượt"); set("f_i2", u <= Vc / 3 + 0.02 ? "vừa xuống dưới: SET" : "ở trên ngưỡng"); set("f_i3", hi ? "SET → OUT cao" : "RESET → OUT thấp"); set("f_i4", hi ? "hở: tụ nạp" : "dẫn: tụ xả qua RB");
      plot(E("f_cv"), { x0: 0, x1: 2 * T, y0: 0, y1: 5, ny: 5, nx: 4, xl: "t (s)", yl: "u (V)", s: [{ p: po, c: "sig2", w: 1.8 }, { p: p, c: "sig1", w: 2.4 }], h: [{ y: Vc / 3, t: "1/3 VCC", c: "copper" }, { y: 2 * Vc / 3, t: "2/3 VCC", c: "copper" }], m: [{ x: ph, y: u }] });
    }
  });

  /* ================= 555 MONOSTABLE ================= */
  DT.reg("monostable", {
    st: { t0: -1e9, n: 0, miss: 0 },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctlrow" style="justify-content:center"><svg class="sch" viewBox="0 0 220 110" style="max-width:260px" role="img" aria-label="Đèn LED ở ngõ ra"><circle id="mn_l" class="off" cx="110" cy="52" r="34" stroke="var(--dt-ink)" stroke-width="1.4"/><text x="110" y="104" text-anchor="middle" class="m">LED ở ngõ ra OUT</text></svg></div>' +
        '<div class="ctlrow" style="justify-content:center"><button type="button" class="btn-sim pri big" id="mn_go">Nhấn trigger</button></div><div class="ctl">' + sl("mn_r", "R", 1e4, 1e6, 0, 1e5, "Ω", 1) + sl("mn_c", "C", 1e-6, 1e-4, 0, 1e-5, "F", 1) + '</div><p class="note" id="mn_slow"></p></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Điện áp tụ và ngõ ra sau một lần trigger</h4><canvas id="mn_cv"></canvas>' + leg([["sig1", "điện áp trên tụ C"], ["sig2", "OUT (chân 3)"]]) +
        '<div class="ctlrow"><span class="pill warn" id="mn_p">Đang nghỉ: OUT thấp, tụ bị giữ ở 0 V</span></div><div class="tiles">' + tile("mn_t1", "Độ rộng xung tW = 1,1·R·C") + tile("mn_t2", "Số xung đã tạo") + tile("mn_t3", "Lần nhấn bị bỏ qua") + '</div><p class="note">Nhấn thêm trong lúc đang có xung không tạo xung mới và không kéo dài xung: mạch chỉ nhận trigger khi đã về trạng thái nghỉ.</p></div></div></div>';
    },
    par: function () { var R = V("mn_r"), C = V("mn_c"), tw = 1.1 * R * C, D = clamp(tw, 0.8, 6); return { R: R, C: C, tw: tw, k: tw / D }; },
    init: function () { var s = this.st, self = this; E("mn_go").onclick = function () { var p = self.par(), el = (DT.NOW - s.t0) * p.k; if (el < p.tw) { s.miss++; return; } s.t0 = DT.NOW; s.n++; }; },
    draw: function (t) {
      var s = this.st, p = this.par(), el = (t - s.t0) * p.k, act = el >= 0 && el < p.tw, pv = [], po = [], N = 200, xm = 1.6 * p.tw;
      for (var i = 0; i <= N; i++) { var x = xm * i / N; pv.push([x, x < p.tw ? 5 * (1 - Math.exp(-x / (p.R * p.C))) : 0]); po.push([x, x < p.tw ? 3.6 : 0.1]); }
      var u = act ? 5 * (1 - Math.exp(-el / (p.R * p.C))) : 0;
      plot(E("mn_cv"), { x0: 0, x1: xm, y0: 0, y1: 5, ny: 5, nx: 4, xl: "t (s)", yl: "u (V)", s: [{ p: po, c: "sig2", w: 1.8 }, { p: pv, c: "sig1", w: 2.4 }], h: [{ y: 10 / 3, t: "2/3 VCC", c: "copper" }], v: [{ x: p.tw, t: "tW", c: "copper" }], m: el >= 0 && el < xm ? [{ x: el, y: u }] : [] });
      E("mn_l").setAttribute("class", act ? "glow" : "off"); set("mn_t1", eng(p.tw, "s")); set("mn_t2", String(s.n)); set("mn_t3", String(s.miss));
      set("mn_slow", Math.abs(p.k - 1) < 0.02 ? "Đang chạy theo thời gian thực." : p.k < 1 ? "Xung ngắn nên được chiếu chậm " + num(1 / p.k, 2) + " lần." : "Xung dài nên được chiếu nhanh " + num(p.k, 2) + " lần.");
      pill("mn_p", act ? "good" : "warn", act ? "Đang tạo xung: OUT cao, tụ nạp qua R (" + eng(u, "V") + ")" : "Đang nghỉ: OUT thấp, tụ bị giữ ở 0 V");
    }
  });

  /* ================= KHUẾCH ĐẠI ĐẢO / KHÔNG ĐẢO ================= */
  DT.reg("khuech-dai", {
    sch: function (m) {
      var com = S.wire("250,115 250,55 430,55 430,130", "g_f") + S.wire("366,130 490,130") + S.res(340, 55, "h", "Rf", "g_rfv") + S.opa(310, 130) + S.node(250, 115) + S.node(430, 130) + S.term(490, 130, "Ura", "r");
      E("g_sch").innerHTML = m === "inv"
        ? svg(560, 240, S.wire("70,115 310,115", "g_i") + S.wire("310,145 280,145 280,195") + com + S.res(160, 115, "h", "Rin 10 kΩ") + S.term(70, 115, "Uvào", "l") + S.gnd(280, 195))
        : svg(560, 240, S.wire("70,145 310,145") + S.wire("250,115 310,115") + S.wire("250,115 250,205", "g_i") + com + S.res(250, 165, "v", "Rg 10 kΩ") + S.term(70, 145, "Uvào", "l") + S.gnd(250, 205));
    },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><h4 id="g_h">Mạch khuếch đại</h4><div id="g_sch"></div><div class="ctlrow"><span class="lbl">Cấu hình</span>' + seg("g_m", [["inv", "Khuếch đại đảo"], ["non", "Không đảo"]], "inv") + '</div><div class="ctl">' +
        sl("g_rf", "Rf", 1e3, 4.7e5, 0, 4.7e4, "Ω", 1) + sl("g_a", "Biên độ Uvào (đỉnh)", 0.05, 3, 0.05, 0.2, "V") + sl("g_fq", "Tần số tín hiệu", 100, 1e5, 0, 1e3, "Hz", 1) + sl("g_vs", "Nguồn đôi ±", 5, 15, 1, 12, "V") + '</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Dạng sóng vào và ra</h4><canvas id="g_cv"></canvas>' + leg([["sig1", "Uvào"], ["sig2", "Ura"], ["copper", "giới hạn ngõ ra"]]) +
        '<div class="ctlrow"><span class="pill good" id="g_p">–</span></div><div class="tiles">' + tile("g_t1", "Độ lợi lý tưởng Av") + tile("g_t2", "Ura đỉnh lý tưởng") + tile("g_t3", "Giới hạn ngõ ra") + tile("g_t4", "Băng thông vòng kín") + tile("g_t5", "Slew rate cần") + tile("g_t6", "Ura đỉnh thực") + '</div><p class="note">Mô hình op amp kiểu LM741: tích độ lợi–băng thông 1 MHz, slew rate 0,5 V/µs, ngõ ra thấp hơn nguồn khoảng 1,5 V.</p></div></div></div>';
    },
    init: function (el) { var self = this; this.sch("inv"); el.addEventListener("segchange", function () { self.sch(segV("g_m")); }); },
    draw: function (t, dt) {
      var m = segV("g_m"), Rf = V("g_rf"), A = V("g_a"), Vs = V("g_vs"), f = V("g_fq"), R = 1e4, Av = m === "inv" ? -Rf / R : 1 + Rf / R, lim = Vs - 1.5, fc = 1e6 / (1 + Rf / R), g = 1 / Math.sqrt(1 + (f / fc) * (f / fc)), phl = -Math.atan(f / fc), SR = 0.5e6;
      var id = Math.abs(Av) * A, idr = id * g, clip = idr > lim, need = 2 * Math.PI * f * Math.min(idr, lim), slew = need > SR;
      var N = 1800, per = 1 / f, h = 3 * per / N, o = 0, pi = [], po = [], pk = 0, w = 2 * Math.PI * f;
      for (var i = 0; i <= N; i++) { var x = i * h, tg = clamp(Av * g * A * Math.sin(w * x + phl), -lim, lim), st = SR * h; o += clamp(tg - o, -st, st); if (x >= per) { var xx = (x - per) * 1e3; pi.push([xx, A * Math.sin(w * x)]); po.push([xx, o]); if (Math.abs(o) > pk) pk = Math.abs(o); } }
      set("g_t1", num(Av, 3)); set("g_t2", eng(id, "V")); set("g_t3", "±" + eng(lim, "V")); set("g_t4", eng(fc, "Hz")); set("g_t5", num(need / 1e6, 2) + " V/µs"); set("g_t6", eng(pk, "V")); set("g_rfv", eng(Rf, "Ω")); set("g_h", m === "inv" ? "Khuếch đại đảo: Av = −Rf/Rin" : "Khuếch đại không đảo: Av = 1 + Rf/Rg");
      if (clip) pill("g_p", "bad", "Bị cắt đỉnh: ngõ ra chạm giới hạn nguồn"); else if (slew) pill("g_p", "bad", "Méo do slew rate: sóng sin thành cạnh xiên"); else if (g < 0.9) pill("g_p", "warn", "Độ lợi giảm vì tần số gần băng thông vòng kín"); else pill("g_p", "good", "Tuyến tính: công thức độ lợi còn đúng");
      var ph = DT.RM ? 0.25 : (t * 0.4) % 1, u = A * Math.sin(2 * Math.PI * ph), ii = u / R; flow("g_i", lvl(m === "inv" ? ii : -ii, 3e-5), dt); flow("g_f", lvl(m === "inv" ? ii : -ii, 3e-5), dt);
      plot(E("g_cv"), { x0: 0, x1: 2 * per * 1e3, y0: -15, y1: 15, ny: 6, nx: 4, xl: "t (ms)", yl: "u (V)", s: [{ p: pi, c: "sig1", w: 2 }, { p: po, c: "sig2", w: 2.4 }], h: [{ y: lim, t: "", c: "copper" }, { y: -lim, t: "", c: "copper" }] });
    }
  });

  /* ================= HYSTERESIS CHỐNG NHIỄU ================= */
  var NOISE = (function () { var a = [], s = 12345, v = 0; for (var i = 0; i <= 600; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; v = 0.55 * v + 0.45 * (s / 0x3fffffff - 1); a.push(v * 1.6); } return a; })();
  DT.reg("hysteresis", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><canvas id="hy_cv" style="height:280px"></canvas>' + leg([["sig1", "tín hiệu cảm biến có nhiễu"], ["sig2", "ngõ ra bộ so sánh (vẽ ở dải dưới)"], ["copper", "ngưỡng"]]) + '</div></div>' +
        '<div class="simcol"><div class="panel"><div class="ctl">' + sl("hy_n", "Biên độ nhiễu", 0, 0.3, 0.01, 0.12, "V") + sl("hy_w", "Độ rộng hysteresis", 0, 0.8, 0.02, 0, "V") + '</div><div class="ctlrow"><span class="pill good" id="hy_p">–</span></div><div class="tiles">' + tile("hy_t1", "Số lần ngõ ra đổi trạng thái") + tile("hy_t2", "Ngưỡng khi tín hiệu tăng") + tile("hy_t3", "Ngưỡng khi tín hiệu giảm") + '</div><p class="note">Tín hiệu tăng chậm qua ngưỡng 1,5 V rồi giảm trở lại. Một bộ so sánh lý tưởng chỉ cần đổi trạng thái 2 lần. Hãy tăng nhiễu để thấy ngõ ra rung, rồi tăng hysteresis cho đến khi hết rung.</p></div></div></div>';
    },
    draw: function () {
      var n = V("hy_n"), w = V("hy_w"), hi = 1.5 + w / 2, lo = 1.5 - w / 2, st = false, cnt = 0, pi = [], po = [];
      for (var i = 0; i <= 600; i++) { var x = i / 600, base = 0.5 + 2 * (x < 0.5 ? 2 * x : 2 - 2 * x), u = base + n * NOISE[i], prev = st; if (!st && u > hi) st = true; else if (st && u < lo) st = false; if (st !== prev) cnt++; pi.push([x * 10, u]); po.push([x * 10, st ? -0.25 : -0.95]); }
      plot(E("hy_cv"), { x0: 0, x1: 10, y0: -1.2, y1: 3.2, ny: 11, nx: 5, xl: "t (s)", yl: "u (V)", s: [{ p: pi, c: "sig1", w: 1.6 }, { p: po, c: "sig2", w: 2.2 }], h: w > 0 ? [{ y: hi, t: "ngưỡng lên", c: "copper" }, { y: lo, t: "ngưỡng xuống", c: "copper" }] : [{ y: 1.5, t: "một ngưỡng 1,5 V", c: "copper" }] });
      set("hy_t1", String(cnt)); set("hy_t2", eng(hi, "V")); set("hy_t3", eng(lo, "V"));
      pill("hy_p", cnt <= 2 ? "good" : "bad", cnt <= 2 ? "Chuyển trạng thái gọn: đúng 2 lần" : "Ngõ ra rung " + cnt + " lần quanh ngưỡng: tải bật tắt liên tục");
    }
  });

  /* ================= MẠCH QUẠT THEO NHIỆT ĐỘ ================= */
  function fanSvg(p, extra) {
    return svg(560, 300,
      S.wire("60,30 330,30") + S.wire("90,30 90,270", p + "d") + S.wire("90,140 215,140") + S.wire("160,170 215,170") + S.wire("271,155 365,155 365,205 412,205") + S.wire("320,30 320,155") + S.wire("440,40 440,187", p + "f") + S.wire("440,223 440,270", p + "f2") + S.wire("60,270 480,270") +
      S.res(90, 85, "v", "10 kΩ") + '<rect class="cp" x="82" y="183" width="16" height="44" rx="1"/><path class="ln" d="M72 232L108 178"/><text x="112" y="200">NTC</text><text class="v" id="' + p + 'rn" x="112" y="215"></text>' +
      S.opa(215, 155) + S.txt(243, 203, "LM393", "m", "middle") + S.res(320, 90, "v", "kéo lên") + S.nmos(430, 205, "MOSFET") + S.term(160, 170, "Vref", "l") + S.term(440, 40, "+12 V", "r") +
      '<circle class="cp" cx="440" cy="105" r="28"/><g id="' + p + 'fan" transform="rotate(0 440 105)"><path class="ink" d="M440 105c-4-14 4-24 10-24c2 10-2 18-10 24zM440 105c14 4 20 14 17 20c-10-2-16-10-17-20zM440 105c-10 10-22 9-25 3c8-7 17-8 25-3z"/></g><circle class="cp" cx="440" cy="105" r="4"/><text x="476" y="109">Quạt</text>' +
      S.node(90, 140) + S.node(320, 155) + S.gnd(260, 270) + S.txt(336, 26, "+5 V", "m") + S.txt(100, 134, "Us", "m") + S.val(126, 134, p + "us") + S.txt(372, 199, "GATE", "m") + S.val(372, 225, p + "g") + (extra || ""), "Mạch điều khiển quạt theo nhiệt độ");
  }
  var rn = function (T) { return 1e4 * Math.exp(3977 * (1 / (T + 273.15) - 1 / 298.15)); }, us = function (T) { return 5 * rn(T) / (1e4 + rn(T)); };
  var degC = function (x) { return num(x, 3) + " °C"; };
  DT.reg("ntc-quat", {
    st: { on: false, auto: false, ang: 0 },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + fanSvg("h_") + '<div class="ctl">' + sl("h_t", "Nhiệt độ tại NTC", 20, 85, 0.5, 30, degC) + sl("h_on", "Ngưỡng bật", 50, 75, 1, 60, degC) + sl("h_of", "Ngưỡng tắt", 30, 55, 1, 45, degC) + '</div>' +
        '<div class="ctlrow"><button type="button" class="btn-sim pri" id="h_auto">Chạy chu trình nóng, nguội</button></div><p class="note">Trong chu trình, nguồn nhiệt làm NTC nóng dần; khi quạt chạy thì nguội dần.</p></div></div>' +
        '<div class="simcol"><div class="panel"><div class="ctlrow"><span class="pill good" id="h_p">–</span></div><div class="tiles">' + tile("h_t1", "Điện trở NTC") + tile("h_t2", "Us") + tile("h_t3", "Us tại ngưỡng bật") + tile("h_t4", "Us tại ngưỡng tắt") + '</div></div>' +
        '<div class="panel"><h4>Us theo nhiệt độ và hai ngưỡng</h4><canvas id="h_cv"></canvas>' + leg([["sig1", "Us của cầu chia NTC"], ["bad", "ngưỡng bật"], ["good", "ngưỡng tắt"]]) + '</div></div></div>';
    },
    init: function () { var s = this.st; E("h_auto").onclick = function () { s.auto = !s.auto; }; },
    draw: function (t, dt) {
      var s = this.st, Ton = V("h_on"), Tof = Math.min(V("h_of"), Ton);
      if (s.auto && !DT.RM) { var T0 = V("h_t") + (s.on ? -5 : 6) * dt; E("h_t").value = clamp(T0, 20, 85); DT.showSliders(); }
      var T = V("h_t"); if (T >= Ton) s.on = true; else if (T <= Tof) s.on = false;
      set("h_t1", eng(rn(T), "Ω")); set("h_t2", eng(us(T), "V")); set("h_t3", eng(us(Ton), "V")); set("h_t4", eng(us(Tof), "V")); set("h_us", eng(us(T), "V")); set("h_rn", eng(rn(T), "Ω")); set("h_g", s.on ? "cao" : "thấp");
      pill("h_p", s.on ? "bad" : "good", s.on ? "Quạt đang chạy: chờ nguội xuống ngưỡng tắt" : (T > Tof ? "Quạt tắt: vùng giữ trạng thái, chờ đến ngưỡng bật" : "Quạt tắt: nhiệt độ thấp")); set("h_auto", s.auto ? "Dừng chu trình" : "Chạy chu trình nóng, nguội");
      if (s.on && !DT.RM) { s.ang = (s.ang + dt * 520) % 360; E("h_fan").setAttribute("transform", "rotate(" + s.ang.toFixed(1) + " 440 105)"); }
      flow("h_d", 0.35, dt); flow("h_f", s.on ? 1.2 : 0, dt); flow("h_f2", s.on ? 1.2 : 0, dt);
      var p = []; for (var x = 20; x <= 85; x += 1) p.push([x, us(x)]);
      plot(E("h_cv"), { x0: 20, x1: 85, y0: 0, y1: 3, ny: 6, nx: 13, xl: "nhiệt độ (°C)", yl: "Us (V)", s: [{ p: p, c: "sig1", w: 2.4 }], h: [{ y: us(Ton), t: "bật", c: "bad" }, { y: us(Tof), t: "tắt", c: "good" }], v: [{ x: Ton, t: "", c: "bad" }, { x: Tof, t: "", c: "good" }], m: [{ x: T, y: us(T), c: s.on ? "bad" : "dot" }] });
    }
  });

  /* ================= TÌM LỖI THEO CHUỖI ĐO ================= */
  var TP = [["v5", "① Nguồn +5 V"], ["us", "② Us (cầu chia NTC)"], ["vref", "③ Vref"], ["gate", "④ GATE"], ["v12", "⑤ Nguồn +12 V"], ["fan", "⑥ Điện áp trên quạt"]];
  var FAULTS = [["ntc", "Đứt đường cảm biến NTC"], ["swap", "Đảo hai đầu vào bộ so sánh"], ["pull", "Thiếu điện trở kéo lên ở ngõ ra LM393"], ["short", "MOSFET bị chập D–S"], ["v12", "Mất nguồn 12 V của quạt"]];
  function vals(f, hot) {
    var o = { v5: 5.0, us: hot ? us(65) : us(30), v12: 12.0 }, on = hot;
    if (f === "ntc") { o.us = 4.98; on = false; } if (f === "swap") on = !hot;
    var gateHigh = on; if (f === "pull") gateHigh = false; if (f === "pull") on = false;
    o.vref = gateHigh ? us(45) : us(60); o.gate = gateHigh ? 4.9 : 0.05; if (f === "v12") o.v12 = 0;
    var run = f === "short" ? true : gateHigh; o.fan = run && o.v12 > 1 ? 11.9 : 0; return o;
  }
  DT.reg("xu-ly-loi", {
    st: { f: "ntc", n: 0, seen: {}, done: false },
    html: function () {
      var marks = S.txt(200, 22, "①", "tpn", "middle") + S.txt(74, 136, "②", "tpn", "middle") + S.txt(150, 192, "③", "tpn", "middle") + S.txt(352, 176, "④", "tpn", "middle") + S.txt(424, 30, "⑤", "tpn", "middle") + S.txt(486, 92, "⑥", "tpn", "middle");
      return '<div class="simgrid"><div class="simcol"><div class="panel"><p class="symptom" id="x_sym"></p>' + fanSvg("x_", marks) +
        '<div class="ctlrow"><span class="lbl">Trạng thái thử</span>' + seg("x_hot", [["0", "NTC lạnh 30 °C"], ["1", "NTC nóng 65 °C"]], "0") + '</div><div class="ctlrow" id="x_btns">' + TP.map(function (p) { return '<button type="button" class="btn-sim sm" data-tp="' + p[0] + '">Đo ' + p[1] + "</button>"; }).join("") + '</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Phiếu đo</h4><div class="tblwrap"><table class="dt-table"><thead><tr><th rowspan="2">Điểm đo</th><th colspan="2">Mạch tốt</th><th colspan="2">Bạn đo được</th></tr><tr><th>lạnh</th><th>nóng</th><th>lạnh</th><th>nóng</th></tr></thead><tbody id="x_tb"></tbody></table></div><p class="note" id="x_cnt"></p></div>' +
        '<div class="panel"><h4>Kết luận</h4><div class="ctl"><label for="x_dx"><span>Lỗi của mạch là</span><select id="x_dx"><option value="">— chọn một lỗi —</option>' + FAULTS.map(function (f) { return '<option value="' + f[0] + '">' + f[1] + "</option>"; }).join("") + '</select></label></div><div class="ctlrow"><button type="button" class="btn-sim pri" id="x_ck">Kết luận</button><button type="button" class="btn-sim" id="x_new">Mạch lỗi khác</button></div><div class="ctlrow"><span class="pill warn" id="x_p">Đo trước, kết luận sau</span></div><p class="note" id="x_msg"></p></div></div></div>';
    },
    table: function () {
      var s = this.st, g0 = vals("", false), g1 = vals("", true), fm = function (v) { return num(v, 3) + " V"; };
      E("x_tb").innerHTML = TP.map(function (p) { var a = s.seen[p[0] + "0"], b = s.seen[p[0] + "1"]; return "<tr><th>" + p[1] + "</th><td>" + fm(g0[p[0]]) + "</td><td>" + fm(g1[p[0]]) + '</td><td class="me">' + (a === undefined ? "·" : fm(a)) + '</td><td class="me">' + (b === undefined ? "·" : fm(b)) + "</td></tr>"; }).join("");
      set("x_cnt", "Đã dùng " + s.n + " phép đo. Người sửa giỏi tìm ra lỗi với ít phép đo nhất, đi từ nguồn đến tải.");
    },
    fresh: function () {
      var s = this.st, f; do { f = FAULTS[Math.floor(Math.random() * FAULTS.length)][0]; } while (f === s.f && Math.random() < 0.8); s.f = f; s.n = 0; s.seen = {}; s.done = false;
      set("x_sym", f === "swap" ? "Hiện tượng: quạt chạy khi còn lạnh và tắt khi nóng lên." : f === "short" ? "Hiện tượng: quạt chạy liên tục, kể cả khi lạnh." : "Hiện tượng: quạt không chạy dù NTC đã nóng 65 °C.");
      pill("x_p", "warn", "Đo trước, kết luận sau"); set("x_msg", ""); if (E("x_dx")) E("x_dx").value = ""; this.table();
    },
    init: function (el) {
      var self = this, s = this.st;
      E("x_btns").addEventListener("click", function (ev) { var b = ev.target.closest("[data-tp]"); if (!b) return; var hot = segV("x_hot"), key = b.dataset.tp + hot; if (s.seen[key] === undefined) s.n++; s.seen[key] = vals(s.f, hot === "1")[b.dataset.tp]; self.table(); });
      E("x_new").onclick = function () { self.fresh(); };
      E("x_ck").onclick = function () {
        if (!E("x_dx").value) { pill("x_p", "warn", "Hãy chọn một lỗi trong danh sách"); return; } var ok = E("x_dx").value === s.f, why = { ntc: "Us đứng ở gần 5 V dù nóng hay lạnh: nhánh dưới của cầu chia bị hở. Bộ so sánh thấy Us luôn cao hơn Vref nên không bao giờ bật quạt.", swap: "Us và Vref đều đúng nhưng GATE ngược với mong đợi ở cả hai trạng thái: hai đầu vào của bộ so sánh bị đảo.", pull: "Khi nóng, Us đã thấp hơn Vref nhưng GATE vẫn gần 0 V: ngõ ra open-collector đã nhả nhưng không có điện trở kéo lên để tạo mức cao.", short: "GATE ở mức thấp khi lạnh mà quạt vẫn có 12 V: MOSFET dẫn dù không được điều khiển, tức bị chập D–S.", v12: "Khi nóng, GATE lên cao đúng nhưng điểm +12 V không có điện áp: lỗi nằm ở nguồn hoặc đầu nối của tầng công suất." };
        pill("x_p", ok ? "good" : "bad", ok ? "Đúng, sau " + s.n + " phép đo" : "Chưa đúng: xem lại điểm đo đầu tiên lệch so với mạch tốt"); set("x_msg", ok ? why[s.f] : "Gợi ý: đi theo chuỗi nguồn → Us → Vref → GATE → quạt, ở cả hai trạng thái lạnh và nóng. Khối đầu tiên có số đo khác mạch tốt là nơi có lỗi.");
      };
      this.fresh();
    },
    draw: function (t, dt) {
      var s = this.st, hot = segV("x_hot") === "1", v = vals(s.f, hot), run = v.fan > 1;
      set("x_rn", hot ? "nóng" : "lạnh"); set("x_us", ""); set("x_g", "");
      if (run && !DT.RM) { s.ang = ((s.ang || 0) + dt * 520) % 360; E("x_fan").setAttribute("transform", "rotate(" + s.ang.toFixed(1) + " 440 105)"); }
      flow("x_f", run ? 1.2 : 0, dt); flow("x_f2", run ? 1.2 : 0, dt); flow("x_d", s.f === "ntc" ? 0 : 0.35, dt);
    }
  });
})();
