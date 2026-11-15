/* Bài 3, Bài 4, Bài 5 */
(function () {
  "use strict";
  var DT = window.DT, E = DT.E, S = DT.S, svg = DT.svg, sl = DT.sl, V = DT.V, tile = DT.tile, set = DT.set, pill = DT.pill, eng = DT.eng, num = DT.num, flow = DT.flow, lvl = DT.lvl, plot = DT.plot, leg = DT.leg, clamp = DT.clamp, seg = DT.seg, segV = DT.segV;

  /* ================= ĐƯỜNG DÒNG TRONG MẠCH CHỈNH LƯU ================= */
  DT.reg("cau-chinh-luu", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctlrow"><span class="lbl">Kiểu chỉnh lưu</span>' + seg("cr_m", [["cau", "Cầu bốn diode"], ["ban", "Bán kỳ một diode"]], "cau") + '</div>' +
        '<div id="cr_cau">' + svg(480, 280,
          S.wire("180,40 180,240") + S.wire("280,40 280,240") + S.wire("180,40 400,40 400,240 180,240") + S.wire("180,140 280,140") +
          S.wire("230,140 180,140 180,40 400,40 400,240 280,240 280,140 230,140", "cr_p") + S.wire("230,140 280,140 280,40 400,40 400,240 180,240 180,140 230,140", "cr_n") +
          S.dio(180, 90, "u", "", 0, "cr_d1") + S.dio(180, 190, "u", "", 0, "cr_d3") + S.dio(280, 90, "u", "", 0, "cr_d2") + S.dio(280, 190, "u", "", 0, "cr_d4") +
          S.txt(162, 94, "D1", "", "end") + S.txt(162, 194, "D3", "", "end") + S.txt(298, 94, "D2") + S.txt(298, 194, "D4") +
          S.src(230, 140, "", "~") + S.res(400, 140, "v", "Tải") + S.node(180, 140) + S.node(280, 140) + S.node(280, 40) + S.node(280, 240) +
          S.txt(170, 136, "A", "", "end") + S.txt(290, 136, "B") + S.txt(340, 32, "P (+)", "m") + S.txt(340, 258, "N (−)", "m") + S.val(230, 112, "cr_pol", "middle"), "Cầu chỉnh lưu bốn diode") + '</div>' +
        '<div id="cr_ban" style="display:none">' + svg(480, 240, S.wire("90,200 90,50 400,50 400,200 90,200", "cr_h") + S.src(90, 125, "", "~") + S.dio(240, 50, "r", "", 0, "cr_d0") + S.txt(240, 32, "D", "", "middle") + S.res(400, 125, "v", "Tải") + S.gnd(240, 200), "Chỉnh lưu bán kỳ một diode") + '</div>' +
        '<div class="ctlrow"><button type="button" class="btn-sim" id="cr_pause">Tạm dừng</button><span class="pill good" id="cr_pill">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Điện áp nguồn và điện áp trên tải</h4><canvas id="cr_cv"></canvas>' + leg([["muted", "điện áp xoay chiều ở thứ cấp"], ["sig1", "điện áp trên tải"]]) +
        '<div class="tiles">' + tile("cr_t1", "Điện áp nguồn lúc này") + tile("cr_t2", "Điện áp tải lúc này") + tile("cr_t3", "Diode đang dẫn") + tile("cr_t4", "Trung bình trên tải") + tile("cr_t5", "Số xung mỗi chu kỳ") + '</div><p class="note">Thứ cấp 12 V hiệu dụng (đỉnh khoảng 17 V), chiếu chậm để theo dõi được từng nửa chu kỳ 10 ms.</p></div></div></div>';
    },
    st: { ph: 0.05, run: true },
    init: function () { var s = this.st; E("cr_pause").onclick = function () { s.run = !s.run; }; },
    draw: function (t, dt) {
      var s = this.st, m = segV("cr_m"), Up = 12 * Math.SQRT2, drop = m === "cau" ? 1.4 : 0.7; if (s.run && !DT.RM) s.ph = (s.ph + dt / 5) % 1;
      var u = Up * Math.sin(2 * Math.PI * s.ph), ld = m === "cau" ? Math.max(0, Math.abs(u) - drop) : Math.max(0, u - drop), on = ld > 0, pos = u >= 0;
      E("cr_cau").style.display = m === "cau" ? "" : "none"; E("cr_ban").style.display = m === "cau" ? "none" : ""; set("cr_pause", s.run ? "Tạm dừng" : "Chạy tiếp");
      var hot = "var(--dt-sig2)", cold = "";
      if (m === "cau") {
        E("cr_d1").style.fill = on && pos ? hot : cold; E("cr_d4").style.fill = on && pos ? hot : cold; E("cr_d2").style.fill = on && !pos ? hot : cold; E("cr_d3").style.fill = on && !pos ? hot : cold;
        flow("cr_p", on && pos ? 0.4 + ld / Up : 0, dt); flow("cr_n", on && !pos ? 0.4 + ld / Up : 0, dt); set("cr_pol", pos ? "A dương hơn B" : "B dương hơn A");
      } else { E("cr_d0").style.fill = on ? hot : cold; flow("cr_h", on ? 0.4 + ld / Up : 0, dt); }
      var ps = [], pl = [], sum = 0, N = 400; for (var i = 0; i <= N; i++) { var x = 2 * i / N, uu = Up * Math.sin(2 * Math.PI * x), l = m === "cau" ? Math.max(0, Math.abs(uu) - drop) : Math.max(0, uu - drop); ps.push([x * 20, uu]); pl.push([x * 20, l]); sum += l; }
      plot(E("cr_cv"), { x0: 0, x1: 40, y0: -20, y1: 20, ny: 8, nx: 4, xl: "t (ms)", yl: "u (V)", s: [{ p: ps, c: "muted", w: 1.3, d: [4, 3] }, { p: pl, c: "sig1", w: 2.4 }], m: [{ x: s.ph * 20, y: ld }] });
      set("cr_t1", eng(u, "V")); set("cr_t2", eng(ld, "V")); set("cr_t3", !on ? "không có" : m === "cau" ? (pos ? "D1 và D4" : "D2 và D3") : "D"); set("cr_t4", eng(sum / (N + 1), "V")); set("cr_t5", m === "cau" ? "2 (100 Hz)" : "1 (50 Hz)");
      if (m === "cau") pill("cr_pill", on ? "good" : "warn", on ? (pos ? "Đường dòng: A → D1 → P → tải → N → D4 → B" : "Đường dòng: B → D2 → P → tải → N → D3 → A") : "Gần điểm 0: chưa đủ điện áp cho hai diode dẫn");
      else pill("cr_pill", on ? "good" : "warn", on ? "Nửa chu kỳ dương: diode dẫn, tải có dòng" : "Nửa chu kỳ âm: diode khóa, tải không có dòng");
    }
  });

  /* ================= TỤ LỌC VÀ ĐỘ GỢN ================= */
  DT.reg("tu-loc", {
    st: { cap: true },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(545, 250,
        S.wire("50,125 50,50 150,50 150,90") + S.wire("50,125 50,205 150,205 150,160") + S.wire("185,110 225,110 225,60 320,60 320,205 225,205 225,140 185,140", "c_ch") + S.wire("320,60 440,60 440,205 320,205", "c_ld") +
        S.src(50, 125, "U₂", "~") + '<rect class="cp" x="115" y="90" width="70" height="70" rx="3"/><text x="150" y="108" text-anchor="middle" class="m">~</text><text x="150" y="155" text-anchor="middle" class="m">~</text><text x="176" y="114" text-anchor="end" class="m">+</text><text x="176" y="144" text-anchor="end" class="m">−</text><text x="146" y="122" text-anchor="middle">BR</text><text x="150" y="137" text-anchor="middle" class="v" id="c_dd"></text>' +
        '<g id="c_capg">' + S.cap(320, 132, "v", "C", "c_cv") + "</g>" + S.res(440, 132, "v", "Rtải", "c_rv") + S.node(320, 60) + S.node(320, 205) + S.gnd(380, 205) + S.txt(332, 52, "VRAW", "m") + S.txt(366, 228, "0 V", "m")) +
        '<div class="ctl">' + sl("c_u", "Thứ cấp U₂ (hiệu dụng)", 6, 15, 0.5, 12, "V") + sl("c_c", "Tụ lọc C", 1e-4, 1e-2, 0, 3.3e-3, "F", 1) + sl("c_r", "Rtải", 8, 500, 0, 14, "Ω", 1) + '</div><div class="ctlrow"><button type="button" class="btn-sim" id="c_btn">Tháo tụ lọc</button><span class="pill good" id="c_p">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Dạng sóng trên tải (chiếu chậm 100 lần)</h4><canvas id="c_cv2"></canvas>' + leg([["muted", "sau cầu, chưa lọc"], ["sig1", "điện áp trên tụ và tải"]]) +
        '<div class="tiles">' + tile("c_t1", "Đỉnh") + tile("c_t2", "Đáy gợn") + tile("c_t3", "Gợn ΔUpp đo được") + tile("c_t4", "Trung bình") + tile("c_t5", "Dòng tải") + tile("c_t6", "Công thức Itải/(100·C)") + '</div><p class="note">Công thức gần đúng cho giá trị lớn hơn số đo một chút, vì tụ chỉ xả trong phần chu kỳ diode khóa chứ không phải trọn 10 ms.</p></div></div></div>';
    },
    init: function () { var s = this.st; E("c_btn").onclick = function () { s.cap = !s.cap; }; },
    draw: function (t, dt) {
      var U = V("c_u"), C = V("c_c"), R = V("c_r"), cap = this.st.cap, Up = U * Math.SQRT2, w = 2 * Math.PI * 50, h = 2e-5;
      var vr = function (x) { return Math.max(0, Math.abs(Up * Math.sin(w * x)) - 1.8); }, vc = Math.max(0, Up - 1.8), pr = [], pc = [], cond = [], mx = 0, mn = 1e9, sum = 0, n = 0, k = 0;
      for (var x = -0.06; x <= 0.04; x += h, k++) {
        var r = vr(x), on = false; if (cap) { if (r >= vc) { vc = r; on = true; } else vc -= vc / (R * C) * h; } else { vc = r; on = r > 0; }
        if (x >= 0) { if (n % 10 === 0) { pr.push([x * 1e3, r]); pc.push([x * 1e3, vc]); cond.push(on); } if (vc > mx) mx = vc; if (vc < mn) mn = vc; sum += vc; n++; }
      }
      var avg = sum / n, I = avg / R, cur = DT.RM ? 0.012 : (t * 0.01) % 0.04, ci = clamp(Math.round(cur / 2e-4), 0, cond.length - 1), cn = cond[ci], pos = Math.sin(w * cur) >= 0;
      plot(E("c_cv2"), { x0: 0, x1: 40, y0: 0, y1: 24, ny: 4, nx: 4, xl: "t (ms)", yl: "u (V)", s: [{ p: pr, c: "muted", w: 1.3, d: [4, 3] }, { p: pc, c: "sig1", w: 2.4 }], m: [{ x: cur * 1e3, y: pc[ci][1] }] });
      set("c_dd", cn ? (pos ? "D1 + D4" : "D2 + D3") : "khóa"); E("c_capg").style.opacity = cap ? 1 : 0.18; set("c_btn", cap ? "Tháo tụ lọc" : "Lắp tụ lọc");
      set("c_t1", eng(mx, "V")); set("c_t2", eng(mn, "V")); set("c_t3", eng(mx - mn, "V")); set("c_t4", eng(avg, "V")); set("c_t5", eng(I, "A")); set("c_t6", cap ? eng(I / (100 * C), "V") : "–"); set("c_cv", cap ? eng(C, "F") : "đã tháo"); set("c_rv", eng(R, "Ω"));
      var rip = (mx - mn) / Math.max(avg, 0.1); pill("c_p", !cap ? "bad" : rip < 0.12 ? "good" : rip < 0.3 ? "warn" : "bad", !cap ? "Chưa lọc: điện áp nhấp nhô về 0" : "Gợn bằng " + num(rip * 100, 2) + "% điện áp trung bình");
      flow("c_ld", lvl(pc[ci][1] / R, 1), dt); flow("c_ch", cn ? 1.5 : 0, dt);
    }
  });

  /* ================= BỀ RỘNG ĐƯỜNG MẠCH IN ================= */
  DT.reg("duong-mach", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctl">' + sl("pc_i", "Dòng qua đường mạch", 0.1, 5, 0.1, 1, "A") + sl("pc_w", "Bề rộng bạn định vẽ", 0.2, 4, 0.1, 2, function (x) { return num(x, 3) + " mm"; }) + sl("pc_l", "Chiều dài đường mạch", 10, 200, 5, 50, function (x) { return num(x, 3) + " mm"; }) + '</div>' +
        '<div class="ctlrow"><span class="lbl">Mức tăng nhiệt cho phép</span>' + seg("pc_dt", [["10", "10 °C"], ["20", "20 °C"], ["30", "30 °C"]], "10") + '</div><div class="ctlrow"><span class="lbl">Độ dày đồng</span>' + seg("pc_cu", [["35", "35 µm"], ["70", "70 µm"]], "35") + '</div><div class="ctlrow"><span class="lbl">Vị trí lớp</span>' + seg("pc_ly", [["o", "Lớp ngoài"], ["i", "Lớp trong"]], "o") + '</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>So sánh theo tỉ lệ thật (1 mm = 24 px)</h4><svg class="sch" viewBox="0 0 440 150" role="img" aria-label="So sánh bề rộng tối thiểu và bề rộng định vẽ"><rect x="0" y="0" width="440" height="150" fill="#0c5a3c" rx="6"/><rect id="pc_r1" x="20" y="30" width="400" height="8" fill="#d99a4e"/><rect id="pc_r2" x="20" y="90" width="400" height="48" fill="#d99a4e"/><text x="24" y="22" style="fill:#fff" id="pc_l1"></text><text x="24" y="82" style="fill:#fff" id="pc_l2"></text></svg>' +
        '<div class="ctlrow"><span class="pill good" id="pc_p">–</span></div><div class="tiles">' + tile("pc_t1", "Bề rộng tối thiểu (IPC-2221)") + tile("pc_t2", "Điện trở đường mạch") + tile("pc_t3", "Sụt áp trên đường mạch") + tile("pc_t4", "Tổn hao") + '</div><p class="note">Công thức IPC-2221: I = k·ΔT^0,44·A^0,725, với A là tiết diện đồng tính bằng mil², k = 0,048 cho lớp ngoài và 0,024 cho lớp trong. Bo gia công thủ công nên vẽ rộng hơn mức tối thiểu để bù sai số ăn mòn.</p></div></div></div>';
    },
    draw: function () {
      var I = V("pc_i"), w = V("pc_w"), Lm = V("pc_l"), dT = +segV("pc_dt"), cu = +segV("pc_cu"), k = segV("pc_ly") === "o" ? 0.048 : 0.024;
      var A = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725), wmin = A / (cu / 25.4) * 0.0254, R = 1.72e-8 * (Lm / 1e3) / ((w / 1e3) * (cu * 1e-6)), dv = I * R;
      set("pc_t1", num(wmin, 3) + " mm"); set("pc_t2", eng(R, "Ω")); set("pc_t3", eng(dv, "V")); set("pc_t4", eng(I * dv, "W"));
      E("pc_r1").setAttribute("height", Math.max(1, wmin * 24).toFixed(1)); E("pc_r2").setAttribute("height", (w * 24).toFixed(1)); E("pc_r2").setAttribute("y", 90); set("pc_l1", "Tối thiểu theo công thức: " + num(wmin, 3) + " mm"); set("pc_l2", "Bạn định vẽ: " + num(w, 3) + " mm");
      pill("pc_p", w < wmin ? "bad" : w < 1 ? "warn" : "good", w < wmin ? "Quá hẹp: đường mạch sẽ nóng hơn mức cho phép" : w < 1 ? "Đủ về điện, nhưng khó gia công thủ công dưới 1 mm" : "Đạt, có dự phòng cho gia công");
    }
  });

  /* ================= ỔN ÁP ZENER ================= */
  DT.reg("zener", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(470, 250,
        S.wire("60,210 60,50 250,50", "d_s") + S.wire("250,50 250,210", "d_z") + S.wire("250,50 420,50 420,210 250,210", "d_l") + S.wire("250,210 60,210", "d_fr") +
        S.src(60, 130, "Uvào") + S.res(155, 50, "h", "Rs", "d_rs") + S.dio(250, 130, "u", "", 1) + S.txt(264, 126, "Zener 5,1 V") + S.val(264, 142, "d_iz") + S.res(420, 130, "v", "Rtải", "d_rl") +
        S.node(250, 50) + S.node(250, 210) + S.gnd(155, 210) + S.txt(300, 42, "Ura", "m") + S.val(330, 42, "d_ura")) +
        '<div class="ctl">' + sl("d_u", "Uvào", 6, 16, 0.1, 12, "V") + sl("d_rsv", "Rs", 100, 2200, 0, 470, "Ω", 1) + sl("d_rlv", "Rtải", 100, 2e4, 0, 510, "Ω", 1) + '</div><div class="ctlrow"><span class="pill good" id="d_p">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Cân bằng dòng tại nút ra</h4><div class="tiles">' + tile("d_t1", "Dòng qua Rs") + tile("d_t2", "Dòng tải") + tile("d_t3", "Dòng Zener IZ") + tile("d_t4", "Công suất Zener") + tile("d_t5", "Công suất trên Rs") + '</div></div>' +
        '<div class="panel"><h4>Ura theo Uvào</h4><canvas id="d_cv"></canvas>' + leg([["sig1", "Ura với Rs, Rtải đang chọn"], ["copper", "mức 5,1 V"]]) + '</div></div></div>';
    },
    draw: function (t, dt) {
      var U = V("d_u"), Rs = V("d_rsv"), RL = V("d_rlv"), VZ = 5.1, f = function (u) { var d = u * RL / (Rs + RL); return d >= VZ ? VZ : d; }, Ur = f(U), reg = Ur >= VZ - 1e-9, IR = (U - Ur) / Rs, IL = Ur / RL, IZ = Math.max(0, IR - IL), PZ = VZ * IZ;
      set("d_t1", eng(IR, "A")); set("d_t2", eng(IL, "A")); set("d_t3", eng(IZ, "A")); set("d_t4", eng(PZ, "W")); set("d_t5", eng(IR * IR * Rs, "W")); set("d_ura", eng(Ur, "V")); set("d_iz", "IZ " + eng(IZ, "A")); set("d_rs", eng(Rs, "Ω")); set("d_rl", eng(RL, "Ω"));
      if (!reg) pill("d_p", "bad", "Mất ổn áp: Zener không còn dòng"); else if (IZ < 2e-3) pill("d_p", "warn", "Sát giới hạn: IZ dưới 2 mA"); else if (PZ > 0.4) pill("d_p", "warn", "Zener nóng: PZ gần mức 0,5 W"); else pill("d_p", "good", "Đang ổn áp ở 5,1 V");
      flow("d_s", lvl(IR, 0.02), dt); flow("d_fr", lvl(IR, 0.02), dt); flow("d_z", lvl(IZ, 0.02), dt); flow("d_l", lvl(IL, 0.02), dt);
      var p = []; for (var u = 4; u <= 16.001; u += 0.1) p.push([u, f(u)]);
      plot(E("d_cv"), { x0: 4, x1: 16, y0: 0, y1: 8, nx: 6, xl: "Uvào (V)", yl: "Ura (V)", s: [{ p: p, c: "sig1", w: 2.4 }], h: [{ y: 5.1, t: "5,1 V", c: "copper" }], m: [{ x: U, y: Ur }] });
    }
  });

  /* ================= NHIỆT TRÊN IC ỔN ÁP ================= */
  DT.reg("on-ap-ic", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctl">' + sl("th_v", "Điện áp vào Uvào", 7, 25, 0.5, 12, "V") + sl("th_i", "Dòng tải của ngõ 5 V", 0.02, 1.5, 0, 0.2, "A", 1) + sl("th_a", "Nhiệt độ môi trường", 20, 50, 1, 30, function (x) { return num(x, 3) + " °C"; }) + '</div>' +
        '<div class="ctlrow"><span class="lbl">Tản nhiệt</span>' + seg("th_h", [["0", "Không gắn"], ["20", "Nhỏ 20 °C/W"], ["10", "Vừa 10 °C/W"], ["5", "Lớn 5 °C/W"]], "0") + '</div><label class="chk" for="th_c"><input type="checkbox" id="th_c"> Phân tầng: cấp L7805 từ ngõ ra +12 V của L7812</label></div>' +
        '<div class="panel"><h4>Dòng năng lượng</h4><svg class="sch" viewBox="0 0 440 120" role="img" aria-label="Phần công suất đến tải và phần biến thành nhiệt"><rect x="10" y="20" width="420" height="34" fill="var(--dt-grid)" rx="4"/><rect id="th_b1" x="10" y="20" height="34" fill="var(--dt-sig3)" rx="4"/><rect id="th_b2" y="20" height="34" fill="var(--dt-sig2)"/><rect id="th_b3" y="20" height="34" fill="var(--dt-copper)"/><text x="10" y="76" id="th_bl1"></text><text x="10" y="94" id="th_bl2"></text><text x="10" y="112" id="th_bl3"></text></svg></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Nhiệt độ tiếp giáp ước tính của L7805</h4><svg class="sch" viewBox="0 0 440 86" role="img" aria-label="Thang nhiệt độ tiếp giáp"><rect x="20" y="24" width="400" height="20" rx="10" fill="var(--dt-grid)"/><rect id="th_bar" x="20" y="24" width="10" height="20" rx="10" fill="var(--dt-sig3)"/><path class="ln" d="M240 18V50M270 18V50" style="stroke-dasharray:3 3"/><text x="240" y="14" text-anchor="middle" class="m">110 °C</text><text x="276" y="66" class="m">125 °C giới hạn</text><text x="20" y="66" class="m">0 °C</text><text x="420" y="66" text-anchor="end" class="m">200 °C</text><text id="th_tj" x="20" y="14" style="font-weight:600"></text></svg>' +
        '<div class="ctlrow"><span class="pill good" id="th_p">–</span></div><div class="tiles">' + tile("th_t1", "Tổn hao trên L7805") + tile("th_t2", "Nhiệt trở tiếp giáp–môi trường") + tile("th_t3", "Nhiệt độ tiếp giáp") + tile("th_t4", "Hiệu suất cả mạch") + tile("th_t5", "Tổn hao trên L7812") + '</div><p class="note">Tj = TA + P × θJA. Vỏ TO-220 không tản nhiệt có θJA khoảng 50 °C/W; khi gắn tản nhiệt, θJA ≈ 5 (tiếp giáp–vỏ) + 1 (lớp tiếp xúc) + nhiệt trở tản nhiệt. Phân tầng không làm giảm tổng nhiệt, chỉ chia nhiệt cho hai vỏ.</p></div></div></div>';
    },
    draw: function () {
      var U = V("th_v"), I = V("th_i"), TA = V("th_a"), hs = +segV("th_h"), cas = E("th_c").checked, th = hs ? 6 + hs : 50;
      var vin5 = cas ? 12 : U, P5 = (vin5 - 5) * I, P12 = cas ? (U - 12) * I : 0, Tj = TA + P5 * th, Pout = 5 * I, Pin = U * I, bad = cas && U < 14.5;
      set("th_t1", eng(P5, "W")); set("th_t2", num(th, 3) + " °C/W"); set("th_t3", num(Tj, 3) + " °C"); set("th_t4", num(Pout / Pin * 100, 3) + "%"); set("th_t5", cas ? eng(P12, "W") : "không dùng");
      var w = clamp(Tj / 200 * 400, 12, 400); E("th_bar").setAttribute("width", w.toFixed(0)); E("th_bar").setAttribute("fill", Tj > 125 ? "var(--dt-bad)" : Tj > 110 ? "var(--dt-warn)" : "var(--dt-sig3)"); set("th_tj", "Tj ≈ " + num(Tj, 3) + " °C");
      if (bad) pill("th_p", "bad", "Uvào dưới 14,5 V: L7812 không đủ điện áp rơi để ổn áp"); else if (Tj > 125) pill("th_p", "bad", "Quá nhiệt: IC sẽ tự ngắt bảo vệ"); else if (Tj > 110) pill("th_p", "warn", "Sát giới hạn: cần tản nhiệt lớn hơn hoặc giảm tải"); else pill("th_p", "good", "Trong giới hạn thiết kế 110 °C");
      var a = Pout / Pin * 420, b = P5 / Pin * 420, c = P12 / Pin * 420; E("th_b1").setAttribute("width", a.toFixed(1)); E("th_b2").setAttribute("x", (10 + a).toFixed(1)); E("th_b2").setAttribute("width", b.toFixed(1)); E("th_b3").setAttribute("x", (10 + a + b).toFixed(1)); E("th_b3").setAttribute("width", Math.max(0, c).toFixed(1));
      set("th_bl1", "■ Đến tải: " + eng(Pout, "W")); set("th_bl2", "■ Thành nhiệt trên L7805: " + eng(P5, "W")); set("th_bl3", cas ? "■ Thành nhiệt trên L7812: " + eng(P12, "W") + " (tổng nhiệt " + eng(P5 + P12, "W") + ")" : "");
      E("th_bl1").style.fill = "var(--dt-sig3)"; E("th_bl2").style.fill = "var(--dt-sig2)"; E("th_bl3").style.fill = "var(--dt-copper)";
    }
  });

  /* ================= ĐA HÀI BJT ================= */
  DT.reg("da-hai", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(560, 300,
        S.wire("90,30 470,30") + S.wire("120,30 120,217", "e_1") + S.wire("440,30 440,217", "e_2") + S.wire("220,30 220,165 395,235 412,235") + S.wire("340,30 340,165 165,235 148,235") +
        S.wire("120,150 220,150") + S.wire("340,150 440,150") + S.wire("120,253 120,275") + S.wire("440,253 440,275") + S.wire("90,275 470,275") +
        S.led(120, 62, "d", "LED1", "e_l1") + S.res(120, 112, "v", "") + S.led(440, 62, "d", "LED2", "e_l2") + S.res(440, 112, "v", "") + S.res(220, 90, "v", "R") + S.res(340, 90, "v", "R") +
        S.cap(170, 150, "h", "C1") + S.cap(390, 150, "h", "C2") + S.npn(130, 235, 1, "Q1") + S.npn(430, 235, 0, "Q2") +
        S.node(120, 150) + S.node(220, 150) + S.node(340, 150) + S.node(440, 150) + S.gnd(280, 275) + S.txt(476, 34, "+5 V", "m") + S.txt(60, 154, "C(Q1)", "m") + S.txt(452, 154, "C(Q2)", "m") + S.txt(228, 143, "B(Q2)", "m")) +
        '<div class="ctl">' + sl("e_r", "R định thời (hai nhánh)", 1e4, 1.5e5, 0, 6.8e4, "Ω", 1) + sl("e_c1", "C1", 1e-6, 4.7e-5, 0, 1e-5, "F", 1) + sl("e_c2", "C2", 1e-6, 4.7e-5, 0, 1e-5, "F", 1) + '</div><p class="note" id="e_slow"></p></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Dạng sóng</h4><canvas id="e_cv"></canvas>' + leg([["sig1", "collector Q1"], ["sig2", "collector Q2"], ["sig3", "base Q2"]]) +
        '<div class="ctlrow"><span class="pill good" id="e_p">–</span><span class="pill warn" id="e_s">–</span></div><div class="tiles">' + tile("e_t1", "Q1 dẫn (LED1 sáng)") + tile("e_t2", "Q2 dẫn (LED2 sáng)") + tile("e_t3", "Chu kỳ T") + tile("e_t4", "Tần số") + '</div></div></div></div>';
    },
    draw: function (t, dt) {
      var R = V("e_r"), C1 = V("e_c1"), C2 = V("e_c2"), Vc = 5, tA = 0.693 * R * C1, tB = 0.693 * R * C2, T = tA + tB, k = T < 0.6 ? 0.9 / T : 1, ph = DT.RM ? tA * 0.5 : ((t / k) % T), A = ph < tA;
      set("e_t1", eng(tA, "s")); set("e_t2", eng(tB, "s")); set("e_t3", eng(T, "s")); set("e_t4", eng(1 / T, "Hz"));
      set("e_slow", k > 1.01 ? "Tần số cao nên hình được chiếu chậm " + num(k, 2) + " lần." : "Đang chạy theo thời gian thực.");
      var d = Math.abs(tA - tB) / T; pill("e_p", d < 0.05 ? "good" : "warn", d < 0.05 ? "Hai nhánh đối xứng" : "Mất đối xứng: hai tụ khác nhau"); pill("e_s", "warn", A ? "Q1 dẫn, Q2 tắt: C1 đang nạp qua R" : "Q2 dẫn, Q1 tắt: C2 đang nạp qua R");
      E("e_l1").setAttribute("class", A ? "glow" : "off"); E("e_l2").setAttribute("class", A ? "off" : "glow"); flow("e_1", A ? 1 : 0, dt); flow("e_2", A ? 0 : 1, dt);
      var p1 = [], p2 = [], pb = [], N = 240; for (var i = 0; i <= N; i++) { var x = 2 * T * i / N, q = x % T, a = q < tA; p1.push([x, a ? 0.1 : Vc]); p2.push([x, a ? Vc : 0.1]); pb.push([x, a ? Vc - (2 * Vc - 0.8) * Math.exp(-q / (R * C1)) : 0.7]); }
      plot(E("e_cv"), { x0: 0, x1: 2 * T, y0: -5, y1: 6, ny: 11, nx: 4, xl: "t (s)", yl: "u (V)", s: [{ p: p1, c: "sig1", w: 2 }, { p: p2, c: "sig2", w: 2 }, { p: pb, c: "sig3", w: 2 }], v: [{ x: ph, t: "", c: "dot" }], h: [{ y: 0.7, t: "ngưỡng 0,7 V", c: "muted" }] });
    }
  });

  /* ================= ĐA HÀI LÁI RƠLE 24 V: KIỂM TRA BÃO HÒA ================= */
  var TR = { bc337: ["BC337-25", 160], n2222: ["2N2222A", 75], tip41: ["TIP41C", 30] };
  DT.reg("da-hai-role", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctlrow"><span class="lbl">Transistor</span>' + seg("rl_t", Object.keys(TR).map(function (k) { return [k, TR[k][0]]; }), "bc337") + '</div><div class="ctl">' +
        sl("rl_rb", "RB định thời", 4.7e3, 1e5, 0, 3.3e4, "Ω", 1) + sl("rl_c", "Tụ ghép C", 4.7e-6, 1e-4, 0, 2.2e-5, "F", 1) + sl("rl_rc", "Điện trở cuộn rơle 24 V", 200, 2000, 0, 650, "Ω", 1) + '</div></div>' +
        '<div class="panel"><h4>hFE bảo đảm so với β cưỡng bức</h4><svg class="sch" viewBox="0 0 440 96" role="img" aria-label="So sánh hFE nhỏ nhất của transistor với β cưỡng bức của mạch"><rect x="10" y="18" width="420" height="22" fill="var(--dt-grid)" rx="4"/><rect id="rl_b1" x="10" y="18" height="22" fill="var(--dt-sig1)" rx="4"/><rect x="10" y="58" width="420" height="22" fill="var(--dt-grid)" rx="4"/><rect id="rl_b2" x="10" y="58" height="22" fill="var(--dt-sig2)" rx="4"/><text x="10" y="13" id="rl_l1"></text><text x="10" y="53" id="rl_l2"></text><text x="430" y="94" text-anchor="end" class="m">thang 0–200</text></svg></div></div>' +
        '<div class="simcol"><div class="panel"><div class="ctlrow"><span class="pill good" id="rl_p">–</span></div><div class="tiles">' + tile("rl_t1", "Thời gian mỗi trạng thái") + tile("rl_t2", "Dòng cuộn rơle IC") + tile("rl_t3", "Dòng base IB") + tile("rl_t4", "β cưỡng bức IC/IB") + tile("rl_t5", "hFE nhỏ nhất bảo đảm") + tile("rl_t6", "Hệ số dự phòng") + '</div><p class="note">t ≈ 0,693·RB·C; IB ≈ (24 − 0,7 − 0,7)/RB, đã trừ sụt áp của diode bảo vệ base. Transistor chỉ chắc chắn bão hòa khi hFE nhỏ nhất trong datasheet lớn hơn β cưỡng bức, nên có dự phòng từ 2 lần.</p></div></div></div>';
    },
    draw: function () {
      var tr = TR[segV("rl_t")], RB = V("rl_rb"), C = V("rl_c"), RC = V("rl_rc"), IC = 24 / RC, IB = 22.6 / RB, bf = IC / IB, mg = tr[1] / bf;
      set("rl_t1", eng(0.693 * RB * C, "s")); set("rl_t2", eng(IC, "A")); set("rl_t3", eng(IB, "A")); set("rl_t4", num(bf, 3)); set("rl_t5", String(tr[1])); set("rl_t6", num(mg, 2) + " lần");
      E("rl_b1").setAttribute("width", (clamp(tr[1] / 200, 0, 1) * 420).toFixed(0)); E("rl_b2").setAttribute("width", (clamp(bf / 200, 0, 1) * 420).toFixed(0)); set("rl_l1", "hFE nhỏ nhất của " + tr[0] + ": " + tr[1]); set("rl_l2", "β cưỡng bức của mạch: " + num(bf, 3));
      pill("rl_p", mg >= 2 ? "good" : mg >= 1 ? "warn" : "bad", mg >= 2 ? "Bão hòa chắc chắn" : mg >= 1 ? "Sát giới hạn: có linh kiện sẽ không bão hòa" : "Không chắc bão hòa: rơle hút yếu, transistor nóng");
    }
  });
})();
