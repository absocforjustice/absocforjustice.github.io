/* Renders AFJ lectures from lectures-data.js, grouped by category.
   Videos load only when clicked (privacy-enhanced YouTube embed). */
(function () {
  "use strict";
  var list = (window.AFJ_LECTURES || []).filter(function (l) { return l && l.youtube; });
  var wrap = document.querySelector("[data-lectures]");
  var empty = document.querySelector("[data-lectures-empty]");
  if (!wrap) return;
  if (!list.length) { if (empty) empty.hidden = false; return; }

  function esc(s) { var d = document.createElement("div"); d.textContent = s || ""; return d.innerHTML; }
  function fmt(d) {
    if (!d) return "";
    var t = new Date(d + "T12:00:00");
    return isNaN(t) ? "" : t.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  var order = [], groups = {};
  list.forEach(function (l) {
    var c = l.category || "Lectures";
    if (!groups[c]) { groups[c] = []; order.push(c); }
    groups[c].push(l);
  });
  var rank = { "AFJ Events": 0, "Lectures": 1 };
  order.sort(function (a, b) { return (a in rank ? rank[a] : 9) - (b in rank ? rank[b] : 9); });

  wrap.innerHTML = order.map(function (c) {
    return '<h3 class="lec-cat">' + esc(c) + '</h3><div class="lec-row">' + groups[c].map(function (l) {
      var meta = [l.speaker, fmt(l.date)].filter(Boolean).map(esc).join(" &middot; ");
      return '<article class="lec-card">' +
        '<button class="lec-thumb" type="button" data-yt="' + esc(l.youtube) + '" aria-label="Play ' + esc(l.title) + '">' +
          '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(l.youtube) + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' +
          '<span class="lec-play" aria-hidden="true"></span></button>' +
        '<div class="lec-body"><h4>' + esc(l.title) + '</h4>' +
          (meta ? '<p class="lec-meta">' + meta + '</p>' : '') +
          (l.about ? '<p>' + esc(l.about) + '</p>' : '') +
          '<a class="lec-link" href="https://www.youtube.com/watch?v=' + encodeURIComponent(l.youtube) + '" target="_blank" rel="noopener">Watch on YouTube &rarr;</a>' +
        '</div></article>';
    }).join("") + '</div>';
  }).join("");

  wrap.addEventListener("click", function (e) {
    var b = e.target.closest(".lec-thumb");
    if (!b) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(b.getAttribute("data-yt")) + "?autoplay=1&rel=0";
    f.title = b.getAttribute("aria-label").replace(/^Play /, "");
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    b.replaceWith(f);
  });
})();
