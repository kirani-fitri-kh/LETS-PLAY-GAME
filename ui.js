/* ==========================================================================
   ui.js — Kontrol sentuh (joystick, tombol skill), HUD, shop panel, dan
   efek visual dunia (damage text, particle burst) yang digambar di canvas.
   ========================================================================== */

// ---------------------------------------------------------------------
// Efek visual dunia (dipanggil dari hero.js / skill.js)
// ---------------------------------------------------------------------
function spawnDamageText(gameState, x, y, value, type, big = false) {
  gameState.effects.push({
    kind: 'text', x, y: y - 10, value, type, big,
    life: 0.9, maxLife: 0.9, vy: -40
  });
}

function spawnParticleBurst(gameState, x, y, element) {
  const colorMap = {
    'Tanah': '#8a6d3b', 'Api': '#ff6b3f', 'Bayangan': '#8a4fd6',
    'Air/Astral': '#3fb8e0', 'Angin': '#e0d23f', 'Cahaya': '#fff2b0'
  };
  const color = colorMap[element] || '#ffffff';
  for (let i = 0; i < 14; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 60 + Math.random() * 120;
    gameState.effects.push({
      kind: 'particle', x, y, color,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 0.5 + Math.random() * 0.3, maxLife: 0.8, r: 3 + Math.random() * 3
    });
  }
}

function spawnExplosion(gameState, x, y, color = '#ffcc55') {
  gameState.effects.push({ kind: 'explosion', x, y, life: 0.4, maxLife: 0.4, color });
}

function updateEffects(dt, gameState) {
  gameState.effects = gameState.effects.filter(e => {
    e.life -= dt;
    if (e.kind === 'text') e.y += e.vy * dt;
    if (e.kind === 'particle') { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= 0.9; e.vy *= 0.9; }
    return e.life > 0;
  });
}

