/* AFJ: Email City St George's — divest from genocide.
   Fills in the letter, then opens the supporter's own email (app or Gmail). */
(function () {
  "use strict";
  var form = document.getElementById("city-form");
  if (!form) return;
  var TO = "enquiries@city.ac.uk,studentcentre@citystgeorges.ac.uk";
  var SUBJECT = "Call for City St George's to Divest from Genocide";
  var $ = function (id) { return document.getElementById(id); };
  var nameEl = $("c-name"), courseEl = $("c-course"), bodyEl = $("c-body"), subjEl = $("c-subject");
  var gmail = $("c-gmail"), err = $("c-error"), courseBox = form.querySelector(".c-course");
  var edited = false;

  var FACTS =
    "According to Freedom of Information disclosures analysed by Demilitarise Education, City St George's has 44 direct links with arms-sector companies. These include partnerships, research funding, consultancy arrangements, PhD studentships and tuition sponsorships. Over the past eight years these partnerships are worth approximately £4.5 million, with over £3.6 million in arms-sector research funding alone.\n\n" +
    "FOI data further shows funded relationships with major arms and military contractors including BAE Systems, Boeing, Airbus Group Innovations, Rolls-Royce, Thales and the UK Defence Science and Technology Laboratory (Dstl). Between 2013 and 2025, arms-sector partners disclosed more than £4.9 million in funding, much of it concentrated within the School of Science and Technology. These partnerships stand in direct contradiction to Point 7.8.2 of City's own Investment Policy.\n\n" +
    "These companies are not abstract entities. They manufacture and supply weapons that are actively used in conflicts resulting in the mass killing of civilians. At present, such weapons are being used in what numerous human rights organisations, legal scholars and international bodies have identified as genocide, massacres and severe human rights violations against the Palestinian and Lebanese people.\n\n";

  function who() { return form.querySelector('input[name="who"]:checked').value; }

  function letter() {
    var student = who() === "student";
    var open = student
      ? "I am writing as a current student of City St George's to formally object to the university's extensive financial and research links with arms companies, and to hold the institution accountable for its ethical and moral responsibilities.\n\n"
      : "I am writing as a concerned member of the public to formally object to the university's extensive financial and research links with arms companies, and to hold the institution accountable for its ethical and moral responsibilities.\n\n";
    var consent = student
      ? "When choosing City St George's as our university, students did not consent to our tuition fees, research output or institutional reputation being tied to the arms trade, nor to systems that profit from genocide, war crimes and the murder of innocent people abroad. Ethical consent matters, and it has not been given.\n\n"
      : "";
    var neutral = "Universities are not neutral actors. By accepting funding, partnerships and institutional collaboration with arms manufacturers, City St George's is complicit in sustaining industries that enable mass violence. Claims of academic neutrality do not absolve moral responsibility." +
      (student ? "" : " As a publicly respected institution, the university's actions have consequences far beyond its campus.") + "\n\n";
    var asks = "I therefore call on City St George's to:\n\n" +
      "- Publicly disclose the full extent of all arms-sector financial, research and institutional links\n" +
      "- Immediately commit to divestment from all arms companies and military contractors\n" +
      "- Divest from all current and future research partnerships with organisations involved in the production of weapons\n" +
      "- Engage transparently with " + (student ? "students and staff" : "students, staff and the wider community") + " on ethical investment and research practices\n\n";
    var close = "Silence, delay or deflection on this issue is not acceptable. " + (student ? "Students are" : "The public is") +
      " watching closely, and history will judge institutions by whether they chose profit or principles in the face of genocide.\n\n" +
      "I expect a clear response outlining the university's position and the concrete actions it intends to take.\n\n";
    var name = nameEl.value.trim() || "[Your name]";
    var course = student && courseEl.value.trim() ? "\n" + courseEl.value.trim() : "";
    return "Dear City St George's,\n\n" + open + FACTS + consent + neutral + asks + close + "Yours sincerely,\n\n" + name + course;
  }

  function refresh(force) {
    courseBox.hidden = who() !== "student";
    if (!edited || force) { bodyEl.value = letter(); subjEl.value = SUBJECT; }
    gmail.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(TO) +
      "&su=" + encodeURIComponent(subjEl.value) + "&body=" + encodeURIComponent(bodyEl.value);
  }
  var AUTO = window.AFJ_SEND && AFJ_SEND.enabled();
  var emailEl = $("c-email"), sendBtn = form.querySelector(".af-send");
  function fail(msg, el) { err.textContent = msg; err.hidden = false; if (el) el.focus(); return false; }
  function valid(needEmail) {
    if (!nameEl.value.trim()) return fail("Please add your name so the letter can be signed.", nameEl);
    if (needEmail && !AFJ_SEND.validEmail(emailEl.value.trim())) return fail("Please add your email address so your letter can be sent.", emailEl);
    err.hidden = true; return true;
  }
  function openMail() {
    window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subjEl.value) + "&body=" + encodeURIComponent(bodyEl.value);
  }
  function thanks(msg) {
    var t = $("c-thanks"); if (msg) $("c-thanks-msg").textContent = msg;
    t.hidden = false; t.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  [nameEl, courseEl].forEach(function (el) {
    el.addEventListener("input", function () {
      if (edited) {
        var i = bodyEl.value.lastIndexOf("Yours sincerely,");
        if (i > -1) {
          var c = who() === "student" && courseEl.value.trim() ? "\n" + courseEl.value.trim() : "";
          bodyEl.value = bodyEl.value.slice(0, i) + "Yours sincerely,\n\n" + (nameEl.value.trim() || "[Your name]") + c;
        }
      }
      refresh();
    });
  });
  bodyEl.addEventListener("input", function () { edited = true; refresh(); });
  subjEl.addEventListener("input", function () { refresh(); });
  form.querySelectorAll('input[name="who"]').forEach(function (r) { r.addEventListener("change", function () { edited = false; refresh(true); }); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!AUTO) { if (!valid()) return; openMail(); setTimeout(thanks, 600); return; }
    if (!valid(true)) return;
    sendBtn.disabled = true; sendBtn.textContent = "Sending…";
    AFJ_SEND.send("city-divest", {
      name: nameEl.value.trim(), email: emailEl.value.trim(), subject: subjEl.value, body: bodyEl.value,
      website: form.querySelector('[name="website"]').value
    }).then(function (res) {
      sendBtn.disabled = false; sendBtn.textContent = "Send my email";
      if (res.ok) {
        if (res.count) AFJ_SEND.show($("c-count"), res.count);
        thanks("Your letter has been sent to City St George\u2019s. Thank you! Now multiply it: send this page to five friends.");
      } else if (AFJ_SEND.MESSAGES[res.error]) {
        fail(AFJ_SEND.MESSAGES[res.error], res.error === "email" ? emailEl : null);
      } else {
        fail("We couldn\u2019t send it automatically just now, so your email app is opening with the letter ready \u2014 just tap send.");
        openMail(); setTimeout(thanks, 600);
      }
    });
  });
  if (AUTO) AFJ_SEND.count("city-divest", $("c-count"));
  gmail.addEventListener("click", function (e) { if (!valid()) { e.preventDefault(); return; } setTimeout(thanks, 600); });
  $("c-copy").addEventListener("click", function () {
    if (!valid()) return;
    var text = "To: " + TO.replace(",", ", ") + "\nSubject: " + subjEl.value + "\n\n" + bodyEl.value, btn = this;
    function done() { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy letter"; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { bodyEl.select(); });
    else { bodyEl.select(); try { document.execCommand("copy"); done(); } catch (x) {} }
  });
  $("c-share").addEventListener("click", function () {
    var d = { title: document.title, text: "Email City St George's: divest from genocide.", url: location.href.split("#")[0] };
    if (navigator.share) navigator.share(d).catch(function () {});
    else if (navigator.clipboard) { navigator.clipboard.writeText(d.url); this.textContent = "Link copied!"; }
  });
  refresh(true);
})();
