/* ==========================================================================
   skill.js — Sistem skill generik & data-driven.
   Setiap hero punya 4 slot: passive, skill1, skill2, ultimate.
   effect() dieksekusi oleh castSkill() di hero.js, menerima (caster, target,
   gameState) dan bertanggung jawab memberi damage/heal/CC/shield/buff.
   ========================================================================== */

// Menghitung damage fisik setelah defense (formula sederhana ala MOBA).
function calcPhysicalDamage(atk, defenderDefense) {
  const reduction = defenderDefense / (defenderDefense + 100);
  return Math.max(1, Math.round(atk * (1 - reduction)));
}
function calcMagicDamage(mp, defenderMagicDefense) {
  const reduction = defenderMagicDefense / (defenderMagicDefense + 100);
  return Math.max(1, Math.round(mp * (1 - reduction)));
}

// Terapkan crowd control ke target: { stun, slowPct, slowDuration, knockup }
function applyCC(target, cc, duration) {
  target.ccUntil = Math.max(target.ccUntil || 0, performance.now() + duration * 1000);
  if (cc === 'stun') target.stunned = true;
  if (cc === 'knockup') { target.stunned = true; target.knockedUp = true; }
  if (cc === 'slow') { target.slowUntil = performance.now() + duration * 1000; }
}

function applyShield(target, amount, duration) {
  target.shield = (target.shield || 0) + amount;
  target.shieldUntil = performance.now() + duration * 1000;
}

function findEnemiesInRadius(caster, gameState, x, y, radius) {
  return gameState.heroes.filter(h => h.team !== caster.team && !h.dead &&
    Math.hypot(h.x - x, h.y - y) <= radius);
}
function findAlliesInRadius(caster, gameState, x, y, radius, includeSelf = true) {
  return gameState.heroes.filter(h => h.team === caster.team && !h.dead &&
    (includeSelf || h !== caster) && Math.hypot(h.x - x, h.y - y) <= radius);
}

/* ---------------------------------------------------------------------
   Definisi skill per hero. Setiap skill: name, desc, manaCost, cooldown,
   castRange (0 = self/no target needed), radius, effect(caster, target, gs)
   --------------------------------------------------------------------- */
