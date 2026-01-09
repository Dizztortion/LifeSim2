(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    shellTemplate: function () {
      return [
        '<div class="shell">',
        '  <header class="topbar">',
        '    <div class="title-block">',
        '      <div class="logo">LifeSim</div>',
        '      <div class="music-widget">',
        '        <div class="music-marquee" id="music-track-marquee"><span id="music-track-text">Music</span></div>',
        '        <button class="btn btn-small btn-outline btn-square" id="btn-music-toggle" aria-pressed="false" title="Toggle music">â–¶</button>',
        '      </div>',
        '    </div>',
        '    <div class="topbar-stats">',
        '      <div class="stat">',
        '        <span>Money</span>',
        '        <span id="stat-money" class="stat-number">$0</span>',
        '        <span id="stat-money-forecast" class="stat-subtext">Income +$0 / Expense -$0 per day</span>',
        '      </div>',
        '      <div class="stat">',
        '        <span>BTC Holdings</span>',
        '        <span id="stat-btc" class="stat-number">0 BTC</span>',
        '        <span id="stat-btc-unconfirmed" class="stat-subtext">Unconfirmed +0.00000000 BTC</span>',
        '      </div>',
      '      <div class="stat">',
        '        <span id="stat-daytime-label">Monday</span>',
        '        <span id="stat-daytime" class="stat-number">Day 1, 08:00</span>',
        '        <span id="stat-monthyear" class="stat-subtext">MONTH 1, YEAR 2003 + 0</span>',
        '      </div>',
        '      <div class="stat">',
        '        <span>Status</span>',
        '        <span id="stat-activity" class="stat-number">Idle</span>',
        '        <div class="progress progress-status" style="margin-top:4px;"><div id="stat-activity-progress" class="progress-fill progress-fill-status" style="width:0%"></div></div>',
        '      </div>',
        '      <div class="stat stat-position">',
        '        <span>Position</span>',
        '        <div class="topbar-position" id="topbar-position" title="Position">',
        '          <div class="topbar-position-route pos-timeline" aria-label="Position">',
        '            <div class="pos-viewport" id="pos-viewport">',
        '              <div class="pos-track" id="pos-track"></div>',
        '              <span class="pos-player topbar-emoji" id="pos-player"></span>',
        '              <span class="pos-distance" id="pos-distance">0 mi</span>',
        '            </div>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="topbar-bars">',
        '      <div>',
        '        <div class="bar-label">Health</div>',
        '        <div class="progress"><div id="bar-health" class="progress-fill green"></div></div>',
        '      </div>',
        '      <div>',
        '        <div class="bar-label">Energy</div>',
        '        <div class="progress"><div id="bar-energy" class="progress-fill blue"></div></div>',
        '      </div>',
        '      <div>',
        '        <div class="bar-label">Hunger</div>',
        '        <div class="progress"><div id="bar-hunger" class="progress-fill danger"></div></div>',
        '      </div>',
        '      <div>',
        '        <div class="bar-label">Education Experience</div>',
        '        <div class="progress"><div id="bar-edu" class="progress-fill violet"></div></div>',
        '      </div>',
        '    </div>',
        '    <div class="topbar-actions">',
        '      <button class="btn btn-small btn-outline" id="btn-save">Manual Save</button>',
        '      <button class="btn btn-small btn-primary" id="btn-pc">Open PC</button>',
        '      <button class="btn btn-small btn-outline" id="btn-help">Help</button>',
        '      <button class="btn btn-small btn-outline" id="btn-settings">Settings</button>',
        '    </div>',
        '  </header>',
        '  <div class="main">',
        '    <nav class="sidebar">',
        '      ' + UI.tabButton("overview", "Overview", "Life summary") +
        '      ' + UI.tabButton("quests", "Quests", "Goals & tasks") +
        '      ' + UI.tabButton("school", "School", "Education & courses") +
        '      ' + UI.tabButton("jobs", "Jobs", "Work & promotions") +
        '      ' + UI.tabButton("companies", "Companies", "Your businesses") +
        '      ' + UI.tabButton("property", "Property", "Real estate & tenants") +
        '      ' + UI.tabButton("healthcare", "Healthcare", "Health & wellbeing") +
        '      ' + UI.tabButton("travel", "Travel", "Move around the city") +
        '      ' + UI.tabButton("btc", "BTC", "Mining & wallet") +
        '      ' + UI.tabButton("shop", "Shop", "Buy equipment") +
        '      ' + UI.tabButton("bank", "Bank", "Loans & credit", UI.getTabDisabledReason("bank")) +
        '      ' + UI.tabButton("prestige", "Prestige", "Meta progression") +
        '      ' + UI.tabButton("eventlog", "Event Log", "All notifications") +
        '    </nav>',
        '    <section id="tab-content" class="content"></section>',
        '  </div>',
        '  <div id="notification-area"></div>',
        '</div>',
        '<div id="pc-overlay" class="pc-overlay hidden">',
        '  <div class="pc-header">',
        '    <div class="pc-title">Player PC</div>',
        '    <div class="pc-header-actions">',
        '      <button class="btn btn-small btn-outline" id="btn-pc-close">Close</button>',
        '    </div>',
        '  </div>',
        '  <div class="pc-desktop" id="pc-desktop">',
        '    <div class="pc-desktop-icons" id="pc-desktop-icons" aria-label="Desktop icons"></div>',
        '    <div class="pc-desktop-widgets" id="pc-desktop-widgets" aria-label="Desktop widgets"></div>',
        '    <div class="pc-windows" id="pc-windows" aria-label="Windows"></div>',
        '    <div class="pc-context-menu hidden" id="pc-context-menu" role="menu" aria-label="PC menu"></div>',
        '    <div class="pc-start-menu hidden" id="pc-start-menu" aria-label="Start menu"></div>',
        '    <div class="pc-taskbar" id="pc-taskbar" aria-label="Taskbar">',
        '      <button class="btn btn-outline pc-taskbar-start pc-taskbar-start-big" id="pc-start-btn" type="button"><span class="pc-start-mark">⊞</span> Start</button>',
        '      <div class="pc-taskbar-windows" id="pc-taskbar-windows"></div>',
        '      <div class="pc-taskbar-tray" id="pc-taskbar-tray"></div>',
        '    </div>',
      '  </div>',
      '</div>'
      ].join("");
    },
    tabButton: function (id, label, sub, disabledReason) {
      var disabled = !!(disabledReason && disabledReason.length);
      var titleAttr = disabled ? (' title="' + String(disabledReason).replace(/\"/g, "&quot;") + '"') : "";
      return '<button class="tab-btn' + (disabled ? " disabled" : "") + '" data-tab="' + id + '"' + (disabled ? " disabled" : "") + titleAttr + '><span class="tab-label">' + label + '</span><span class="tab-sub">' + sub + '</span></button>';
    },
    _tabIntroDefs: {
      overview: {
        title: "Overview",
        sub: "Your life snapshot",
        bodyHtml: '<div class="card-section small dim">Your dashboard for daily survival and momentum.</div>' +
          '<div class="card-section small">Watch time, cash flow, health, energy, hunger, and active notifications.</div>' +
          '<div class="card-section small">Use this to spot problems early before they affect jobs or learning.</div>'
      },
      quests: {
        title: "Quests",
        sub: "Goals and rewards",
        bodyHtml: '<div class="card-section small dim">Structured goals that guide your early game.</div>' +
          '<div class="card-section small">Complete tasks to unlock rewards and build momentum.</div>' +
          '<div class="card-section small">Check back often for new objectives.</div>'
      },
      school: {
        title: "School",
        sub: "Education and unlocks",
        bodyHtml: '<div class="card-section small dim">Education unlocks higher jobs and companies.</div>' +
          '<div class="card-section small">Enroll in courses, queue multiple classes, and track XP progress.</div>' +
          '<div class="card-section small">Higher education improves credit score and career options.</div>'
      },
      jobs: {
        title: "Jobs",
        sub: "Work and promotions",
        bodyHtml: '<div class="card-section small dim">Earn steady income and job XP.</div>' +
          '<div class="card-section small">Apply to local roles, work shifts, and earn promotions.</div>' +
          '<div class="card-section small">Some jobs require education and travel to specific locations.</div>'
      },
      companies: {
        title: "Companies",
        sub: "Business operations",
        bodyHtml: '<div class="card-section small dim">Long-term money makers with unique systems.</div>' +
          '<div class="card-section small">Unlock companies through education and skills.</div>' +
          '<div class="card-section small">Manage contracts, stock, staff, and automation for compounding profits.</div>'
      },
      property: {
        title: "Property",
        sub: "Housing and tenants",
        bodyHtml: '<div class="card-section small dim">Stability and passive income.</div>' +
          '<div class="card-section small">Repair and upgrade your home for health and energy benefits.</div>' +
          '<div class="card-section small">Buy properties, fill tenants, and grow rent income.</div>'
      },
      healthcare: {
        title: "Healthcare",
        sub: "Health and recovery",
        bodyHtml: '<div class="card-section small dim">Stay alive and productive.</div>' +
          '<div class="card-section small">Use doctor visits or hospital stays to recover health and energy.</div>' +
          '<div class="card-section small">Low health or hunger can reduce job performance.</div>'
      },
      travel: {
        title: "Travel",
        sub: "Move between locations",
        bodyHtml: '<div class="card-section small dim">Location changes what you can do.</div>' +
          '<div class="card-section small">Move around the city for jobs, shopping, or services.</div>' +
          '<div class="card-section small">UK travel unlocks longâ€‘range logistics routes.</div>'
      },
      btc: {
        title: "BTC",
        sub: "Mining and wallet",
        bodyHtml: '<div class="card-section small dim">A longâ€‘term income engine.</div>' +
          '<div class="card-section small">Buy rigs, manage power costs, and sync your wallet via the PC.</div>' +
          '<div class="card-section small">Track price history to time sales.</div>'
      },
      shop: {
        title: "Shop",
        sub: "Items and upgrades",
        bodyHtml: '<div class="card-section small dim">Upgrade your toolkit and PC.</div>' +
          '<div class="card-section small">Physical items require travel; hardware upgrades refresh daily.</div>' +
          '<div class="card-section small">Better gear supports mining and productivity.</div>'
      },
      bank: {
        title: "Bank",
        sub: "Loans and deposits",
        bodyHtml: '<div class="card-section small dim">Shortâ€‘term boosts and safe storage.</div>' +
          '<div class="card-section small">Apply for loans, manage repayments, and grow deposits with interest.</div>' +
          '<div class="card-section small">Bank access is only available in the City Centre.</div>'
      },
      prestige: {
        title: "Prestige",
        sub: "Meta progression",
        bodyHtml: '<div class="card-section small dim">Permanent progression.</div>' +
          '<div class="card-section small">Reach the score target to reset for Life Experience Points.</div>' +
          '<div class="card-section small">Spend points on upgrades that speed future runs.</div>'
      },
      eventlog: {
        title: "Event Log",
        sub: "Notifications",
        bodyHtml: '<div class="card-section small dim">Your history and alerts.</div>' +
          '<div class="card-section small">Review notifications, earnings, and system messages.</div>'
      },
      settings: {
        title: "Settings",
        sub: "Save and codes",
        bodyHtml: '<div class="card-section small dim">Utility and save tools.</div>' +
          '<div class="card-section small">Redeem codes, manage save options, and tweak settings.</div>'
      }
    },
  });
})();
