(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.getEducationBenefits = function (level) {
    var lvl = typeof level === "number" ? level : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;

    var lines = [];

    var creditBonus = Math.min(lvl, 6) * 5;
    lines.push("+" + creditBonus + " credit score from education");

    if (lvl >= 1) lines.push("Mining Corp unlockable (requires education L1)");
    if (lvl >= 2) lines.push("Rail Logistics unlockable (requires education L2 + Train skill 20)");

    var unlockedHere = [];
    if (window.Game && Game.Jobs && Game.Jobs.defs) {
      for (var id in Game.Jobs.defs) {
        if (!Object.prototype.hasOwnProperty.call(Game.Jobs.defs, id)) continue;
        if (id === "none") continue;
        var jd = Game.Jobs.defs[id];
        if (jd && typeof jd.minEducation === "number" && jd.minEducation === lvl) {
          unlockedHere.push(jd.name || id);
        }
      }
    }
    if (unlockedHere.length) lines.push("Jobs unlocked at L" + lvl + ": " + unlockedHere.join(", "));

    return lines;
  };

  UI.Tabs.getCourseBenefitText = function (courseId) {
    var id = String(courseId || "");
    if (id === "nightClass") return "Earn education XP toward L1+ job and company unlocks.";
    if (id === "engineering") return "Earn education XP toward L2-L3 rail career unlocks (Rail Logistics, Train Driver).";
    if (id === "business") return "Earn education XP toward L2+ higher-paying jobs and stronger credit score.";
    return "Earn education XP toward level-ups.";
  };

  UI.Tabs.renderSchoolTab = function () {
    var s = Game.state;
    var course = s.school.course ? Game.School.courses[s.school.course] : null;
    var queue = (s.school && Array.isArray(s.school.queue)) ? s.school.queue.slice() : [];
    var eduProgress = Game.School.getLevelProgressPercent();
    var neededXp = Game.School.xpForNextLevel ? Game.School.xpForNextLevel() : 0;
    var benefitLines = UI.Tabs.getEducationBenefits(s.education.level);
    var html = [];

    html.push('<div>');
    html.push('<div class="section-title">School & Education</div>');
    html.push('<div class="section-subtitle">Invest time and money into courses to unlock better jobs and companies.</div>');
    html.push('<div class="grid mt-8">');

    html.push('<div class="card">');
    html.push('<div class="card-title">Your Education</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Level</span><span id="school-level">L' + s.education.level + ' - ' + Game.getEducationLabel() + '</span></div>');
    html.push('<div class="field-row"><span>Education experience</span><span class="mono" id="school-xp">' + s.education.xp.toFixed(1) + ' / ' + neededXp.toFixed(1) + ' XP (' + eduProgress + '%)</span></div>');
    html.push('<div class="bar-label mt-4">Education experience</div>');
    html.push('<div class="progress"><div id="school-level-bar" class="progress-fill violet" style="width:' + eduProgress + '%"></div></div>');

    html.push('<div class="edu-benefit small mt-8">Current benefits:</div>');
    for (var bi = 0; bi < benefitLines.length; bi++) {
      html.push('<div class="edu-benefit small">' + benefitLines[bi] + '</div>');
    }

    html.push('</div>');
    if (s.school.enrolled && course) {
      var p = Math.floor((s.school.progress / s.school.maxProgress) * 100);
      html.push('<div class="card-section is-selected">');
      html.push('<div class="field-row"><span>Current course</span><span class="flex-row">' + course.name + '<span class="badge badge-accent">Active</span></span></div>');
      html.push('<div class="bar-label">Course progress</div>');
      html.push('<div class="progress"><div id="school-course-bar" class="progress-fill blue" style="width:' + p + '%"></div></div>');
      if (queue.length) {
        html.push('<div class="edu-benefit small mt-8">Queued courses:</div>');
        for (var qi = 0; qi < queue.length; qi++) {
          var qId = queue[qi];
          var q = Game.School.courses[qId];
          html.push('<div class="edu-benefit small">' + (qi + 1) + ". " + (q ? q.name : qId) + '</div>');
        }
      } else {
        html.push('<div class="small dim mt-8">No queued courses.</div>');
      }
      html.push('</div>');
    } else {
      html.push('<div class="card-section small dim">You are not currently enrolled in a course.</div>');
      if (queue.length) {
        html.push('<div class="card-section">');
        html.push('<div class="edu-benefit small">Queued courses:</div>');
        for (var qi2 = 0; qi2 < queue.length; qi2++) {
          var qId2 = queue[qi2];
          var q2 = Game.School.courses[qId2];
          html.push('<div class="edu-benefit small">' + (qi2 + 1) + ". " + (q2 ? q2.name : qId2) + '</div>');
        }
        html.push('</div>');
      }
    }
    html.push('</div>');

    html.push('<div class="card">');
    html.push('<div class="card-title">Available Courses</div>');
    html.push('<div class="card-section">');
    var ids = ["nightClass", "engineering", "business"];
    for (var i = 0; i < ids.length; i++) {
      var c = Game.School.courses[ids[i]];
      var active = !!(s.school && s.school.enrolled && s.school.course === c.id);
      var disabled = s.education.level < c.minEducationLevel;
      var isQueueMode = !!(s.school && s.school.enrolled && s.school.course);
      var maxQueue = 6;
      var queueFull = isQueueMode && Array.isArray(s.school.queue) && s.school.queue.length >= maxQueue;
      var btnLabel = isQueueMode ? "Queue" : "Enroll";
      html.push('<div class="card-section' + (active ? " is-selected" : "") + '" style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:6px;margin-bottom:6px;">');
      html.push('<div class="field-row"><span class="flex-row">' + c.name + (active ? '<span class="badge badge-accent">Active</span>' : '') + '</span><span>$' + c.cost.toFixed(0) + '</span></div>');
      html.push('<div class="small dim">' + c.description + '</div>');
      html.push('<div class="edu-benefit small mt-4">Benefit: ' + UI.Tabs.getCourseBenefitText(c.id) + '</div>');
      html.push('<div class="field-row small mt-4"><span>Education required</span><span>L' + c.minEducationLevel + '</span></div>');
      html.push('<div class="field-row small mt-4"><span>Duration</span><span>' + c.durationProgress + ' study units</span></div>');
      html.push('<div class="field-row small"><span>XP reward</span><span>' + c.xpReward + '</span></div>');
      html.push('<div class="mt-4"><button class="btn btn-small btn-primary btn-enroll" data-course="' + c.id + '"' + ((disabled || queueFull) ? ' disabled' : '') + '>' + btnLabel + '</button></div>');
      html.push('</div>');
    }
    html.push('</div>');
    html.push('</div>');

    html.push('<div class="card">');
    html.push('<div class="card-title">Rail Certification Exams</div>');
    html.push('<div class="card-section small dim">Required for hazardous cargo in Rail Logistics. Exam fees are paid from Rail Logistics business funds.</div>');
    html.push('<div class="card-section">');
    var rail = (s.companies && s.companies.railLogistics) ? s.companies.railLogistics : null;
    var exams = (Game.Companies && Array.isArray(Game.Companies.railExamCatalog)) ? Game.Companies.railExamCatalog : [];
    if (!rail || !rail.unlocked) {
      html.push('<div class="small dim">Rail Logistics must be unlocked before you can take these exams.</div>');
    } else if (!exams.length) {
      html.push('<div class="small dim">No exams available.</div>');
    } else {
      for (var ei = 0; ei < exams.length; ei++) {
        var ex = exams[ei];
        if (!ex) continue;
        var passed = !!(rail.certifications && rail.certifications[ex.id]);
        var req = ex.minEducation || 0;
        var fee = ex.fee || 0;
        var canEdu = s.education.level >= req;
        var canFee = (rail.funds || 0) >= fee;
        html.push('<div class="field-row small mt-4"><span>' + ex.name + '</span><span class="mono">' + (passed ? "PASSED" : ("$" + fee.toFixed(0))) + '</span></div>');
        html.push('<div class="small dim">Requires education level ' + req + ' - Unlocks ' + ex.id + ' haulage</div>');
        if (!passed) {
          var disabled = (!canEdu || !canFee) ? ' disabled' : '';
          html.push('<button class="btn btn-small btn-outline mt-4 btn-rail-exam-start"' + disabled + ' data-exam="' + ex.id + '">Start exam</button>');
          if (!canEdu) html.push('<div class="small dim">Not eligible: raise education level.</div>');
          else if (!canFee) html.push('<div class="small dim">Not enough rail business funds for the fee.</div>');
        }
      }
    }
    html.push('</div>');
    html.push('</div>');

    html.push('</div>');
    html.push('</div>');
    return html.join("");
  };

  UI.Tabs.updateSchoolDynamic = function () {
    var s = Game.state;
    var eduProgress = Game.School.getLevelProgressPercent();
    var levelEl = document.getElementById("school-level");
    var xpEl = document.getElementById("school-xp");
    if (levelEl) levelEl.textContent = "L" + s.education.level + " - " + Game.getEducationLabel();
    if (xpEl && Game.School && Game.School.xpForNextLevel) {
      var needed = Game.School.xpForNextLevel();
      xpEl.textContent = s.education.xp.toFixed(1) + " / " + needed.toFixed(1) + " XP (" + eduProgress + "%)";
    }
    var course = s.school.course ? Game.School.courses[s.school.course] : null;
    var bar = document.getElementById("school-course-bar");
    if (bar && s.school.enrolled && course) {
      var p = Math.floor((s.school.progress / s.school.maxProgress) * 100);
      bar.style.width = p + "%";
    }
  };
})();
