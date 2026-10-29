/* AFJ events: renders assets/js/events-data.js into
   [data-events="upcoming"], [data-events="past"] and [data-events="home"] lists. */
(function () {
  "use strict";
  var all = (window.AFJ_EVENTS || []).filter(function (e) { return e && e.title && /^\d{4}-\d{2}-\d{2}$/.test(e.date); });
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function d(e) { var p = e.date.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var upcoming = all.filter(function (e) { return d(e) >= today; }).sort(function (a, b) { return d(a) - d(b); });
  var past = all.filter(function (e) { return d(e) < today; }).sort(function (a, b) { return d(b) - d(a); });

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function t12(t) {
    if (!t) return "";
    var h = +t.split(":")[0], m = t.split(":")[1];
    return ((h % 12) || 12) + (m !== "00" ? ":" + m : "") + (h < 12 ? "am" : "pm");
  }
  function gcal(e) {
    var ymd = e.date.replace(/-/g, "");
    var dates;
    if (e.start) {
      var s = ymd + "T" + e.start.replace(":", "") + "00";
      var endT = e.end || (String((+e.start.split(":")[0] + 2) % 24).padStart(2, "0") + ":" + e.start.split(":")[1]);   // no end time: assume 2 hours
      var en = ymd + "T" + endT.replace(":", "") + "00";
      dates = s + "/" + en;
    } else {
      var nx = d(e); nx.setDate(nx.getDate() + 1);
      dates = ymd + "/" + nx.getFullYear() + String(nx.getMonth() + 1).padStart(2, "0") + String(nx.getDate()).padStart(2, "0");
    }
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.title + " — ABSoc for Justice") +
      "&dates=" + dates + "&ctz=Europe/London" +
      "&details=" + encodeURIComponent((e.about || "") + (e.link ? "\n\n" + e.link : "")) +
      "&location=" + encodeURIComponent([e.place, e.city].filter(Boolean).join(", "));
  }
  function card(e, isPast) {
    var dt = d(e);
    var when = DAY[dt.getDay()] + (e.start ? " · " + t12(e.start) + (e.end ? "–" + t12(e.end) : "") : "");
    var where = [e.place, e.city].filter(Boolean).join(", ");
    var btns = "";
    if (!isPast) {
      if (e.link) btns += '<a class="btn btn-primary" href="' + esc(e.link) + '" target="_blank" rel="noopener">' + esc(e.linkText || "More info") + "</a>";
      btns += '<a class="btn btn-outline" href="' + gcal(e) + '" target="_blank" rel="noopener">Add to calendar</a>';
    }
    var extra = "";
    if (e.speakers && e.speakers.length) extra += '<p class="ev-speakers"><b>Speakers:</b> ' + e.speakers.map(esc).join(" · ") + "</p>";
    if (e.topics && e.topics.length) extra += '<ul class="ev-topics">' + e.topics.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
    var poster = e.image ? '<a class="ev-poster" href="' + esc(e.image) + '" target="_blank" rel="noopener"><img src="' + esc(e.image) + '" alt="Poster for ' + esc(e.title) + '" loading="lazy"></a>' : "";
    return '<article class="ev' + (isPast ? " ev--past" : "") + (poster ? " ev--poster" : "") + '">' +
      '<div class="ev-date"><span class="ev-day">' + dt.getDate() + '</span><span class="ev-mon">' + MON[dt.getMonth()] + " " + dt.getFullYear() + "</span></div>" +
      '<div class="ev-body"><h3>' + esc(e.title) + "</h3>" +
      '<p class="ev-meta">' + esc(when) + (where ? ' <span aria-hidden="true">·</span> ' + esc(where) : "") + "</p>" +
      (e.about ? "<p>" + esc(e.about) + "</p>" : "") + extra +
      (btns ? '<div class="ev-actions">' + btns + "</div>" : "") + "</div>" + poster + "</article>";
  }
  var EMPTY = '<div class="ev-empty"><h3>New events announced soon</h3><p>Follow <a href="https://instagram.com/absocforjustice" target="_blank" rel="noopener">@absocforjustice</a> to hear first about our next talks, protests and workshops.</p></div>';

  document.querySelectorAll("[data-events]").forEach(function (box) {
    var kind = box.getAttribute("data-events");
    if (kind === "past") {
      var wrap = box.closest("[data-past-wrap]");
      if (!past.length) { if (wrap) wrap.hidden = true; return; }
      box.innerHTML = past.map(function (e) { return card(e, true); }).join("");
      return;
    }
    var list = kind === "home" ? upcoming.slice(0, 3) : upcoming;
    box.innerHTML = list.length ? list.map(function (e) { return card(e, false); }).join("") : EMPTY;
  });
})();
