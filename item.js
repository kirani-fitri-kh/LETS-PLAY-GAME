/* ==========================================================================
   item.js — Data item & logika toko (shop).
   Setiap item: { id, name, price, category, stats:{...}, effect (teks unik),
   passiveTag (opsional, dipakai game.js/skill.js untuk efek aktif) }
   ========================================================================== */

const ITEMS = {

  physical: [
    { id: 'p1', name: 'Taring Serigala Kabut', price: 1950, category: 'physical', stats: { atk: 65 }, effect: 'Physical Penetration +15%.' },
    { id: 'p2', name: 'Kapak Titan Retak', price: 2450, category: 'physical', stats: { atk: 75, hp: 300 }, effect: 'Serangan normal memberi damage area kecil (splash).' },
    { id: 'p3', name: 'Cincin Pemburu Fajar', price: 2100, category: 'physical', stats: { atk: 50, critChance: 25 }, effect: 'Critical hit memberi +20% Movement Speed selama 1 detik.' },
    { id: 'p4', name: 'Belati Bayangan Kembar', price: 2000, category: 'physical', stats: { atk: 40, atkSpeed: 25 }, effect: 'Setiap 4 serangan memberi 1 serangan tambahan instan.' },
    { id: 'p5', name: 'Zirah Duri Beruang', price: 2200, category: 'physical', stats: { atk: 55, hp: 400 }, effect: 'Saat diserang, memantulkan 20% damage fisik ke penyerang.' },
    { id: 'p6', name: 'Busur Angin Puyuh', price: 2350, category: 'physical', stats: { atk: 60, atkSpeed: 20 }, effect: 'Serangan menembus 1 musuh tambahan di belakang target.' },
    { id: 'p7', name: 'Gada Penghancur Karang', price: 2600, category: 'physical', stats: { atk: 80, hp: 250 }, effect: 'Damage fisik +8% dari HP maksimum target (maks 200 vs monster).' },
    { id: 'p8', name: 'Sarung Tangan Petir Liar', price: 2150, category: 'physical', stats: { atk: 45, critChance: 20, critDamage: 30 }, effect: 'Critical damage +30%.' },
    { id: 'p9', name: 'Pedang Vampir Merah', price: 2300, category: 'physical', stats: { atk: 65, lifesteal: 18 }, effect: 'Lifesteal fisik +18%.' },
    { id: 'p10', name: 'Zirah Perang Cakar Elang', price: 2500, category: 'physical', stats: { atk: 70, atkSpeed: 15, hp: 200 }, effect: 'Serangan pertama ke target baru +25% bonus damage.' }
  ],

  magic: [
    { id: 'm1', name: 'Tongkat Inti Kristal', price: 2050, category: 'magic', stats: { mp2: 90 }, effect: 'Magic Penetration flat +40.' },
    { id: 'm2', name: 'Jubah Kabut Astral', price: 2250, category: 'magic', stats: { mp2: 75, mana: 500 }, effect: 'Mengembalikan 3% mana maksimum tiap 3 detik.' },
    { id: 'm3', name: 'Permata Api Abadi', price: 2400, category: 'magic', stats: { mp2: 85, hp: 300 }, effect: 'Skill damage memberi burn 2% HP target selama 2 detik.' },
    { id: 'm4', name: 'Orb Kegelapan Bertuah', price: 2600, category: 'magic', stats: { mp2: 100 }, effect: 'Magic damage ke musuh HP di bawah 30% +25%.' },
    { id: 'm5', name: 'Tongkat Petir Bercabang', price: 2350, category: 'magic', stats: { mp2: 80, cdr: 10 }, effect: 'Skill damage memantul ke 1 musuh terdekat (40% damage).' },
    { id: 'm6', name: 'Kalung Roh Beku', price: 2150, category: 'magic', stats: { mp2: 70, hp: 250 }, effect: 'Skill yang mengenai musuh memberi slow 20% selama 1 detik.' },
    { id: 'm7', name: 'Mahkota Cahaya Retak', price: 2500, category: 'magic', stats: { mp2: 95, mana: 400 }, effect: 'Spell Vamp +15%.' },
    { id: 'm8', name: 'Buku Mantra Terlarang', price: 2700, category: 'magic', stats: { mp2: 120 }, effect: 'Ultimate cooldown -20%.' },
    { id: 'm9', name: 'Batu Inti Vulkanik', price: 2300, category: 'magic', stats: { mp2: 85, def: 20 }, effect: 'Magic damage +10% terhadap target dengan shield aktif.' },
    { id: 'm10', name: 'Prisma Bintang Jatuh', price: 2600, category: 'magic', stats: { mp2: 100, cdr: 8 }, effect: 'Setiap cast skill mengisi 1% mana maksimum instan.' }
  ],

  defense: [
    { id: 'd1', name: 'Zirah Kulit Naga', price: 1900, category: 'defense', stats: { hp: 700, def: 30 }, effect: 'Damage fisik yang diterima -6%.' },
    { id: 'd2', name: 'Perisai Batu Leviathan', price: 2000, category: 'defense', stats: { hp: 600, mdef: 40 }, effect: 'Magic damage yang diterima -6%.' },
    { id: 'd3', name: 'Jubah Kabut Pelindung', price: 1850, category: 'defense', stats: { hp: 500, def: 20, mdef: 20 }, effect: 'HP di bawah 40% memberi shield sekali (25% HP maks), cooldown 90 detik.' },
    { id: 'd4', name: 'Helm Penjaga Kuil', price: 2100, category: 'defense', stats: { hp: 800, def: 25 }, effect: 'Mengurangi durasi crowd control yang diterima 30%.' },
    { id: 'd5', name: 'Zirah Duri Karang', price: 1950, category: 'defense', stats: { hp: 650, def: 35 }, effect: 'Serangan musuh ke pemakai memantulkan damage fisik kecil.' },
    { id: 'd6', name: 'Jantung Titan Beku', price: 2200, category: 'defense', stats: { hp: 900 }, effect: 'Regenerasi HP +250% selama di luar pertarungan.' },
    { id: 'd7', name: 'Perisai Cermin Astral', price: 2450, category: 'defense', stats: { hp: 500, mdef: 45 }, effect: 'Memantulkan 15% magic damage ke penyerang.' },
    { id: 'd8', name: 'Baju Zirah Sang Penjaga', price: 2050, category: 'defense', stats: { hp: 750, def: 30, mdef: 15 }, effect: 'Movement speed +5% saat HP di bawah 50%.' },
    { id: 'd9', name: 'Gelang Rantai Belenggu', price: 1800, category: 'defense', stats: { hp: 550, def: 20 }, effect: 'Mengurangi damage crit yang diterima 20%.' },
    { id: 'd10', name: 'Mahkota Penjaga Abadi', price: 2600, category: 'defense', stats: { hp: 1000, def: 20, mdef: 20 }, effect: 'Sekali per pertarungan, bertahan dari damage fatal dengan HP 1 (cooldown 120 detik).' }
  ],

  jungle: [
    { id: 'j1', name: 'Kapak Pemburu Belantara', price: 900, category: 'jungle', stats: { atk: 20, hp: 100 }, effect: 'Damage bonus +40% terhadap monster jungle. Membantu jungling lebih cepat.' },
    { id: 'j2', name: 'Belati Penebas Rimba', price: 950, category: 'jungle', stats: { atk: 25 }, effect: 'True damage tambahan ke monster jungle berdasarkan level.' },
    { id: 'j3', name: 'Totem Pemanggil Buff', price: 850, category: 'jungle', stats: { hp: 150 }, effect: 'Durasi buff merah/biru dari kubu jungle +30%.' },
    { id: 'j4', name: 'Sarung Tangan Pelacak', price: 800, category: 'jungle', stats: { mp2: 15, atk: 10 }, effect: 'Mengungkap lokasi Turtle & Lord di minimap 15 detik sebelum muncul.' },
    { id: 'j5', name: 'Zirah Penakluk Rimba', price: 1000, category: 'jungle', stats: { hp: 200, def: 10 }, effect: 'Heal dari regenerasi saat farming jungle +50%.' }
  ],

  boots: [
    { id: 'b1', name: 'Sepatu Pengembara', price: 800, category: 'boots', stats: { moveSpeed: 60 }, effect: 'Movement speed dasar.' },
    { id: 'b2', name: 'Sepatu Badai Kilat', price: 1050, category: 'boots', stats: { moveSpeed: 55, atkSpeed: 10 }, effect: 'Attack speed tambahan ringan.' },
    { id: 'b3', name: 'Sepatu Penjaga Abadi', price: 1100, category: 'boots', stats: { moveSpeed: 50, def: 20, mdef: 20 }, effect: 'Ketahanan tambahan saat bergerak di dekat musuh.' },
    { id: 'b4', name: 'Sepatu Perapal Mantra', price: 1050, category: 'boots', stats: { moveSpeed: 50, cdr: 5 }, effect: 'Cooldown reduction tambahan.' },
    { id: 'b5', name: 'Sepatu Bayangan Senyap', price: 1000, category: 'boots', stats: { moveSpeed: 65 }, effect: 'Tak terlihat radar musuh selama 1.5 detik saat mulai bergerak dari diam.' }
  ]
};

