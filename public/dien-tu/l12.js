/* Dụng cụ đo, Bài 1, Bài 2 */
(function () {
  "use strict";
  var DT = window.DT, E = DT.E, S = DT.S, svg = DT.svg, sl = DT.sl, V = DT.V, tile = DT.tile, set = DT.set, pill = DT.pill, eng = DT.eng, num = DT.num, flow = DT.flow, lvl = DT.lvl, plot = DT.plot, leg = DT.leg, clamp = DT.clamp, seg = DT.seg, segV = DT.segV;
  var SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  function pow10(n) { return "10" + (n < 0 ? "⁻" : "") + String(Math.abs(n)).split("").map(function (d) { return SUP[+d]; }).join(""); }

  /* ================= ĐỒNG HỒ VẠN NĂNG ================= */
  DT.reg("dong-ho-van-nang", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(540, 262,
        S.wire("130,215 130,50 390,50 390,215 130,215", "dm_f") +
        S.src(130, 135, "", "±") + S.txt(152, 128, "Nguồn 5 V", "m") + S.val(152, 144, "dm_pw") +
        S.res(240, 50, "h", "R₁ 1 kΩ") + S.res(390, 135, "v", "") + S.txt(350, 118, "R₂", "", "end") + S.txt(366, 134, "2,2 kΩ", "m", "end") + S.gnd(260, 215) +
        '<g id="dm_lift" style="display:none"><rect class="bg" x="380" y="176" width="20" height="16"/><path class="ln" d="M390 176l10 -8"/><text class="m" x="372" y="190" text-anchor="end">đã tháo chân</text></g>' +
        '<g id="dm_par">' + S.wire("390,80 480,80 480,118") + S.wire("480,152 480,195 390,195") + S.node(390, 80) + S.node(390, 195) + '<circle class="mt" cx="480" cy="135" r="19"/><text class="mtx" x="480" y="141" text-anchor="middle"></text></g>' +
        '<g id="dm_ser" style="display:none"><circle class="mt" cx="325" cy="50" r="19"/><text class="mtx" x="325" y="56" text-anchor="middle"></text><text class="m" x="325" y="86" text-anchor="middle">cắt nhánh, mắc nối tiếp</text></g>' +
        '<g id="dm_src" style="display:none">' + S.wire("130,80 50,80 50,118") + S.wire("50,152 50,195 130,195") + S.node(130, 80) + S.node(130, 195) + '<circle class="mt" cx="50" cy="135" r="19"/><text class="mtx" x="50" y="141" text-anchor="middle"></text></g>',
        "Mạch hai điện trở nối tiếp và vị trí đồng hồ") +
        '</div><div class="panel"><div class="ctlrow"><span class="lbl">Chức năng</span>' + seg("dm_fn", [["V", "V⎓ điện áp"], ["A", "mA dòng điện"], ["O", "Ω điện trở"]], "V") + '</div>' +
        '<div class="ctlrow"><span class="lbl">Cách mắc que đo</span>' + seg("dm_pos", [["par", "Song song R₂"], ["ser", "Nối tiếp trong nhánh"], ["src", "Song song nguồn"]], "par") + '</div>' +
        '<div class="ctlrow"><span class="lbl">Nguồn</span>' + seg("dm_on", [["1", "Đang bật"], ["0", "Đã ngắt"]], "1") + '<label class="chk" for="dm_lf"><input type="checkbox" id="dm_lf"> Tháo một chân R₂</label></div></div></div>' +
        '<div class="simcol"><div class="panel"><div class="lcd" id="dm_lcd" aria-live="polite">–</div><div class="ctlrow"><span class="pill good" id="dm_p">–</span></div><p class="note" id="dm_msg"></p></div>' +
        '<div class="panel"><h4>Nhớ nhanh</h4><div class="tiles">' + tile("dm_t1", "Điện áp trên R₂") + tile("dm_t2", "Dòng trong mạch") + tile("dm_t3", "Que đỏ cắm cổng") + '</div></div></div></div>';
    },
    init: function () { },
    draw: function (t, dt) {
      var f = segV("dm_fn"), p = segV("dm_pos"), on = segV("dm_on") === "1", lf = E("dm_lf");
      if (f !== "O" || on) { if (lf.checked) lf.checked = false; lf.disabled = true; } else lf.disabled = false;
      var lift = lf.checked, I = 5 / 3200, U2 = 5 * 2200 / 3200, lcd, cls, msg, i = on ? I : 0;
      if (f === "V") {
        if (!on) { lcd = "0,00 V"; cls = "warn"; msg = "Nguồn đã ngắt nên không có điện áp để đo. Đo điện áp là phép đo khi mạch đang hoạt động."; }
        else if (p === "par") { lcd = num(U2, 3) + " V"; cls = "good"; msg = "Đúng: vôn kế mắc song song với linh kiện cần đo. Điện trở trong của đồng hồ rất lớn (cỡ 10 MΩ) nên gần như không làm thay đổi mạch."; }
        else if (p === "src") { lcd = "5,00 V"; cls = "good"; msg = "Đúng: mắc song song hai cực nguồn để kiểm tra điện áp nguồn trước khi đo các điểm khác."; }
        else { lcd = "5,00 V"; cls = "bad"; i = 0; msg = "Sai cách mắc: vôn kế nối tiếp làm mạch gần như hở vì điện trở trong rất lớn. Số đo gần bằng điện áp nguồn, không phải điện áp trên linh kiện, và mạch ngừng hoạt động."; }
      } else if (f === "A") {
        if (p === "ser") { lcd = (on ? num(I * 1e3, 3) : "0,00") + " mA"; cls = on ? "good" : "warn"; msg = on ? "Đúng: muốn đo dòng phải ngắt nhánh và mắc ampe kế nối tiếp để toàn bộ dòng đi qua đồng hồ." : "Cách mắc đúng, nhưng nguồn đã ngắt nên dòng bằng 0."; }
        else if (p === "par") { lcd = (on ? "5,00" : "0,00") + " mA"; cls = "bad"; if (on) i = 5e-3; msg = "Sai: ampe kế có điện trở trong rất nhỏ nên nối tắt R₂. Dòng tăng lên 5 mA và R₂ mất điện áp. Ở mạch công suất lớn, cách mắc này gây chập."; }
        else { lcd = on ? "CHẬP" : "0,00 mA"; cls = "bad"; msg = "Nguy hiểm: ampe kế mắc song song nguồn là nối tắt nguồn qua đồng hồ. Cầu chì của đồng hồ cháy, dây và nguồn có thể hỏng. Sau khi đo dòng luôn trả que đỏ về cổng VΩ."; }
      } else {
        if (on) { lcd = "SAI"; cls = "bad"; msg = "Không đo điện trở khi mạch còn điện: nguồn ngoài làm sai số đo và có thể làm hỏng đồng hồ. Ngắt nguồn, xả tụ rồi mới đo."; }
        else if (p === "par") {
          if (lift) { lcd = "2,20 kΩ"; cls = "good"; msg = "Đúng: nguồn đã ngắt và một chân được tháo ra nên đồng hồ chỉ đo riêng R₂."; }
          else { lcd = "688 Ω"; cls = "warn"; msg = "Số đo thấp hơn 2,2 kΩ vì R₁ cùng nguồn (đã tắt nhưng vẫn nối kín mạch) tạo thành nhánh song song. Tháo một chân của R₂ để đo đúng."; }
        } else { lcd = "3,20 kΩ"; cls = "warn"; msg = "Đồng hồ đang đo cả vòng mạch (R₁ + R₂), không phải một linh kiện. Muốn đo riêng R₂, đặt que song song R₂ và tháo một chân của nó."; }
      }
      set("dm_lcd", lcd); pill("dm_p", cls, cls === "good" ? "Cách đo đúng" : cls === "warn" ? "Chưa đạt mục đích đo" : "Cách đo sai"); set("dm_msg", msg);
      set("dm_t1", on ? num(U2, 3) + " V" : "0 V"); set("dm_t2", on ? num(I * 1e3, 3) + " mA" : "0 mA"); set("dm_t3", f === "A" ? "mA (có cầu chì)" : "VΩ"); set("dm_pw", on ? "đang bật" : "đã ngắt");
      ["par", "ser", "src"].forEach(function (k) { var g = E("dm_" + k); g.style.display = k === p ? "" : "none"; g.querySelector(".mtx").textContent = f === "V" ? "V" : f === "A" ? "A" : "Ω"; });
      E("dm_lift").style.display = lift ? "" : "none";
      flow("dm_f", lift ? 0 : lvl(i, 2e-3), dt);
    }
  });

  /* ================= DAO ĐỘNG KÝ ================= */
  var VD = [0.1, 0.2, 0.5, 1, 2, 5], TD = [5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2];
  DT.reg("dao-dong-ky", {
    st: { vpp: 4, f: 500, sh: "sin", checked: false },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><canvas id="os_cv" class="scope"></canvas>' +
        '<div class="ctl">' + sl("os_v", "Núm V/div (dọc)", 0, 5, 1, 3, function (i) { return eng(VD[i], "V") + "/ô"; }) + sl("os_t", "Núm thời gian/div (ngang)", 0, 7, 1, 4, function (i) { return eng(TD[i], "s") + "/ô"; }) + '</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Đọc và trả lời</h4><div class="ctl"><label for="os_a1"><span>Điện áp đỉnh–đỉnh (V)</span><input type="number" id="os_a1" step="any" inputmode="decimal"></label><label for="os_a2"><span>Tần số (Hz)</span><input type="number" id="os_a2" step="any" inputmode="decimal"></label></div>' +
        '<div class="ctlrow"><button type="button" class="btn-sim pri" id="os_ck">Kiểm tra</button><button type="button" class="btn-sim" id="os_new">Tín hiệu mới</button><button type="button" class="btn-sim" id="os_show">Xem đáp án</button></div><div class="ctlrow"><span class="pill warn" id="os_p">Chỉnh hai núm để hình vừa màn hình rồi đọc số ô</span></div><p class="note" id="os_msg"></p></div>' +
        '<div class="panel"><h4>Cách đọc</h4><div class="tiles">' + tile("os_t1", "Mỗi ô dọc") + tile("os_t2", "Mỗi ô ngang") + '</div><p class="note">Vpp = số ô dọc từ đáy đến đỉnh × V/div. Chu kỳ T = số ô ngang của một chu kỳ × thời gian/div, tần số f = 1/T.</p></div></div></div>';
    },
    init: function () {
      var s = this.st, self = this;
      E("os_new").onclick = function () { var a = [0.5, 1, 1.6, 2, 3, 4, 6, 8, 12], b = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000]; s.vpp = a[Math.floor(Math.random() * a.length)]; s.f = b[Math.floor(Math.random() * b.length)]; s.sh = ["sin", "vuong", "tam"][Math.floor(Math.random() * 3)]; E("os_a1").value = ""; E("os_a2").value = ""; pill("os_p", "warn", "Tín hiệu mới: hãy đo lại"); set("os_msg", ""); };
      E("os_ck").onclick = function () {
        var a = parseFloat(E("os_a1").value), b = parseFloat(E("os_a2").value); if (!isFinite(a) || !isFinite(b)) { pill("os_p", "warn", "Nhập cả hai giá trị"); return; }
        var ok1 = Math.abs(a - s.vpp) / s.vpp <= 0.1, ok2 = Math.abs(b - s.f) / s.f <= 0.1;
        pill("os_p", ok1 && ok2 ? "good" : "bad", ok1 && ok2 ? "Đúng cả hai (sai số trong 10%)" : ok1 ? "Vpp đúng, tần số chưa đúng" : ok2 ? "Tần số đúng, Vpp chưa đúng" : "Cả hai chưa đúng");
        set("os_msg", ok1 && ok2 ? "Đáp án: " + num(s.vpp) + " Vpp, " + num(s.f) + " Hz." : "Gợi ý: chỉnh núm sao cho thấy 1–3 chu kỳ và hình cao 4–6 ô, sai số đọc sẽ nhỏ nhất.");
      };
      E("os_show").onclick = function () { pill("os_p", "warn", "Đáp án"); set("os_msg", "Vpp = " + num(s.vpp) + " V; f = " + num(s.f) + " Hz; chu kỳ T = " + eng(1 / s.f, "s") + "."); };
    },
    draw: function () {
      var s = this.st, vd = VD[V("os_v")], td = TD[V("os_t")], cv = E("os_cv"), r = cv.getBoundingClientRect(); if (r.width < 10) return;
      var dpr = window.devicePixelRatio || 1; if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); var W = r.width, H = r.height, cw = W / 10, ch = H / 8, i;
      c.fillStyle = "#10201b"; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(160,220,200,.28)"; c.lineWidth = 1;
      for (i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(i * cw, 0); c.lineTo(i * cw, H); c.stroke(); }
      for (i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(0, i * ch); c.lineTo(W, i * ch); c.stroke(); }
      c.strokeStyle = "rgba(160,220,200,.6)"; c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
      for (i = 0; i <= 50; i++) { c.beginPath(); c.moveTo(i * cw / 5, H / 2 - 3); c.lineTo(i * cw / 5, H / 2 + 3); c.stroke(); } for (i = 0; i <= 40; i++) { c.beginPath(); c.moveTo(W / 2 - 3, i * ch / 5); c.lineTo(W / 2 + 3, i * ch / 5); c.stroke(); }
      c.strokeStyle = "#7dffb2"; c.lineWidth = 2; c.beginPath(); var A = s.vpp / 2;
      for (i = 0; i <= 800; i++) { var x = i / 800 * W, tt = i / 800 * 10 * td, ph = (tt * s.f) % 1, u = s.sh === "sin" ? A * Math.sin(2 * Math.PI * ph) : s.sh === "vuong" ? (ph < 0.5 ? A : -A) : A * (ph < 0.25 ? 4 * ph : ph < 0.75 ? 2 - 4 * ph : 4 * ph - 4), y = H / 2 - u / vd * ch; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke(); set("os_t1", eng(vd, "V")); set("os_t2", eng(td, "s"));
    }
  });

  /* ================= MÃ MÀU ĐIỆN TRỞ ================= */
  var COL = [["Đen", "#151515"], ["Nâu", "#7a4a21"], ["Đỏ", "#d62828"], ["Cam", "#f77f00"], ["Vàng", "#f2c300"], ["Lục", "#2a9d4b"], ["Lam", "#1d5fbf"], ["Tím", "#7b3fa0"], ["Xám", "#8a8f98"], ["Trắng", "#f7f7f7"], ["Vàng kim", "#c9a227"], ["Bạc", "#b9bdc4"]];
  var TOL = { 1: 1, 2: 2, 5: 0.5, 6: 0.25, 7: 0.1, 8: 0.05, 10: 5, 11: 10 }, MUL = function (i) { return i <= 9 ? i : i === 10 ? -1 : -2; };
  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  DT.reg("ma-mau", {
    st: { n: 4, b: [1, 0, 2, 10], b5: [1, 0, 0, 1, 1], goal: null },
    bands: function () { return this.st.n === 4 ? this.st.b : this.st.b5; },
    calc: function (b) { var n = b.length, dg = b.slice(0, n - 2), base = +dg.join(""), ex = MUL(b[n - 2]); return { base: base, ex: ex, val: base * Math.pow(10, ex), tol: TOL[b[n - 1]] }; },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctlrow"><span class="lbl">Loại điện trở</span>' + seg("mm_n", [["4", "4 vạch"], ["5", "5 vạch"]], "4") + '</div><div id="mm_res"></div><div id="mm_rows"></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Kết quả đọc</h4><div class="bigval" id="mm_val">–</div><p class="note" id="mm_how"></p><div class="tiles">' + tile("mm_t1", "Dung sai") + tile("mm_t2", "Giá trị nhỏ nhất") + tile("mm_t3", "Giá trị lớn nhất") + '</div></div>' +
        '<div class="panel"><h4>Thử thách</h4><p class="note" id="mm_goal">Bấm nút để nhận một trị số, rồi chọn màu các vạch cho đúng.</p><div class="ctlrow"><button type="button" class="btn-sim pri" id="mm_new">Cho tôi một trị số</button><span class="pill warn" id="mm_p" style="display:none"></span></div></div></div></div>';
    },
    render: function () {
      var st = this.st, b = this.bands(), n = b.length, self = this, names = n === 4 ? ["Vạch 1: chữ số", "Vạch 2: chữ số", "Vạch 3: hệ số nhân", "Vạch 4: dung sai"] : ["Vạch 1: chữ số", "Vạch 2: chữ số", "Vạch 3: chữ số", "Vạch 4: hệ số nhân", "Vạch 5: dung sai"];
      var xs = n === 4 ? [150, 185, 220, 300] : [140, 170, 200, 230, 300], bandsSvg = b.map(function (ci, k) { return '<rect x="' + xs[k] + '" y="43" width="16" height="64" fill="' + COL[ci][1] + '" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>'; }).join("");
      E("mm_res").innerHTML = '<svg class="sch" viewBox="0 0 460 150" role="img" aria-label="Điện trở với các vạch màu đang chọn"><path class="ln" d="M20 75H110M350 75H440" style="stroke-width:3"/><rect x="110" y="42" width="240" height="66" rx="22" fill="#e9d3a6" stroke="var(--dt-ink)" stroke-width="1.4"/>' + bandsSvg + '</svg>';
      E("mm_rows").innerHTML = b.map(function (ci, k) {
        var allowed = k < n - 2 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : k === n - 2 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [1, 2, 5, 6, 7, 8, 10, 11];
        return '<div class="swrow"><span class="lbl">' + names[k] + '</span><div class="sws">' + allowed.map(function (c) { return '<button type="button" class="sw" data-k="' + k + '" data-c="' + c + '" aria-pressed="' + (c === ci) + '" title="' + COL[c][0] + '" aria-label="' + names[k] + ", " + COL[c][0] + '" style="background:' + COL[c][1] + '"></button>'; }).join("") + '</div><span class="swname">' + COL[ci][0] + "</span></div>";
      }).join("");
      var r = this.calc(b), lo = r.val * (1 - r.tol / 100), hi = r.val * (1 + r.tol / 100);
      set("mm_val", eng(r.val, "Ω", 4) + " ±" + num(r.tol) + "%"); set("mm_how", b.slice(0, n - 2).map(function (c) { return COL[c][0].toLowerCase() + " = " + c; }).join(", ") + " → " + r.base + "; hệ số nhân " + COL[b[n - 2]][0].toLowerCase() + " = " + pow10(r.ex) + " → " + r.base + " × " + pow10(r.ex) + " Ω = " + eng(r.val, "Ω", 4) + ".");
      set("mm_t1", "±" + num(r.tol) + "%"); set("mm_t2", eng(lo, "Ω", 4)); set("mm_t3", eng(hi, "Ω", 4));
      if (st.goal) { var ok = Math.abs(r.val - st.goal.val) < st.goal.val * 1e-6 && r.tol === st.goal.tol; E("mm_p").style.display = ""; pill("mm_p", ok ? "good" : "warn", ok ? "Chính xác" : "Chưa khớp, thử tiếp"); }
      if (b[0] === 0) set("mm_how", "Vạch đầu tiên không bao giờ là màu đen. Hãy kiểm tra lại chiều đọc: vạch dung sai nằm xa các vạch còn lại.");
    },
    init: function (el) {
      var self = this, st = this.st;
      el.addEventListener("click", function (ev) { var b = ev.target.closest(".sw"); if (!b) return; self.bands()[+b.dataset.k] = +b.dataset.c; self.render(); });
      el.addEventListener("segchange", function () { st.n = +segV("mm_n"); self.render(); });
      E("mm_new").onclick = function () { var v = E12[Math.floor(Math.random() * 12)] * Math.pow(10, Math.floor(Math.random() * 6)), tol = st.n === 4 ? 5 : 1; st.goal = { val: v, tol: tol }; set("mm_goal", "Hãy chọn màu cho điện trở " + eng(v, "Ω", 4) + " ±" + tol + "% (" + st.n + " vạch)."); self.render(); };
      this.render();
    }
  });

  /* ================= MÃ SỐ: ĐIỆN TRỞ DÁN VÀ TỤ ================= */
  DT.reg("ma-so", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><div class="ctlrow"><span class="lbl">Linh kiện</span>' + seg("ms_ty", [["r", "Điện trở dán"], ["c", "Tụ điện"]], "r") + '</div>' +
        '<div class="ctl"><label for="ms_in"><span>Mã in trên thân linh kiện</span><input type="text" id="ms_in" value="472" maxlength="5" autocomplete="off" spellcheck="false"></label></div>' +
        '<div class="ctlrow" id="ms_pre"></div><div class="chip" id="ms_chip" aria-hidden="true">472</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Giải mã</h4><div class="bigval" id="ms_val">–</div><p class="note" id="ms_how"></p><div class="ctlrow"><span class="pill good" id="ms_p">–</span></div></div></div></div>';
    },
    pres: { r: ["472", "100", "101", "4702", "4R7", "0R22", "1K5", "01C"], c: ["104", "223", "471", "105", "47", "104K", "229"] },
    render: function () {
      var ty = segV("ms_ty"), s = E("ms_in").value.trim().toUpperCase(), val = null, how = "", cls = "good", note = "Đọc được theo quy tắc", m;
      E("ms_pre").innerHTML = this.pres[ty].map(function (p) { return '<button type="button" class="btn-sim sm" data-p="' + p + '">' + p + "</button>"; }).join("");
      set("ms_chip", s || " "); E("ms_chip").className = "chip " + (ty === "r" ? "chip-r" : "chip-c");
      if (ty === "r") {
        if ((m = /^(\d\d)(\d)$/.exec(s))) { val = +m[1] * Math.pow(10, +m[2]); how = "Hai chữ số đầu là " + m[1] + ", chữ số thứ ba là số mũ: " + m[1] + " × " + pow10(+m[2]) + " Ω." + (m[2] === "0" ? " Lưu ý: số cuối bằng 0 nghĩa là nhân với 1, không thêm chữ số 0 nào." : ""); }
        else if ((m = /^(\d\d\d)(\d)$/.exec(s))) { val = +m[1] * Math.pow(10, +m[2]); how = "Mã bốn chữ số (thường là loại 1%): ba chữ số đầu là " + m[1] + ", chữ số cuối là số mũ: " + m[1] + " × " + pow10(+m[2]) + " Ω."; }
        else if (/^\d*[RKM]\d*$/.test(s) && /\d/.test(s)) { var L = s.match(/[RKM]/)[0], k = L === "R" ? 1 : L === "K" ? 1e3 : 1e6; val = parseFloat(s.replace(L, ".")) * k; how = "Chữ " + L + " đứng ở vị trí dấu thập phân" + (L === "R" ? "" : " và cho biết đơn vị " + (L === "K" ? "kΩ" : "MΩ")) + ": " + s.replace(L, ",") + (L === "R" ? " Ω." : L === "K" ? " kΩ." : " MΩ."); }
        else if (/^\d\d[A-Z]$/.test(s)) { cls = "warn"; note = "Mã EIA-96"; how = "Hai chữ số kèm một chữ cái là mã EIA-96 của điện trở 1%: hai chữ số là số thứ tự trong bảng tra, chữ cái là hệ số nhân. Mã này phải tra bảng, không suy ra theo quy tắc ba chữ số."; }
        else { cls = "bad"; note = "Không nhận ra mã"; how = "Nhập mã gồm 3 hoặc 4 chữ số (472, 4702) hoặc có chữ R, K, M ở vị trí dấu thập phân (4R7, 1K5)."; }
        set("ms_val", val === null ? "–" : val < 1 ? num(val, 4) + " Ω" : eng(val, "Ω", 4));
      } else {
        var tolL = { J: 5, K: 10, M: 20 }, tl = "";
        if ((m = /^(\d\d)(\d)([JKM]?)$/.exec(s))) { var ex = +m[2], mult = ex === 9 ? 0.1 : ex === 8 ? 0.01 : Math.pow(10, ex); val = +m[1] * mult * 1e-12; how = "Đơn vị gốc là picofarad: " + m[1] + " × " + (ex >= 8 ? (ex === 9 ? "0,1" : "0,01") : pow10(ex)) + " pF = " + eng(val, "F", 4) + "." + (ex >= 8 ? " Chữ số cuối 8 hoặc 9 là trường hợp đặc biệt (nhân 0,01 hoặc 0,1)." : ""); if (m[3]) { tl = " ±" + tolL[m[3]] + "%"; how += " Chữ " + m[3] + " là dung sai ±" + tolL[m[3]] + "%."; } }
        else if ((m = /^(\d{1,2})$/.exec(s))) { val = +m[1] * 1e-12; how = "Chỉ có một hoặc hai chữ số: đọc trực tiếp theo picofarad."; }
        else { cls = "bad"; note = "Không nhận ra mã"; how = "Nhập mã ba chữ số như 104, có thể kèm chữ dung sai J, K hoặc M (104K). Tụ điện phân ghi thẳng trị số và điện áp trên vỏ nên không dùng mã này."; }
        set("ms_val", val === null ? "–" : eng(val, "F", 4) + tl);
      }
      set("ms_how", how); pill("ms_p", cls, note);
    },
    init: function (el) {
      var self = this; E("ms_in").addEventListener("input", function () { self.render(); });
      el.addEventListener("segchange", function () { E("ms_in").value = segV("ms_ty") === "r" ? "472" : "104"; self.render(); });
      el.addEventListener("click", function (ev) { var b = ev.target.closest("[data-p]"); if (b) { E("ms_in").value = b.dataset.p; self.render(); } });
      this.render();
    }
  });

  /* ================= CẦU CHIA ÁP ================= */
  DT.reg("chia-ap", {
    st: { load: false },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(440, 250,
        S.wire("70,215 70,35 210,35 210,125", "a_s") + S.wire("210,125 210,215", "a_2") + S.wire("210,125 285,125") + S.wire("315,125 370,125 370,215 210,215", "a_l") + S.wire("210,215 70,215", "a_fr") +
        S.src(70, 125, "U") + S.res(210, 80, "v", "R₁ 10 kΩ") + S.res(210, 170, "v", "R₂ 10 kΩ") + S.res(370, 170, "v", "Rtải", "a_rl") +
        '<path class="ln" id="a_sw" d="M285 125L315 125"/><circle class="cp" cx="285" cy="125" r="3.5"/><circle class="cp" cx="315" cy="125" r="3.5"/>' +
        S.node(210, 125) + S.node(210, 215) + S.gnd(140, 215) + S.txt(126, 238, "0 V", "m") + S.txt(222, 120, "Ura", "m") + S.val(222, 138, "a_ura")) +
        '<div class="ctl">' + sl("a_u", "Nguồn U", 5, 12, 0.5, 10, "V") + sl("a_rlv", "Rtải", 1e3, 1e6, 0, 1e4, "Ω", 1) + '</div><div class="ctlrow"><button type="button" class="btn-sim pri" id="a_btn">Nối tải</button><span class="pill good" id="a_p">Không tải</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Số đo</h4><div class="tiles">' + tile("a_t1", "Ura không tải") + tile("a_t2", "Ura hiện tại") + tile("a_t3", "Dòng nguồn") + tile("a_t4", "Dòng qua R₂") + tile("a_t5", "Dòng qua tải") + tile("a_t6", "R₂ song song Rtải") + '</div><p class="note">Chấm vàng chạy nhanh hơn ở nhánh có dòng lớn hơn. Khi nối tải, dòng nguồn tách làm hai nhánh tại nút Ura.</p></div></div></div>';
    },
    init: function () { var s = this.st; E("a_btn").onclick = function () { s.load = !s.load; }; },
    draw: function (t, dt) {
      var U = V("a_u"), RL = V("a_rlv"), R1 = 1e4, R2 = 1e4, ld = this.st.load, Rp = ld ? R2 * RL / (R2 + RL) : R2, Ur = U * Rp / (R1 + Rp), I = U / (R1 + Rp), IL = ld ? Ur / RL : 0, I2 = Ur / R2;
      set("a_t1", eng(U / 2, "V")); set("a_t2", eng(Ur, "V")); set("a_t3", eng(I, "A")); set("a_t4", eng(I2, "A")); set("a_t5", eng(IL, "A")); set("a_t6", ld ? eng(Rp, "Ω") : "–"); set("a_ura", eng(Ur, "V")); set("a_rl", eng(RL, "Ω"));
      E("a_sw").setAttribute("d", ld ? "M285 125L315 125" : "M285 125L311 109"); set("a_btn", ld ? "Ngắt tải" : "Nối tải");
      var dv = (U / 2 - Ur) / (U / 2) * 100; pill("a_p", !ld ? "good" : dv < 5 ? "good" : dv < 20 ? "warn" : "bad", !ld ? "Không tải" : "Có tải: Ura giảm " + num(dv, 2) + "%");
      flow("a_s", lvl(I, 1e-3), dt); flow("a_fr", lvl(I, 1e-3), dt); flow("a_2", lvl(I2, 1e-3), dt); flow("a_l", lvl(IL, 1e-3), dt);
    }
  });

  /* ================= TỤ NẠP XẢ ================= */
  DT.reg("tu-nap-xa", {
    st: { mode: "c", t0: 0, v0: 0 },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(440, 220,
        S.wire("70,185 70,40 150,40") + S.wire("180,40 330,40 330,185 70,185", "r_f") + S.src(70, 112, "5 V") + S.res(250, 40, "h", "R", "r_rv") + S.cap(330, 112, "v", "C", "r_cv") +
        '<path class="ln" id="r_sw" d="M150 40L180 40"/><circle class="cp" cx="150" cy="40" r="3.5"/><circle class="cp" cx="180" cy="40" r="3.5"/>' + S.wire("165,62 165,185") + '<circle class="cp" cx="165" cy="62" r="3.5"/>' + S.txt(150, 28, "nạp", "m", "end") + S.txt(172, 80, "xả", "m") + S.gnd(250, 185)) +
        '<div class="ctl">' + sl("r_r", "R", 1e3, 1e5, 0, 1e4, "Ω", 1) + sl("r_c", "C", 1e-6, 1e-4, 0, 1e-5, "F", 1) + '</div><div class="ctlrow"><button type="button" class="btn-sim pri" id="r_ch">Nạp</button><button type="button" class="btn-sim" id="r_dis">Xả</button></div></div></div>' +
        '<div class="simcol"><div class="panel"><canvas id="r_cvs"></canvas>' + leg([["sig1", "uC theo thời gian thực"], ["muted", "đường lý thuyết"]]) + '<div class="tiles">' + tile("r_t1", "τ = RC") + tile("r_t2", "uC lúc này") + tile("r_t3", "Dòng qua R lúc này") + tile("r_t4", "Sau 1τ (nạp từ 0)") + '</div></div></div></div>';
    },
    f: function (x) { var s = this.st, tau = V("r_r") * V("r_c"); return s.mode === "c" ? 5 - (5 - s.v0) * Math.exp(-x / tau) : s.v0 * Math.exp(-x / tau); },
    init: function () {
      var s = this.st, self = this, go = function (m) { return function () { var tau = V("r_r") * V("r_c"); s.v0 = self.f(Math.min(DT.NOW - s.t0, 50 * tau)); s.mode = m; s.t0 = DT.NOW; }; };
      E("r_ch").onclick = go("c"); E("r_dis").onclick = go("d");
      ["r_r", "r_c"].forEach(function (i) { E(i).addEventListener("input", function () { s.v0 = 0; s.mode = "c"; s.t0 = DT.NOW; }); });
    },
    draw: function (t, dt) {
      var s = this.st, R = V("r_r"), tau = R * V("r_c"), tm = Math.max(5 * tau, 0.05), el = DT.RM ? tm : Math.min(t - s.t0, tm), self = this, full = [], livep = [];
      for (var i = 0; i <= 120; i++) { var x = tm * i / 120; full.push([x, this.f(x)]); if (x <= el) livep.push([x, this.f(x)]); }
      var u = this.f(el), ir = s.mode === "c" ? (5 - u) / R : -u / R;
      plot(E("r_cvs"), { x0: 0, x1: tm, y0: 0, y1: 5.5, ny: 5, xl: "t (s)", yl: "uC (V)", s: [{ p: full, c: "muted", w: 1.2, d: [4, 4] }, { p: livep, c: "sig1", w: 2.4 }], v: [{ x: tau, t: "τ", c: "copper" }], h: s.mode === "c" && s.v0 < 0.01 ? [{ y: 3.16, t: "63,2%", c: "copper" }] : [], m: [{ x: el, y: u }] });
      set("r_t1", eng(tau, "s")); set("r_t2", eng(u, "V")); set("r_t3", eng(Math.abs(ir), "A")); set("r_t4", "3,16 V"); set("r_rv", eng(R, "Ω")); set("r_cv", eng(u, "V"));
      E("r_sw").setAttribute("d", s.mode === "c" ? "M150 40L180 40" : "M165 62L180 40"); flow("r_f", lvl(ir, 5 / R), dt);
    }
  });

  /* ================= TẢI CẢM VÀ DIODE DẬP XUNG ================= */
  DT.reg("tai-cam", {
    st: { t0: -99 },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><h4>Điện áp trên collector của transistor</h4><canvas id="tc_cv1"></canvas>' + leg([["sig2", "điện áp collector"], ["copper", "nguồn 12 V"]]) + '</div>' +
        '<div class="panel"><div class="ctlrow"><span class="lbl">Diode dập xung</span>' + seg("tc_d", [["1", "Có diode"], ["0", "Không có diode"]], "1") + '</div><div class="ctl">' + sl("tc_l", "Điện cảm cuộn rơle L", 0.05, 2, 0, 0.5, "H", 1) + '</div><div class="ctlrow"><button type="button" class="btn-sim pri" id="tc_go">Ngắt transistor</button><span class="pill good" id="tc_p">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Dòng qua cuộn dây</h4><canvas id="tc_cv2"></canvas><div class="tiles">' + tile("tc_t1", "Đỉnh điện áp collector") + tile("tc_t2", "Dòng tắt hẳn sau") + tile("tc_t3", "Năng lượng trong cuộn") + tile("tc_t4", "τ = L/R") + '</div><p class="note">Mô hình: rơle 12 V, cuộn 200 Ω, dòng 60 mA. Khi không có diode, điện áp tăng đến khi transistor bị đánh thủng; ở đây lấy mức đánh thủng 60 V.</p></div></div></div>';
    },
    init: function () { var s = this.st; E("tc_go").onclick = function () { s.t0 = DT.NOW; }; },
    draw: function (t) {
      var L = V("tc_l"), R = 200, I0 = 0.06, d = segV("tc_d") === "1", tau = L / R, Vx = d ? 0.7 : 48, tz = tau * Math.log(1 + I0 * R / Vx), tm = 4 * tau, p1 = [], p2 = [], N = 300;
      var cur = function (x) { return x < 0 ? I0 : x >= tz ? 0 : (I0 + Vx / R) * Math.exp(-x / tau) - Vx / R; }, vc = function (x) { return x < 0 ? 0.15 : x < tz ? 12 + Vx : 12; };
      for (var i = 0; i <= N; i++) { var x = -0.5 * tau + (tm + 0.5 * tau) * i / N; p1.push([x * 1e3, vc(x)]); p2.push([x * 1e3, cur(x) * 1e3]); }
      var el = DT.RM ? tz * 0.5 : (t - this.st.t0) * tm / 3 - 0.5 * tau, show = el < tm, cx = clamp(el, -0.5 * tau, tm);
      plot(E("tc_cv1"), { x0: -0.5 * tau * 1e3, x1: tm * 1e3, y0: 0, y1: 70, ny: 7, xl: "t (ms)", yl: "u (V)", s: [{ p: p1, c: "sig2", w: 2.4 }], h: [{ y: 12, t: "12 V", c: "copper" }], v: [{ x: 0, t: "ngắt", c: "muted" }], m: show ? [{ x: cx * 1e3, y: vc(cx), c: "sig2" }] : [] });
      plot(E("tc_cv2"), { x0: -0.5 * tau * 1e3, x1: tm * 1e3, y0: 0, y1: 70, ny: 7, xl: "t (ms)", yl: "i (mA)", s: [{ p: p2, c: "sig1", w: 2.4 }], v: [{ x: 0, t: "ngắt", c: "muted" }], m: show ? [{ x: cx * 1e3, y: cur(cx) * 1e3 }] : [] });
      set("tc_t1", eng(12 + Vx, "V")); set("tc_t2", eng(tz, "s")); set("tc_t3", eng(L * I0 * I0 / 2, "J")); set("tc_t4", eng(tau, "s"));
      pill("tc_p", d ? "good" : "bad", d ? "Điện áp chỉ vượt nguồn 0,7 V; rơle nhả chậm hơn" : "Xung 60 V vượt giới hạn nhiều transistor nhỏ");
    }
  });

  /* ================= TIẾP GIÁP PN ================= */
  DT.reg("tiep-giap-pn", {
    ph: 0,
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel"><canvas id="pn_cv" style="height:210px"></canvas><div class="ctl">' + sl("pn_u", "Điện áp đặt lên diode (anode so với cathode)", -5, 0.74, 0.01, 0, function (x) { return num(x, 3) + " V"; }) + '</div><div class="ctlrow"><span class="pill good" id="pn_p">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Đường đặc tính dòng – áp</h4><canvas id="pn_iv"></canvas><div class="tiles">' + tile("pn_t1", "Dòng qua diode") + tile("pn_t2", "Bề rộng vùng nghèo") + tile("pn_t3", "Điện trở tĩnh U/I") + '</div><p class="note">Mô hình Shockley cho diode silicon nhỏ ở 25 °C. Không có giá trị “0,7 V” cố định: điện áp thuận tăng dần theo dòng.</p></div></div></div>';
    },
    I: function (u) { return 1e-13 * (Math.exp(u / 0.02585) - 1); },
    draw: function (t, dt) {
      var u = V("pn_u"), I = this.I(u), w = clamp(Math.sqrt(Math.max(0.02, (0.78 - u) / 0.78)), 0.12, 2.8), cv = E("pn_cv"), r = cv.getBoundingClientRect(); if (r.width < 10) return;
      var dpr = window.devicePixelRatio || 1; if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); var W = r.width, H = r.height, mid = W / 2, hw = w * W * 0.07, y0 = 34, y1 = H - 26, i;
      c.clearRect(0, 0, W, H); c.fillStyle = "#f6d5de"; c.fillRect(20, y0, mid - 20, y1 - y0); c.fillStyle = "#d6e4f7"; c.fillRect(mid, y0, W - 20 - mid, y1 - y0);
      c.fillStyle = "rgba(255,255,255,.88)"; c.fillRect(mid - hw, y0, 2 * hw, y1 - y0); c.strokeStyle = DT.cssv("ink"); c.lineWidth = 1.2; c.strokeRect(20, y0, W - 40, y1 - y0);
      c.setLineDash([4, 3]); c.beginPath(); c.moveTo(mid - hw, y0); c.lineTo(mid - hw, y1); c.moveTo(mid + hw, y0); c.lineTo(mid + hw, y1); c.stroke(); c.setLineDash([]);
      c.fillStyle = DT.cssv("ink"); c.font = "600 13px " + DT.cssv("body"); c.textAlign = "center"; c.fillText("Vùng P (lỗ trống)", (20 + mid - hw) / 2, 22); c.fillText("Vùng N (electron)", (mid + hw + W - 20) / 2, 22);
      c.font = "11px " + DT.cssv("body"); c.fillStyle = DT.cssv("muted"); c.fillText("vùng nghèo", mid, H - 8); c.textAlign = "left"; c.fillText("Anode", 22, H - 8); c.textAlign = "right"; c.fillText("Cathode", W - 22, H - 8);
      // ion cố định trong vùng nghèo
      c.font = "12px " + DT.cssv("mono"); c.textAlign = "center";
      for (i = 0; i < 4; i++) { var yy = y0 + (y1 - y0) * (i + 0.5) / 4; if (hw > 9) { c.fillStyle = "#9e5066"; c.fillText("−", mid - hw / 2, yy + 4); c.fillStyle = "#1f66c1"; c.fillText("+", mid + hw / 2, yy + 4); } }
      // hạt tải: khi dẫn thuận thì trôi qua tiếp giáp
      var k = clamp(I / 0.02, 0, 1); if (!DT.RM) this.ph = (this.ph + dt * (0.15 + 2.2 * k)) % 1;
      for (i = 0; i < 24; i++) {
        var row = i % 4, col = Math.floor(i / 4), yb = y0 + (y1 - y0) * (row + 0.5) / 4 + (col % 2 ? 7 : -7), span = mid - hw - 34, fx = (col + 0.5) / 6, x;
        if (k > 0.004) fx = (fx + this.ph) % 1;
        x = 28 + fx * (k > 0.004 ? (W - 56) : span); c.strokeStyle = "#9e5066"; c.lineWidth = 1.6; c.beginPath(); c.arc(x, yb, 4.2, 0, 6.3); c.stroke();
        var fx2 = (col + 0.5) / 6; if (k > 0.004) fx2 = (fx2 + this.ph) % 1; x = W - 28 - fx2 * (k > 0.004 ? (W - 56) : span); c.fillStyle = "#1f66c1"; c.beginPath(); c.arc(x, yb + 9, 3.6, 0, 6.3); c.fill();
      }
      var p = [], uu; for (uu = -5; uu <= 0.76; uu += 0.01) p.push([uu, this.I(uu) * 1e3]);
      plot(E("pn_iv"), { x0: -5, x1: 1, y0: -5, y1: 60, nx: 6, ny: 13, xl: "U (V)", yl: "I (mA)", s: [{ p: p, c: "sig1", w: 2.4 }], h: [{ y: 0, t: "", c: "muted" }], m: [{ x: u, y: Math.min(I * 1e3, 60) }] });
      set("pn_t1", Math.abs(I) < 1e-9 ? (u < 0 ? "dòng rò, cỡ pA" : eng(I, "A")) : eng(I, "A")); set("pn_t2", num(w / 1 * 100, 3) + "% so với 0 V"); set("pn_t3", I > 1e-9 ? eng(u / I, "Ω") : "rất lớn");
      if (Math.abs(u) < 0.005) pill("pn_p", "warn", "Chưa phân cực: vùng nghèo ở bề rộng cân bằng, không có dòng"); else if (u < -0.005) pill("pn_p", "warn", "Phân cực ngược: vùng nghèo rộng ra, chỉ còn dòng rò"); else if (I < 1e-4) pill("pn_p", "warn", "Phân cực thuận nhỏ: rào thế chưa hạ đủ, dòng rất nhỏ"); else pill("pn_p", "good", "Dẫn thuận: hạt tải vượt qua tiếp giáp, dòng tăng rất nhanh");
    }
  });

  /* ================= ĐIỆN TRỞ HẠN DÒNG LED ================= */
  var E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
  function e24up(r) { var d = Math.pow(10, Math.floor(Math.log10(r))); for (var i = 0; i < 24; i++) if (E24[i] * d >= r * 0.9999) return +(E24[i] * d).toPrecision(2); return 10 * d; }
  var LEDS = { do: ["Đỏ", 2.0, "#e03131"], vang: ["Vàng", 2.1, "#f2b400"], luc: ["Lục", 2.2, "#2f9e44"], lam: ["Lam", 3.1, "#1c7ed6"], trang: ["Trắng", 3.1, "#f1f3f5"] };
  DT.reg("led", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(440, 200, S.wire("70,165 70,40 360,40 360,165 70,165", "ld_f") + S.src(70, 102, "U") + S.res(210, 40, "h", "R", "ld_rv") +
        '<circle id="ld_glow" cx="360" cy="102" r="30" fill="none"/>' + S.led(360, 102, "d", "LED", "ld_l") + S.gnd(210, 165) + S.val(384, 124, "ld_uf")) +
        '<div class="ctlrow"><span class="lbl">Màu LED</span>' + seg("ld_c", Object.keys(LEDS).map(function (k) { return [k, LEDS[k][0]]; }), "do") + '</div><div class="ctl">' + sl("ld_u", "Điện áp nguồn U", 3, 24, 0.5, 5, "V") + sl("ld_i", "Dòng LED mong muốn", 1, 25, 0.5, 8, function (x) { return num(x, 3) + " mA"; }) + '</div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Tính và chọn</h4><div class="ctlrow"><span class="pill good" id="ld_p">–</span></div><div class="tiles">' + tile("ld_t1", "R tính toán") + tile("ld_t2", "Chọn giá trị chuẩn E24") + tile("ld_t3", "Dòng thực qua LED") + tile("ld_t4", "Công suất trên R") + tile("ld_t5", "Công suất danh định nên dùng") + '</div><p class="note" id="ld_how"></p></div></div></div>';
    },
    draw: function (t, dt) {
      var L = LEDS[segV("ld_c")], U = V("ld_u"), I = V("ld_i") * 1e-3, uf = L[1];
      if (U <= uf + 0.2) { pill("ld_p", "bad", "Nguồn thấp hơn điện áp thuận của LED: LED không sáng đúng"); ["ld_t1", "ld_t2", "ld_t3", "ld_t4", "ld_t5"].forEach(function (i) { set(i, "–"); }); set("ld_how", ""); flow("ld_f", 0, dt); E("ld_l").setAttribute("class", "off"); E("ld_l").style.fill = ""; E("ld_glow").setAttribute("fill", "none"); return; }
      var R = (U - uf) / I, Rs = e24up(R), Ir = (U - uf) / Rs, P = Ir * Ir * Rs, Pr = P * 2 <= 0.25 ? 0.25 : P * 2 <= 0.5 ? 0.5 : P * 2 <= 1 ? 1 : 2;
      set("ld_t1", eng(R, "Ω")); set("ld_t2", eng(Rs, "Ω")); set("ld_t3", eng(Ir, "A")); set("ld_t4", eng(P, "W")); set("ld_t5", num(Pr) + " W"); set("ld_rv", eng(Rs, "Ω")); set("ld_uf", "UF " + num(uf) + " V");
      set("ld_how", "R = (U − UF)/I = (" + num(U) + " − " + num(uf) + ")/" + num(I, 3) + " A ≈ " + eng(R, "Ω") + ". Chọn giá trị chuẩn bằng hoặc lớn hơn để dòng không vượt mức mong muốn.");
      pill("ld_p", I > 0.02 ? "warn" : "good", I > 0.02 ? "Trên 20 mA: kiểm tra giới hạn trong datasheet của LED" : "Dòng trong vùng dùng thông thường");
      var a = clamp(Ir / 0.02, 0.08, 1); E("ld_l").setAttribute("class", ""); E("ld_l").style.fill = L[2]; E("ld_l").style.fillOpacity = 0.25 + 0.75 * a; E("ld_glow").setAttribute("fill", L[2]); E("ld_glow").setAttribute("fill-opacity", 0.28 * a);
      flow("ld_f", lvl(Ir, 0.02), dt);
    }
  });

  /* ================= BJT CÔNG TẮC ================= */
  DT.reg("bjt-cong-tac", {
    st: { decay: 0 }, ic: 0,
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(470, 285,
        S.wire("350,30 350,167", "b_c") + S.wire("350,60 420,60 420,135 350,135", "b_d") + S.wire("350,203 350,255", "b_e") + S.wire("80,185 322,185", "b_b") +
        '<rect class="cp" x="328" y="76" width="44" height="46" rx="2"/><text x="350" y="103" text-anchor="middle" class="m">Rơle</text>' +
        S.dio(420, 98, "u", "D") + S.res(195, 185, "h", "RB", "b_rb") + S.npn(340, 185, 0, "Q") + S.term(350, 30, "+12 V", "r") + S.term(80, 185, "Uđk", "l") + S.gnd(350, 255) + S.node(350, 60) + S.node(350, 135) +
        S.val(250, 172, "b_ib", "middle") + S.val(362, 152, "b_ic") + S.txt(362, 225, "VCE", "m") + S.val(362, 240, "b_vce")) +
        '<div class="ctl">' + sl("b_u", "Điện áp điều khiển Uđk", 0, 5, 0.1, 5, "V") + sl("b_r", "RB", 220, 2.2e5, 0, 680, "Ω", 1) + sl("b_h", "hFE của transistor", 20, 300, 5, 100, function (x) { return num(x, 3); }) + '</div>' +
        '<div class="ctlrow"><button type="button" class="btn-sim" id="b_off">Ngắt đột ngột (Uđk = 0)</button></div></div></div>' +
        '<div class="simcol"><div class="panel"><div class="ctlrow"><span class="pill good" id="b_p">–</span></div><div class="tiles">' + tile("b_t1", "Dòng base IB") + tile("b_t2", "Dòng collector IC") + tile("b_t3", "IC cần để rơle hút") + tile("b_t4", "β cưỡng bức IC/IB") + tile("b_t5", "VCE") + tile("b_t6", "Tổn hao trên Q") + '</div></div>' +
        '<div class="panel"><h4>IC theo IB: ba miền làm việc</h4><canvas id="b_cv"></canvas>' + leg([["sig1", "IC = hFE·IB cho đến khi tải giới hạn"], ["copper", "mức bão hòa do tải quyết định"]]) + '</div></div></div>';
    },
    init: function () { var self = this; E("b_off").onclick = function () { self.st.decay = self.ic || 0; E("b_u").value = 0; DT.showSliders(); }; },
    draw: function (t, dt) {
      var U = V("b_u"), RB = V("b_r"), h = V("b_h"), RC = 200, VCC = 12, IB = Math.max(0, (U - 0.7) / RB), Isat = (VCC - 0.15) / RC, IC = Math.min(h * IB, Isat), sat = h * IB >= Isat && IB > 0, VCE = sat ? 0.15 : VCC - IC * RC; this.ic = IC;
      set("b_t1", eng(IB, "A")); set("b_t2", eng(IC, "A")); set("b_t3", eng(Isat, "A")); set("b_t4", IB > 0 ? num(IC / IB, 3) : "–"); set("b_t5", eng(VCE, "V")); set("b_t6", eng(VCE * IC, "W"));
      set("b_ib", "IB " + eng(IB, "A")); set("b_ic", "IC " + eng(IC, "A")); set("b_vce", eng(VCE, "V")); set("b_rb", eng(RB, "Ω"));
      if (IB <= 0) pill("b_p", "warn", "Ngắt: công tắc hở, rơle nhả"); else if (sat) pill("b_p", "good", "Bão hòa: công tắc đóng, rơle hút chắc"); else pill("b_p", "bad", "Khuếch đại: VCE còn lớn, transistor nóng");
      this.st.decay *= Math.exp(-dt / 0.6); if (IC > 1e-4) this.st.decay = 0; var fd = this.st.decay;
      flow("b_b", lvl(IB, 6e-3), dt); flow("b_c", lvl(IC, 0.06), dt); flow("b_e", lvl(IC, 0.06), dt); flow("b_d", fd > 1e-3 ? -lvl(fd, 0.06) : 0, dt);
      var xm = Math.max(2 * Isat / h, IB * 1.3, 1e-4), p = []; for (var i = 0; i <= 80; i++) { var x = xm * i / 80; p.push([x * 1e3, Math.min(h * x, Isat) * 1e3]); }
      plot(E("b_cv"), { x0: 0, x1: xm * 1e3, y0: 0, y1: 80, xl: "IB (mA)", yl: "IC (mA)", s: [{ p: p, c: "sig1", w: 2.4 }], h: [{ y: Isat * 1e3, t: "bão hòa", c: "copper" }], m: [{ x: Math.min(IB, xm) * 1e3, y: IC * 1e3 }] });
    }
  });

  /* ================= MOSFET ================= */
  function mos(vgs) {
    var K = 10, Vth = 2, RL = 40, VDD = 12, vov = vgs - Vth; if (vov <= 0) return { id: 0, vds: VDD, st: 0 };
    var isat = K * vov * vov / 2; if (VDD - isat * RL >= vov) return { id: isat, vds: VDD - isat * RL, st: 1 };
    var lo = 0, hi = vov; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (K * (vov * m - m * m / 2) < (VDD - m) / RL) lo = m; else hi = m; }
    return { id: (VDD - lo) / RL, vds: lo, st: 2 };
  }
  DT.reg("mosfet", {
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(520, 280,
        S.wire("330,30 330,167", "mo_d") + S.wire("330,203 330,250", "mo_s") + S.wire("80,185 302,185") + S.wire("240,185 240,250 330,250") +
        '<circle class="cp" cx="330" cy="95" r="26"/><g id="mo_fan"><path class="ink" d="M330 95c-4-14 4-24 10-24c2 10-2 18-10 24zM330 95c14 4 20 14 17 20c-10-2-16-10-17-20zM330 95c-10 10-22 9-25 3c8-7 17-8 25-3z"/></g><circle class="cp" cx="330" cy="95" r="4"/>' + S.txt(366, 99, "Quạt 12 V – 0,3 A") +
        S.res(160, 185, "h", "100 Ω") + S.res(240, 220, "v", "") + S.txt(232, 224, "kéo xuống", "m", "end") + S.nmos(320, 185, "") + S.term(330, 30, "+12 V", "r") + S.term(80, 185, "VGS", "l") + S.gnd(330, 250) + S.node(240, 185) +
        S.val(342, 150, "mo_id") + S.txt(342, 226, "VDS", "m") + S.val(342, 241, "mo_vds")) +
        '<div class="ctl">' + sl("mo_g", "Điện áp cổng VGS", 0, 10, 0.05, 5, function (x) { return num(x, 3) + " V"; }) + '</div><div class="ctlrow"><span class="pill good" id="mo_p">–</span></div></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Dòng qua quạt theo VGS</h4><canvas id="mo_cv"></canvas>' + leg([["sig1", "dòng máng ID"], ["copper", "dòng định mức của quạt"]]) + '<div class="tiles">' + tile("mo_t1", "Dòng ID") + tile("mo_t2", "Sụt áp VDS") + tile("mo_t3", "Điện trở D–S hiệu dụng") + tile("mo_t4", "Tổn hao trên MOSFET") + '</div><p class="note">Mô hình MOSFET logic-level có ngưỡng VGS(th) = 2 V và RDS(on) khoảng 33 mΩ ở 5 V. Ngay trên ngưỡng, MOSFET mới chỉ dẫn một phần.</p></div></div></div>';
    },
    ang: 0,
    draw: function (t, dt) {
      var g = V("mo_g"), r = mos(g), P = r.id * r.vds, p = [], x;
      for (x = 0; x <= 10.001; x += 0.05) p.push([x, mos(x).id * 1e3]);
      plot(E("mo_cv"), { x0: 0, x1: 10, y0: 0, y1: 350, ny: 7, xl: "VGS (V)", yl: "ID (mA)", s: [{ p: p, c: "sig1", w: 2.4 }], h: [{ y: 300, t: "0,3 A", c: "copper" }], v: [{ x: 2, t: "VGS(th)", c: "muted" }], m: [{ x: g, y: r.id * 1e3 }] });
      set("mo_t1", eng(r.id, "A")); set("mo_t2", eng(r.vds, "V")); set("mo_t3", r.id > 1e-6 ? eng(r.vds / r.id, "Ω") : "hở mạch"); set("mo_t4", eng(P, "W")); set("mo_id", "ID " + eng(r.id, "A")); set("mo_vds", eng(r.vds, "V"));
      if (r.st === 0) pill("mo_p", "warn", "Tắt: VGS dưới ngưỡng, quạt đứng yên"); else if (r.st === 1 || r.vds > 0.3) pill("mo_p", "bad", "Dẫn một phần: quạt yếu, MOSFET nóng " + eng(P, "W")); else pill("mo_p", "good", "Dẫn hoàn toàn: tổn hao chỉ " + eng(P, "W"));
      if (!DT.RM && r.id > 0.01) { this.ang = (this.ang + dt * 1700 * r.id) % 360; E("mo_fan").setAttribute("transform", "rotate(" + this.ang.toFixed(1) + " 330 95)"); }
      flow("mo_d", lvl(r.id, 0.3), dt); flow("mo_s", lvl(r.id, 0.3), dt);
    }
  });

  /* ================= DÒ CHÂN BJT BẰNG THANG DIODE ================= */
  DT.reg("do-kiem-bjt", {
    st: { type: "NPN", pins: ["E", "B", "C"], red: 1, blk: 0, n: 0, done: false },
    html: function () {
      return '<div class="simgrid"><div class="simcol"><div class="panel">' + svg(420, 190,
        '<path class="cp" d="M150 30h120a12 12 0 0 1 12 12v58h-144v-58a12 12 0 0 1 12 -12z"/><text x="210" y="70" text-anchor="middle" style="font-weight:600">BJT chưa biết loại</text><path class="ln" d="M160 100V160M210 100V160M260 100V160" style="stroke-width:3"/>' +
        '<text x="160" y="180" text-anchor="middle">chân 1</text><text x="210" y="180" text-anchor="middle">chân 2</text><text x="260" y="180" text-anchor="middle">chân 3</text><circle id="dk_r" r="8" cy="135" fill="#d62828"/><circle id="dk_b" r="8" cy="150" fill="#222"/>', "Transistor ba chân và vị trí hai que đo") +
        '<div class="ctlrow"><span class="lbl">Que đỏ (+)</span>' + seg("dk_red", [["0", "Chân 1"], ["1", "Chân 2"], ["2", "Chân 3"]], "1") + '</div><div class="ctlrow"><span class="lbl">Que đen (−)</span>' + seg("dk_blk", [["0", "Chân 1"], ["1", "Chân 2"], ["2", "Chân 3"]], "0") + '</div>' +
        '<div class="lcd" id="dk_lcd">–</div><p class="note">Thang diode: đồng hồ hiện điện áp thuận (khoảng 0,6–0,7 V) khi que đỏ ở phía P và que đen ở phía N của một tiếp giáp; các trường hợp khác hiện OL.</p></div></div>' +
        '<div class="simcol"><div class="panel"><h4>Kết luận của bạn</h4><div class="ctlrow"><span class="lbl">Loại</span>' + seg("dk_ty", [["NPN", "NPN"], ["PNP", "PNP"]], "NPN") + '</div><div class="ctlrow"><span class="lbl">Chân base</span>' + seg("dk_bs", [["0", "Chân 1"], ["1", "Chân 2"], ["2", "Chân 3"]], "0") + '</div><div class="ctlrow"><span class="lbl">Chân emitter</span>' + seg("dk_em", [["0", "Chân 1"], ["1", "Chân 2"], ["2", "Chân 3"]], "1") + '</div>' +
        '<div class="ctlrow"><button type="button" class="btn-sim pri" id="dk_ck">Kiểm tra</button><button type="button" class="btn-sim" id="dk_new">Linh kiện khác</button></div><div class="ctlrow"><span class="pill warn" id="dk_p">Hãy đo đủ các cặp chân trước khi kết luận</span></div><p class="note" id="dk_msg"></p></div>' +
        '<div class="panel"><h4>Nhật ký đo</h4><div class="logbox" id="dk_log"></div></div></div></div>';
    },
    read: function (r, b) {
      var s = this.st, pr = s.pins[r], pb = s.pins[b]; if (r === b) return "0,000 V";
      var bToX = s.type === "NPN" ? (pr === "B") : (pb === "B"), other = s.type === "NPN" ? pb : pr; if (!bToX) return "OL";
      return other === "E" ? "0,692 V" : "0,671 V";
    },
    fresh: function () { var s = this.st, a = ["E", "B", "C"], i, j, t; for (i = 2; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } s.pins = a; s.type = Math.random() < 0.5 ? "NPN" : "PNP"; s.n = 0; E("dk_log").innerHTML = ""; pill("dk_p", "warn", "Hãy đo đủ các cặp chân trước khi kết luận"); set("dk_msg", ""); this.upd(false); },
    upd: function (log) {
      var r = +segV("dk_red"), b = +segV("dk_blk"), v = this.read(r, b), xs = [160, 210, 260]; set("dk_lcd", v); E("dk_r").setAttribute("cx", xs[r] - 6); E("dk_b").setAttribute("cx", xs[b] + 6);
      if (log) { this.st.n++; var d = document.createElement("div"); d.textContent = "Lần " + this.st.n + ": đỏ chân " + (r + 1) + ", đen chân " + (b + 1) + " → " + v; E("dk_log").prepend(d); }
    },
    init: function (el) {
      var self = this, s = this.st;
      el.addEventListener("segchange", function (ev) { if (ev.target.id === "dk_red" || ev.target.id === "dk_blk") self.upd(true); });
      E("dk_new").onclick = function () { self.fresh(); };
      E("dk_ck").onclick = function () {
        var okT = segV("dk_ty") === s.type, okB = s.pins[+segV("dk_bs")] === "B", okE = s.pins[+segV("dk_em")] === "E", all = okT && okB && okE;
        pill("dk_p", all ? "good" : "bad", all ? "Chính xác sau " + s.n + " lần đo" : "Chưa đúng: " + [okT ? "" : "loại", okB ? "" : "chân base", okE ? "" : "chân emitter"].filter(Boolean).join(", "));
        set("dk_msg", all ? "Chân base là chân chung của hai phép đo có số. Que đỏ ở base mà có số thì là NPN, que đen ở base thì là PNP. Tiếp giáp B–E cho số đo hơi cao hơn B–C." : "Gợi ý: tìm chân nào cho số đo với cả hai chân còn lại; đó là base. Sau đó so sánh hai số đo: số lớn hơn thuộc tiếp giáp B–E.");
      };
      this.fresh();
    }
  });
})();
