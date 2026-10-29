/**
 * AFJ Take Action mailer (Google Apps Script)
 * --------------------------------------------
 * Sends supporters' letters straight to the campaign target from the AFJ
 * Gmail account, with the supporter's own email as the reply-to address.
 *
 * Paste this whole file into a new project at script.google.com while signed
 * in to info.absocforjustice@gmail.com, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Paste the web app URL into
 * assets/js/auto-send.js on the website.
 *
 * Only the recipients listed in TARGETS can ever be emailed, so the script
 * cannot be misused to send mail to anyone else.
 */

var TARGETS = {
  "azerbaijan-pm": {
    to: "pmo.ca@pmo.gov.iq",
    subject: "Azerbaijan is barring hijab-wearing girls and teachers from school - please act"
  },
  "city-divest": {
    to: "enquiries@city.ac.uk,studentcentre@citystgeorges.ac.uk",
    subject: "Call for City St George's to Divest from Genocide"
  }
};

var ONE_LETTER_PER_HOURS = 6;   // the same email address can send each letter once per 6 hours

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (d.website) return out({ ok: true });                       // spam bot filled the hidden field

    var t = TARGETS[d.campaign];
    if (!t) return out({ ok: false, error: "unknown-campaign" });

    var name = clean(d.name, 100);
    var email = clean(d.email, 200).toLowerCase();
    var subject = clean(d.subject, 200) || t.subject;
    var body = String(d.body || "").slice(0, 12000);

    if (!name) return out({ ok: false, error: "name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out({ ok: false, error: "email" });
    if (body.replace(/\s/g, "").length < 200) return out({ ok: false, error: "body" });

    var cache = CacheService.getScriptCache();
    var key = d.campaign + "|" + email;
    if (cache.get(key)) return out({ ok: false, error: "already-sent" });

    var recipients = t.to.split(",").length;
    if (MailApp.getRemainingDailyQuota() < recipients) return out({ ok: false, error: "quota" });

    MailApp.sendEmail({
      to: t.to,
      subject: subject,
      body: body + "\n" + email,
      name: name + " (via ABSoc for Justice)",
      replyTo: email
    });

    cache.put(key, "1", ONE_LETTER_PER_HOURS * 3600);
    var count = bump(d.campaign);
    return out({ ok: true, count: count });
  } catch (err) {
    return out({ ok: false, error: "server", detail: String(err) });
  }
}

// GET ?campaign=city-divest  ->  { ok: true, count: 123 }   (the "letters sent" counter)
function doGet(e) {
  var c = e && e.parameter && e.parameter.campaign;
  var n = Number(PropertiesService.getScriptProperties().getProperty("count:" + c) || 0);
  return out({ ok: true, count: n });
}

function bump(campaign) {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var p = PropertiesService.getScriptProperties();
    var n = Number(p.getProperty("count:" + campaign) || 0) + 1;
    p.setProperty("count:" + campaign, String(n));
    return n;
  } finally { lock.releaseLock(); }
}

function clean(v, max) { return String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, max); }

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (select "authorise" and press Run) to grant Gmail permission.
function authorise() { MailApp.getRemainingDailyQuota(); }
