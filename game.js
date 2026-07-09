/* ==========================================================================
   game.js — Loop utama, entitas minion, interaksi turret/jungle, ekonomi
   gold & exp, kamera, dan kondisi menang. Menyatukan semua modul lain.
   ========================================================================== */

let _minionIdCounter = 1;
function createMinion(team, laneName) {
  const pts = team === TEAM.BLUE ? LANES[laneName] : [...LANES[laneName]].reverse();
  return {
    id: _minionIdCounter++, team, lane: laneName,
    x: pts[0].x + (Math.random() * 40 - 20), y: pts[0].y + (Math.random() * 40 - 20),
    waypointIndex: 0, hp: 720, maxHp: 720, atk: 46, def: 12, mdef: 8,
    dead: false, atkTimer: 0, moveSpeed: 130, lastAttacker: null
  };
}

class Game {
  constructor(canvas, minimapCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minimapCanvas = minimapCanvas;
    this.mmCtx = minimapCanvas.getContext('2d');

    this.state = {
      heroes: [], minions: [], turrets: buildTurrets(), jungleCamps: buildJungleCamps(),
      effects: [], playerTeam: TEAM.BLUE
    };
    this.bots = [];
    this.matchTime = 0;
    this.minionSpawnTimer = 30; // spawn pertama di detik 30
    this.playerAttackToggle = false;
    this.cam = { x: 0, y: 0 };
    this.matchOver = false;

    this.setupTeams();
    this.ui = new UIController(this);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('click', e => this.handleWorldClick(e));
    this.canvas.addEventListener('touchstart', e => { if (e.touches.length === 1) this.handleWorldClick(e.touches[0]); }, { passive: true });

    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  setupTeams() {
    const blueHeroes = ['korrath', 'sylvara', 'lyric', 'ryuujin', 'elowen'];
    const redHeroes = ['korrath', 'sylvara', 'lyric', 'ryuujin', 'elowen'];
    const lanesAssign = ['top', 'mid', 'mid', 'bottom', 'bottom'];

    blueHeroes.forEach((id, i) => {
      const isPlayer = i === 3; // pemain memegang Ryuujin (fighter) secara default
      const h = new Hero(id, TEAM.BLUE, isPlayer, !isPlayer);
      this.state.heroes.push(h);
      if (isPlayer) this.player = h;
      else this.bots.push(new Bot(h, lanesAssign[i]));
      if (isPlayer) h.lane = lanesAssign[i];
    });
    redHeroes.forEach((id, i) => {
      const h = new Hero(id, TEAM.RED, false, true);
      this.state.heroes.push(h);
      this.bots.push(new Bot(h, lanesAssign[i]));
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleWorldClick(e) {
    if (this.ui.shopOpen) return;
    const rect = this.canvas.getBoundingClientRect();
    const wx = this.cam.x + (e.clientX - rect.left);
    const wy = this.cam.y + (e.clientY - rect.top);
    // klik untuk menyerang musuh terdekat jika ada, kalau tidak set moveTarget manual
    const enemy = findEnemiesInRadius(this.player, this.state, wx, wy, 60)[0];
    if (enemy) this.player.manualTarget = enemy;
    else { this.player.manualTarget = null; this.player.manualMove = { x: wx, y: wy }; }
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.matchOver) this.update(dt);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    this.matchTime += dt;

    this.updatePlayer(dt);
    this.bots.forEach(b => b.update(dt, this.state));
    this.state.heroes.forEach(h => h.update(dt, this.state));

    this.updateMinionSpawning(dt);
    this.updateMinions(dt);
    this.updateTurrets(dt);
    this.updateJungle(dt);
    this.passiveGoldTick(dt);

    updateEffects(dt, this.state);
    this.ui.updateHUD();

    this.cam.x = clamp(this.player.x - this.canvas.width / 2, 0, WORLD_SIZE - this.canvas.width);
    this.cam.y = clamp(this.player.y - this.canvas.height / 2, 0, WORLD_SIZE - this.canvas.height);

    this.checkWinCondition();
  }

  updatePlayer(dt) {
    const p = this.player;
    if (p.dead || p.recalling) return;
    const mv = this.ui.getMoveVector();
    if (Math.hypot(mv.x, mv.y) > 0.1) {
      p.manualTarget = null; p.manualMove = null;
      p.moveTowards(p.x + mv.x * 200, p.y + mv.y * 200, dt);
    } else if (p.manualTarget && !p.manualTarget.dead) {
      const t = p.manualTarget;
      const dist = Math.hypot(t.x - p.x, t.y - p.y);
      if (dist > 120) p.moveTowards(t.x, t.y, dt);
      else p.tryAutoAttack(t, this.state, dt);
    } else if (p.manualMove) {
      const reached = p.moveTowards(p.manualMove.x, p.manualMove.y, dt);
      if (reached) p.manualMove = null;
    } else if (this.playerAttackToggle) {
      const target = findEnemiesInRadius(p, this.state, p.x, p.y, 500)
        .concat(this.state.minions.filter(m => m.team !== p.team && !m.dead))
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (target) {
        const dist = Math.hypot(target.x - p.x, target.y - p.y);
        if (dist > 120) p.moveTowards(target.x, target.y, dt);
        else p.tryAutoAttack(target, this.state, dt);
      }
    }
  }

  updateMinionSpawning(dt) {
    this.minionSpawnTimer -= dt;
    if (this.minionSpawnTimer <= 0) {
      this.minionSpawnTimer = 30;
      ['top', 'mid', 'bottom'].forEach(lane => {
        for (let i = 0; i < 3; i++) {
          this.state.minions.push(createMinion(TEAM.BLUE, lane));
          this.state.minions.push(createMinion(TEAM.RED, lane));
        }
      });
    }
  }

  updateMinions(dt) {
    const arr = this.state.minions;
    arr.forEach(m => {
      if (m.dead) return;
      // Cari target terdekat: minion musuh > turret musuh > hero musuh (agresi ringan)
      let target = arr.find(o => o.team !== m.team && !o.dead && Math.hypot(o.x - m.x, o.y - m.y) < 260);
      if (!target) {
        target = this.state.heroes.find(h => h.team !== m.team && !h.dead && Math.hypot(h.x - m.x, h.y - m.y) < 200);
      }
      if (!target) {
        target = this.state.turrets.find(t => t.team !== m.team && t.alive && t.lane === m.lane && Math.hypot(t.x - m.x, t.y - m.y) < 260);
      }

      if (target) {
        const dist = Math.hypot(target.x - m.x, target.y - m.y);
        if (dist > 90) {
          const dx = target.x - m.x, dy = target.y - m.y;
          m.x += (dx / dist) * m.moveSpeed * dt; m.y += (dy / dist) * m.moveSpeed * dt;
        } else {
          m.atkTimer -= dt;
          if (m.atkTimer <= 0) {
            m.atkTimer = 1;
            const dmg = calcPhysicalDamage(m.atk, target.def || 0);
            if (target.takeDamage) { target.lastAttacker = target.lastAttacker; target.takeDamage(dmg, 'physical', this.state, null); }
            else target.hp -= dmg;
            target.lastAttacker = m;
            spawnDamageText(this.state, target.x, target.y, dmg, 'physical');
            if (target.hp <= 0) this.handleDeath(target, m);
          }
        }
      } else {
        const pts = m.team === TEAM.BLUE ? LANES[m.lane] : [...LANES[m.lane]].reverse();
        const wp = pts[Math.min(m.waypointIndex, pts.length - 1)];
        const dx = wp.x - m.x, dy = wp.y - m.y, d = Math.hypot(dx, dy);
        if (d < 20) { if (m.waypointIndex < pts.length - 1) m.waypointIndex++; }
        else { m.x += (dx / d) * m.moveSpeed * dt; m.y += (dy / d) * m.moveSpeed * dt; }
      }
    });
    this.state.minions = arr.filter(m => !m.dead);
  }

  // Menangani kematian entitas non-hero (minion/monster) demi gold last-hit.
  handleDeath(entity, lastAttacker) {
    if (entity._deadHandled) return;
    entity._deadHandled = true;
    entity.dead = true;
    if (lastAttacker instanceof Hero) {
      const goldAmt = entity.rewardGold || 30;
      lastAttacker.gainGold(goldAmt);
      lastAttacker.gainExp(entity.rewardExp || 25);
      spawnDamageText(this.state, lastAttacker.x, lastAttacker.y - 40, '+' + goldAmt, 'gold');
      playSfx('gold');
    }
  }

  updateTurrets(dt) {
    this.state.turrets.forEach(t => {
      if (!t.alive) return;
      t.atkTimer -= dt;
      // Prioritas: minion musuh dalam range, lalu hero musuh
      let target = this.state.minions.find(m => m.team !== t.team && !m.dead && Math.hypot(m.x - t.x, m.y - t.y) < t.range);
      if (!target) target = this.state.heroes.find(h => h.team !== t.team && !h.dead && Math.hypot(h.x - t.x, h.y - t.y) < t.range);
      if (target && t.atkTimer <= 0) {
        t.atkTimer = 0.9;
        const dmg = target.def !== undefined ? calcPhysicalDamage(t.atk, target.def) : t.atk;
        if (target.takeDamage) target.takeDamage(dmg, 'physical', this.state, null);
        else target.hp -= dmg;
        spawnDamageText(this.state, target.x, target.y, dmg, 'physical');
        if (target.hp <= 0 && !(target instanceof Hero)) this.handleDeath(target, null);
      }
      if (t.hp <= 0 && t.alive) {
        t.alive = false;
        const winningTeam = t.team === TEAM.BLUE ? TEAM.RED : TEAM.BLUE;
        this.state.heroes.filter(h => h.team === winningTeam).forEach(h => { h.gainGold(150); h.gainExp(100); });
        this.ui.addKillFeed(`Turret ${t.lane} milik ${t.team === TEAM.BLUE ? 'Auroran' : 'Emberfall'} hancur!`);
        spawnExplosion(this.state, t.x, t.y, '#ffaa33');
      }
    });
  }

  updateJungle(dt) {
    this.state.jungleCamps.forEach(c => {
      if (!c.alive) {
        c.timer -= dt;
        if (c.timer <= 0) { c.alive = true; c.hp = c.maxHp; }
        return;
      }
      // Cek serangan dari hero terdekat (mendekat otomatis menyerang bila hero AI dekat & bertarung)
      const attacker = this.state.heroes.find(h => !h.dead && Math.hypot(h.x - c.x, h.y - c.y) < 90);
      if (attacker) {
        c.hp -= 6 * dt * 20; // damage simulasi ringan berbasis waktu kontak (disederhanakan)
        if (Math.random() < dt) { // sesekali monster balas menyerang
          attacker.takeDamage(c.type === 'lord' || c.type === 'turtle' ? 40 : 18, 'physical', this.state, null);
        }
        if (c.hp <= 0) {
          c.alive = false; c.timer = c.respawn; c.hp = 0;
          attacker.gainGold(c.type === 'lord' ? 700 : c.type === 'turtle' ? 400 : 120);
          attacker.gainExp(c.type === 'lord' ? 400 : c.type === 'turtle' ? 250 : 90);
          spawnExplosion(this.state, c.x, c.y, '#88ff88');
          this.ui.addKillFeed(`${attacker.name.split(',')[0]} menaklukkan ${c.name}!`);
          if (c.type === 'buff_blue' || c.type === 'buff_red') {
            attacker.buffs.push({ stat: 'atk', amount: 25, until: performance.now() + 60000 });
            attacker.buffs.push({ stat: 'moveSpeed', amount: 20, until: performance.now() + 60000 });
          }
          if (c.type === 'lord' || c.type === 'turtle') {
            // Buff seluruh tim penakluk: bonus damage ke turret sesaat (disederhanakan sebagai heal+atk tim)
            this.state.heroes.filter(h => h.team === attacker.team).forEach(h => {
              h.buffs.push({ stat: 'atk', amount: 15, until: performance.now() + 45000 });
            });
          }
        }
      }
    });
  }

  passiveGoldTick(dt) {
    this._goldTick = (this._goldTick || 0) + dt;
    if (this._goldTick >= 1) {
      this._goldTick = 0;
      this.state.heroes.forEach(h => { if (!h.dead) h.gainGold(4); });
    }
  }

  checkWinCondition() {
    const blueBaseTurret = this.state.turrets.find(t => t.team === TEAM.BLUE && t.lane === 'base');
    const redBaseTurret = this.state.turrets.find(t => t.team === TEAM.RED && t.lane === 'base');
    if (!blueBaseTurret.alive || !redBaseTurret.alive) {
      this.matchOver = true;
      const winner = !blueBaseTurret.alive ? 'Emberfall Dominion (Merah)' : 'Auroran Vanguard (Biru)';
      this.ui.addKillFeed(`🏆 ${winner} MENANG!`);
      document.getElementById('match-over').classList.remove('hidden');
      document.getElementById('match-over-text').textContent = `${winner} Menang!`;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.translate(-this.cam.x, -this.cam.y);

    drawMap(ctx, this.cam, this.state);

    this.state.minions.forEach(m => {
      ctx.fillStyle = m.team === TEAM.BLUE ? '#7fc8ff' : '#ff9d7f';
      ctx.beginPath(); ctx.arc(m.x, m.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000a'; ctx.fillRect(m.x - 12, m.y - 20, 24, 4);
      ctx.fillStyle = '#4f4'; ctx.fillRect(m.x - 12, m.y - 20, 24 * (m.hp / m.maxHp), 4);
    });

    this.state.heroes.forEach(h => h.draw(ctx));
    drawEffects(ctx, this.state);
    drawFogOfWar(ctx, this.state, this.cam.x, this.cam.y, this.canvas.width, this.canvas.height);

    ctx.restore();

    drawMinimap(this.mmCtx, this.state, this.minimapCanvas.width);
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

window.addEventListener('load', () => {
  const canvas = document.getElementById('game-canvas');
  const minimap = document.getElementById('minimap-canvas');
  window.game = new Game(canvas, minimap);
});
