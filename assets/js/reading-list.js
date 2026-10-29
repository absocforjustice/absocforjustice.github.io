/* AFJ reading list — books that enlarge and open to show their summary.
   Mouse: hover a book and it opens in place; move away and it closes.
   Touch / click / keyboard: the book flies to the centre of the screen and opens. */
(function () {
  "use strict";

  var books = Array.prototype.slice.call(document.querySelectorAll(".rbook"));
  if (!books.length) return;

  var MARGIN = 14;
  var current = null;      // the open book
  var mode = null;         // "hover" | "focus"
  var openTimer = null, closeTimer = null;

  var backdrop = document.createElement("div");
  backdrop.className = "rbook-backdrop";
  document.body.appendChild(backdrop);

  function headerBottom() {
    var h = document.querySelector(".site-header");
    if (!h) return 0;
    var r = h.getBoundingClientRect();
    return Math.max(0, r.bottom);
  }

  function clamp(v, lo, hi) {
    if (hi < lo) return (lo + hi) / 2;
    return Math.min(hi, Math.max(lo, v));
  }

  /* Work out how big the open book should be and where it should sit,
     so it never spills off the edge of the screen. */
  function layout(book, m) {
    var stage = book.querySelector(".rbook-stage");
    var r = stage.getBoundingClientRect();
    var w = r.width, h = r.height;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var top = (m === "focus" ? 0 : headerBottom()) + MARGIN;
    var bottom = vh - MARGIN;
    var availW = vw - MARGIN * 2;
    var availH = bottom - top;
    var s, solo;

    if (m === "hover") {
      s = Math.min(1.6, availW / (2 * w), availH / h);
      solo = s < 1.2;                             // no room for a two-page spread
      if (solo) s = Math.min(1.6, availW / w, availH / h);
    } else {
      var maxPage = 380;                          // comfortable reading width per page
      s = Math.min(availW / (2 * w), availH / h, maxPage / w);
      solo = s * w < 250;                         // phone: show the page on its own
      if (solo) s = Math.min(availW / w, availH / h, 460 / w);
    }
    s = Math.max(s, 1);

    var pageW = w * s, pageH = h * s;
    var spineX, centreY;

    if (m === "hover") {
      spineX = solo ? r.left + w / 2 - pageW / 2 : r.left + w / 2;
      centreY = r.top + h / 2;
    } else {
      spineX = solo ? vw / 2 - pageW / 2 : vw / 2;
      centreY = top + availH / 2;
    }
    spineX = solo
      ? clamp(spineX, MARGIN, vw - MARGIN - pageW)
      : clamp(spineX, MARGIN + pageW, vw - MARGIN - pageW);
    centreY = clamp(centreY, top + pageH / 2, bottom - pageH / 2);

    var fsTarget = m === "focus" ? (solo ? 15.5 : 15) : 13.5;
    var el = book.querySelector(".rbook-3d");
    el.style.setProperty("--s", s.toFixed(4));
    el.style.setProperty("--dx", (spineX - r.left).toFixed(1) + "px");
    el.style.setProperty("--dy", (centreY - (r.top + h / 2)).toFixed(1) + "px");
    el.style.setProperty("--fs", (fsTarget / s).toFixed(3) + "px");
    book.classList.toggle("is-solo", solo);
  }

  function lockScroll(on) {
    var de = document.documentElement;
    if (on) {
      var sb = window.innerWidth - de.clientWidth;
      de.style.overflow = "hidden";
      if (sb > 0) de.style.paddingRight = sb + "px";
    } else {
      de.style.overflow = "";
      de.style.paddingRight = "";
    }
  }

  function open(book, m) {
    clearTimeout(openTimer); clearTimeout(closeTimer);
    if (current && current !== book) close(true);
    if (m === "focus") lockScroll(true);           // lock first so the layout is final
    layout(book, m);
    current = book; mode = m;
    book.classList.add("is-open");
    book.classList.toggle("is-focus", m === "focus");
    book.setAttribute("aria-expanded", "true");
    backdrop.classList.toggle("on", m === "focus");
    var page = book.querySelector(".rbook-page");
    page.scrollTop = 0;
    if (m === "focus") {
      var btn = book.querySelector(".rbook-close");
      setTimeout(function () { if (current === book && btn) btn.focus({ preventScroll: true }); }, 60);
    }
  }

  function close(immediate) {
    clearTimeout(openTimer); clearTimeout(closeTimer);
    if (!current) return;
    var book = current, wasFocus = mode === "focus";
    current = null; mode = null;
    book.classList.remove("is-open", "is-focus");
    book.setAttribute("aria-expanded", "false");
    backdrop.classList.remove("on");
    if (wasFocus) {
      lockScroll(false);
      if (!immediate) book.focus({ preventScroll: true });
    }
  }

  books.forEach(function (book) {
    var title = (book.querySelector(".rbook-caption h3") || {}).textContent || "book";
    book.setAttribute("tabindex", "0");
    book.setAttribute("role", "button");
    book.setAttribute("aria-expanded", "false");
    book.setAttribute("aria-label", "Open the summary of " + title.trim());

    /* Mouse hover: open in place */
    book.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse" || mode === "focus") return;
      clearTimeout(closeTimer);
      if (current === book) return;
      openTimer = setTimeout(function () { open(book, "hover"); }, 140);
    });
    book.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      clearTimeout(openTimer);
      if (current === book && mode === "hover") {
        closeTimer = setTimeout(function () { if (mode === "hover") close(true); }, 180);
      }
    });

    /* Tap / click: open centred on screen */
    book.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;                    // let links work
      if (e.target.closest(".rbook-close")) { close(); return; }
      if (current === book && mode === "focus") return;     // clicks inside the open page do nothing
      open(book, "focus");
    });

    book.addEventListener("keydown", function (e) {
      if (e.target !== book) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (current === book && mode === "focus") close(); else open(book, "focus");
      }
    });
  });

  backdrop.addEventListener("click", function () { close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  window.addEventListener("resize", function () { if (current) close(true); });
  window.addEventListener("scroll", function () { if (mode === "hover") close(true); }, { passive: true });

  /* Covers: try each source in turn; if none loads, typeset a cover from the title */
  function typeset(front) {
    var book = front.closest(".rbook");
    var t = (book.querySelector(".rbook-caption h3") || {}).textContent || "";
    var a = (book.querySelector(".rbook-caption p") || {}).textContent || "";
    front.innerHTML = '<span class="tt"></span><span class="ta"></span>';
    front.querySelector(".tt").textContent = t;
    front.querySelector(".ta").textContent = a;
    front.classList.add("is-typeset");
  }
  function next(img) {
    var list = (img.getAttribute("data-fallback") || "").split("|").filter(Boolean);
    if (list.length) {
      img.setAttribute("data-fallback", list.slice(1).join("|"));
      img.src = list[0];
    } else {
      typeset(img.parentNode);
    }
  }
  document.querySelectorAll(".rbook-front img").forEach(function (img) {
    function check() { if (img.naturalWidth < 30) next(img); }   // some services return a 1px placeholder
    img.addEventListener("error", function () { next(img); });
    img.addEventListener("load", check);
    if (img.complete) { if (!img.naturalWidth) next(img); else check(); }
  });
})();
