/* AFJ site — interactions */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var open = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- Active nav link based on filename ---- */
  var path = location.pathname.split("/").pop() || "index.html";
  if (path.indexOf("take-action") === 0) path = "campaigns.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---- Scroll reveal ---- */
  var reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Contact form (front-end only demo) ---- */
  var form = document.querySelector(".afj-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) {
        status.textContent =
          "Thank you — your message has been noted. (This demo form is not yet " +
          "connected to a mail service; email Info.absocforjustice@gmail.com in the meantime.)";
        status.style.display = "block";
      }
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

/* Campaign jump bar: pause while touched */
(function () {
  var bar = document.querySelector(".camp-index");
  if (!bar) return;
  var t;
  bar.addEventListener("touchstart", function () { clearTimeout(t); bar.classList.add("paused"); }, { passive: true });
  bar.addEventListener("touchend", function () { t = setTimeout(function () { bar.classList.remove("paused"); }, 2500); }, { passive: true });
})();
