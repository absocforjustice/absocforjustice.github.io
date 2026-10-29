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

  /* ---- Contact form: sends to info.absocforjustice@gmail.com via Web3Forms ---- */
  var form = document.querySelector(".afj-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var btn = form.querySelector('button[type="submit"]');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (form.querySelector('[name="botcheck"]').checked) return;   // spam bot
      delete data.botcheck;
      data.topic = data.subject || "(none)";
      data.subject = "AFJ website: " + (data.subject || "new message");
      btn.disabled = true; btn.textContent = "Sending…";
      function show(msg, ok) {
        status.textContent = msg; status.style.display = "block";
        status.style.borderColor = ok ? "" : "#a3191f";
      }
      var TO = "info.absocforjustice@gmail.com";
      // If the automatic send fails, hand the message to the visitor's own email so it still reaches us.
      function fallback(why) {
        if (why && window.console) console.warn("Contact form:", why);
        var subj = data.subject;
        var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
        var mailto = "mailto:" + TO + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
        var gmail = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(TO) +
          "&su=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
        status.innerHTML = "";
        var p = document.createElement("p");
        p.textContent = "Almost there — tap a button below and your message opens in your email, already written. Just tap send.";
        var row = document.createElement("div"); row.className = "hero-actions"; row.style.marginTop = ".8rem";
        var a1 = document.createElement("a"); a1.className = "btn btn-primary"; a1.href = mailto; a1.textContent = "Open my email app";
        var a2 = document.createElement("a"); a2.className = "btn btn-outline"; a2.href = gmail; a2.target = "_blank"; a2.rel = "noopener"; a2.textContent = "Send with Gmail";
        row.appendChild(a1); row.appendChild(a2); status.appendChild(p); status.appendChild(row);
        status.style.display = "block"; status.style.borderColor = "";
      }
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j && res.j.success === true) {
            show("Thank you — your message has been sent. We’ll get back to you soon, in shaa Allah.", true);
            form.reset();
          } else {
            fallback(res.j && res.j.message);
          }
        })
        .catch(function (err) { fallback(err && err.message); })
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
