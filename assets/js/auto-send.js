/* AFJ automatic letter sending.
   Letters are posted to AFJ's Google Apps Script mailer (tools/afj-mailer.gs),
   which emails the campaign target from the AFJ account with the supporter's
   email as the reply-to address. If URL is empty or sending fails, the pages
   fall back to opening the supporter's own email app. */
window.AFJ_SEND = (function () {
  "use strict";

  // Paste the Apps Script web app URL between the quotes:
  var URL = "";

  if (URL) document.documentElement.classList.add("afj-auto");

  function send(campaign, data) {
    if (!URL) return Promise.resolve({ ok: false, error: "not-configured" });
    data.campaign = campaign;
    return fetch(URL, { method: "POST", body: JSON.stringify(data) })   // text/plain: no CORS preflight
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "network" }; });
  }

  function count(campaign, el) {
    if (!URL || !el) return;
    fetch(URL + "?campaign=" + encodeURIComponent(campaign))
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.count) show(el, j.count); })
      .catch(function () {});
  }

  function show(el, n) {
    el.textContent = n.toLocaleString("en-GB") + (n === 1 ? " letter" : " letters") + " sent so far";
    el.hidden = false;
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  var MESSAGES = {
    "already-sent": "You've already sent this letter — thank you! Share the page so others can send theirs.",
    "email": "Please check your email address.",
    "name": "Please add your name so the letter can be signed.",
    "body": "Your letter looks too short — please check it before sending."
  };

  return { enabled: function () { return !!URL; }, send: send, count: count, show: show, validEmail: validEmail, MESSAGES: MESSAGES };
})();
