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

  /* ---- Contact form: sends to Info.absocforjustice@gmail.com via FormSubmit ---- */
  var form = document.querySelector(".afj-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var btn = form.querySelector('button[type="submit"]');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return;                                   // spam bot
      if (data.subject) data._subject = "AFJ website: " + data.subject;
      btn.disabled = true; btn.textContent = "Sending…";
      function show(msg, ok) {
        status.textContent = msg; status.style.display = "block";
        status.style.borderColor = ok ? "" : "#a3191f";
      }
      fetch("https://formsubmit.co/ajax/Info.absocforjustice@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === "true") {
            show("Thank you — your message has been sent. We’ll get back to you soon, in shaa Allah.", true);
            form.reset();
          } else {
            show("Sorry, your message couldn’t be sent just now. Please email Info.absocforjustice@gmail.com directly.", false);
          }
        })
        .catch(function () {
          show("Sorry, your message couldn’t be sent just now. Please email Info.absocforjustice@gmail.com directly.", false);
        })
        .then(function () { btn.disabled = false; btn.textContent = "Send message"; });
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
