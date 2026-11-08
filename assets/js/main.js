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

  /* ---- Dropdown menus (About, Education): click/tap to open, hover on desktop ---- */
  var subs = Array.prototype.slice.call(document.querySelectorAll(".nav-links .has-sub"));
  function closeSubs(except) {
    subs.forEach(function (li) {
      if (li === except) return;
      li.classList.remove("sub-open");
      li.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
    });
  }
  subs.forEach(function (li) {
    var btn = li.querySelector(".sub-toggle");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !li.classList.contains("sub-open");
      closeSubs(li);
      li.classList.toggle("sub-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeSubs(); btn.focus(); }
    });
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget) && window.matchMedia("(min-width: 1181px)").matches) {
        li.classList.remove("sub-open"); btn.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) closeSubs();
  });

  /* ---- Active nav link based on filename ---- */
  var path = location.pathname.split("/").pop() || "index.html";
  if (path.indexOf("take-action") === 0) path = "campaigns.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
      var parent = a.closest(".has-sub");
      if (parent) parent.querySelector(".sub-toggle").classList.add("active");
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
  var form = document.querySelector(".afj-form:not(.afj-waitlist)");
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

  /* ---- Shop waitlist: sends name + email to the AFJ inbox via Web3Forms ---- */
  var wl = document.querySelector(".afj-waitlist");
  if (wl) {
    wl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!wl.checkValidity()) { wl.reportValidity(); return; }
      if (wl.querySelector('[name="botcheck"]').checked) return;
      var st = wl.querySelector(".form-status"), b = wl.querySelector('button[type="submit"]');
      var d = {}; new FormData(wl).forEach(function (v, k) { if (k !== "botcheck") d[k] = v; });
      d.message = d.name + " (" + d.email + ") joined the merch waitlist.";
      b.disabled = true; b.textContent = "Joining…";
      function say(msg) { st.textContent = msg; st.style.display = "block"; }
      fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.success === true) { say("You\u2019re on the list! We\u2019ll email you as soon as the merch drops."); wl.reset(); }
        else throw 0;
      }).catch(function () {
        st.innerHTML = 'Sorry, that didn\u2019t go through. Please email <a href="mailto:info.absocforjustice@gmail.com?subject=Merch%20waitlist">info.absocforjustice@gmail.com</a> with the subject \u201cMerch waitlist\u201d and we\u2019ll add you.';
        st.style.display = "block";
      }).then(function () { b.disabled = false; b.textContent = "Join the waitlist"; });
    });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

/* Campaign jump bar: scrolls slowly by itself; drag (mouse) or swipe (touch) to move it.
   Pauses while hovered, focused or handled, then carries on after a short rest. */
(function () {
  var bar = document.querySelector(".camp-index");
  var vp = bar && bar.querySelector(".ci-viewport");
  var group = bar && bar.querySelector(".ci-group");
  if (!vp || !group) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SECONDS = 45;                 // time for one full lap, as before
  var hover = false, focus = false, held = false, restUntil = 0;
  var pos = 0, last = 0;

  function loopW() { return group.offsetWidth; }
  function wrap() {
    var w = loopW(); if (reduce || !w) return;
    if (pos >= w) pos -= w; else if (pos < 0) pos += w;
  }
  function apply() { vp.scrollLeft = pos; }
  function rest() { restUntil = performance.now() + 2500; }

  // keep our position in step with swipes, trackpads and keyboard scrolling
  vp.addEventListener("scroll", function () {
    if (Math.abs(vp.scrollLeft - pos) < 2) return;   // our own movement
    pos = vp.scrollLeft; wrap(); if (Math.abs(vp.scrollLeft - pos) > 1) apply(); rest();
  }, { passive: true });

  bar.addEventListener("mouseenter", function () { hover = true; });
  bar.addEventListener("mouseleave", function () { hover = false; });
  bar.addEventListener("focusin", function () { focus = true; });
  bar.addEventListener("focusout", function () { focus = false; });
  bar.addEventListener("touchstart", function () { held = true; }, { passive: true });
  bar.addEventListener("touchend", function () { held = false; rest(); }, { passive: true });

  // mouse drag
  var down = false, moved = false, startX = 0, startPos = 0;
  vp.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startPos = pos; held = true;
  });
  window.addEventListener("pointermove", function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) { moved = true; vp.classList.add("dragging"); }
    if (moved) { pos = startPos - dx; wrap(); apply(); e.preventDefault(); }
  });
  window.addEventListener("pointerup", function () {
    if (!down) return;
    down = false; held = false; rest();
    if (moved) setTimeout(function () { vp.classList.remove("dragging"); }, 0);
  });
  // a drag should never count as a click on a country
  vp.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  vp.addEventListener("dragstart", function (e) { e.preventDefault(); });

  if (reduce) return;
  function tick(now) {
    var dt = last ? Math.min(now - last, 100) : 0; last = now;
    if (!hover && !focus && !held && now > restUntil) {
      pos += loopW() / (SECONDS * 1000) * dt; wrap(); apply();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Back to top button */
(function () {
  var btn = document.querySelector(".to-top");
  if (!btn) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function update() { btn.classList.toggle("show", window.scrollY > 700); }
  window.addEventListener("scroll", update, { passive: true }); update();
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (history.replaceState && location.hash) history.replaceState(null, "", location.pathname + location.search);
  });
})();
