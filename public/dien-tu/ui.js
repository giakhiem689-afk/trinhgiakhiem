/* Điện tử cơ bản MĐ13 — giao diện bài học: tiến độ, mục lục, chép liên kết, chế độ giảng dạy. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  var done = store.get("dt-done-v1", []), preds = store.get("dt-pred-v1", {});
  if (!Array.isArray(done)) done = [];
  var has = function (k) { return done.indexOf(k) >= 0; };

  /* ---------- tiến độ ---------- */
  function paint() {
    $$("[data-done]").forEach(function (b) { var on = has(b.getAttribute("data-done")); b.setAttribute("aria-pressed", String(on)); var t = $(".dt-done-txt", b); if (t) t.textContent = on ? "Đã hiểu phần này" : "Đánh dấu đã hiểu"; var sec = b.closest(".dt-sec"); if (sec) sec.classList.toggle("is-done", on); });
    $$("[data-ck]").forEach(function (i) { i.classList.toggle("on", has(i.getAttribute("data-ck"))); });
    $$(".dt-count").forEach(function (c) { var ks = c.getAttribute("data-keys").split(","), n = ks.filter(has).length; c.textContent = n + "/" + ks.length; c.classList.toggle("full", n === ks.length); });
    var txt = $("#dt-prog-txt"); if (txt) { var total = +txt.getAttribute("data-total"), n = done.length > total ? total : done.length; txt.textContent = n + "/" + total + " phần đã hiểu"; $("#dt-prog-fill").style.width = (total ? n / total * 100 : 0) + "%"; }
    var go = $("#dt-continue"); if (go) { var all = go.getAttribute("data-keys").split(","), nx = all.filter(function (k) { return !has(k); })[0]; if (done.length && nx) { go.textContent = "Tiếp tục học"; go.setAttribute("href", go.getAttribute("data-base") + "/" + nx); } else if (done.length && !nx) { go.textContent = "Ôn lại từ đầu"; } }
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-done]"); if (!b) return; var k = b.getAttribute("data-done"), i = done.indexOf(k);
    if (i >= 0) done.splice(i, 1); else done.push(k); store.set("dt-done-v1", done); paint();
  });
  var reset = $("#dt-reset"), armed = 0;
  if (reset) reset.addEventListener("click", function () {
    if (!armed) { armed = 1; reset.textContent = "Bấm lần nữa để xóa"; setTimeout(function () { armed = 0; reset.textContent = "Xóa tiến độ trên máy này"; }, 4000); return; }
    done = []; preds = {}; store.set("dt-done-v1", done); store.set("dt-pred-v1", preds); $$("[data-pred]").forEach(function (i) { i.value = ""; }); armed = 0; reset.textContent = "Đã xóa tiến độ"; paint();
  });

  /* ---------- ghi dự đoán ---------- */
  $$("[data-pred]").forEach(function (inp) {
    var k = inp.getAttribute("data-pred"); if (preds[k]) inp.value = preds[k];
    inp.addEventListener("input", function () { if (inp.value) preds[k] = inp.value.slice(0, 200); else delete preds[k]; store.set("dt-pred-v1", preds); });
  });

  /* ---------- chép liên kết ---------- */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-copy]"); if (!b) return;
    var url = location.origin + location.pathname.replace(/\/$/, "") + "#" + b.getAttribute("data-copy"), old = "Chép liên kết";
    var ok = function () { b.textContent = "Đã chép"; setTimeout(function () { b.textContent = old; }, 1800); };
    var fallback = function () { var t = document.createElement("textarea"); t.value = url; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); ok(); } catch (e) { b.textContent = url; } document.body.removeChild(t); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fallback); else fallback();
  });

  /* ---------- chế độ giảng dạy ---------- */
  function gv(on) { document.documentElement.classList.toggle("dt-gv", on); $$("[data-gv]").forEach(function (b) { b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Thoát chế độ giảng dạy" : "Chế độ giảng dạy"; }); window.dispatchEvent(new Event("resize")); }
  gv(store.get("dt-gv", false) === true);
  document.addEventListener("click", function (ev) { if (!ev.target.closest("[data-gv]")) return; var on = !document.documentElement.classList.contains("dt-gv"); store.set("dt-gv", on); gv(on); closeMenu(); });

  /* ---------- mục lục trên điện thoại ---------- */
  var side = $("#dt-side"), menu = $("#dt-menu"), scrim = $("#dt-scrim");
  function closeMenu() { if (!side) return; side.classList.remove("open"); if (menu) menu.setAttribute("aria-expanded", "false"); if (scrim) scrim.hidden = true; }
  if (menu && side) {
    menu.addEventListener("click", function () { var on = !side.classList.contains("open"); side.classList.toggle("open", on); menu.setAttribute("aria-expanded", String(on)); if (scrim) scrim.hidden = !on; });
    if (scrim) scrim.addEventListener("click", closeMenu);
    side.addEventListener("click", function (ev) { if (ev.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeMenu(); });
  }

  /* ---------- đánh dấu phần đang xem ---------- */
  var secs = $$(".dt-sec");
  if (secs.length) {
    var cur = null, tick = false;
    var spy = function () {
      tick = false; var line = window.innerHeight * 0.35, id = secs[0].id;
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) id = s.id; });
      if (id === cur) return; cur = id;
      $$("[data-spy]").forEach(function (a) { if (a.getAttribute("data-spy") === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    };
    var ask = function () { if (!tick) { tick = true; requestAnimationFrame(spy); } };
    window.addEventListener("scroll", ask, { passive: true }); window.addEventListener("resize", ask); spy();
    /* mô phỏng được dựng sau khi tải trang làm chiều cao thay đổi: cuộn lại đúng phần được dẫn link */
    window.addEventListener("load", function () { setTimeout(function () { var t = location.hash && document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); spy(); }, 250); });
  }

  /* ---------- lọc theo loại hoạt động (trang tổng quan) ---------- */
  var filt = $(".dt-filter");
  if (filt) filt.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-filter]"); if (!b) return; var k = b.getAttribute("data-filter");
    $$("[data-filter]", filt).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    $$(".dt-secs li").forEach(function (li) { li.hidden = !!k && li.getAttribute("data-kind") !== k; });
    $$(".dt-lesson").forEach(function (l) { l.hidden = !$$(".dt-secs li", l).some(function (li) { return !li.hidden; }); });
  });

  paint();
})();
