/* ==========================================================================
   ai.js — Bot controller sederhana berbasis finite-state machine.
   State: LANE (mengikuti jalur & farming), FIGHT (menyerang musuh terdekat),
   RETREAT (kabur saat HP rendah), RECALL (pulang membeli item), PUSH (turret).
   ========================================================================== */

const AI_STATE = { LANE: 'LANE', FIGHT: 'FIGHT', RETREAT: 'RETREAT', RECALL: 'RECALL', PUSH: 'PUSH' };

class Bot {
  constructor(hero, laneName) {
    this.hero = hero;
    hero.lane = laneName;
    this.state = AI_STATE.LANE;
    this.waypointIndex = hero.team === TEAM.BLUE ? 0 : LANES[laneName].length - 1;
    this.decisionTimer = 0;
    this.shopCooldown = 0;
  }

  laneWaypoints() {
    const pts = LANES[this.hero.lane];
    return this.hero.team === TEAM.BLUE ? pts : [...pts].reverse();
  }

  currentWaypoint() {
    const pts = this.laneWaypoints();
    return pts[Math.min(this.waypointIndex, pts.length - 1)];
  }

  update(dt, gameState) {
    const h = this.hero;
    if (h.dead) { this.state = AI_STATE.LANE; return; }

    this.decisionTimer -= dt;
    this.shopCooldown -= dt;

    // Auto-buy item ketika di base / recall & cukup gold
    if (this.shopCooldown <= 0) {
      this.autoBuy(gameState);
      this.shopCooldown = 3;
    }

    // Retreat check
    const hpPct = h.hp / h.maxHp;
    if (hpPct < 0.28 && this.state !== AI_STATE.RETREAT) {
      this.state = AI_STATE.RETREAT;
    }
    if (this.state === AI_STATE.RETREAT) {
      if (hpPct > 0.75 || h.dead) this.state = AI_STATE.LANE;
      else {
        const base = h.team === TEAM.BLUE ? BASE.blue : BASE.red;
        const distToBase = Math.hypot(h.x - base.x, h.y - base.y);
        if (distToBase < 500 && hpPct < 0.9) {
          if (!h.recalling) h.startRecall();
        } else {
          h.moveTowards(base.x, base.y, dt);
        }
        return;
      }
    }
    if (h.recalling) {
      // Batalkan recall jika musuh sangat dekat
      const threat = findEnemiesInRadius(h, gameState, h.x, h.y, 260)[0];
      if (threat) h.cancelRecall();
      return;
    }

    // Cari musuh terdekat dalam radius agresi
    const aggroRadius = 480;
    const enemy = this.findBestTarget(gameState, aggroRadius);
    const enemyTurret = gameState.turrets.find(t => t.team !== h.team && t.alive &&
      Math.hypot(t.x - h.x, t.y - h.y) < 500 && t.lane === h.lane);

    if (enemy) {
      this.state = AI_STATE.FIGHT;
      this.fight(enemy, gameState, dt);
    } else if (enemyTurret && this.friendlyMinionsNear(gameState, enemyTurret)) {
      this.state = AI_STATE.PUSH;
      this.pushTurret(enemyTurret, gameState, dt);
    } else {
      this.state = AI_STATE.LANE;
      this.followLane(gameState, dt);
    }
  }

  friendlyMinionsNear(gameState, turret) {
    return gameState.minions.some(m => m.team === this.hero.team && !m.dead &&
      Math.hypot(m.x - turret.x, m.y - turret.y) < 400);
  }

  findBestTarget(gameState, radius) {
    const enemies = findEnemiesInRadius(this.hero, gameState, this.hero.x, this.hero.y, radius);
    if (enemies.length === 0) return null;
    // Prioritaskan HP terendah (target termudah dibunuh)
    enemies.sort((a, b) => a.hp - b.hp);
    return enemies[0];
  }

  fight(enemy, gameState, dt) {
    const h = this.hero;
    const dist = Math.hypot(enemy.x - h.x, enemy.y - h.y);
    // Coba pakai skill jika di range & tidak stun
    if (dist < 450) {
      ['ultimate', 'skill1', 'skill2'].forEach(slot => {
        if (h.canCast(slot)) {
          const def = SKILL_DEFINITIONS[h.heroId][slot];
          if (dist <= (def.castRange || 999) || def.castRange === 0) {
            h.castSkill(slot, enemy, gameState);
          }
        }
      });
    }
    if (dist > 120) {
      h.moveTowards(enemy.x, enemy.y, dt);
    } else {
      h.tryAutoAttack(enemy, gameState, dt);
    }
  }

  pushTurret(turret, gameState, dt) {
    const h = this.hero;
    const dist = Math.hypot(turret.x - h.x, turret.y - h.y);
    if (dist > 120) h.moveTowards(turret.x, turret.y, dt);
    else h.tryAutoAttack(turret, gameState, dt);
  }

  followLane(gameState, dt) {
    const h = this.hero;
    const wp = this.currentWaypoint();
    const reached = h.moveTowards(wp.x, wp.y, dt);
    if (reached) {
      const pts = this.laneWaypoints();
      if (this.waypointIndex < pts.length - 1) this.waypointIndex++;
    }
    // Last-hit farming minion terdekat di jalur
    const minion = gameState.minions.find(m => m.team !== h.team && !m.dead &&
      Math.hypot(m.x - h.x, m.y - h.y) < 130);
    if (minion) h.tryAutoAttack(minion, gameState, dt);
  }

  autoBuy(gameState) {
    const h = this.hero;
    if (h.inventory.length >= 6) return;
    const pool = h.role === 'Mage' || h.role === 'Support' ? ITEMS.magic
      : h.role === 'Tank' ? ITEMS.defense
      : ITEMS.physical;
    // Beli sepatu dulu jika belum ada
    const hasBoots = h.inventory.some(i => i.category === 'boots');
    const candidates = !hasBoots ? ITEMS.boots : pool;
    const affordable = candidates.filter(i => i.price <= h.gold && !h.inventory.includes(i));
    if (affordable.length > 0 && (h.recalling || Math.hypot(h.x - h.spawnPoint.x, h.y - h.spawnPoint.y) < 400)) {
      const pick = affordable[Math.floor(Math.random() * affordable.length)];
      applyItemToHero(h, pick);
    }
  }
}
