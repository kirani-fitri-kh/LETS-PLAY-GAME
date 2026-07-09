/* ==========================================================================
   hero.js — Roster hero orisinal & class Hero.

   ---------------------------------------------------------------------
   LORE DUNIA: AETHERION
   ---------------------------------------------------------------------
   Aetherion adalah benua yang lahir dari retakan antara dunia fana dan
   dunia roh. Ribuan tahun lalu, sebuah bintang jatuh bernama "Air Mata
   Pertama" pecah menjadi lima serpihan elemen purba, menyebar ke seluruh
   benua dan membangunkan makhluk-makhluk mitologis dari berbagai budaya
   dunia yang sebelumnya tertidur di lapisan roh. Serpihan-serpihan itu
   kini disebut "Inti Aether", dan siapa pun yang menguasai kelimanya
   dipercaya dapat menulis ulang takdir benua ini.

   Dua kubu besar muncul untuk memperebutkan Inti Aether:

   - AURORAN VANGUARD (Biru): aliansi makhluk penjaga keseimbangan —
     titan tanah, roh sungai, phoenix, dan griffin — yang percaya Inti
     Aether harus dijaga, bukan digunakan.
   - EMBERFALL DOMINION (Merah): aliansi makhluk yang lahir dari amarah
     dan ambisi — naga bara, kitsune bayangan, leviathan purba — yang
     percaya kekuatan Inti Aether harus direbut untuk menulis ulang
     nasib mereka yang dulu terbuang dari dunia fana.

   Arena pertempuran (peta permainan) adalah "Lembah Retak Aether",
   titik temu ketiga jalur ley-line tempat sisa energi Inti Aether masih
   mengalir deras — menjelaskan kenapa lane, jungle, turret, hingga
   monster Turtle & Lord (di sini bernama Penyu Penjaga Arus & Wyrm
   Penakluk Fana) semuanya berebut energi yang sama.
   ---------------------------------------------------------------------
*/

