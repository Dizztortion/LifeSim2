(function () {
  if (typeof window === "undefined") return;
  if (!window.Game) window.Game = {};

  var items = [
    // Level 0 (starter)
    { id: "snacks", name: "Snacks", category: "Everyday", minLevel: 0, buyPrice: 1.8, sellPrice: 3.2, demand: 1.2 },
    { id: "soft_drinks", name: "Soft Drinks", category: "Everyday", minLevel: 0, buyPrice: 1.2, sellPrice: 2.2, demand: 1.1 },
    { id: "stationery", name: "Stationery", category: "Everyday", minLevel: 0, buyPrice: 0.8, sellPrice: 1.6, demand: 0.9 },
    { id: "household_basics", name: "Household Basics", category: "Everyday", minLevel: 0, buyPrice: 2.4, sellPrice: 4.4, demand: 1.0 },

    // Level 1
    { id: "toiletries", name: "Toiletries", category: "Personal care", minLevel: 1, buyPrice: 2.6, sellPrice: 5.0, demand: 0.95 },
    { id: "bakery", name: "Bakery Goods", category: "Food", minLevel: 1, buyPrice: 1.4, sellPrice: 2.6, demand: 0.9 },
    { id: "fresh_produce", name: "Fresh Produce", category: "Food", minLevel: 1, buyPrice: 1.0, sellPrice: 1.9, demand: 0.85 },

    // Level 2
    { id: "phone_accessories", name: "Phone Accessories", category: "Electronics", minLevel: 2, buyPrice: 4.0, sellPrice: 7.5, demand: 0.7 },
    { id: "headphones", name: "Headphones", category: "Electronics", minLevel: 2, buyPrice: 8.5, sellPrice: 14.0, demand: 0.55 },
    { id: "small_toys", name: "Small Toys", category: "Gifts", minLevel: 2, buyPrice: 2.2, sellPrice: 4.5, demand: 0.65 },

    // Level 3
    { id: "smartwatch", name: "Smartwatch", category: "Electronics", minLevel: 3, buyPrice: 22.0, sellPrice: 34.0, demand: 0.35 },
    { id: "kitchen_appliance", name: "Kitchen Appliance", category: "Home", minLevel: 3, buyPrice: 28.0, sellPrice: 44.0, demand: 0.3 }
  ];

  function normalizeNumber(n, fallback) {
    if (typeof n !== "number" || !isFinite(n)) return fallback;
    return n;
  }

  function getItemById(id) {
    if (!id) return null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function getUnlockedItems(level) {
    level = Math.max(0, Math.floor(normalizeNumber(level, 0)));
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if ((items[i].minLevel || 0) <= level) out.push(items[i]);
    }
    return out;
  }

  window.Game.RetailCatalog = {
    version: 1,
    items: items,
    getItemById: getItemById,
    getUnlockedItems: getUnlockedItems
  };
})();

