(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    questDefs: [
      {
        id: "get_job",
        title: "Career Ladder",
        description: "Get hired and keep leveling up your job.",
        type: "jobHas",
        target: 1,
        step: 1,
        repeatable: true,
        reward: { money: 75 }
      },
      {
        id: "education_level_1",
        title: "Night Student",
        description: "Keep increasing your education level.",
        type: "educationLevel",
        target: 1,
        step: 1,
        repeatable: true,
        reward: { money: 120 }
      },
      {
        id: "first_property",
        title: "Property Portfolio",
        description: "Buy properties and grow your portfolio.",
        type: "propertyCount",
        target: 1,
        step: 1,
        repeatable: true,
        reward: { money: 250 }
      },
      {
        id: "btc_holder",
        title: "Liquid Assets",
        description: "Hold at least 0.000001 BTC (confirmed).",
        type: "btcBalance",
        target: 0.000001,
        repeatable: true,
        scaleType: "exponential",
        scaleMultiplier: 1.5,
        reward: { btc: 0.00000100 }
      },
      {
        id: "first_company",
        title: "First Venture",
        description: "Unlock your first company.",
        type: "companiesUnlocked",
        target: 1,
        repeatable: false,
        reward: { money: 200 }
      },
      {
        id: "second_company",
        title: "Second Venture",
        description: "Unlock a second company.",
        type: "companiesUnlocked",
        target: 2,
        repeatable: false,
        reward: { money: 350 }
      },
      {
        id: "three_companies",
        title: "Business Empire",
        description: "Unlock all three companies.",
        type: "companiesUnlocked",
        target: 3,
        repeatable: false,
        reward: { money: 500 }
      },
      {
        id: "two_properties",
        title: "Two Doors",
        description: "Own 2 properties.",
        type: "propertyCount",
        target: 2,
        repeatable: false,
        reward: { money: 225 }
      },
      {
        id: "btc_saver",
        title: "Sats Saved",
        description: "Hold at least 0.00001000 BTC (confirmed).",
        type: "btcBalance",
        target: 0.00001,
        repeatable: false,
        reward: { btc: 0.00000200 }
      },
      {
        id: "buy_shovel",
        title: "Tooling Up",
        description: "Buy a Quality Coal Shovel at the Industrial Park.",
        type: "ownsItem",
        itemId: "coal-shovel",
        target: 1,
        repeatable: false,
        reward: { items: [{ id: "home-tool-set", name: "Home Tool Set", type: "hardware", requiresItemId: "coal-shovel" }] }
      },
      {
        id: "snack_stash",
        title: "Snack Stash",
        description: "Buy a Healthy Snack Pack in the City Centre.",
        type: "ownsItem",
        itemId: "health-snacks",
        target: 1,
        repeatable: false,
        reward: { money: 40 }
      },
      {
        id: "energy_pick_me_up",
        title: "Pick-Me-Up",
        description: "Buy an energy drink (Red Fang) in the City Centre.",
        type: "ownsItem",
        itemId: "drink-red-fang",
        target: 1,
        repeatable: false,
        reward: { money: 25 }
      },
      {
        id: "rig_frame_kit",
        title: "Rig Builder",
        description: "Buy a Basic Rig Frame Kit in the Industrial Park.",
        type: "ownsItem",
        itemId: "small-rig-kit",
        target: 1,
        repeatable: false,
        reward: { money: 150 }
      },
      {
        id: "home_library",
        title: "Home Library",
        description: "Buy the Book Bundle at Home.",
        type: "ownsItem",
        itemId: "home-book-bundle",
        target: 1,
        repeatable: false,
        reward: { money: 30 }
      }
    ],
  });
})();