const HERO_ROSTER = {
  korrath: {
    id: 'korrath', name: 'Korrath, Sang Titan Batu', role: 'Tank', element: 'Tanah', species: 'Titan Batu',
    difficulty: 'Mudah', team_lore: 'Auroran Vanguard',
    lore: 'Korrath adalah salah satu titan pertama yang bangkit dari runtuhan gunung saat Inti Aether jatuh. Ia bersumpah menjaga garis pertahanan Lembah Retak agar Inti Aether tak jatuh ke tangan yang salah.',
    voiceLines: { pick: '"Gunung tak pernah lari."', joke: '"Aku sudah berdiri sejak sebelum sungai ini mengalir."', death: '"Batu... akan tersusun kembali..."' },
    base: { hp: 3200, mana: 400, atk: 118, mp2: 0, def: 95, mdef: 60, moveSpeed: 260 },
    growth: { hp: 260, mana: 25, atk: 8, mp2: 0, def: 9, mdef: 5 }
  },
  ryuujin: {
    id: 'ryuujin', name: 'Ryuujin Emberfang', role: 'Fighter', element: 'Api', species: 'Manusia-Naga Timur',
    difficulty: 'Sedang', team_lore: 'Emberfall Dominion',
    lore: 'Keturunan Naga Timur yang diusir dari kuil leluhurnya karena darah baranya dianggap kutukan. Ryuujin bergabung dengan Emberfall Dominion untuk membuktikan bahwa api dalam dirinya adalah kekuatan, bukan aib.',
    voiceLines: { pick: '"Biar bara ini membakar keraguanmu."', joke: '"Aku hanya perlu satu tarikan napas untuk membakarmu."', death: '"Baraku... belum padam..."' },
    base: { hp: 2850, mana: 430, atk: 132, mp2: 0, def: 68, mdef: 45, moveSpeed: 270 },
    growth: { hp: 210, mana: 28, atk: 11, mp2: 0, def: 6, mdef: 4 }
  },
  nyxara: {
    id: 'nyxara', name: 'Nyxara Shadowveil', role: 'Assassin', element: 'Bayangan', species: 'Kitsune Bayangan',
    difficulty: 'Sulit', team_lore: 'Emberfall Dominion',
    lore: 'Kitsune sembilan ekor yang kehilangan seluruh ekornya dalam perang roh kuno, menggantinya dengan bayangan curian. Nyxara memburu Inti Aether untuk memulihkan wujud sejatinya.',
    voiceLines: { pick: '"Kau takkan lihat aku datang."', joke: '"Bayangan tidak pernah berbohong tentang niatku."', death: '"Kembali... ke kegelapan..."' },
    base: { hp: 2500, mana: 400, atk: 128, mp2: 0, def: 55, mdef: 45, moveSpeed: 285 },
    growth: { hp: 180, mana: 26, atk: 12, mp2: 0, def: 5, mdef: 4 }
  },
  lyric: {
    id: 'lyric', name: 'Lyric of the Deep', role: 'Mage', element: 'Air/Astral', species: 'Roh Leviathan',
    difficulty: 'Sedang', team_lore: 'Auroran Vanguard',
    lore: 'Fragmen kesadaran leviathan purba yang tidur di dasar Danau Astral. Lyric bangkit ketika merasakan Inti Aether jatuh ke perairannya, dan kini menjaga arus lembah dari siapa pun yang ingin mengeruk energi itu secara paksa.',
    voiceLines: { pick: '"Dengarkan gelombangnya..."', joke: '"Arus selalu tahu ke mana harus mengalir."', death: '"Kembali... ke kedalaman..."' },
    base: { hp: 2400, mana: 560, atk: 78, mp2: 130, def: 50, mdef: 55, moveSpeed: 260 },
    growth: { hp: 170, mana: 38, atk: 4, mp2: 14, def: 4, mdef: 5 }
  },
  sylvara: {
    id: 'sylvara', name: 'Sylvara Windrunner', role: 'Marksman', element: 'Angin', species: 'Penunggang Griffin',
    difficulty: 'Sedang', team_lore: 'Auroran Vanguard',
    lore: 'Pemanah dari suku langit yang menunggangi griffin sejak kecil. Sylvara terbang menembus Lembah Retak untuk melindungi sarang kaumnya dari perluasan wilayah Emberfall Dominion.',
    voiceLines: { pick: '"Anginku takkan meleset."', joke: '"Cobalah kejar aku dulu."', death: '"Anginku... berhenti berhembus..."' },
    base: { hp: 2350, mana: 420, atk: 128, mp2: 0, def: 48, mdef: 42, moveSpeed: 265 },
    growth: { hp: 165, mana: 27, atk: 11, mp2: 0, def: 4, mdef: 4 }
  },
  elowen: {
    id: 'elowen', name: 'Elowen Dawnsong', role: 'Support', element: 'Cahaya', species: 'Titisan Phoenix',
    difficulty: 'Mudah', team_lore: 'Auroran Vanguard',
    lore: 'Lahir dari abu phoenix yang jatuh bersama Inti Aether, Elowen mengembara menyembuhkan siapa pun yang terluka akibat perang perebutan Inti — termasuk musuh yang menyerah.',
    voiceLines: { pick: '"Cahaya fajar menyertaimu."', joke: '"Bahkan abu bisa bernyanyi, jika kau dengar baik-baik."', death: '"Aku akan... terlahir kembali..."' },
    base: { hp: 2300, mana: 500, atk: 65, mp2: 110, def: 48, mdef: 50, moveSpeed: 260 },
    growth: { hp: 160, mana: 34, atk: 3, mp2: 12, def: 4, mdef: 5 }
  }
};

const ROLE_COLORS = {
  Tank: '#8a9a7a', Fighter: '#e0703f', Assassin: '#7a4fd6',
  Mage: '#3fb8e0', Marksman: '#e0c93f', Support: '#ffd8a8'
};

const EXP_TABLE = (() => {
  // Total exp dibutuhkan untuk naik ke level n (maks 15).
  const t = [0];
  for (let lvl = 1; lvl < 15; lvl++) t.push(t[lvl - 1] + 260 + lvl * 55);
  return t;
})();

