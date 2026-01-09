// Override the legacy "3 emoji bar" position widget with a timeline where the player stays fixed
// and the world track moves underneath.
(function () {
  window.UI = window.UI || {};
  var UI = window.UI;

  UI.updateTopbarPosition = function () {
    try {
      if (!window.Game || !Game.state) return;
      var s = Game.state;

      var container = document.getElementById("topbar-position");
      if (!container) return;

      var viewportEl = document.getElementById("pos-viewport");
      var trackEl = document.getElementById("pos-track");
      var playerEl = document.getElementById("pos-player");
      var distEl = document.getElementById("pos-distance");
      if (!viewportEl || !trackEl || !playerEl || !distEl) return;

      function clamp(n, a, b) {
        if (n < a) return a;
        if (n > b) return b;
        return n;
      }

      var cityTravel = !!(s.travel && s.travel.inProgress);
      var ukTravel = !!(s.ukTravel && s.ukTravel.inProgress);
      var traveling = cityTravel || ukTravel;
      var mode = ukTravel ? "uk" : "city";

      var leftLabel = "";
      var rightLabel = "";
      var pct = 0;
      var milesFromHome = 0;
      var axisMiles = 0;
      var axisFrom = 0;
      var axisTo = 0;
      var nodesKey = "";

      function shortCityLabel(id) {
        var k = String(id || "");
        if (k === "Home") return "Home";
        if (k === "City Centre") return "City";
        if (k === "Industrial Park") return "Industry";
        if (k === "Hospital") return "Hospital";
        if (k === "Countryside") return "Country";
        return k;
      }

      function shortUpper(label) {
        var s2 = String(label || "");
        if (!s2) return "";
        return s2.toUpperCase();
      }

      function emojiForLabel(label) {
        try {
          if (mode === "city" && UI.getPositionLocationEmoji) return UI.getPositionLocationEmoji(label);
        } catch (e) {}
        return "\uD83D\uDCCD";
      }

      function buildTimeline(nodes) {
        trackEl.innerHTML = "";
        var nodeEls = {};
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          if (!n) continue;

          var node = document.createElement("div");
          node.className = "pos-node";
          node.setAttribute("data-pos-key", String(n.key || ""));
          node.title = String(n.label || n.key || "");

          var emoji = document.createElement("span");
          emoji.className = "pos-node-emoji topbar-emoji";
          var emojiText = String(n.emoji || "");
          emoji.textContent = emojiText ? emojiText : "\uD83D\uDCCD";

          var name = document.createElement("span");
          name.className = "pos-node-name";
          name.textContent = String(n.short || "");

          node.appendChild(emoji);
          node.appendChild(name);
          trackEl.appendChild(node);
          nodeEls[String(n.key || "")] = node;
        }
        UI._posTimeline = { mode: mode, key: nodesKey, nodes: nodes, nodeEls: nodeEls };
      }

      function ensureTimeline(nodes) {
        if (!UI._posTimeline || UI._posTimeline.mode !== mode || UI._posTimeline.key !== nodesKey) {
          buildTimeline(nodes);
          return;
        }
        UI._posTimeline.nodes = nodes;
      }

      if (cityTravel) {
        leftLabel = String((s.travel && s.travel.from) || s.travelLocation || "Home");
        rightLabel = String((s.travel && s.travel.to) || "");
        var totalT = (s.travel && s.travel.totalMinutes) || 0;
        var remainingT = (s.travel && s.travel.remainingMinutes) || 0;
        if (!(totalT > 0)) totalT = 1;
        var doneT = totalT - remainingT;
        if (doneT < 0) doneT = 0;
        if (doneT > totalT) doneT = totalT;
        pct = doneT / totalT;
      } else if (ukTravel) {
        leftLabel = UI.getPositionUkHubLabel(s.ukTravel ? s.ukTravel.fromPlaceId : "");
        rightLabel = UI.getPositionUkHubLabel(s.ukTravel ? s.ukTravel.toPlaceId : "");
        var totalU = (s.ukTravel && s.ukTravel.totalMinutes) || 0;
        var remainingU = (s.ukTravel && s.ukTravel.remainingMinutes) || 0;
        if (!(totalU > 0)) totalU = 1;
        var doneU = totalU - remainingU;
        if (doneU < 0) doneU = 0;
        if (doneU > totalU) doneU = totalU;
        pct = doneU / totalU;
      } else {
        leftLabel = "Home";
        rightLabel = String(s.travelLocation || "Home");
        pct = 0;
      }

      if (mode === "uk") {
        var tripKm = UI.getUkRouteDistanceKmForStops(s.ukTravel ? s.ukTravel.stops : null);
        var homeHub = (s.player && s.player.homePlaceId) ? String(s.player.homePlaceId) : String(s.ukTravel ? s.ukTravel.fromPlaceId : "");
        var fromHub = String(s.ukTravel ? s.ukTravel.fromPlaceId : "");
        var baseKm = (homeHub && fromHub && homeHub !== fromHub) ? UI.getUkDistanceKmBetweenHubs(homeHub, fromHub) : 0;
        milesFromHome = (baseKm + (tripKm * pct)) * 0.621371;

        var tripMiles = tripKm * 0.621371;
        if (!isFinite(tripMiles) || tripMiles < 0) tripMiles = 0;
        axisFrom = 0;
        axisTo = tripMiles;
        axisMiles = tripMiles * pct;
      } else {
        axisFrom = UI.getCityTimelineMiles(leftLabel);
        axisTo = UI.getCityTimelineMiles(rightLabel);
        axisMiles = cityTravel ? (axisFrom + ((axisTo - axisFrom) * pct)) : UI.getCityTimelineMiles(rightLabel);
        milesFromHome = Math.abs(axisMiles);
      }

      // My Journey-style: show only 2 location icons (from + to/current) with fixed spacing.
      nodesKey = mode + ":" + String(leftLabel || "") + "->" + String(rightLabel || "");
      ensureTimeline([
        {
          key: "left",
          label: leftLabel || "Start",
          short: shortUpper(mode === "city" ? shortCityLabel(leftLabel) : leftLabel),
          emoji: emojiForLabel(leftLabel),
          miles: 0
        },
        {
          key: "right",
          label: rightLabel || "Destination",
          short: shortUpper(mode === "city" ? shortCityLabel(rightLabel) : rightLabel),
          emoji: emojiForLabel(rightLabel),
          miles: 1
        }
      ]);

      if (!isFinite(milesFromHome) || milesFromHome < 0) milesFromHome = 0;
      var milesStr = (Math.round(milesFromHome * 10) / 10).toFixed(1);
      var remainingMiles = 0;
      if (traveling) {
        if (mode === "uk") remainingMiles = Math.max(0, axisTo - axisMiles);
        else remainingMiles = Math.abs(axisTo - axisMiles);
      } else {
        remainingMiles = milesFromHome;
      }
      if (!isFinite(remainingMiles) || remainingMiles < 0) remainingMiles = 0;
      distEl.textContent = (Math.round(remainingMiles * 10) / 10).toFixed(1) + " mi";

      // Player stays fixed; the track translates beneath them.
      var travelSteps = ["\uD83E\uDDCD", "\uD83D\uDEB6", "\uD83D\uDEB6", "\uD83D\uDEB4", "\uD83D\uDEB5", "\uD83C\uDFC3", "\uD83C\uDFC3"];
      var stance = "\uD83E\uDDCD";
      if (traveling) {
        var stepIdx = 1 + Math.floor(pct * (travelSteps.length - 1));
        if (stepIdx < 1) stepIdx = 1;
        if (stepIdx >= travelSteps.length) stepIdx = travelSteps.length - 1;
        stance = travelSteps[stepIdx];
      }
      playerEl.textContent = stance;

      var t = UI._posTimeline;
      if (t && t.nodes && t.nodeEls) {
        var nodeEls = t.nodeEls;
        var vw = viewportEl.clientWidth || 260;

        // Scale the timeline by real location miles so nearby places appear closer.
        var pad = 54;
        var minMiles = 0;
        var maxMiles = 1;
        try {
          if (mode === "city" && Game.World && Array.isArray(Game.World.locations) && UI.getCityTimelineMiles) {
            minMiles = Infinity;
            maxMiles = -Infinity;
            for (var mi = 0; mi < Game.World.locations.length; mi++) {
              var loc = Game.World.locations[mi];
              if (!loc || !loc.id) continue;
              var m = UI.getCityTimelineMiles(loc.id);
              if (!isFinite(m)) continue;
              if (m < minMiles) minMiles = m;
              if (m > maxMiles) maxMiles = m;
            }
            if (!isFinite(minMiles)) minMiles = 0;
            if (!isFinite(maxMiles)) maxMiles = 1;
          } else if (mode === "uk") {
            minMiles = axisFrom;
            maxMiles = axisTo;
            if (!isFinite(minMiles)) minMiles = 0;
            if (!isFinite(maxMiles) || maxMiles <= minMiles) maxMiles = minMiles + 1;
          }
        } catch (e) {
          minMiles = 0;
          maxMiles = 1;
        }
        var range = maxMiles - minMiles;
        if (!isFinite(range) || range < 0.00001) range = 1;

        var usable = Math.max(160, vw - (pad * 2));
        var pxPerMile = usable / range;
        if (!isFinite(pxPerMile) || pxPerMile <= 0) pxPerMile = 18;
        pxPerMile = clamp(pxPerMile, 10, 60);

        var trackW = (pad * 2) + (range * pxPerMile);
        trackEl.style.width = trackW.toFixed(2) + "px";

        function xFor(miles) {
          var m = miles;
          if (!isFinite(m)) m = minMiles;
          return pad + ((m - minMiles) * pxPerMile);
        }

        var leftEl = nodeEls.left;
        var rightEl = nodeEls.right;
        if (leftEl) {
          leftEl.style.left = xFor(axisFrom).toFixed(2) + "px";
          leftEl.classList.remove("is-current", "is-from", "is-to");
          if (traveling) leftEl.classList.add("is-from");
        }
        if (rightEl) {
          rightEl.style.left = xFor(axisTo).toFixed(2) + "px";
          rightEl.classList.remove("is-current", "is-from", "is-to");
          rightEl.classList.add(traveling ? "is-to" : "is-current");
        }

        var cur = axisMiles;
        if (mode === "uk") cur = clamp(axisMiles, axisFrom, axisTo);
        var centerX = vw / 2;
        var curX = xFor(cur);
        var tx = centerX - curX;
        if (!isFinite(tx)) tx = 0;
        trackEl.style.transform = "translateX(" + tx.toFixed(2) + "px)";
      }

      if (UI.normalizeTopbarEmojiSizes) UI.normalizeTopbarEmojiSizes();

      var title = "";
      if (mode === "uk") {
        title = "UK Travel: " + (leftLabel || "Start") + " \u2192 " + (rightLabel || "Destination") + " (" + Math.floor(pct * 100) + "%) \u00b7 " + milesStr + " mi from Home";
      } else if (cityTravel) {
        title = "Travel: " + (leftLabel || "Start") + " \u2192 " + (rightLabel || "Destination") + " (" + Math.floor(pct * 100) + "%) \u00b7 " + milesStr + " mi from Home";
      } else {
        title = "Position: " + (rightLabel || "Home") + " \u00b7 " + milesStr + " mi from Home";
      }
      container.title = title;
    } catch (e) {}
  };
})();