function allItems() {
  return [...ITEMS.physical, ...ITEMS.magic, ...ITEMS.defense, ...ITEMS.jungle, ...ITEMS.boots];
}

// Terapkan statistik item ke hero (dipanggil saat membeli).
function applyItemToHero(hero, item) {
  if (hero.gold < item.price) return false;
  if (hero.inventory.length >= 6) return false;
  hero.gold -= item.price;
  hero.inventory.push(item);
  const s = item.stats;
  if (s.atk) hero.itemAtk += s.atk;
  if (s.mp2) hero.itemMp2 += s.mp2;
  if (s.hp) { hero.maxHp += s.hp; hero.hp += s.hp; }
  if (s.mana) { hero.maxMana += s.mana; hero.mana += s.mana; }
  if (s.def) hero.itemDef += s.def;
  if (s.mdef) hero.itemMdef += s.mdef;
  if (s.moveSpeed) hero.itemMoveSpeed += s.moveSpeed;
  if (s.atkSpeed) hero.itemAtkSpeed += s.atkSpeed;
  if (s.cdr) hero.itemCdr += s.cdr;
  if (s.lifesteal) hero.itemLifesteal += s.lifesteal;
  if (s.critChance) hero.itemCritChance += s.critChance;
  if (s.critDamage) hero.itemCritDamage += s.critDamage;
  return true;
}