let _entityIdCounter = 1;

class Hero {
  constructor(heroId, team, isPlayer = false, isBot = true) {
    const data = HERO_ROSTER[heroId];
    this.entityId = _entityIdCounter++;
    this.heroId = heroId;
    this.data = data;
    this.name = data.name;
    this.role = data.role;
    this.element = data.element;
    this.team = team;
    this.isPlayer = isPlayer;
    this.isBot = isBot;

    const spawn = team === TEAM.BLUE ? BASE.blue : BASE.red;
    this.x = spawn.x + (Math.random() * 60 - 30);
    this.y = spawn.y + (Math.random() * 60 - 30);
    this.spawnPoint = spawn;
    this.facingAngle = 0;
    this.facingX = this.x; this.facingY = this.y;

    this.level = 1;
    this.exp = 0;
    this.gold = 500;
    this.kills = 0; this.deaths = 0; this.assists = 0;
    this.inventory = [];

    // item bonuses (terpisah dari base agar level-up recalculation mudah)
    this.itemAtk = 0; this.itemMp2 = 0; this.itemDef = 0; this.itemMdef = 0;
    this.itemMoveSpeed = 0; this.itemAtkSpeed = 0; this.itemCdr = 0;
    this.itemLifesteal = 0; this.itemCritChance = 0; this.itemCritDamage = 0;

    this.recalcStats();
    this.hp = this.maxHp;
    this.mana = this.maxMana;

    this.dead = false;
    this.respawnAt = 0;
    this.cooldowns = { skill1: 0, skill2: 0, ultimate: 0, passive: 0 };
    this.buffs = [];
    this.shield = 0; this.shieldUntil = 0;
    this.stunned = false; this.ccUntil = 0; this.slowUntil = 0;
    this.dot = null;
    this.autoAttackTimer = 0;
    this.recalling = false; this.recallUntil = 0;
    this.lane = null; // dipakai AI: 'top' | 'mid' | 'bottom'
    this.target = null;
    this.moveTarget = null;
    this._windStack = 0;
  }

  recalcStats() {
    const d = this.data;
    const g = this.data.growth;
    const lvl = this.level - 1;
    this.maxHp = d.base.hp + g.hp * lvl;
    this.maxMana = d.base.mana + g.mana * lvl;
    this.baseAtk = d.base.atk + g.atk * lvl;
    this.baseMp2 = d.base.mp2 + g.mp2 * lvl;
    this.baseDef = d.base.def + g.def * lvl;
    this.baseMdef = d.base.mdef + g.mdef * lvl;
    this.baseMoveSpeed = d.base.moveSpeed;
  }

  get atk() { return this.baseAtk + this.itemAtk; }
  get mp2() { return this.baseMp2 + this.itemMp2; }
  get def() { return this.baseDef + this.itemDef; }
  get mdef() { return this.baseMdef + this.itemMdef; }
  get moveSpeed() {
    let ms = this.baseMoveSpeed + this.itemMoveSpeed;
    const now = performance.now();
    if (this.slowUntil > now) ms *= 0.6;
    this.buffs.forEach(b => { if (b.stat === 'moveSpeed' && b.until > now) ms += b.amount; });
    return ms;
  }
  get atkSpeed() {
    let as = 1 + this.itemAtkSpeed / 100;
    const now = performance.now();
    this.buffs.forEach(b => { if (b.stat === 'atkSpeed' && b.until > now) as += b.amount; });
    return as;
  }
  get cdr() { return Math.min(0.4, this.itemCdr / 100); }

  gainExp(amount) {
    if (this.level >= 15) return;
    this.exp += amount;
    while (this.level < 15 && this.exp >= EXP_TABLE[this.level]) {
      this.level++;
      this.recalcStats();
      this.hp = this.maxHp; this.mana = this.maxMana;
    }
  }

  gainGold(amount) { this.gold += amount; }

