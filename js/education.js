Game.School = {
  courses: {
    nightClass: {
      id: "nightClass",
      name: "Evening Foundation (Part-time)",
      description: "Cheap, slow but steady way to start your education.",
      durationProgress: 100,
      xpReward: 60,
      cost: Game.Economy.schoolCosts.nightClass,
      minEducationLevel: 0
    },
    engineering: {
      id: "engineering",
      name: "Rail Engineering Diploma",
      description: "Unlock advanced rail jobs and Rail Logistics company.",
      durationProgress: 140,
      xpReward: 120,
      cost: Game.Economy.schoolCosts.engineering,
      minEducationLevel: 1
    },
    business: {
      id: "business",
      name: "Business Management",
      description: "Improves business skills and helps with promotions.",
      durationProgress: 130,
      xpReward: 110,
      cost: Game.Economy.schoolCosts.business,
      minEducationLevel: 1
    }
  },
  ensureQueue: function () {
    var s = Game.state.school;
    if (!s || typeof s !== "object") {
      Game.state.school = { enrolled: false, course: null, progress: 0, maxProgress: 100, xpEarnedThisCourse: 0, queue: [] };
      s = Game.state.school;
    }
    if (!Array.isArray(s.queue)) s.queue = [];
  },
  _startCourse: function (courseId) {
    var course = Game.School.courses[courseId];
    var s = Game.state.school;
    if (!course || !s) return false;
    s.enrolled = true;
    s.course = courseId;
    s.progress = 0;
    s.maxProgress = course.durationProgress || 100;
    s.xpEarnedThisCourse = 0;
    return true;
  },
  enroll: function (id) {
    var course = Game.School.courses[id];
    var s = Game.state.school;
    if (!course) return;
    Game.School.ensureQueue();
    if (Game.blockIfSleeping && Game.blockIfSleeping("enroll in education")) return;
     if (Game.state.job && Game.state.job.isWorking) {
       Game.addNotification("Finish your work shift before enrolling in a course.");
       return;
     }
     if (Game.state.travel && Game.state.travel.inProgress) {
       Game.addNotification("Finish travelling before enrolling in a course.");
       return;
     }
    if (Game.state.education.level < course.minEducationLevel) {
      Game.addNotification("You need more prior education for this course.");
      return;
    }
    var cost = course.cost;
    if (Game.Prestige && typeof Game.Prestige.getTuitionDiscountMultiplier === "function") {
      cost = cost * Game.Prestige.getTuitionDiscountMultiplier();
    }
    cost = Math.round(cost * 100) / 100;
    if (!Game.spendMoney(cost, "Tuition for " + course.name)) {
      Game.addNotification("Not enough money for tuition.");
      return;
    }

    // If already studying, queue the course behind the current one.
    if (s.enrolled && s.course) {
      var maxQueue = 6;
      if (s.queue.length >= maxQueue) {
        Game.addNotification("Course queue is full (" + maxQueue + ").");
        Game.addMoney(cost, "Refund: tuition (queue full)");
        return;
      }
      s.queue.push(id);
      Game.addNotification("Queued: " + course.name + " (#" + s.queue.length + ")");
      if (typeof UI !== "undefined" && UI.currentTab === "school" && UI.renderCurrentTab) {
        UI.renderCurrentTab();
      }
      return;
    }

    Game.School._startCourse(id);
    Game.addNotification("Enrolled in " + course.name);
    if (typeof UI !== "undefined" && UI.currentTab === "school" && UI.renderCurrentTab) {
      UI.renderCurrentTab();
    }
  },
  tick: function (minutes) {
    var s = Game.state.school;
    if (!s.enrolled || !s.course) return;
    if (Game.isSleeping && Game.isSleeping()) return;
    Game.School.ensureQueue();
    var speed = 0.35; // progress per in-game minute
    if (Game.Prestige && typeof Game.Prestige.getCourseSpeedMultiplier === "function") {
      speed *= Game.Prestige.getCourseSpeedMultiplier();
    }
    var course = Game.School.courses[s.course];
    var maxP = s.maxProgress || (course ? course.durationProgress : 0) || 1;
    if (maxP <= 0) maxP = 1;
    var before = s.progress || 0;
    var deltaProgress = minutes * speed;
    var remaining = maxP - before;
    if (deltaProgress > remaining) deltaProgress = remaining;
    if (deltaProgress < 0) deltaProgress = 0;
    s.progress = before + deltaProgress;

    // Earn education XP continuously, proportional to course completion.
    var totalXp = course ? (course.xpReward || 0) : 80;
    var xpPerProgress = totalXp / maxP;
    var xpGain = deltaProgress * xpPerProgress;
    if (typeof s.xpEarnedThisCourse !== "number") s.xpEarnedThisCourse = 0;
    if (xpGain > 0) {
      Game.state.education.xp += xpGain;
      s.xpEarnedThisCourse += xpGain;
      Game.School.checkLevelUp();
    }

    if (s.progress >= maxP - 0.00001) {
      var completedCourseId = s.course;
      s.enrolled = false;
      s.progress = 0;
      var earned = typeof s.xpEarnedThisCourse === "number" ? s.xpEarnedThisCourse : totalXp;
      Game.addNotification("Completed " + (course ? course.name : "course") + " (+" + earned.toFixed(1) + " education XP)");
      s.course = null;
      s.xpEarnedThisCourse = 0;
      if (Game.Prestige && typeof Game.Prestige.recordEduCourseRun === "function") {
        Game.Prestige.recordEduCourseRun(completedCourseId);
      }

      // Auto-start next queued course if present.
      if (Array.isArray(s.queue) && s.queue.length > 0) {
        var nextId = s.queue.shift();
        var nextCourse = Game.School.courses[nextId];
        if (nextCourse) {
          Game.School._startCourse(nextId);
          Game.addNotification("Next course started: " + nextCourse.name);
        } else {
          Game.addNotification("A queued course is no longer available and was skipped.");
        }
      }

      // Refresh the School tab so the completed/next course state is visible immediately.
      if (typeof UI !== "undefined" && UI.currentTab === "school" && UI.renderCurrentTab) {
        UI.renderCurrentTab();
      }
    }
  },
  xpForNextLevel: function () {
    var lvl = Game.state.education.level;
    return 80 + lvl * 60;
  },
  checkLevelUp: function () {
    var e = Game.state.education;
    var needed = Game.School.xpForNextLevel();
    while (e.xp >= needed) {
      e.xp -= needed;
      e.level += 1;
      Game.addNotification("Education level up! Now level " + e.level + " (" + Game.getEducationLabel() + ")");
      needed = Game.School.xpForNextLevel();
    }
  },
  getLevelProgressPercent: function () {
    var e = Game.state.education;
    var needed = Game.School.xpForNextLevel();
    if (needed <= 0) return 0;
    var ratio = e.xp / needed;
    if (ratio > 1) ratio = 1;
    return Math.floor(ratio * 100);
  }
};
