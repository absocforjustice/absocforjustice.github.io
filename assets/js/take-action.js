/* AFJ take-action letter: fills in the letter, then opens the supporter's
   own email (app or Gmail) with everything ready to send. */
(function () {
  "use strict";

  var form = document.getElementById("action-form");
  if (!form) return;

  var PM_EMAIL = "pmo.ca@pmo.gov.iq";
  var SUBJECT = "Azerbaijan is barring hijab-wearing girls and teachers from school - please act";

  var $ = function (id) { return document.getElementById(id); };
  var nameEl = $("your-name"), townEl = $("your-town");
  var fmNameEl = $("fm-name"), fmEmailEl = $("fm-email");
  var subjEl = $("letter-subject"), bodyEl = $("letter-body");
  var toLine = $("to-line"), gmail = $("send-gmail"), err = $("af-error");
  var fmBox = form.querySelector(".af-fm");
  var edited = false;

  function today() {
    try {
      return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }

  var COMMON =
    "I am writing about the hijab ban now being enforced in Azerbaijan's schools. Since 12 October 2026, girls and teachers who wear the hijab have been turned away at the school gates, and children have been filmed in tears as they are sent home. In a country where 97% of the population is Muslim, Muslim girls are being forced to choose between their faith and their education.\n\n" +
    "This is not a dress code. It is a ban on Muslim women themselves - part of a sustained campaign to push practising Muslims to the margins and treat them as second-class citizens. It follows the same path Tajikistan took when it outlawed the headscarf.\n\n" +
    "Azerbaijanis have refused to accept it. Students have walked out, classrooms have emptied as classmates stand with those shut out, and families have protested at the school gates. The government has answered with a crackdown: Azerbaijan's own Interior Ministry says 37 people were detained in Baku on 12 October alone, and activists report more than 200 detentions across the country.\n\n";

  function letter(target) {
    var who = target === "pm"
      ? "Dear Prime Minister al-Zaidi,"
      : "Dear " + (fmNameEl.value.trim() || "Foreign Minister") + ",";
    var ask = target === "pm"
      ? "Iraq now holds the presidency of the Organisation of Islamic Cooperation's Council of Foreign Ministers. I urge you to use that position, and your own voice, to call on the Azerbaijani government to lift this ban immediately, to let every pupil and teacher return to school, and to release everyone detained for peacefully opposing it. Silence from the Muslim world would only embolden discrimination against Muslim women everywhere, in Muslim-majority and Muslim-minority countries alike."
      : "Your government cannot stay silent while a Muslim-majority country shuts Muslim girls out of their classrooms. I urge you to make clear, publicly and through every diplomatic channel, that this ban is unacceptable, and to press Azerbaijan to reverse it immediately, let every pupil and teacher return to school, and release everyone detained for peacefully opposing it. If Muslim governments do not challenge this, it will embolden Islamophobia and discrimination against Muslim women in Muslim-majority and Muslim-minority countries alike.";
    var name = nameEl.value.trim() || "[Your name]";
    var town = townEl.value.trim();
    return who + "\n\n" + COMMON + ask + "\n\nYours sincerely,\n\n" + name + (town ? "\n" + town : "") + "\n" + today();
  }

  function target() { return form.querySelector('input[name="target"]:checked').value; }
  function recipient() { return target() === "pm" ? PM_EMAIL : fmEmailEl.value.trim(); }

  function refresh(force) {
    var t = target();
    fmBox.hidden = t !== "fm";
    form.classList.toggle("af-manual", t === "fm");      // foreign ministers: sent from your own email
    if (!edited || force) {
      bodyEl.value = letter(t);
      subjEl.value = SUBJECT;
    }
    var to = recipient();
    toLine.textContent = t === "pm"
      ? "Prime Minister Ali al-Zaidi <" + PM_EMAIL + ">"
      : (to ? (fmNameEl.value.trim() || "Foreign minister") + " <" + to + ">" : "add the minister's email in your email app");
    gmail.href = "https://mail.google.com/mail/?view=cm&fs=1" +
      (to ? "&to=" + encodeURIComponent(to) : "") +
      "&su=" + encodeURIComponent(subjEl.value) +
      "&body=" + encodeURIComponent(bodyEl.value);
  }

  var AUTO = window.AFJ_SEND && AFJ_SEND.enabled();
  var emailEl = $("your-email"), sendBtn = form.querySelector(".af-send");
  function fail(msg, el) { err.textContent = msg; err.hidden = false; if (el) el.focus(); return false; }
  function valid(needEmail) {
    if (!nameEl.value.trim()) return fail("Please add your name so the letter can be signed.", nameEl);
    if (needEmail && !AFJ_SEND.validEmail(emailEl.value.trim())) return fail("Please add your email address so your letter can be sent.", emailEl);
    err.hidden = true; return true;
  }
  function openMail() {
    window.location.href = "mailto:" + encodeURIComponent(recipient()).replace(/%40/g, "@") +
      "?subject=" + encodeURIComponent(subjEl.value) + "&body=" + encodeURIComponent(bodyEl.value);
  }

  var THANKS_DEFAULT = $("af-thanks-msg").textContent;
  function thanks(msg) {
    var t = $("af-thanks"); $("af-thanks-msg").textContent = msg || THANKS_DEFAULT; t.hidden = false;
    t.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Typing your name or town updates the letter unless you've edited it by hand.
  [nameEl, townEl, fmNameEl, fmEmailEl].forEach(function (el) {
    el.addEventListener("input", function () {
      if (edited && (el === nameEl || el === townEl || el === fmNameEl)) {
        // keep their edits, but still update the signature block
        var lines = bodyEl.value.split("\n");
        var i = lines.lastIndexOf("Yours sincerely,");
        if (i > -1) {
          var town = townEl.value.trim();
          bodyEl.value = lines.slice(0, i + 1).join("\n") + "\n\n" +
            (nameEl.value.trim() || "[Your name]") + (town ? "\n" + town : "") + "\n" + today();
        }
      }
      refresh();
    });
  });
  bodyEl.addEventListener("input", function () { edited = true; refresh(); });
  subjEl.addEventListener("input", function () { refresh(); });
  form.querySelectorAll('input[name="target"]').forEach(function (r) {
    r.addEventListener("change", function () { edited = false; refresh(true); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!AUTO || target() !== "pm") { if (!valid()) return; openMail(); setTimeout(thanks, 600); return; }
    if (!valid(true)) return;
    sendBtn.disabled = true; sendBtn.textContent = "Sending…";
    AFJ_SEND.send("azerbaijan-pm", {
      name: nameEl.value.trim(), email: emailEl.value.trim(), subject: subjEl.value, body: bodyEl.value,
      website: form.querySelector('[name="website"]').value
    }).then(function (res) {
      sendBtn.disabled = false; sendBtn.textContent = "Send my email";
      if (res.ok) {
        if (res.count) AFJ_SEND.show($("af-count"), res.count);
        thanks("Your letter has been sent to the Prime Minister of Iraq\u2019s office. Thank you! Now multiply it: send this page to five friends, and write to a foreign minister too.");
      } else if (AFJ_SEND.MESSAGES[res.error]) {
        fail(AFJ_SEND.MESSAGES[res.error], res.error === "email" ? emailEl : null);
      } else {
        fail("We couldn\u2019t send it automatically just now, so your email app is opening with the letter ready \u2014 just tap send.");
        openMail(); setTimeout(thanks, 600);
      }
    });
  });
  if (AUTO) AFJ_SEND.count("azerbaijan-pm", $("af-count"));

  gmail.addEventListener("click", function (e) {
    if (!valid()) { e.preventDefault(); return; }
    setTimeout(thanks, 600);
  });

  $("copy-letter").addEventListener("click", function () {
    if (!valid()) return;
    var text = (recipient() ? "To: " + recipient() + "\n" : "") + "Subject: " + subjEl.value + "\n\n" + bodyEl.value;
    var btn = this;
    function done() { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy letter"; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { bodyEl.select(); });
    } else { bodyEl.select(); try { document.execCommand("copy"); done(); } catch (x) {} }
  });

  $("share-page").addEventListener("click", function () {
    var data = { title: document.title, text: "Write to Muslim governments: lift the hijab ban on Azerbaijan's schoolgirls.", url: location.href.split("#")[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url); this.textContent = "Link copied!"; }
  });

  function pickFM() {
    form.querySelector('input[value="fm"]').checked = true;
    edited = false; refresh(true);
    $("af-thanks").hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { fmNameEl.focus({ preventScroll: true }); }, 500);
  }
  $("write-another").addEventListener("click", pickFM);
  document.querySelectorAll('[data-pick="fm"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); pickFM(); });
  });

  // Printable versions of both letters further down the page
  function paper(id, t) {
    var el = $(id); if (!el) return;
    var saveName = nameEl.value, saveTown = townEl.value, saveFm = fmNameEl.value;
    nameEl.value = "[Your name]"; townEl.value = "[Your address]";
    if (t === "fm") fmNameEl.value = "[Name of Foreign Minister]";
    el.textContent = letter(t).replace(/\n\d{1,2} \w+ \d{4}$/, "\n[Date]");
    nameEl.value = saveName; townEl.value = saveTown; fmNameEl.value = saveFm;
  }
  paper("paper-pm", "pm");
  paper("paper-fm", "fm");

  refresh(true);
})();
