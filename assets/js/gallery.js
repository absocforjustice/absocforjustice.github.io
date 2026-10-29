/* Gallery lightbox: tap a photo to see it in full; swipe or use arrows to move. */
(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll(".g-open"));
  if (!links.length) return;
  var box = document.createElement("div");
  box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous photo">&lsaquo;</button>' +
    '<img alt=""><p></p>' +
    '<button class="lb-btn lb-next" aria-label="Next photo">&rsaquo;</button>';
  document.body.appendChild(box);
  var img = box.querySelector("img"), cap = box.querySelector("p"), i = 0, last = null;

  function show(n) {
    i = (n + links.length) % links.length;
    var a = links[i], fig = a.closest("figure");
    img.src = a.getAttribute("href");
    img.alt = a.querySelector("img").alt;
    cap.textContent = fig.querySelector("figcaption").textContent;
  }
  function open(n) { last = document.activeElement; show(n); box.classList.add("on"); document.documentElement.style.overflow = "hidden"; box.querySelector(".lb-close").focus(); }
  function close() { box.classList.remove("on"); document.documentElement.style.overflow = ""; if (last) last.focus(); }

  links.forEach(function (a, n) { a.addEventListener("click", function (e) { e.preventDefault(); open(n); }); });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", function () { show(i - 1); });
  box.querySelector(".lb-next").addEventListener("click", function () { show(i + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("on")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
  var sx = null;
  box.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
  });
})();