  takeDamage(amount, type, gameState, source) {
    if (this.dead) return;
    let dmg = amount;
    if (this.shield > 0 && this.shieldUntil > performance.now()) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
    }
    this.hp -= dmg;
    if (this.hp <= 0 && !this.dead) this.die(gameState, source);
  }

  die(gameState, killer) {
    this.dead = true;
    this.deaths++;
    this.hp = 0;
    const respawnTime = 4 + this.level * 1.3;
    this.respawnAt = performance.now() + respawnTime * 1000;
    if (killer) {
      killer.kills++;
      const bounty = 260 + this.level * 25;
      killer.gainGold(bounty);
      killer.gainExp(180);
      spawnDamageText(gameState, killer.x, killer.y - 60, 'KILL +' + bounty, 'gold');
      // assist ke ally killer dalam radius
      findAlliesInRadius(killer, gameState, this.x, this.y, 700, false).forEach(a => {
        a.assists++; a.gainGold(Math.round(bounty * 0.4)); a.gainExp(90);
      });
    }
  }

  respawn() {
    this.dead = false;
    this.hp = this.maxHp; this.mana = this.maxMana;
    this.x = this.spawnPoint.x + (Math.random() * 60 - 30);
    this.y = this.spawnPoint.y + (Math.random() * 60 - 30);
    this.recalling = false;
  }

  update(dt, gameState) {
    const now = performance.now();
    // Bersihkan buff kadaluarsa
    this.buffs = this.buffs.filter(b => b.until > now);
    if (this.shieldUntil <= now) this.shield = 0;
    if (this.ccUntil <= now) { this.stunned = false; this.knockedUp = false; }

    if (this.dead) {
      if (now >= this.respawnAt) this.respawn();
      return;
    }

    // DOT (burn dsb)
    if (this.dot && this.dot.until > now) {
      this.hp -= this.dot.dps * dt;
    } else this.dot = null;

    // Regenerasi pasif
    let regenMult = 1;
    this.buffs.forEach(b => { if (b.stat === 'regenBoost' && b.until > now) regenMult = b.amount; });
    this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.0025) * regenMult * dt);
    this.mana = Math.min(this.maxMana, this.mana + (this.maxMana * 0.004) * dt);

    // Recall channel
    if (this.recalling) {
      if (now >= this.recallUntil) {
        this.x = this.spawnPoint.x; this.y = this.spawnPoint.y;
        this.recalling = false;
      }
      return; // tidak bisa bergerak saat recall
    }

    if (this.hp <= 0) { this.die(gameState, this.lastAttacker); return; }

    // Cooldown reduction terpakai saat cast (dihandle castSkill), di sini hanya tick timer display di ui.js.
  }

  startRecall() {
    if (this.recalling || this.dead) return;
    this.recalling = true;
    this.recallUntil = performance.now() + 6000; // 6 detik channel
  }
  cancelRecall() { this.recalling = false; }

  canCast(slot) {
    const def = SKILL_DEFINITIONS[this.heroId][slot];
    if (!def || !def.manaCost) return false;
    const cd = this.cooldowns[slot] || 0;
    return performance.now() >= cd && this.mana >= def.manaCost && !this.stunned && !this.dead && !this.recalling;
  }

  castSkill(slot, target, gameState) {
    if (!this.canCast(slot)) return false;
    const def = SKILL_DEFINITIONS[this.heroId][slot];
    this.mana -= def.manaCost;
    const cdMs = def.cooldown * 1000 * (1 - this.cdr);
    this.cooldowns[slot] = performance.now() + cdMs;
    def.effect(this, target, gameState);
    playSfx('skill');
    spawnParticleBurst(gameState, this.x, this.y, this.element);
    return true;
  }

  // Auto-attack terhadap target (hero/minion/turret/monster)
  tryAutoAttack(target, gameState, dt) {
    if (this.dead || this.stunned || this.recalling) return;
    const dist = Math.hypot(target.x - this.x, target.y - this.y);
    const range = 130;
    if (dist > range) return false;
    this.autoAttackTimer -= dt;
    if (this.autoAttackTimer > 0) return false;
    this.autoAttackTimer = 1 / this.atkSpeed;

    let isCrit = false;
    let dmg = calcPhysicalDamage(this.atk, target.def || 0);
    const now = performance.now();
    this.buffs.forEach(b => { if (b.stat === 'guaranteedCrit' && b.until > now) isCrit = true; });
    if (!isCrit && Math.random() * 100 < this.itemCritChance) isCrit = true;
    if (isCrit) dmg = Math.round(dmg * (1.5 + this.itemCritDamage / 100));

    if (target.takeDamage) target.takeDamage(dmg, 'physical', gameState, this);
    else target.hp -= dmg; // minion/turret/monster generik

    if (this.itemLifesteal > 0) this.hp = Math.min(this.maxHp, this.hp + dmg * (this.itemLifesteal / 100));
    spawnDamageText(gameState, target.x, target.y, dmg, 'physical', isCrit);
    playSfx('attack');

    // Trigger passive onAutoAttack bila ada
    const passive = SKILL_DEFINITIONS[this.heroId].passive;
    if (passive && passive.trigger === 'onAutoAttack') {
      const pcd = this.cooldowns.passive || 0;
      if (performance.now() >= pcd) {
        this.cooldowns.passive = performance.now() + (passive.cooldown || 4) * 1000;
        passive.effect(this, target, gameState);
      }
    }
    return true;
  }

  moveTowards(tx, ty, dt) {
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) return true;
    if (this.stunned || this.recalling) return false;
    const spd = this.moveSpeed * dt;
    this.x += (dx / d) * Math.min(spd, d);
    this.y += (dy / d) * Math.min(spd, d);
    this.facingAngle = Math.atan2(dy, dx);
    this.facingX = this.x + Math.cos(this.facingAngle) * 300;
    this.facingY = this.y + Math.sin(this.facingAngle) * 300;
    return false;
  }

  draw(ctx) {
    if (this.dead) return;
    const color = ROLE_COLORS[this.role];
    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(this.x, this.y + 22, 22, 8, 0, 0, Math.PI * 2); ctx.fill();

    // silhouette badan (bentuk unik ringan per role agar mudah dibedakan)
    ctx.translate(this.x, this.y);
    ctx.fillStyle = color;
    ctx.strokeStyle = this.team === TEAM.BLUE ? '#3fa9ff' : '#ff5b3f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (this.role === 'Tank') ctx.arc(0, 0, 26, 0, Math.PI * 2);
    else if (this.role === 'Assassin') { ctx.moveTo(0, -24); ctx.lineTo(18, 16); ctx.lineTo(-18, 16); ctx.closePath(); }
    else if (this.role === 'Mage') { ctx.moveTo(0, -22); ctx.lineTo(16, 0); ctx.lineTo(0, 22); ctx.lineTo(-16, 0); ctx.closePath(); }
    else ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // nameplate
    ctx.rotate(0);
    ctx.restore();
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText((this.isPlayer ? '★ ' : '') + this.name.split(',')[0], this.x, this.y - 40);

    // HP & Mana bar
    const barW = 50;
    ctx.fillStyle = '#000a';
    ctx.fillRect(this.x - barW / 2, this.y - 34, barW, 6);
    ctx.fillStyle = '#3ecb3e';
    ctx.fillRect(this.x - barW / 2, this.y - 34, barW * Math.max(0, this.hp / this.maxHp), 6);
    ctx.fillStyle = '#000a';
    ctx.fillRect(this.x - barW / 2, this.y - 27, barW, 4);
    ctx.fillStyle = '#3f8fe0';
    ctx.fillRect(this.x - barW / 2, this.y - 27, barW * Math.max(0, this.mana / this.maxMana), 4);

    // level badge
    ctx.fillStyle = '#ffd54a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Lv.' + this.level, this.x, this.y + 40);

    if (this.shield > 0 && this.shieldUntil > performance.now()) {
      ctx.strokeStyle = '#ffe98a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, 30, 0, Math.PI * 2); ctx.stroke();
    }
    if (this.recalling) {
      ctx.fillStyle = 'rgba(150,120,255,0.5)';
      ctx.beginPath(); ctx.arc(this.x, this.y, 34, 0, Math.PI * 2); ctx.fill();
    }
  }
}