function drawEffects(ctx, gameState) {
  gameState.effects.forEach(e => {
    const alpha = Math.max(0, e.life / e.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (e.kind === 'text') {
      let color = '#fff', prefix = '';
      if (e.type === 'physical') color = '#ffe27a';
      else if (e.type === 'magic') color = '#8fd7ff';
      else if (e.type === 'heal') { color = '#7dff9e'; prefix = '+'; }
      else if (e.type === 'gold') color = '#ffd54a';
      ctx.font = (e.big ? 'bold 22px' : 'bold 15px') + ' sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(prefix + e.value, e.x, e.y);
    } else if (e.kind === 'particle') {
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    } else if (e.kind === 'explosion') {
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(e.x, e.y, 50 * (1 - alpha), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------------
// Kontrol: joystick, tombol aksi, shop, HUD
// ---------------------------------------------------------------------
class UIController {
  constructor(game) {
    this.game = game;
    this.moveVector = { x: 0, y: 0 };
    this.joystickActive = false;
    this.shopOpen = false;
    this.cacheElements();
    this.bindJoystick();
    this.bindButtons();
    this.bindShop();
  }

  cacheElements() {
    this.el = {
      joystickZone: document.getElementById('joystick-zone'),
      joystickStick: document.getElementById('joystick-stick'),
      btnAttack: document.getElementById('btn-attack'),
      btnSkill1: document.getElementById('btn-skill1'),
      btnSkill2: document.getElementById('btn-skill2'),
      btnUlt: document.getElementById('btn-ultimate'),
      btnRecall: document.getElementById('btn-recall'),
      btnShop: document.getElementById('btn-shop'),
      shopPanel: document.getElementById('shop-panel'),
      shopClose: document.getElementById('shop-close'),
      shopGrid: document.getElementById('shop-grid'),
      shopTabs: document.querySelectorAll('.shop-tab'),
      hpFill: document.getElementById('hp-fill'),
      mpFill: document.getElementById('mp-fill'),
      goldText: document.getElementById('gold-text'),
      levelText: document.getElementById('level-text'),
      kdaText: document.getElementById('kda-text'),
      timerText: document.getElementById('timer-text'),
      killFeed: document.getElementById('kill-feed'),
      respawnOverlay: document.getElementById('respawn-overlay'),
      inventoryBar: document.getElementById('inventory-bar')
    };
  }

  bindJoystick() {
    const zone = this.el.joystickZone, stick = this.el.joystickStick;
    let originX = 0, originY = 0;
    const start = (clientX, clientY) => {
      this.joystickActive = true;
      const rect = zone.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    };
    const move = (clientX, clientY) => {
      if (!this.joystickActive) return;
      let dx = clientX - originX, dy = clientY - originY;
      const maxR = 45;
      const d = Math.hypot(dx, dy);
      if (d > maxR) { dx = (dx / d) * maxR; dy = (dy / d) * maxR; }
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      const norm = Math.max(d, 1) > maxR ? maxR : d;
      this.moveVector.x = dx / maxR;
      this.moveVector.y = dy / maxR;
    };
    const end = () => {
      this.joystickActive = false;
      this.moveVector.x = 0; this.moveVector.y = 0;
      stick.style.transform = 'translate(0px, 0px)';
    };

    zone.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; start(t.clientX, t.clientY); }, { passive: false });
    zone.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: false });
    zone.addEventListener('touchend', e => { e.preventDefault(); end(); }, { passive: false });

    zone.addEventListener('mousedown', e => { start(e.clientX, e.clientY); const mm = ev => move(ev.clientX, ev.clientY); const mu = () => { end(); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); }; window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu); });

    // Dukungan keyboard (WASD) untuk desktop
    this.keys = {};
    window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
  }

  getMoveVector() {
    if (this.joystickActive) return this.moveVector;
    let x = 0, y = 0;
    if (this.keys['w'] || this.keys['arrowup']) y -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) y += 1;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;
    const d = Math.hypot(x, y);
    if (d > 0) { x /= d; y /= d; }
    return { x, y };
  }

  bindButtons() {
    const g = this.game;
    const nearestEnemy = () => {
      const p = g.player;
      return findEnemiesInRadius(p, g.state, p.x, p.y, 900)
        .concat(g.state.minions.filter(m => m.team !== p.team && !m.dead))
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    };
    this.el.btnAttack.addEventListener('click', () => { g.playerAttackToggle = !g.playerAttackToggle; this.el.btnAttack.classList.toggle('active', g.playerAttackToggle); });
    this.el.btnSkill1.addEventListener('click', () => g.player.castSkill('skill1', nearestEnemy(), g.state));
    this.el.btnSkill2.addEventListener('click', () => g.player.castSkill('skill2', nearestEnemy(), g.state));
    this.el.btnUlt.addEventListener('click', () => g.player.castSkill('ultimate', nearestEnemy(), g.state));
    this.el.btnRecall.addEventListener('click', () => {
      if (g.player.recalling) g.player.cancelRecall();
      else g.player.startRecall();
    });
    this.el.btnShop.addEventListener('click', () => this.toggleShop());
  }

  toggleShop() {
    this.shopOpen = !this.shopOpen;
    this.el.shopPanel.classList.toggle('hidden', !this.shopOpen);
    if (this.shopOpen) this.renderShop('boots');
  }

  bindShop() {
    this.el.shopClose.addEventListener('click', () => { this.shopOpen = false; this.el.shopPanel.classList.add('hidden'); });
    this.el.shopTabs.forEach(tab => {
      tab.addEventListener('click', () => this.renderShop(tab.dataset.cat));
    });
  }

  renderShop(category) {
    this.el.shopTabs.forEach(t => t.classList.toggle('active', t.dataset.cat === category));
    const list = ITEMS[category] || [];
    this.el.shopGrid.innerHTML = '';
    const player = this.game.player;
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-item' + (player.gold < item.price ? ' disabled' : '');
      card.innerHTML = `<div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price">${item.price}g</div>
        <div class="shop-item-effect">${item.effect}</div>`;
      card.addEventListener('click', () => {
        if (applyItemToHero(player, item)) {
          this.renderShop(category);
          this.renderInventory();
        }
      });
      this.el.shopGrid.appendChild(card);
    });
  }

  renderInventory() {
    const bar = this.el.inventoryBar;
    bar.innerHTML = '';
    this.game.player.inventory.forEach(it => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.title = it.name;
      slot.textContent = it.name.slice(0, 2);
      bar.appendChild(slot);
    });
  }

  addKillFeed(text) {
    const div = document.createElement('div');
    div.className = 'kill-feed-item';
    div.textContent = text;
    this.el.killFeed.prepend(div);
    setTimeout(() => div.remove(), 4500);
    if (this.el.killFeed.children.length > 6) this.el.killFeed.lastChild.remove();
  }

  updateHUD() {
    const p = this.game.player;
    this.el.hpFill.style.width = Math.max(0, (p.hp / p.maxHp) * 100) + '%';
    this.el.mpFill.style.width = Math.max(0, (p.mana / p.maxMana) * 100) + '%';
    this.el.goldText.textContent = Math.floor(p.gold) + 'g';
    this.el.levelText.textContent = 'Lv.' + p.level;
    this.el.kdaText.textContent = `${p.kills}/${p.deaths}/${p.assists}`;
    const t = Math.floor(this.game.matchTime);
    this.el.timerText.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

    // Cooldown overlays
    [['skill1', this.el.btnSkill1], ['skill2', this.el.btnSkill2], ['ultimate', this.el.btnUlt]].forEach(([slot, btn]) => {
      const def = SKILL_DEFINITIONS[p.heroId][slot];
      const remain = Math.max(0, (p.cooldowns[slot] - performance.now()) / 1000);
      const overlay = btn.querySelector('.cd-overlay');
      if (remain > 0) {
        overlay.style.height = Math.min(100, (remain / def.cooldown) * 100) + '%';
        overlay.textContent = Math.ceil(remain);
      } else { overlay.style.height = '0%'; overlay.textContent = ''; }
      btn.classList.toggle('no-mana', p.mana < def.manaCost);
    });

    this.el.respawnOverlay.classList.toggle('hidden', !p.dead);
    if (p.dead) {
      const remain = Math.max(0, (p.respawnAt - performance.now()) / 1000);
      this.el.respawnOverlay.textContent = `Bangkit dalam ${remain.toFixed(1)}s`;
    }
  }
}