const SKILL_DEFINITIONS = {

  // ===== 1. KORRATH, Sang Titan Batu (Tank - Tanah) =====
  korrath: {
    passive: {
      name: 'Kulit Granit',
      desc: 'Setiap 4 detik, serangan berikutnya Korrath memberi shield ke dirinya sendiri sebesar 6% HP maksimum selama 3 detik.',
      trigger: 'onAutoAttack',
      cooldown: 4,
      effect: (caster) => applyShield(caster, caster.maxHp * 0.06, 3)
    },
    skill1: {
      name: 'Hentakan Runtuh', desc: 'Menghantam tanah, memberi damage fisik & knock up singkat ke musuh di sekitar.',
      manaCost: 60, cooldown: 9, castRange: 0, radius: 260,
      effect: (caster, _t, gs) => {
        findEnemiesInRadius(caster, gs, caster.x, caster.y, 260).forEach(e => {
          e.hp -= calcPhysicalDamage(caster.atk * 1.3 + 40, e.def);
          applyCC(e, 'knockup', 0.6);
          spawnDamageText(gs, e.x, e.y, Math.round(caster.atk * 1.3 + 40), 'physical');
        });
      }
    },
    skill2: {
      name: 'Tembok Bara Batu', desc: 'Mengangkat perisai batu, menambah defense & magic defense selama 4 detik dan slow musuh yang mendekat.',
      manaCost: 50, cooldown: 12, castRange: 0, radius: 220,
      effect: (caster, _t, gs) => {
        caster.buffs.push({ stat: 'def', amount: 40, until: performance.now() + 4000 });
        caster.buffs.push({ stat: 'mdef', amount: 40, until: performance.now() + 4000 });
        findEnemiesInRadius(caster, gs, caster.x, caster.y, 220).forEach(e => applyCC(e, 'slow', 2));
      }
    },
    ultimate: {
      name: 'Amukan Gunung', desc: 'Menjadi raksasa selama 5 detik: HP maksimum +30%, menarik musuh terdekat mendekat, dan setiap serangan memberi damage area.',
      manaCost: 100, cooldown: 55, castRange: 0, radius: 300,
      effect: (caster, _t, gs) => {
        const bonus = caster.maxHp * 0.3;
        caster.maxHp += bonus; caster.hp += bonus;
        caster.buffs.push({ stat: 'giant', amount: 1, until: performance.now() + 5000 });
        findEnemiesInRadius(caster, gs, caster.x, caster.y, 300).forEach(e => {
          const dx = caster.x - e.x, dy = caster.y - e.y, d = Math.hypot(dx, dy) || 1;
          e.x += (dx / d) * 80; e.y += (dy / d) * 80;
          applyCC(e, 'slow', 1.5);
        });
      }
    }
  },

  // ===== 2. RYUUJIN EMBERFANG, Manusia-Naga Timur (Fighter - Api) =====
  ryuujin: {
    passive: {
      name: 'Darah Naga', desc: 'Ketika HP di bawah 40%, regenerasi HP meningkat 3x selama 5 detik (cooldown internal 30 detik).',
      trigger: 'onLowHp', cooldown: 30,
      effect: (caster) => caster.buffs.push({ stat: 'regenBoost', amount: 3, until: performance.now() + 5000 })
    },
    skill1: {
      name: 'Cakar Bara', desc: 'Menyabet ke depan, damage fisik ke musuh dalam garis lurus dan membakar (damage per detik 3 detik).',
      manaCost: 45, cooldown: 6, castRange: 220, radius: 140,
      effect: (caster, target, gs) => {
        if (!target) return;
        const dmg = calcPhysicalDamage(caster.atk * 1.1 + 30, target.def);
        target.hp -= dmg;
        target.dot = { dps: caster.atk * 0.15, until: performance.now() + 3000 };
        spawnDamageText(gs, target.x, target.y, dmg, 'physical');
      }
    },
    skill2: {
      name: 'Terjang Ekor Api', desc: 'Menerjang ke arah target, memberi damage dan slow.',
      manaCost: 50, cooldown: 10, castRange: 320, radius: 0,
      effect: (caster, target, gs) => {
        if (!target) return;
        caster.x = target.x - 40; caster.y = target.y;
        const dmg = calcPhysicalDamage(caster.atk * 1.2 + 20, target.def);
        target.hp -= dmg; applyCC(target, 'slow', 1.5);
        spawnDamageText(gs, target.x, target.y, dmg, 'physical');
      }
    },
    ultimate: {
      name: 'Wujud Naga Bara', desc: 'Bertransformasi 6 detik: attack speed +40%, setiap serangan memberi damage api tambahan area kecil.',
      manaCost: 100, cooldown: 50, castRange: 0, radius: 0,
      effect: (caster) => {
        caster.buffs.push({ stat: 'dragonForm', amount: 1, until: performance.now() + 6000 });
        caster.buffs.push({ stat: 'atkSpeed', amount: 0.4, until: performance.now() + 6000 });
      }
    }
  },

  // ===== 3. NYXARA SHADOWVEIL, Kitsune Bayangan (Assassin - Bayangan) =====
  nyxara: {
    passive: {
      name: 'Langkah Senyap', desc: 'Di luar pertarungan, bergerak 15% lebih cepat dan tak terlihat radar musuh selama 2 detik setelah tidak terlihat.',
      trigger: 'passive-always', effect: () => {}
    },
    skill1: {
      name: 'Sayatan Kabut', desc: 'Menyerang dua kali secara cepat ke target, damage fisik.',
      manaCost: 40, cooldown: 5, castRange: 160, radius: 0,
      effect: (caster, target, gs) => {
        if (!target) return;
        for (let i = 0; i < 2; i++) {
          const dmg = calcPhysicalDamage(caster.atk * 0.65 + 15, target.def);
          target.hp -= dmg;
          spawnDamageText(gs, target.x, target.y, dmg, 'physical');
        }
      }
    },
    skill2: {
      name: 'Lompat Bayangan', desc: 'Berteleportasi pendek ke belakang target, bonus damage kritikal serangan berikutnya.',
      manaCost: 45, cooldown: 9, castRange: 400, radius: 0,
      effect: (caster, target) => {
        if (!target) return;
        caster.x = target.x + 30; caster.y = target.y;
        caster.buffs.push({ stat: 'guaranteedCrit', amount: 1, until: performance.now() + 3000 });
      }
    },
    ultimate: {
      name: 'Sembilan Ekor Maut', desc: 'Menghilang sejenak lalu menyerang target dengan damage fisik besar berdasarkan HP hilang target.',
      manaCost: 90, cooldown: 45, castRange: 250, radius: 0,
      effect: (caster, target, gs) => {
        if (!target) return;
        caster.invisibleUntil = performance.now() + 700;
        const missingHpBonus = (1 - target.hp / target.maxHp) * 0.25;
        const dmg = calcPhysicalDamage(caster.atk * (1.8 + missingHpBonus) + 60, target.def);
        target.hp -= dmg;
        spawnDamageText(gs, target.x, target.y, dmg, 'physical', true);
      }
    }
  },

  // ===== 4. LYRIC OF THE DEEP, Roh Leviathan (Mage - Air/Astral) =====
  lyric: {
    passive: {
      name: 'Gelombang Batin', desc: 'Setiap cast skill mengisi 5 mana tambahan setelah 2 detik dan memberi sedikit magic power stack (maks 5).',
      trigger: 'onCast',
      effect: (caster) => caster.buffs.push({ stat: 'stackMP', amount: 4, until: performance.now() + 15000 })
    },
    skill1: {
      name: 'Gelombang Pasang', desc: 'Melempar bola air yang meledak, magic damage area.',
      manaCost: 55, cooldown: 6, castRange: 480, radius: 160,
      effect: (caster, target, gs) => {
        const cx = target ? target.x : caster.facingX, cy = target ? target.y : caster.facingY;
        findEnemiesInRadius(caster, gs, cx, cy, 160).forEach(e => {
          const dmg = calcMagicDamage(caster.mp2 * 0.9 + 70, e.mdef);
          e.hp -= dmg;
          spawnDamageText(gs, e.x, e.y, dmg, 'magic');
        });
      }
    },
    skill2: {
      name: 'Rantai Arus', desc: 'Slow + magic damage ke target dan memantul ke satu musuh terdekat lain.',
      manaCost: 60, cooldown: 10, castRange: 450, radius: 0,
      effect: (caster, target, gs) => {
        if (!target) return;
        const dmg = calcMagicDamage(caster.mp2 * 0.8 + 60, target.mdef);
        target.hp -= dmg; applyCC(target, 'slow', 2);
        spawnDamageText(gs, target.x, target.y, dmg, 'magic');
        const others = findEnemiesInRadius(caster, gs, target.x, target.y, 300).filter(e => e !== target);
        if (others[0]) {
          const d2 = calcMagicDamage(caster.mp2 * 0.6 + 40, others[0].mdef);
          others[0].hp -= d2;
          spawnDamageText(gs, others[0].x, others[0].y, d2, 'magic');
        }
      }
    },
    ultimate: {
      name: 'Murka Samudra Purba', desc: 'Memanggil pusaran raksasa di area, magic damage besar bertahap selama 2.5 detik + stun singkat.',
      manaCost: 110, cooldown: 60, castRange: 550, radius: 220,
      effect: (caster, target, gs) => {
        const cx = target ? target.x : caster.facingX, cy = target ? target.y : caster.facingY;
        findEnemiesInRadius(caster, gs, cx, cy, 220).forEach(e => {
          const dmg = calcMagicDamage(caster.mp2 * 1.6 + 150, e.mdef);
          e.hp -= dmg; applyCC(e, 'stun', 1.0);
          spawnDamageText(gs, e.x, e.y, dmg, 'magic', true);
        });
      }
    }
  },

  // ===== 5. SYLVARA WINDRUNNER, Penunggang Griffin (Marksman - Angin) =====
  sylvara: {
    passive: {
      name: 'Angin Sepoi', desc: 'Attack speed meningkat 3% setiap kali menyerang, stack hingga 5x, reset jika tak menyerang 3 detik.',
      trigger: 'onAutoAttack', effect: (caster) => {
        caster._windStack = Math.min(5, (caster._windStack || 0) + 1);
        caster.buffs.push({ stat: 'atkSpeed', amount: 0.03 * caster._windStack, until: performance.now() + 3000, tag: 'wind' });
      }
    },
    skill1: {
      name: 'Panah Menusuk', desc: 'Panah menembus, damage fisik ke semua musuh dalam garis lurus.',
      manaCost: 40, cooldown: 7, castRange: 500, radius: 0,
      effect: (caster, target, gs) => {
        const dir = target ? Math.atan2(target.y - caster.y, target.x - caster.x) : caster.facingAngle;
        findEnemiesInRadius(caster, gs, caster.x + Math.cos(dir) * 250, caster.y + Math.sin(dir) * 250, 300).forEach(e => {
          const dmg = calcPhysicalDamage(caster.atk * 1.0 + 25, e.def);
          e.hp -= dmg;
          spawnDamageText(gs, e.x, e.y, dmg, 'physical');
        });
      }
    },
    skill2: {
      name: 'Kepakan Mundur', desc: 'Melompat mundur menjauhi arah musuh terdekat sambil menambah movement speed sesaat.',
      manaCost: 35, cooldown: 11, castRange: 0, radius: 0,
      effect: (caster, _t, gs) => {
        const nearest = findEnemiesInRadius(caster, gs, caster.x, caster.y, 500)[0];
        if (nearest) {
          const dx = caster.x - nearest.x, dy = caster.y - nearest.y, d = Math.hypot(dx, dy) || 1;
          caster.x += (dx / d) * 220; caster.y += (dy / d) * 220;
        }
        caster.buffs.push({ stat: 'moveSpeed', amount: 60, until: performance.now() + 1500 });
      }
    },
    ultimate: {
      name: 'Badai Anak Panah', desc: 'Menembakkan rentetan panah ke area luas selama 2 detik, damage fisik berulang.',
      manaCost: 100, cooldown: 50, castRange: 600, radius: 260,
      effect: (caster, target, gs) => {
        const cx = target ? target.x : caster.facingX, cy = target ? target.y : caster.facingY;
        findEnemiesInRadius(caster, gs, cx, cy, 260).forEach(e => {
          const dmg = calcPhysicalDamage(caster.atk * 1.4 + 50, e.def);
          e.hp -= dmg;
          spawnDamageText(gs, e.x, e.y, dmg, 'physical', true);
        });
      }
    }
  },

  // ===== 6. ELOWEN DAWNSONG, Titisan Phoenix (Support - Cahaya) =====
  elowen: {
    passive: {
      name: 'Nyanyian Fajar', desc: 'Heal dari skill Elowen memberi shield kecil tambahan sebesar 20% dari jumlah heal.',
      trigger: 'onHeal', effect: () => {}
    },
    skill1: {
      name: 'Sentuhan Cahaya', desc: 'Menyembuhkan HP ally target (atau diri sendiri) dan memberi sedikit magic defense sesaat.',
      manaCost: 45, cooldown: 6, castRange: 450, radius: 0,
      effect: (caster, target, gs) => {
        const t = target || caster;
        const healAmt = caster.mp2 * 0.7 + 90;
        t.hp = Math.min(t.maxHp, t.hp + healAmt);
        applyShield(t, healAmt * 0.2, 2);
        spawnDamageText(gs, t.x, t.y, Math.round(healAmt), 'heal');
      }
    },
    skill2: {
      name: 'Kilau Pelindung', desc: 'Memberi shield ke seluruh ally dalam radius.',
      manaCost: 55, cooldown: 13, castRange: 0, radius: 300,
      effect: (caster, _t, gs) => {
        findAlliesInRadius(caster, gs, caster.x, caster.y, 300).forEach(a => applyShield(a, caster.mp2 * 0.6 + 80, 3));
      }
    },
    ultimate: {
      name: 'Kebangkitan Fajar', desc: 'Ultimate penyelamat: heal besar sekali ke semua ally dalam radius besar dan bersihkan efek slow.',
      manaCost: 120, cooldown: 70, castRange: 0, radius: 450,
      effect: (caster, _t, gs) => {
        findAlliesInRadius(caster, gs, caster.x, caster.y, 450).forEach(a => {
          a.hp = Math.min(a.maxHp, a.hp + caster.mp2 * 1.5 + 220);
          a.slowUntil = 0;
          spawnDamageText(gs, a.x, a.y, Math.round(caster.mp2 * 1.5 + 220), 'heal', true);
        });
      }
    }
  }
};
