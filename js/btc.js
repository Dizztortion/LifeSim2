Game.Btc = {
  ensureWalletState: function () {
    if (!Game.state.btc || !Game.state.btc.wallet) return;
    if (!Game.state.btc || typeof Game.state.btc !== "object") Game.state.btc = {};
    if (!Array.isArray(Game.state.btc.pendingCredits)) Game.state.btc.pendingCredits = [];
    if (!Game.state.btc.chain || typeof Game.state.btc.chain !== "object") {
      // Keep the network chain height simple and stable: base height + user interactions.
      var baseHeight = 100;
      Game.state.btc.chain = { baseHeight: baseHeight, height: baseHeight, clickCount: 0 };
    }
    var w = Game.state.btc.wallet;

    // Legacy migration (old saves used huge heights + percent progress)
    if (typeof w.chainHeight === "number" && w.chainHeight > 100000) {
      w.chainHeight = 0;
      w.targetHeight = 0;
      w.syncProgress = 0;
      w.isSyncing = false;
      w.syncDownloadId = null;
    }

    if (typeof w.isInstalled !== "boolean") w.isInstalled = false;
    if (typeof w.isSyncing !== "boolean") w.isSyncing = false;
    if (typeof w.syncProgress !== "number") w.syncProgress = 0;
    if (typeof w.chainHeight !== "number") w.chainHeight = 0;
    if (typeof w.targetHeight !== "number") w.targetHeight = 0;
    if (typeof w.lastSyncDay !== "number") w.lastSyncDay = 0;
    if (typeof w.clientSizeMb !== "number") w.clientSizeMb = 65;
    if (w.clientSizeMb > 65) w.clientSizeMb = 65;
    if (typeof w.blockSizeMb !== "number") w.blockSizeMb = 0.5;
    if (typeof w.blockSizeMaxMb !== "number") w.blockSizeMaxMb = 1.6;
    if (typeof w.chainStorageMb !== "number") w.chainStorageMb = 0;
    if (typeof w.syncDownloadId === "undefined") w.syncDownloadId = null;
    if (typeof w.autoSyncDaily !== "boolean") w.autoSyncDaily = false;

    // Legacy migration: if unconfirmed existed but no pending entries, keep it as a single pending credit.
    if (Game.state.unconfirmedBtc > 0 && Game.state.btc.pendingCredits.length === 0) {
      var seedHeight = (typeof w.targetHeight === "number" && w.targetHeight > 0) ? w.targetHeight : (Game.Btc.getNetworkHeight ? Game.Btc.getNetworkHeight() : 0);
      Game.state.btc.pendingCredits.push({ amount: Game.state.unconfirmedBtc, confirmHeight: seedHeight, reason: "Legacy unconfirmed" });
    }
  },
  ensureChainState: function () {
    Game.Btc.ensureWalletState();
    if (!Game.state.btc || typeof Game.state.btc !== "object") Game.state.btc = {};
    if (!Game.state.btc.chain || typeof Game.state.btc.chain !== "object") {
      Game.state.btc.chain = { baseHeight: 100, height: 100, clickCount: 0 };
    }
    var c = Game.state.btc.chain;
    var desiredBase = 100;
    if (typeof c.baseHeight !== "number" || c.baseHeight < 0) c.baseHeight = desiredBase;
    if (typeof c.height !== "number") c.height = c.baseHeight;
    if (typeof c.clickCount !== "number" || c.clickCount < 0) c.clickCount = Math.max(0, Math.floor(c.height - c.baseHeight));

    // Migration: old saves used a much higher base height; keep only the "extra" blocks as clickCount.
    if (c.baseHeight !== desiredBase) {
      var clicks = Math.max(0, Math.floor(c.clickCount || (c.height - c.baseHeight)));
      c.baseHeight = desiredBase;
      c.clickCount = clicks;
      c.height = desiredBase + clicks;
    } else {
      // Keep height consistent with clickCount.
      c.clickCount = Math.max(0, Math.floor(c.clickCount || 0));
      c.height = desiredBase + c.clickCount;
    }
  },
  onUserButtonClick: function () {
    Game.Btc.ensureChainState();
    Game.state.btc.chain.height += 1;
    Game.state.btc.chain.clickCount += 1;
  },
  getBlockSizeMb: function (height) {
    Game.Btc.ensureChainState();
    var h = typeof height === "number" ? Math.floor(height) : 0;
    if (!isFinite(h) || h < 0) h = 0;
    var base = Game.state.btc.chain.baseHeight || 0;
    var idx = Math.max(0, h - base);

    // Deterministic, generally increasing size with mild variation.
    var trend = 0.35 + Math.min(2.9, Math.log(1 + (idx / 120)) * 0.65);
    var wobble = ((Math.sin(idx * 0.18) + 1) * 0.5) * 0.12 + ((Math.sin(idx * 0.035) + 1) * 0.5) * 0.08;

    // Scale down the curve by 4x, then randomize per-block size to 70–100% of the intended value.
    var curveScale = 0.25;
    var minSize = 0.01;
    var maxSize = 4.5 * curveScale;

    var intendedSize = (trend + wobble) * curveScale;
    if (intendedSize < minSize) intendedSize = minSize;
    if (intendedSize > maxSize) intendedSize = maxSize;

    // Deterministic pseudo-random in [0, 1) based on block index.
    var r = Math.sin((idx + 1) * 12.9898 + 78.233) * 43758.5453123;
    r = r - Math.floor(r);
    var minMult = 0.7;
    var mult = minMult + (1 - minMult) * r;
    var rawSize = intendedSize * mult;

    // Quantize to 0.01 MB while keeping the result within 70–100% of intendedSize.
    var size = Math.round(rawSize * 100) / 100;
    var minAllowed = intendedSize * minMult;
    if (size < minAllowed) size = Math.ceil(minAllowed * 100) / 100;
    if (size > intendedSize) size = Math.floor(intendedSize * 100) / 100;

    if (size < minSize) size = minSize;
    if (size > maxSize) size = maxSize;
    return size;
  },
  recordPendingCredit: function (amount, reason) {
    Game.Btc.ensureWalletState();
    Game.Btc.ensureChainState();
    var a = typeof amount === "number" ? amount : 0;
    if (!isFinite(a) || a === 0) return;
    if (a < 0) return;

    var confirmHeight = Game.Btc.getNetworkHeight() + 1;
    Game.state.btc.pendingCredits.push({
      amount: a,
      confirmHeight: confirmHeight,
      reason: reason || "Unconfirmed"
    });
    Game.state.unconfirmedBtc += a;

    var w = Game.state.btc.wallet;
    if (w && w.isInstalled && (w.chainHeight || 0) >= confirmHeight) {
      Game.Btc.confirmUpToHeight(w.chainHeight || 0);
    }
  },
  confirmUpToHeight: function (height) {
    Game.Btc.ensureWalletState();
    var h = typeof height === "number" ? Math.floor(height) : 0;
    if (!isFinite(h) || h < 0) h = 0;

    var list = Game.state.btc.pendingCredits;
    if (!Array.isArray(list) || list.length === 0) return;

    var confirmed = 0;
    for (var i = list.length - 1; i >= 0; i--) {
      var tx = list[i];
      if (!tx || typeof tx.amount !== "number" || !(tx.amount > 0)) {
        list.splice(i, 1);
        continue;
      }
      var ch = typeof tx.confirmHeight === "number" ? tx.confirmHeight : 0;
      if (ch <= h) {
        confirmed += tx.amount;
        list.splice(i, 1);
      }
    }
    if (confirmed > 0) {
      Game.state.btcBalance += confirmed;
      Game.state.unconfirmedBtc -= confirmed;
      if (Game.state.unconfirmedBtc < 0) Game.state.unconfirmedBtc = 0;
      if (window.UI && UI.animateNumber) UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
    }
  },
  ensurePcMinerState: function () {
    if (!Game.state.btc) return;
    if (typeof Game.state.btc.minerSoftwareLevel !== "number" || Game.state.btc.minerSoftwareLevel < 0) {
      // Migrate legacy per-miner softwareLevel into a shared suite level.
      var legacy = (Game.state.btc.pcMiner && typeof Game.state.btc.pcMiner.softwareLevel === "number") ? Game.state.btc.pcMiner.softwareLevel : 0;
      if (!isFinite(legacy) || legacy < 0) legacy = 0;
      Game.state.btc.minerSoftwareLevel = legacy;
    }
    if (!Game.state.btc.pcMiner || typeof Game.state.btc.pcMiner !== "object") {
      Game.state.btc.pcMiner = {
        isOn: false,
        coinId: "BTC",
        caseLevel: 0,
        fansLevel: 0,
        psuLevel: 0,
        cpuLevel: 0,
        gpuLevel: 0,
        softwareLevel: 0,
        heat: 20,
        lastPowerCostPerDay: 0,
        lastHashrate: 0
      };
    }
    var p = Game.state.btc.pcMiner;
    if (typeof p.isOn !== "boolean") p.isOn = false;
    if (typeof p.coinId !== "string") p.coinId = "BTC";
    if (typeof p.caseLevel !== "number") p.caseLevel = 0;
    if (typeof p.fansLevel !== "number") p.fansLevel = 0;
    if (typeof p.psuLevel !== "number") p.psuLevel = 0;
    if (typeof p.cpuLevel !== "number") p.cpuLevel = 0;
    if (typeof p.gpuLevel !== "number") p.gpuLevel = 0;
    // Mirror shared suite level onto the legacy field for UI/back-compat.
    if (typeof p.softwareLevel !== "number") p.softwareLevel = 0;
    p.softwareLevel = Game.state.btc.minerSoftwareLevel || 0;
    if (typeof p.heat !== "number") p.heat = 20;
    if (p.heat < 0) p.heat = 0;
    if (typeof p.lastPowerCostPerDay !== "number") p.lastPowerCostPerDay = 0;
    if (typeof p.lastHashrate !== "number") p.lastHashrate = 0;

    // Clamp upgrade levels to motherboard limits when available.
    if (Game.PC && Game.PC.getMaxCpuLevel && Game.PC.getMaxGpuLevel && Game.PC.getMaxRamLevel) {
      var maxCpu = Game.PC.getMaxCpuLevel();
      var maxGpu = Game.PC.getMaxGpuLevel();
      if (p.cpuLevel > maxCpu) p.cpuLevel = maxCpu;
      if (p.gpuLevel > maxGpu) p.gpuLevel = maxGpu;
      if (Game.state.btc.minerSoftwareLevel > maxCpu) Game.state.btc.minerSoftwareLevel = maxCpu;
      p.softwareLevel = Game.state.btc.minerSoftwareLevel;
    }
  },
  getMinerSoftwareMult: function () {
    Game.Btc.ensurePcMinerState();
    var lvl = (Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    return 1 + lvl * 0.12;
  },
  getDebugMiningMultiplier: function () {
    var mult = 1;
    if (Game.state && Game.state.debug && typeof Game.state.debug.btcMiningMultiplier !== "undefined") {
      mult = parseFloat(Game.state.debug.btcMiningMultiplier);
      if (!isFinite(mult)) mult = 1;
    }
    if (mult < 0) mult = 0;
    if (mult > 1000) mult = 1000;
    return mult;
  },
  getPcMinerStats: function () {
    Game.Btc.ensurePcMinerState();
    var p = Game.state.btc.pcMiner;

    var maxCpu = (Game.PC && Game.PC.getMaxCpuLevel) ? Game.PC.getMaxCpuLevel() : 4;
    var maxGpu = (Game.PC && Game.PC.getMaxGpuLevel) ? Game.PC.getMaxGpuLevel() : 4;
    var maxSw = maxCpu; // keep simple: software tied to CPU cap

    var cpuLevels = [0.0, 1.2, 2.6, 4.6, 7.2, 10.5, 15.0];
    var gpuLevels = [0.0, 3.5, 8.5, 16.5, 28.0, 42.0, 62.0];
    var cpuIdx = Math.max(0, Math.min(cpuLevels.length - 1, Math.min(maxCpu, p.cpuLevel || 0)));
    var gpuIdx = Math.max(0, Math.min(gpuLevels.length - 1, Math.min(maxGpu, p.gpuLevel || 0)));
    var cpuHash = cpuLevels[cpuIdx];
    var gpuHash = gpuLevels[gpuIdx];
    var swLvl = (Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : (p.softwareLevel || 0);
    if (!isFinite(swLvl) || swLvl < 0) swLvl = 0;
    if (swLvl > maxSw) swLvl = maxSw;
    var softwareMult = 1 + swLvl * 0.12;
    var baseHash = (cpuHash + gpuHash) * softwareMult;

    var fanCooling = 1 + Math.max(0, Math.min(3, p.fansLevel || 0)) * 0.75;
    var caseCooling = 1 + Math.max(0, Math.min(3, p.caseLevel || 0)) * 0.5;
    var cooling = fanCooling * caseCooling;
    var maxHeat = 65 + (p.caseLevel || 0) * 10 + (p.fansLevel || 0) * 10;

    var psuCapWatts = 200 + Math.max(0, Math.min(3, p.psuLevel || 0)) * 220;
    var watts = 90 + (p.cpuLevel || 0) * 45 + (p.gpuLevel || 0) * 95 + (p.fansLevel || 0) * 8;
    if (watts < 40) watts = 40;
    var powerMult = watts > psuCapWatts ? (psuCapWatts / watts) : 1;

    var heat = p.heat || 0;
    var throttle = 1;
    if (heat > maxHeat) {
      throttle = Math.max(0.05, 1 - ((heat - maxHeat) / 35));
    }

    // RAM impacts sustained mining; low RAM throttles hashrate.
    var ramMb = (Game.PC && Game.PC.getRamCapacityMb) ? Game.PC.getRamCapacityMb() : 2048;
    if (typeof ramMb !== "number" || !isFinite(ramMb) || ramMb <= 0) ramMb = 2048;
    var ramNeed = 900 + (p.gpuLevel || 0) * 520 + (swLvl || 0) * 260 + (p.cpuLevel || 0) * 140;
    var ramMult = 1;
    if (ramMb < ramNeed) {
      ramMult = Math.max(0.25, ramMb / ramNeed);
    }

    var effectiveHash = baseHash * powerMult * throttle * ramMult;
    var powerCostPerDay = Math.max(0, Math.round((watts / 25) * 10) / 10);

    return {
      baseHashrate: baseHash,
      hashrate: effectiveHash,
      softwareLevel: swLvl,
      softwareMult: softwareMult,
      watts: watts,
      psuCapWatts: psuCapWatts,
      powerMult: powerMult,
      powerCostPerDay: powerCostPerDay,
      heat: heat,
      maxHeat: maxHeat,
      throttle: throttle,
      cooling: cooling,
      ramNeedMb: ramNeed,
      ramMb: ramMb,
      ramMult: ramMult
    };
  },
  togglePcMining: function () {
    Game.Btc.ensurePcMinerState();
    var p = Game.state.btc.pcMiner;
    p.isOn = !p.isOn;
    Game.addNotification("PC mining " + (p.isOn ? "ON" : "OFF") + ".");
  },
  tickPcMining: function (seconds) {
    Game.Btc.ensurePcMinerState();
    var p = Game.state.btc.pcMiner;
    var stats = Game.Btc.getPcMinerStats();
    var heat = stats.heat;
    var coinId = String(p.coinId || "BTC").toUpperCase();

    if (p.isOn) {
      // Heat rises with load; cooling offsets it.
      heat += ((stats.watts / 220) * 0.18 - (stats.cooling * 0.10)) * seconds;
      if (heat < 0) heat = 0;
      if (heat > 120) heat = 120;
      p.heat = heat;

      // Recompute throttle with updated heat.
      stats = Game.Btc.getPcMinerStats();
      var debugMult = Game.Btc.getDebugMiningMultiplier ? Game.Btc.getDebugMiningMultiplier() : 1;
      var yieldMult = 1;
      if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
        yieldMult = Game.Prestige.getMiningYieldMultiplier();
      }
      var btcPerSecond = stats.hashrate * 0.00000000035 * debugMult * yieldMult;
      if (btcPerSecond > 0) {
        if (coinId === "BTC") {
          Game.addBtc(btcPerSecond * seconds, "PC mining");
        } else if (Game.Crypto && Game.Crypto.ensureState) {
          Game.Crypto.ensureState();
          var coin = Game.state.crypto && Game.state.crypto.coins ? Game.state.crypto.coins[coinId] : null;
          var hasMiner = coin && coin.miner && coin.miner.isInstalled;
          if (hasMiner) {
            // Simple relative yield scaling vs BTC (gamey, not realistic).
            var mult = (coinId === "LTC") ? 120 : (coinId === "DOGE" ? 550 : 50);
            var altPerSecond = btcPerSecond * mult;
            if (Game.Crypto.addUnconfirmed) Game.Crypto.addUnconfirmed(coinId, altPerSecond * seconds, "PC mining");
          }
        }
      }
      p.lastPowerCostPerDay = stats.powerCostPerDay;
      p.lastHashrate = stats.hashrate;
    } else {
      // Passive cooldown.
      heat -= stats.cooling * 0.18 * seconds;
      if (heat < 0) heat = 0;
      p.heat = heat;
      p.lastHashrate = 0;
    }
  },
  getNetworkHeight: function () {
    Game.Btc.ensureChainState();
    return Game.state.btc.chain.height;
  },
  processWalletDownloads: function () {
    if (!Game.state || !Game.state.pc || !Array.isArray(Game.state.pc.downloads)) return;
    Game.Btc.ensureWalletState();
    var w = Game.state.btc.wallet;
    var list = Game.state.pc.downloads;
    for (var i = list.length - 1; i >= 0; i--) {
      var d = list[i];
      if (!d || d.status !== "complete") continue;

      if (d.kind === "btc_wallet_client") {
        w.isInstalled = true;
        Game.addNotification("BTC wallet client downloaded.");
        list.splice(i, 1);
        continue;
      }

      if (d.kind === "btc_chain_sync" && w.syncDownloadId && d.id === w.syncDownloadId) {
        w.chainHeight = d.targetHeight;
        w.targetHeight = d.targetHeight;
        w.isSyncing = false;
        w.syncProgress = 100;
        w.lastSyncDay = Game.state.day;
        w.syncDownloadId = null;
        Game.addNotification("Wallet fully synced.");
        list.splice(i, 1);
        continue;
      }
    }
  },
  ensureMiningRewardScale: function () {
    var btc = Game.state && Game.state.btc ? Game.state.btc : null;
    if (!btc) return;
    if (btc.miningRewardsScaled100) return;
    if (btc.cloud && Array.isArray(btc.cloud.contracts)) {
      for (var i = 0; i < btc.cloud.contracts.length; i++) {
        var c = btc.cloud.contracts[i];
        if (c && typeof c.dailyBtc === "number") {
          c.dailyBtc = c.dailyBtc / 100;
        }
      }
    }
    btc.miningRewardsScaled100 = true;
  },
  openWallet: function () {
    Game.Btc.ensureWalletState();
    Game.Btc.ensureChainState();
    var w = Game.state.btc.wallet;
    w.isOpen = true;
    if (!w.isInstalled) {
      Game.addNotification("Wallet client not installed. Download it from the internet first.");
      return;
    }
    var networkHeight = Game.Btc.getNetworkHeight();
    if (typeof w.chainHeight !== "number" || w.chainHeight < 0) w.chainHeight = 0;
    if (w.chainHeight > networkHeight) w.chainHeight = networkHeight;

    if (w.syncDownloadId && Game.Downloads && Game.Downloads.getById) {
      var existing = Game.Downloads.getById(w.syncDownloadId);
      if (existing && existing.kind === "btc_chain_sync" && existing.status === "downloading") {
        w.isSyncing = true;
        w.targetHeight = existing.targetHeight || networkHeight;
        return;
      }
    }

    // Manual sync: opening the wallet should NOT auto-start syncing.
    // If a sync download is already active, keep showing that state (handled above).
    w.isSyncing = false;
    w.targetHeight = networkHeight;
    var denomManual = Math.max(1, w.targetHeight || 1);
    w.syncProgress = Math.max(0, Math.min(100, Math.floor(((w.chainHeight || 0) / denomManual) * 100)));
    Game.Btc.confirmUpToHeight(w.chainHeight || 0);
    return;

    // Create a discrete, block-based sync task (download) if needed.
    if (w.chainHeight < networkHeight) {
      var id = "btc-chain-sync";
      w.isSyncing = true;
      w.syncProgress = 0;
      w.targetHeight = networkHeight;
      w.lastSyncDay = Game.state.day;
      w.syncDownloadId = id;
      var totalBlocks = networkHeight - w.chainHeight;
      if (Game.Downloads && Game.Downloads.startChainSync) {
        Game.Downloads.startChainSync({
          id: id,
          name: "BTC blockchain sync",
          startHeight: w.chainHeight,
          targetHeight: networkHeight,
          totalBlocks: totalBlocks,
          blockSizeMb: w.blockSizeMb || 0.5,
          blockSizeMaxMb: w.blockSizeMaxMb || 1.6
        });
      }
      Game.addNotification("Wallet opened. Syncing blocks " + w.chainHeight + " → " + networkHeight + "…");
    } else {
      w.isSyncing = false;
      w.syncProgress = 100;
    }
  },
  startWalletSync: function () {
    Game.Btc.ensureWalletState();
    Game.Btc.ensureChainState();
    var w = Game.state.btc.wallet;
    if (!w.isInstalled) {
      Game.addNotification("Wallet client not installed. Download it first.");
      return;
    }
    var networkHeight = Game.Btc.getNetworkHeight();
    if (typeof w.chainHeight !== "number" || w.chainHeight < 0) w.chainHeight = 0;
    if (w.chainHeight > networkHeight) w.chainHeight = networkHeight;

    if (w.syncDownloadId && Game.Downloads && Game.Downloads.getById) {
      var existing = Game.Downloads.getById(w.syncDownloadId);
      if (existing && existing.kind === "btc_chain_sync" && existing.status === "downloading") {
        w.isSyncing = true;
        w.targetHeight = existing.targetHeight || networkHeight;
        return;
      }
    }

    if (w.chainHeight >= networkHeight) {
      w.isSyncing = false;
      w.targetHeight = networkHeight;
      w.syncProgress = 100;
      Game.addNotification("Wallet is already synced.");
      return;
    }

    var id = "btc-chain-sync";
    w.isSyncing = true;
    w.syncProgress = 0;
    w.targetHeight = networkHeight;
    w.syncDownloadId = id;
    var totalBlocks = networkHeight - w.chainHeight;
    if (Game.Downloads && Game.Downloads.startChainSync) {
      Game.Downloads.startChainSync({
        id: id,
        name: "BTC blockchain sync",
        startHeight: w.chainHeight,
        targetHeight: networkHeight,
        totalBlocks: totalBlocks,
        blockSizeMb: w.blockSizeMb || 0.5,
        blockSizeMaxMb: w.blockSizeMaxMb || 1.6
      });
    }
    Game.addNotification("Sync started: blocks " + w.chainHeight + " -> " + networkHeight + ".");
  },
  resyncWallet: function () {
    Game.Btc.ensureWalletState();
    Game.Btc.ensureChainState();
    var w = Game.state.btc.wallet;
    if (!w.isInstalled) {
      Game.addNotification("Wallet client not installed. Download it first.");
      return;
    }

    var target = (typeof w.targetHeight === "number" && w.targetHeight > 0) ? Math.floor(w.targetHeight) : Game.Btc.getNetworkHeight();
    if (!isFinite(target) || target < 0) target = 0;

    // Stop any active sync task.
    if (w.syncDownloadId && Game.Downloads && Game.Downloads.remove) {
      Game.Downloads.remove(w.syncDownloadId);
    }
    w.syncDownloadId = null;

    // Delete local chain data and re-download from height 0.
    if (typeof w.chainStorageMb === "number" && w.chainStorageMb > 0 && Game.PCStorage && Game.PCStorage.freeMb) {
      Game.PCStorage.freeMb(w.chainStorageMb);
    }
    w.chainStorageMb = 0;

    w.chainHeight = 0;
    w.syncProgress = 0;
    w.isSyncing = true;
    w.targetHeight = target;
    w.lastSyncDay = Game.state.day;
    w.syncDownloadId = "btc-chain-sync";

    if (Game.Downloads && Game.Downloads.startChainSync) {
      Game.Downloads.startChainSync({
        id: w.syncDownloadId,
        name: "BTC blockchain sync",
        startHeight: 0,
        targetHeight: target,
        totalBlocks: target,
        blockSizeMb: w.blockSizeMb || 0.5,
        blockSizeMaxMb: w.blockSizeMaxMb || 1.6
      });
    }

    Game.addNotification("Resync started. Syncing blocks 0 ƒÅ' " + target + "ƒ?İ");
  },
  closeWallet: function () {
    Game.state.btc.wallet.isOpen = false;
  },
  startWalletDownload: function () {
    Game.Btc.ensureWalletState();
    if (!Game.Downloads || !Game.Downloads.startFileDownload) return;
    var w = Game.state.btc.wallet;
    if (w.isInstalled) {
      Game.addNotification("Wallet client already installed.");
      return;
    }
    var sizeMb = w.clientSizeMb || 65;
    var d = Game.Downloads.startFileDownload({
      id: "btc-wallet-client",
      kind: "btc_wallet_client",
      name: "BTC Wallet Client",
      sizeMb: sizeMb
    });
    if (d) {
      Game.addNotification("Started wallet client download (" + Math.round(sizeMb) + " MB).");
    }
  },
  buyRig: function () {
    var cost = 2200 + Game.state.btc.mining.rigsOwned * 400;
    if (!Game.spendMoney(cost, "Bought BTC mining rig")) {
      Game.addNotification("Not enough money to buy a mining rig.");
      return;
    }
    Game.state.btc.mining.rigsOwned += 1;
    Game.state.inventory.push({ id: "rig-" + Game.state.btc.mining.rigsOwned, name: "BTC Mining Rig", type: "hardware", source: "shop" });
    Game.addNotification("New BTC mining rig installed.");
  },
  toggleRigPower: function () {
    if (Game.state.btc.mining.rigsOwned <= 0) {
      Game.addNotification("You don't own any rigs yet.");
      return;
    }
    Game.state.btc.mining.isPowerOn = !Game.state.btc.mining.isPowerOn;
    Game.addNotification("Mining rig power " + (Game.state.btc.mining.isPowerOn ? "ON" : "OFF") + ".");
  },
  getCloudContractPackages: function () {
    if (Game.Btc._cloudContractPackages && Game.Btc._cloudContractPackages.length === 20) {
      return Game.Btc._cloudContractPackages;
    }
    var minHash = 30000;
    var maxHash = 500000;
    var steps = 20;
    var ratio = Math.pow(maxHash / minHash, 1 / Math.max(1, steps - 1));
    var out = [];
    for (var i = 0; i < steps; i++) {
      var h = minHash * Math.pow(ratio, i);
      h = Math.round(h / 1000) * 1000;
      if (i === 0) h = minHash;
      if (i === steps - 1) h = maxHash;
      var giftCount = 0;
      if (i >= 8 && i < 15) giftCount = 1;
      if (i >= 15) giftCount = 2;
      out.push({ idx: i, hashrate: h, giftCount: giftCount });
    }
    Game.Btc._cloudContractPackages = out;
    return out;
  },
  _resolveCloudContractPackage: function (hashrateOrIndex) {
    var pkgs = Game.Btc.getCloudContractPackages();
    if (!pkgs || !pkgs.length) return { idx: 0, hashrate: 30000, giftCount: 0 };
    var v = typeof hashrateOrIndex === "number" ? hashrateOrIndex : null;
    if (v !== null && isFinite(v)) {
      var vi = Math.floor(v);
      if (vi === v && vi >= 0 && vi < pkgs.length) return pkgs[vi];
      // Treat as hashrate; snap to nearest package.
      var best = pkgs[0];
      var bestD = Math.abs((best.hashrate || 0) - v);
      for (var i = 1; i < pkgs.length; i++) {
        var d = Math.abs((pkgs[i].hashrate || 0) - v);
        if (d < bestD) {
          best = pkgs[i];
          bestD = d;
        }
      }
      return best;
    }
    return pkgs[0];
  },
  getCloudContractTierDefs: function (payWith) {
    var method = String(payWith || "USD").toUpperCase();
    var isCrypto = method === "BTC" || method === "USDT";
    if (!isCrypto) {
      return {
        bronze: { id: "bronze", name: "Bronze", days: 20 },
        silver: { id: "silver", name: "Silver", days: 40 },
        gold: { id: "gold", name: "Gold", days: 60 }
      };
    }
    return {
      satSprint: { id: "satSprint", name: "Sat Sprint", days: 7 },
      bitBurst: { id: "bitBurst", name: "Bit Burst", days: 14 },
      hashRun: { id: "hashRun", name: "Hash Run", days: 30 },
      blockRide: { id: "blockRide", name: "Block Ride", days: 45 },
      chainBuilder: { id: "chainBuilder", name: "Chain Builder", days: 60 },
      ledgerLegend: { id: "ledgerLegend", name: "Ledger Legend", days: 90 }
    };
  },
  _resolveCloudContractTier: function (tierId, payWith) {
    var id = String(tierId || "").trim();
    var method = String(payWith || "USD").toUpperCase();
    var primary = Game.Btc.getCloudContractTierDefs(method) || {};
    if (primary[id]) return primary[id];
    // Back-compat: allow buying bronze/silver/gold even when paying with crypto (or vice versa).
    var fallbackMethod = (method === "USD") ? "BTC" : "USD";
    var secondary = Game.Btc.getCloudContractTierDefs(fallbackMethod) || {};
    return secondary[id] || null;
  },
  quoteCloudContract: function (tierId, hashrateOrIndex, payWith) {
    var baseHash = 30000; // hashes/sec
    var baseDays = 20;
    var baseDaily = 0.0000008 * 3; // BTC/day at baseHash
    var basePriceUsd = 18 + 10; // USD at baseHash for baseDays

    var method = String(payWith || "USD").toUpperCase();
    var isCrypto = method === "BTC" || method === "USDT";

    var tier = Game.Btc._resolveCloudContractTier(tierId, method);
    if (!tier) return null;
    var pkg = Game.Btc._resolveCloudContractPackage(hashrateOrIndex);
    var targetHash = pkg.hashrate || baseHash;
    var hashUnits = targetHash / baseHash;
    if (!isFinite(hashUnits) || hashUnits <= 0) hashUnits = 1;

    var days = typeof tier.days === "number" ? Math.floor(tier.days) : baseDays;
    if (!isFinite(days) || days < 1) days = baseDays;

    var dailyBtc = baseDaily * hashUnits;
    // Price scales progressively with hashrate so higher tiers have worse ROI (the cheapest remains unchanged).
    var priceHashUnits = hashUnits;
    if (priceHashUnits > 1) {
      priceHashUnits = Math.pow(priceHashUnits, 1.28);
    }
    var priceUsd = basePriceUsd * priceHashUnits * (days / baseDays);

    var discountApplied = false;
    var discountPct = 0;
    if (isCrypto && days === 60) {
      discountApplied = true;
      discountPct = 65;
      priceUsd = priceUsd * 0.35;
    }
    priceUsd = Math.max(0, Math.round(priceUsd * 100) / 100);

    return {
      method: method,
      tierId: tier.id,
      tierName: tier.name,
      days: days,
      hashrate: targetHash,
      giftCount: pkg.giftCount || 0,
      dailyBtc: dailyBtc,
      priceUsd: priceUsd,
      discountApplied: discountApplied,
      discountPct: discountPct
    };
  },
  // tierId: see getCloudContractTierDefs(payWith)
  // hashrateOrIndex: either a package index (0-19) or a hashrate value (H/s)
  // payWith: "USD" | "BTC" | "USDT"
  buyCloudContract: function (tierId, hashrateOrIndex, _durationUnused, payWith) {
    Game.Btc.ensureWalletState();
    var q = Game.Btc.quoteCloudContract(tierId, hashrateOrIndex, payWith);
    if (!q) {
      Game.addNotification("Unknown cloud contract tier: " + tierId + ".");
      return;
    }

    var method = q.method;
    var reason = "Cloud mining contract (" + q.tierName + ", " + q.hashrate.toFixed(0) + " H/s, " + q.days + " days)";
    if (q.discountApplied) {
      reason += " (crypto -" + q.discountPct + "%)";
    }

    if (method === "BTC") {
      var ex = Game.Btc && Game.Btc.getExchange ? Game.Btc.getExchange() : null;
      var btcPrice = ex && ex.priceUsd ? ex.priceUsd : 0;
      if (!(btcPrice > 0)) {
        Game.addNotification("BTC price unavailable. Can't pay with BTC.");
        return;
      }
      var btcCost = q.priceUsd / btcPrice;
      if ((Game.state.btcBalance || 0) < btcCost) {
        Game.addNotification("Not enough BTC to buy that cloud mining contract.");
        return;
      }
      Game.state.btcBalance -= btcCost;
      if (Game.state.btcBalance < 0) Game.state.btcBalance = 0;
      Game.addNotification("Paid " + btcCost.toFixed(8) + " BTC for " + reason + ".");
    } else if (method === "USDT") {
      if (!Game.Crypto || !Game.Crypto.ensureState) {
        Game.addNotification("USDT wallet not available.");
        return;
      }
      Game.Crypto.ensureState();
      var usdt = Game.state.crypto && Game.state.crypto.coins ? Game.state.crypto.coins.USDT : null;
      if (!usdt || typeof usdt.balance !== "number") {
        Game.addNotification("USDT wallet not available.");
        return;
      }
      if (usdt.balance < q.priceUsd) {
        Game.addNotification("Not enough USDT to buy that cloud mining contract.");
        return;
      }
      usdt.balance -= q.priceUsd;
      if (usdt.balance < 0) usdt.balance = 0;
      Game.addNotification("Paid " + q.priceUsd.toFixed(2) + " USDT for " + reason + ".");
    } else {
      if (!Game.spendMoney(q.priceUsd, reason)) {
        Game.addNotification("Not enough money for that cloud mining contract.");
        return;
      }
    }

    var cloudState = (Game.state && Game.state.btc && Game.state.btc.cloud) ? Game.state.btc.cloud : {};
    var mainDevice = cloudState.currentMainDevice || null;
    var giftDevice = cloudState.currentGiftDevice || null;
    var giftCount = q.giftCount || 0;
    var giftDeviceForContract = giftDevice;
    if (giftCount > 0) {
      if (!giftDeviceForContract) giftCount = 0;
      if (mainDevice && giftDeviceForContract && typeof mainDevice.rank === "number" && typeof giftDeviceForContract.rank === "number") {
        if (giftDeviceForContract.rank >= mainDevice.rank) {
          giftCount = 0;
          giftDeviceForContract = null;
        }
      }
    }

    Game.state.btc.cloud.contracts.push({
      id: "c" + (Game.state.btc.cloud.contracts.length + 1),
      tier: q.tierId,
      tierName: q.tierName,
      hashrate: q.hashrate,
      daysLeft: q.days,
      dailyBtc: q.dailyBtc,
      paidWith: method,
      priceUsd: q.priceUsd,
      discountApplied: q.discountApplied,
      mainDevice: mainDevice,
      giftDevice: giftDeviceForContract,
      giftCount: giftCount
    });

    if (giftDeviceForContract && giftCount > 0) {
      for (var i = 0; i < giftCount; i++) {
        Game.state.inventory.push({
          id: "gift-" + (giftDeviceForContract.rank || "x") + "-" + (Game.state.btc.cloud.contracts.length) + "-" + i,
          name: giftDeviceForContract.name,
          type: giftDeviceForContract.type || "device",
          source: "cloud contract (" + q.tierId + ")"
        });
      }
      Game.addNotification("Received " + giftCount + " bonus device(s): " + giftDeviceForContract.name + ".");
    }

    Game.addNotification("Cloud mining contract activated: " + q.hashrate.toFixed(0) + " H/s for " + q.days + " days.");
  },
  daily: function () {
    if (!Game.state.btc.history) {
      Game.state.btc.history = { byDay: [], currentDayEarned: 0 };
    }
    var hist = Game.state.btc.history;
    var prevDay = Game.state.day - 1;
    if (prevDay < 1) prevDay = 1;
    hist.byDay.push({
      day: prevDay,
      amount: hist.currentDayEarned
    });
    if (hist.byDay.length > 365) {
      hist.byDay.shift();
    }
    hist.currentDayEarned = 0;
    var m = Game.state.btc.mining;
    if (m.rigsOwned > 0 && m.isPowerOn) {
      var powerBill = m.rigsOwned * m.powerCostPerDay;
      if (Game.Prestige && typeof Game.Prestige.getMiningPowerCostMultiplier === "function") {
        powerBill *= Game.Prestige.getMiningPowerCostMultiplier();
      }
      Game.spendMoney(powerBill, "Mining rig power bill");
    }
    Game.Btc.ensurePcMinerState();
    var pm = Game.state.btc.pcMiner;
    if (pm && pm.isOn) {
      var bill = pm.lastPowerCostPerDay || 0;
      if (bill > 0) {
        if (Game.Prestige && typeof Game.Prestige.getMiningPowerCostMultiplier === "function") {
          bill *= Game.Prestige.getMiningPowerCostMultiplier();
        }
        var ok = Game.spendMoney(bill, "PC mining power bill");
        if (!ok) {
          pm.isOn = false;
          Game.addNotification("PC mining paused (couldn't pay power bill).");
        }
      }
    }
    var cs = Game.state.btc.cloud.contracts;
    var remainingContracts = [];
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i];
      if (!c) continue;
      var left = typeof c.daysLeft === "number" && isFinite(c.daysLeft) ? Math.floor(c.daysLeft) : 0;
      if (left > 0) {
        left -= 1;
        c.daysLeft = left;
        if (left === 0) {
          Game.addNotification("Cloud mining contract (" + c.tier + ") expired.");
        } else {
          remainingContracts.push(c);
        }
      }
    }
    Game.state.btc.cloud.contracts = remainingContracts;

    // Optional: auto-sync the wallet once per day (runs even if the wallet app is closed).
    try {
      var w = Game.state.btc && Game.state.btc.wallet ? Game.state.btc.wallet : null;
      if (w && w.autoSyncDaily && w.isInstalled) {
        var networkHeight = (Game.Btc && typeof Game.Btc.getNetworkHeight === "function") ? Game.Btc.getNetworkHeight() : (w.targetHeight || 0);
        if ((w.chainHeight || 0) < (networkHeight || 0)) {
          if (Game.Btc && typeof Game.Btc.startWalletSync === "function") {
            Game.Btc.startWalletSync();
          }
        }
      }
    } catch (e) {}
  },
  tick: function (seconds) {
    Game.Btc.ensureMiningRewardScale();
    Game.Btc.ensureWalletState();
    Game.Btc.ensureChainState();
    Game.Btc.processWalletDownloads();
    Game.Btc.tickPcMining(seconds);

    // If a chain sync download is active, reflect progress into the wallet state.
    var w = Game.state.btc.wallet;
    if (w && w.syncDownloadId && Game.Downloads && Game.Downloads.getById) {
      var dl = Game.Downloads.getById(w.syncDownloadId);
      if (dl && dl.kind === "btc_chain_sync") {
        w.targetHeight = dl.targetHeight;
        w.chainHeight = dl.startHeight + (dl.syncedBlocks || 0);
        var denom = Math.max(1, dl.totalBlocks || 1);
        w.syncProgress = Math.max(0, Math.min(100, Math.floor(((dl.syncedBlocks || 0) / denom) * 100)));
        w.isSyncing = dl.status === "downloading";
        Game.Btc.confirmUpToHeight(w.chainHeight || 0);
      }
    }

    var m = Game.state.btc.mining;
    if (m.rigsOwned > 0 && m.isPowerOn) {
      var suiteMult = Game.Btc.getMinerSoftwareMult ? Game.Btc.getMinerSoftwareMult() : 1;
      var debugMult = Game.Btc.getDebugMiningMultiplier ? Game.Btc.getDebugMiningMultiplier() : 1;
      var yieldMult2 = 1;
      if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
        yieldMult2 = Game.Prestige.getMiningYieldMultiplier();
      }
      var btcPerSecond = m.rigsOwned * (m.rigHashrate || 0) * suiteMult * 0.00000000035 * debugMult * yieldMult2;
      Game.addBtc(btcPerSecond * seconds, "Mining rig");
    }
    // Cloud mining continuous earnings
    var cs = Game.state.btc.cloud.contracts;
    if (cs && cs.length > 0) {
      // Keep cloud payouts aligned with global time scale:
      // each real second == 0.5 in-game minutes.
      var inGameMinutes = seconds * 0.5;
      var fractionOfDay = inGameMinutes / (24 * 60);
      var debugMultCloud = Game.Btc.getDebugMiningMultiplier ? Game.Btc.getDebugMiningMultiplier() : 1;
      var yieldMultCloud = 1;
      if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
        yieldMultCloud = Game.Prestige.getMiningYieldMultiplier();
      }
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (c.daysLeft > 0 && c.dailyBtc > 0) {
          var amount = c.dailyBtc * fractionOfDay * debugMultCloud * yieldMultCloud;
          if (amount > 0) {
            Game.addBtc(amount, "Cloud mining (" + c.tier + ")");
          }
        }
      }
    }
    // BTC exchange background behaviour
    Game.Btc.tickExchange(seconds);
  },
  // Simple BTC exchange helpers for the Online Market
  getExchange: function () {
    if (!Game.state.btc.exchange) {
      Game.state.btc.exchange = {
        priceUsd: 30000,
        buyOrders: [],
        sellOrders: [],
        priceHistory: [],
        recentTrades: []
      };
    }
    var ex = Game.state.btc.exchange;
    // Ensure new fields exist for older saves
    if (!ex.buyOrders) ex.buyOrders = [];
    if (!ex.sellOrders) ex.sellOrders = [];
    if (!ex.priceHistory) ex.priceHistory = [];
    if (!ex.recentTrades) ex.recentTrades = [];
    if (typeof ex._tradeSeq !== "number") ex._tradeSeq = 0;
    if (typeof ex._pulseAcc !== "number") ex._pulseAcc = 0;
    if (typeof ex._orderSeq !== "number") ex._orderSeq = 0;
    if (typeof ex._orderSeqInitialized !== "boolean") ex._orderSeqInitialized = false;
    // Meta fields for tracking real-world BTC price fetches
    if (typeof ex._lastRealPriceTs === "undefined") ex._lastRealPriceTs = null;
    if (typeof ex._lastRealPriceAttemptTs === "undefined") ex._lastRealPriceAttemptTs = null;
    if (typeof ex._fetchingPrice === "undefined") ex._fetchingPrice = false;

    // Remove legacy seeded "sample" orders (older versions bootstrapped the book with fixed entries).
    ex.sellOrders = ex.sellOrders.filter(function (o) { return !(o && typeof o.id === "string" && o.id.indexOf("ask-sample-") === 0); });
    ex.buyOrders = ex.buyOrders.filter(function (o) { return !(o && typeof o.id === "string" && o.id.indexOf("bid-sample-") === 0); });
    if (typeof ex._seededSampleOrders !== "undefined") ex._seededSampleOrders = true;

    // Initialize order sequence based on existing order IDs so newly created orders don't collide after deletions.
    if (!ex._orderSeqInitialized) {
      var maxSeq = ex._orderSeq || 0;
      var all = ex.sellOrders.concat(ex.buyOrders);
      for (var i = 0; i < all.length; i++) {
        var o0 = all[i];
        if (!o0 || typeof o0.id !== "string") continue;
        var m = String(o0.id).match(/(\d+)$/);
        if (!m) continue;
        var n = parseInt(m[1], 10);
        if (isFinite(n) && n > maxSeq) maxSeq = n;
      }
      ex._orderSeq = maxSeq;
      ex._orderSeqInitialized = true;
    }

    return ex;
  },
  // Fetch real BTC/USD price from a public API (CoinGecko).
  // Falls back silently to simulated drift when network/API is unavailable.
  fetchRealPrice: function () {
    var ex = Game.Btc.getExchange();
    if (ex._fetchingPrice) return;
    if (typeof fetch !== "function") return;
    ex._fetchingPrice = true;
    var now = Date.now ? Date.now() : new Date().getTime();
    ex._lastRealPriceAttemptTs = now;
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.bitcoin && typeof data.bitcoin.usd === "number") {
          ex.priceUsd = data.bitcoin.usd;
          ex._lastRealPriceTs = now;
          // On first successful real price fetch, bootstrap recent history
          // so charts are populated with real BTC data for the period.
          if ((!ex.priceHistory || ex.priceHistory.length === 0) && !ex._bootstrappedHistory) {
            Game.Btc.bootstrapHistoryFromApi();
          }
        }
      })
      .catch(function (err) {
        try {
          console.error("Failed to fetch BTC price from API:", err);
        } catch (e) {}
      })
      .then(function () {
        ex._fetchingPrice = false;
      });
  },
  // Populate priceHistory with recent real BTC prices (last ~24h)
  // so both BTC charts start with meaningful data.
  bootstrapHistoryFromApi: function () {
    var ex = Game.Btc.getExchange();
    if (ex._bootstrappingHistory || typeof fetch !== "function") return;
    ex._bootstrappingHistory = true;
    fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.prices || !data.prices.length) return;
        var prices = data.prices;
        var day = Game.state.day || 1;
        var baseMinutes = Game.state.timeMinutes || 0;
        var history = [];
        // Walk from newest backwards, mapping each hourly point to an in-game time.
        for (var i = 0; i < prices.length; i++) {
          var idx = prices.length - 1 - i;
          var pair = prices[idx];
          var price = pair && typeof pair[1] === "number" ? pair[1] : null;
          if (price === null || !isFinite(price)) continue;
          var minutesAgo = i * 60; // 60 in-game minutes per hourly price
          var minutes = baseMinutes - minutesAgo;
          var d = day;
          while (minutes < 0 && d > 1) {
            minutes += 24 * 60;
            d -= 1;
          }
          if (d < 1) break;
          var minuteOfDay = Math.floor(minutes % (24 * 60));
          if (minuteOfDay < 0) minuteOfDay += 24 * 60;
          var hour = Math.floor(minuteOfDay / 60);
          var key = d * (24 * 60) + minuteOfDay;
          history.unshift({
            key: key,
            day: d,
            hour: hour,
            minutes: minuteOfDay,
            price: price
          });
        }
        if (history.length > 0) {
          // Limit to the same window size used elsewhere.
          if (history.length > 72) {
            history.splice(0, history.length - 72);
          }
          ex.priceHistory = history;
          ex._bootstrappedHistory = true;
        }
      })
      .catch(function (err) {
        try {
          console.error("Failed to bootstrap BTC history from API:", err);
        } catch (e) {}
      })
      .then(function () {
        ex._bootstrappingHistory = false;
      });
  },
  placeLimitOrder: function (side, price, amountBtc) {
    var ex = Game.Btc.getExchange();
    var SATS = 100000000;
    var amt = typeof amountBtc === "number" ? amountBtc : parseFloat(amountBtc);
    var px = typeof price === "number" ? price : parseFloat(price);
    if (!isFinite(amt) || !isFinite(px) || !(amt > 0) || !(px > 0)) return null;
    // Quantize to satoshis to avoid "stuck remainder" floating point behavior.
    amt = Math.floor(amt * SATS) / SATS;
    if (!(amt > 0)) return null;
    if (side === "sell") {
      if (Game.state.btcBalance < amt) {
        Game.addNotification("Not enough BTC for that sell order.");
        return null;
      }
      Game.state.btcBalance -= amt;
      if (window.UI && UI.animateNumber) {
        UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
      }
      ex._orderSeq += 1;
      ex.sellOrders.push({
        id: "ask-" + ex._orderSeq,
        side: "sell",
        price: px,
        amount: amt,
        remaining: amt,
        owner: "player"
      });
      Game.addNotification("Placed BTC sell order: " + amt.toFixed(8) + " BTC @ $" + px.toFixed(0));
      return ex.sellOrders[ex.sellOrders.length - 1];
    } else if (side === "buy") {
      var cost = px * amt;
      if (!Game.spendMoney(cost, "BTC buy order reserve")) {
        Game.addNotification("Not enough money for that buy order.");
        return null;
      }
      ex._orderSeq += 1;
      ex.buyOrders.push({
        id: "bid-" + ex._orderSeq,
        side: "buy",
        price: px,
        amount: amt,
        remaining: amt,
        owner: "player"
      });
      Game.addNotification("Placed BTC buy order: " + amt.toFixed(8) + " BTC @ $" + px.toFixed(0));
      return ex.buyOrders[ex.buyOrders.length - 1];
    }
    return null;
  },
  fulfillOrderInstant: function (orderId) {
    var ex = Game.Btc.getExchange();
    var all = ex.sellOrders.concat(ex.buyOrders);
    var found = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === orderId) {
        found = all[i];
        break;
      }
    }
    var SATS = 100000000;
    function toSats(v) {
      var n = Math.round((typeof v === "number" ? v : 0) * SATS);
      if (!isFinite(n) || n < 0) return 0;
      return n;
    }
    function fromSats(s) { return s / SATS; }

    if (!found) return;
    var remainingSats = toSats(found.remaining);
    if (!(remainingSats > 0)) return;

    var filledSats = 0;
    if (found.side === "sell") {
      // Player buys BTC from this sell order; allow partial fills based on available cash.
      var availableCash = Game.state.money;
      var maxAffordableSats = found.price > 0 ? Math.floor((availableCash / found.price) * SATS) : 0;
      if (!isFinite(maxAffordableSats) || maxAffordableSats < 0) maxAffordableSats = 0;
      filledSats = Math.min(remainingSats, maxAffordableSats);
      if (!(filledSats > 0)) {
        Game.addNotification("Not enough money to buy any BTC at that price.");
        return;
      }
      var fillAmount = fromSats(filledSats);
      var cost = fillAmount * found.price;
      if (!Game.spendMoney(cost, "Filled BTC sell order " + found.id)) {
        // Safety check; should normally succeed given the maxAffordableBtc cap.
        Game.addNotification("Not enough money to buy that BTC.");
        return;
      }
      Game.addBtc(fillAmount, "Exchange buy " + found.id);
    } else if (found.side === "buy") {
      // Player sells BTC into this buy order; allow partial fills based on available BTC.
      var availableBtc = Game.state.btcBalance;
      var availableSats = Math.floor(availableBtc * SATS + 0.000001);
      if (!isFinite(availableSats) || availableSats < 0) availableSats = 0;
      filledSats = Math.min(remainingSats, availableSats);
      if (!(filledSats > 0)) {
        Game.addNotification("Not enough BTC to fill that buy order.");
        return;
      }
      var fillAmount2 = fromSats(filledSats);
      Game.state.btcBalance -= fillAmount2;
      if (window.UI && UI.animateNumber) {
        UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
      }
      Game.addMoney(fillAmount2 * found.price, "Exchange sell " + found.id);
    }
    if (!(filledSats > 0)) return;
    var filled = fromSats(filledSats);
    Game.Btc.recordTrade(found.side, found.price, filled);
    remainingSats = remainingSats - filledSats;
    found.remaining = fromSats(remainingSats);
    if (!(remainingSats > 0)) {
      found.remaining = 0;
      if (found.side === "sell") {
        ex.sellOrders = ex.sellOrders.filter(function (o) { return o.id !== found.id; });
      } else {
        ex.buyOrders = ex.buyOrders.filter(function (o) { return o.id !== found.id; });
      }
      Game.addNotification("Order " + found.id + " fully filled on the exchange.");
    } else {
      Game.addNotification("Order " + found.id + " partially filled: " + filled.toFixed(8) + " BTC");
    }
  },
  ensureMarketDepth: function () {
    // Keep the BTC order book filled with small market-maker orders so the player can trade instantly.
    var ex = Game.Btc.getExchange();
    var base = ex.priceUsd || 30000;
    var SATS = 100000000;
    var sat = 1 / SATS;
    var epsilon = sat / 100;
    if (!(base > 0)) base = 30000;
    if (typeof ex._orderSeq !== "number") ex._orderSeq = 0;

    function newId(prefix) {
      ex._orderSeq += 1;
      return prefix + ex._orderSeq;
    }

    function clampPrice(p) {
      if (!isFinite(p) || p <= 0) return Math.max(1, base);
      if (p < 1) p = 1;
      return p;
    }

    function notionalUsdForLevel(levelIndex) {
      // Small notional sizes so clicks feel responsive ($5..$160-ish).
      var baseUsd = 5 + Math.random() * 25;
      var extra = Math.min(140, levelIndex * (8 + Math.random() * 10));
      return Math.max(1, baseUsd + extra);
    }

    function addMarketOrder(side, price, notionalUsd) {
      price = clampPrice(price);
      var sats = Math.round((notionalUsd / price) * SATS);
      if (!isFinite(sats) || sats < 1) sats = 1;
      var btcAmount = sats / SATS;
      var o = {
        id: newId(side === "sell" ? "ask-mkt-" : "bid-mkt-"),
        side: side,
        price: price,
        amount: btcAmount,
        remaining: btcAmount,
        owner: "market"
      };
      if (side === "sell") ex.sellOrders.push(o);
      else ex.buyOrders.push(o);
    }

    function pruneSide(list) {
      // Remove filled/invalid orders and overly-stale far-from-price market orders.
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (!o || !(o.price > 0)) continue;
        var remSats = Math.round((o.remaining || 0) * SATS);
        if (!(remSats > 0)) continue;
        if (o.owner === "market") {
          var dist = Math.abs(o.price - base);
          if (dist > base * 0.18) continue;
        }
        out.push(o);
      }
      return out;
    }

    ex.sellOrders = pruneSide(ex.sellOrders);
    ex.buyOrders = pruneSide(ex.buyOrders);

    var targetPerSide = 10;
    var maxPerSide = 18;

    function ensureSide(side) {
      var list = side === "sell" ? ex.sellOrders : ex.buyOrders;
      var marketCount = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].owner === "market") marketCount += 1;
      }

      // If we have too many, trim the farthest market orders first.
      if (marketCount > maxPerSide) {
        var markets = list.filter(function (o) { return o && o.owner === "market"; });
        markets.sort(function (a, b) { return Math.abs(b.price - base) - Math.abs(a.price - base); });
        var removeN = marketCount - maxPerSide;
        var removeIds = {};
        for (var r = 0; r < removeN && r < markets.length; r++) {
          removeIds[markets[r].id] = true;
        }
        list = list.filter(function (o) { return !(o && o.owner === "market" && removeIds[o.id]); });
        if (side === "sell") ex.sellOrders = list;
        else ex.buyOrders = list;
        marketCount = maxPerSide;
      }

      var spread = Math.max(15, Math.round(base * 0.0008)); // ~0.08%
      var step = Math.max(25, Math.round(base * 0.0012));   // ~0.12%
      var tolerance = step * 0.55;

      function hasLevelNear(px) {
        for (var j = 0; j < list.length; j++) {
          var o = list[j];
          if (!o || o.owner !== "market") continue;
          if (!(o.price > 0)) continue;
          var remSats = Math.round((o.remaining || 0) * SATS);
          if (!(remSats > 0)) continue;
          if (Math.abs(o.price - px) <= tolerance) return true;
        }
        return false;
      }

      for (var lvl = 0; lvl < targetPerSide; lvl++) {
        var offset = spread + lvl * step;
        var px = side === "sell" ? (base + offset) : (base - offset);
        px = clampPrice(px);
        if (hasLevelNear(px)) continue;
        addMarketOrder(side, px, notionalUsdForLevel(lvl + 1));
      }
    }

    ensureSide("sell");
    ensureSide("buy");
  },
  getNpcLiquidityFactor: function () {
    // A "BTC progress" factor used to scale NPC order sizes.
    // Starts at ~100 (so * 1%) == 1.0x, then grows with chain height and BTC gameplay progression.
    Game.Btc.ensureChainState();
    var h = (Game.state && Game.state.btc && Game.state.btc.chain && typeof Game.state.btc.chain.height === "number") ? Game.state.btc.chain.height : 100;
    if (!isFinite(h) || h < 100) h = 100;

    var factor = h;

    var sw = (Game.state && Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : 0;
    if (!isFinite(sw) || sw < 0) sw = 0;
    factor *= (1 + sw * 0.10);

    var rigs = (Game.state && Game.state.btc && Game.state.btc.mining && typeof Game.state.btc.mining.rigsOwned === "number") ? Game.state.btc.mining.rigsOwned : 0;
    if (!isFinite(rigs) || rigs < 0) rigs = 0;
    factor *= (1 + rigs * 0.12);

    var activeCloud = 0;
    var contracts = (Game.state && Game.state.btc && Game.state.btc.cloud && Array.isArray(Game.state.btc.cloud.contracts)) ? Game.state.btc.cloud.contracts : [];
    for (var i = 0; i < contracts.length; i++) {
      var c = contracts[i];
      if (c && (c.daysLeft || 0) > 0) activeCloud += 1;
    }
    factor *= (1 + activeCloud * 0.18);

    if (Game.Btc.getPcMinerStats) {
      var stats = Game.Btc.getPcMinerStats();
      var hr = stats && typeof stats.hashrate === "number" ? stats.hashrate : 0;
      if (isFinite(hr) && hr > 0) {
        factor *= (1 + Math.min(2.0, hr / 120)); // up to 3x from PC mining performance
      }
    }

    var w = (Game.state && Game.state.btc) ? Game.state.btc.wallet : null;
    if (w && w.isInstalled) factor *= 1.10;

    if (!isFinite(factor) || factor <= 0) factor = 100;
    if (factor < 50) factor = 50;
    if (factor > 6000) factor = 6000;
    return factor;
  },
  sampleNpcTradeUsd: function () {
    // NPC market buy budget per trade: $0.40 to $40.00.
    var usd = 0.40 + Math.random() * (40.00 - 0.40);
    usd = Math.round(usd * 100) / 100;
    if (!isFinite(usd) || usd <= 0) usd = 0.40;
    if (usd < 0.40) usd = 0.40;
    if (usd > 40.00) usd = 40.00;
    return usd;
  },
  recordExchangePriceSnapshot: function () {
    var ex = Game.Btc.getExchange();
    if (!ex.priceHistory) {
      ex.priceHistory = [];
    }
    var day = Game.state.day || 1;
    var minutes = Game.state.timeMinutes || 0;
    if (minutes < 0) minutes = 0;
    // Quantise to 30-minute buckets so the graph updates
    // in discrete in-game time steps rather than every minute.
    var rawMinuteOfDay = Math.floor(minutes % (24 * 60));
    if (rawMinuteOfDay < 0) rawMinuteOfDay += 24 * 60;
    var minuteOfDay = Math.floor(rawMinuteOfDay / 30) * 30; // 0,30,60,...,1410
    var hour = Math.floor(minuteOfDay / 60);
    if (hour < 0) hour = 0;
    if (hour > 23) hour = 23;
    // Unique key per in-game minute
    var key = day * (24 * 60) + minuteOfDay;
    var history = ex.priceHistory;
    var last = history.length > 0 ? history[history.length - 1] : null;
    if (last && last.key === key) {
      last.price = ex.priceUsd;
    } else {
      history.push({
        key: key,
        day: day,
        hour: hour,
        minutes: minuteOfDay,
        price: ex.priceUsd
      });
      if (history.length > 72) {
        history.splice(0, history.length - 72);
      }
    }
  },
  recordTrade: function (side, price, amount) {
    if (amount <= 0 || price <= 0) return;
    var ex = Game.Btc.getExchange();
    if (!ex.recentTrades) ex.recentTrades = [];
    if (typeof ex._tradeSeq !== "number") ex._tradeSeq = 0;
    var day = Game.state.day || 1;
    var minutes = Game.state.timeMinutes || 0;
    if (minutes < 0) minutes = 0;
    var minuteOfDay = Math.floor(minutes % (24 * 60));
    if (minuteOfDay < 0) minuteOfDay += 24 * 60;
    var ts = Date.now ? Date.now() : new Date().getTime();
    ex.recentTrades.unshift({
      id: (++ex._tradeSeq),
      ts: ts,
      side: side,
      price: price,
      amount: amount,
      total: amount,
      remaining: amount,
      day: day,
      minutes: minuteOfDay
    });
    var maxTrades = 40;
    if (ex.recentTrades.length > maxTrades) {
      ex.recentTrades.length = maxTrades;
    }
  },
  fillTradeOpportunity: function (tradeId, fraction) {
    var ex = Game.Btc.getExchange();
    if (!ex || !Array.isArray(ex.recentTrades)) return { ok: false, message: "Exchange unavailable." };
    var trades = ex.recentTrades;
    if (!tradeId) return { ok: false, message: "Missing trade reference." };
    var idx = -1;
    for (var i = 0; i < trades.length; i++) {
      if (trades[i] && String(trades[i].id) === String(tradeId)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return { ok: false, message: "Trade not found." };
    var trade = trades[idx];
    if (!trade) return { ok: false, message: "Trade not available." };
    var available = Math.max(0, typeof trade.remaining === "number" ? trade.remaining : (typeof trade.amount === "number" ? trade.amount : 0));
    if (available <= 0) {
      trades.splice(idx, 1);
      return { ok: false, message: "Trade already filled." };
    }
    var share = (typeof fraction === "number" && fraction > 0) ? Math.min(1, fraction) : 1;
    var want = available * share;
    var epsilon = 0.00000001;
    if (want <= epsilon) want = available;
    var price = trade.price || 0;
    var filled = 0;
    if (trade.side === "sell") {
      var cash = Game.state.money || 0;
      var maxAffordable = price > 0 ? (cash / price) : available;
      if (maxAffordable <= epsilon) return { ok: false, message: "Not enough money." };
      var amount = Math.min(want, available, maxAffordable);
      if (amount <= epsilon) return { ok: false, message: "Trade amount too small." };
      var cost = amount * price;
      if (!Game.spendMoney(cost, "Trade opportunity")) return { ok: false, message: "Not enough money." };
      Game.addBtc(amount, "Trade opportunity");
      filled = amount;
    } else {
      var btc = Game.state.btcBalance || 0;
      if (btc <= epsilon) return { ok: false, message: "Not enough BTC." };
      var amount = Math.min(want, available, btc);
      if (amount <= epsilon) return { ok: false, message: "Trade amount too small." };
      Game.state.btcBalance -= amount;
      if (Game.state.btcBalance < 0) Game.state.btcBalance = 0;
      if (window.UI && UI.animateNumber) UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
      Game.addMoney(amount * price, "Trade opportunity");
      filled = amount;
    }
    if (filled <= 0) return { ok: false, message: "Unable to fill trade." };
    trade.remaining = Math.max(0, (typeof trade.remaining === "number" ? trade.remaining : available) - filled);
    if (trade.remaining <= epsilon) {
      trades.splice(idx, 1);
    }
    return { ok: true, filled: filled, remaining: trade.remaining };
  },
  marketBuyUsd: function (usdAmount) {
    var ex = Game.Btc.getExchange();
    var usd = typeof usdAmount === "number" ? usdAmount : parseFloat(usdAmount);
    if (!isFinite(usd) || usd <= 0) {
      Game.addNotification("Enter a USD amount.");
      return false;
    }
    var price = ex.priceUsd || 0;
    if (!(price > 0)) return false;

    // Quick trades place a limit order on the book (not an instant fill).
    // Funds are reserved immediately by the order system.
    var amt = usd / price;
    // Floor to 8 decimals so we never reserve slightly more USD due to floating error.
    amt = Math.floor(amt * 100000000) / 100000000;
    if (!(amt > 0)) {
      Game.addNotification("Trade amount too small.");
      return false;
    }
    return !!Game.Btc.placeLimitOrder("buy", price, amt);
  },
  marketSellBtc: function (btcAmount) {
    var ex = Game.Btc.getExchange();
    var amt = typeof btcAmount === "number" ? btcAmount : parseFloat(btcAmount);
    if (!isFinite(amt) || amt <= 0) {
      Game.addNotification("Enter a BTC amount.");
      return false;
    }
    var price = ex.priceUsd || 0;
    if (!(price > 0)) return false;

    // Quick trades place a limit order on the book (not an instant fill).
    // BTC is reserved immediately by the order system.
    return !!Game.Btc.placeLimitOrder("sell", price, amt);
  },
  pulseTrades: function (seconds) {
    var ex = Game.Btc.getExchange();
    if (typeof seconds !== "number" || seconds <= 0) return;
    ex._pulseAcc = (ex._pulseAcc || 0) + seconds;
    var pcOpen = !!(Game.state && Game.state.pc && Game.state.pc.isOpen && Game.state.pc.activeApp === "market");
    var interval = pcOpen ? 0.55 : 1.35;
    while (ex._pulseAcc >= interval) {
      ex._pulseAcc -= interval;
      var bursts = pcOpen ? (1 + Math.floor(Math.random() * 3)) : 1;
      for (var i = 0; i < bursts; i++) {
        var side = Math.random() < 0.5 ? "buy" : "sell";
        var p = ex.priceUsd || 30000;
        var slip = (Math.random() - 0.5) * 0.0012; // ±0.12%
        var tradePrice = p * (1 + slip);
        var amt = 0.0005 + Math.random() * (pcOpen ? 0.08 : 0.03);
        if (tradePrice < 1) tradePrice = 1;
        Game.Btc.recordTrade(side, tradePrice, amt);
      }
    }
  },
  tickExchange: function (seconds) {
    var ex = Game.Btc.getExchange();
    var now = Date.now ? Date.now() : new Date().getTime();
    // Throttle real-price requests to at most once per 60 seconds
    if (!ex._lastRealPriceAttemptTs || now - ex._lastRealPriceAttemptTs > 60000) {
      Game.Btc.fetchRealPrice();
    }
    // If we have never successfully fetched a real price, keep the old simulated drift
    if (!ex._lastRealPriceTs) {
      var drift = (Math.random() - 0.5) * 20 * (seconds / 60);
      ex.priceUsd = Math.max(5000, ex.priceUsd + drift);
    }
    // snapshot price for the current in-game hour
    Game.Btc.recordExchangePriceSnapshot();
    // NPC trades: small, periodic market buys that consume the best asks first.
    var SATS = 100000000;

    // Determine whether it's time for an NPC-driven matching pass.
    var day = Game.state.day || 1;
    var minutesNow = Game.state.timeMinutes || 0;
    if (minutesNow < 0) minutesNow = 0;
    var minuteOfDay = Math.floor(minutesNow % (24 * 60));
    if (minuteOfDay < 0) minuteOfDay += 24 * 60;
    var globalNow = day * (24 * 60) + minuteOfDay;

    function scheduleNextNpcTrade() {
      var hour = Math.floor(minuteOfDay / 60);
      var offsetMin;
      // More frequent than retail: every few in-game minutes.
      if (hour >= 8 && hour <= 23) offsetMin = 1 + Math.floor(Math.random() * 4); // 1–4 minutes
      else offsetMin = 2 + Math.floor(Math.random() * 7); // 2–8 minutes
      var nextMinuteOfDay = minuteOfDay + offsetMin;
      // Override cadence: 1–15 in-game minutes.
      nextMinuteOfDay = minuteOfDay + (1 + Math.floor(Math.random() * 15));
      var nextDay = day;
      if (nextMinuteOfDay >= 24 * 60) {
        nextMinuteOfDay -= 24 * 60;
        nextDay += 1;
      }
      ex.nextNpcTradeKey = nextDay * (24 * 60) + nextMinuteOfDay;
    }

    if (!ex.nextNpcTradeKey || ex.nextNpcTradeKey <= 0) {
      scheduleNextNpcTrade();
    }

    var safety = 0;
    while (globalNow >= ex.nextNpcTradeKey && safety < 8) {
      safety += 1;

      function remainingSats(o) {
        if (!o) return 0;
        var n = Math.round((o.remaining || 0) * SATS);
        if (!isFinite(n) || n < 0) return 0;
        return n;
      }

      var asks = ex.sellOrders
        .filter(function (o) { return o && o.price > 0 && remainingSats(o) > 0; })
        .slice()
        .sort(function (a, b) {
          if (a.price !== b.price) return a.price - b.price;
          return String(a.id || "").localeCompare(String(b.id || ""));
        });
      var bids = ex.buyOrders
        .filter(function (o) { return o && o.price > 0 && remainingSats(o) > 0; })
        .slice()
        .sort(function (a, b) {
          if (a.price !== b.price) return b.price - a.price;
          return String(a.id || "").localeCompare(String(b.id || ""));
        });

      if (!asks.length && !bids.length) {
        scheduleNextNpcTrade();
        continue;
      }

      var side = "buy"; // NPC buys BTC (consumes asks) or sells BTC (consumes bids)
      if (asks.length && bids.length) {
        side = Math.random() < 0.5 ? "buy" : "sell";
      } else if (!asks.length) {
        side = "sell";
      }

      var budget = Game.Btc.sampleNpcTradeUsd();
      if (!(budget > 0)) {
        scheduleNextNpcTrade();
        continue;
      }

      if (side === "buy") {
        // NPC market buys: consume the top asks first (best price to worst price).
        for (var q = 0; q < asks.length; q++) {
          if (!(budget > 0.000001)) break;
          var bestAsk = asks[q];
          if (!bestAsk || !(bestAsk.price > 0)) continue;
          var remSats = remainingSats(bestAsk);
          if (!(remSats > 0)) continue;
          var maxUsd = (remSats / SATS) * bestAsk.price;
          if (!(maxUsd > 0)) continue;
          var spend = budget > maxUsd ? maxUsd : budget;
          if (!(spend > 0)) continue;
          var fillSats = Math.round((spend / bestAsk.price) * SATS);
          if (!isFinite(fillSats) || fillSats < 1) fillSats = 1;
          if (fillSats > remSats) fillSats = remSats;

          var fillBtc = fillSats / SATS;
          Game.Btc.recordTrade("sell", bestAsk.price, fillBtc);
          if (bestAsk.owner === "player") {
            Game.addMoney(fillBtc * bestAsk.price, "Exchange sell " + bestAsk.id);
          }
          bestAsk.remaining = (remSats - fillSats) / SATS;
          if (bestAsk.remaining <= 0) {
            bestAsk.remaining = 0;
            if (bestAsk.owner === "player") {
              Game.addNotification("Limit order " + bestAsk.id + " fully executed on the exchange.");
            }
          }
          budget -= fillBtc * bestAsk.price;
          if (budget < 0) budget = 0;
        }
      } else {
        // NPC market sells: consume the top bids first (best price to worst price).
        for (var qb = 0; qb < bids.length; qb++) {
          if (!(budget > 0.000001)) break;
          var bestBid = bids[qb];
          if (!bestBid || !(bestBid.price > 0)) continue;
          var remSats2 = remainingSats(bestBid);
          if (!(remSats2 > 0)) continue;
          var maxUsd2 = (remSats2 / SATS) * bestBid.price;
          if (!(maxUsd2 > 0)) continue;
          var spend2 = budget > maxUsd2 ? maxUsd2 : budget;
          if (!(spend2 > 0)) continue;
          var fillSats2 = Math.round((spend2 / bestBid.price) * SATS);
          if (!isFinite(fillSats2) || fillSats2 < 1) fillSats2 = 1;
          if (fillSats2 > remSats2) fillSats2 = remSats2;

          var fillBtc2 = fillSats2 / SATS;
          Game.Btc.recordTrade("buy", bestBid.price, fillBtc2);
          if (bestBid.owner === "player") {
            Game.addBtc(fillBtc2, "Exchange buy " + bestBid.id);
          }
          bestBid.remaining = (remSats2 - fillSats2) / SATS;
          if (bestBid.remaining <= 0) {
            bestBid.remaining = 0;
            if (bestBid.owner === "player") {
              Game.addNotification("Limit order " + bestBid.id + " fully executed on the exchange.");
            }
          }
          budget -= fillBtc2 * bestBid.price;
          if (budget < 0) budget = 0;
        }
      }

      ex.buyOrders = ex.buyOrders.filter(function (o) { return o && o.price > 0 && remainingSats(o) > 0; });
      ex.sellOrders = ex.sellOrders.filter(function (o) { return o && o.price > 0 && remainingSats(o) > 0; });

      scheduleNextNpcTrade();
      continue;

      // Find best-priced player orders only.
      var bestAsk = null;
      for (var iAsk = 0; iAsk < ex.sellOrders.length; iAsk++) {
        var oAsk = ex.sellOrders[iAsk];
        if (!oAsk || oAsk.owner !== "player") continue;
        if (!(oAsk.remaining > epsilon) || !(oAsk.price > 0)) continue;
        if (!bestAsk || oAsk.price < bestAsk.price) bestAsk = oAsk;
      }
      var bestBid = null;
      for (var iBid = 0; iBid < ex.buyOrders.length; iBid++) {
        var oBid = ex.buyOrders[iBid];
        if (!oBid || oBid.owner !== "player") continue;
        if (!(oBid.remaining > epsilon) || !(oBid.price > 0)) continue;
        if (!bestBid || oBid.price > bestBid.price) bestBid = oBid;
      }

      var hasAsk = !!bestAsk;
      var hasBid = !!bestBid;
      if (!hasAsk && !hasBid) {
        scheduleNextNpcTrade();
        continue;
      }

      var side = Math.random() < 0.5 ? "buy" : "sell";
      if (side === "buy" && !hasAsk) side = "sell";
      if (side === "sell" && !hasBid) side = "buy";

      // NPC trade value in USD: $0.80–$20.00, scaled by BTC-related factors and 1%.
      var usd = Game.Btc.sampleNpcTradeUsd();

      if (side === "buy") {
        var maxUsd = bestAsk.remaining * bestAsk.price;
        if (maxUsd < 0.45) {
          scheduleNextNpcTrade();
          continue;
        }
        if (usd > maxUsd) usd = Math.round(maxUsd * 100) / 100;
        var fillBtc = usd / bestAsk.price;
        if (!(fillBtc > epsilon)) {
          scheduleNextNpcTrade();
          continue;
        }
        if (fillBtc > bestAsk.remaining) fillBtc = bestAsk.remaining;
        Game.Btc.recordTrade("sell", bestAsk.price, fillBtc);
        Game.addMoney(fillBtc * bestAsk.price, "Exchange sell " + bestAsk.id);
        bestAsk.remaining -= fillBtc;
        if (bestAsk.remaining <= epsilon) {
          bestAsk.remaining = 0;
          Game.addNotification("Limit order " + bestAsk.id + " fully executed on the exchange.");
        }
      } else {
        var maxUsd2 = bestBid.remaining * bestBid.price;
        if (maxUsd2 < 0.45) {
          scheduleNextNpcTrade();
          continue;
        }
        if (usd > maxUsd2) usd = Math.round(maxUsd2 * 100) / 100;
        var fillBtc2 = usd / bestBid.price;
        if (!(fillBtc2 > epsilon)) {
          scheduleNextNpcTrade();
          continue;
        }
        if (fillBtc2 > bestBid.remaining) fillBtc2 = bestBid.remaining;
        Game.Btc.recordTrade("buy", bestBid.price, fillBtc2);
        Game.addBtc(fillBtc2, "Exchange buy " + bestBid.id);
        bestBid.remaining -= fillBtc2;
        if (bestBid.remaining <= epsilon) {
          bestBid.remaining = 0;
          Game.addNotification("Limit order " + bestBid.id + " fully executed on the exchange.");
        }
      }

      ex.buyOrders = ex.buyOrders.filter(function (o) { return o && o.remaining > epsilon; });
      ex.sellOrders = ex.sellOrders.filter(function (o) { return o && o.remaining > epsilon; });

      scheduleNextNpcTrade();
    }
    // Keep some market maker liquidity around the current price.
    Game.Btc.ensureMarketDepth();
  }
};

Game.registerDailyHandler(Game.Btc.daily);
