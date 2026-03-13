export const COLS = 20, ROWS = 14, TILE = 36;

export const TOWER_DEFS = [
  { id:'laser', name:'Laser Turret', cost:50, range:120, damage:8, rate:8, color:'#0ff',
    desc:'Fast beam weapon', bulletColor:'#0ff', bulletSpeed:8, splash:0 },
  { id:'plasma', name:'Plasma Cannon', cost:100, range:140, damage:30, rate:25, color:'#f0f',
    desc:'Heavy plasma bolts', bulletColor:'#f0f', bulletSpeed:5, splash:30 },
  { id:'emp', name:'EMP Tower', cost:75, range:110, damage:5, rate:15, color:'#ff0',
    desc:'Slows all nearby bots', bulletColor:'#ff0', bulletSpeed:6, splash:0, slow:0.4 },
  { id:'rail', name:'Railgun', cost:150, range:200, damage:60, rate:50, color:'#f60',
    desc:'Long-range piercer', bulletColor:'#f84', bulletSpeed:12, splash:0, pierce:true },
  { id:'tesla', name:'Tesla Coil', cost:120, range:100, damage:15, rate:12, color:'#8ff',
    desc:'Chain lightning x3', bulletColor:'#8ff', bulletSpeed:0, splash:0, chain:3 },
  { id:'cryo', name:'Cryo Cannon', cost:90, range:130, damage:12, rate:18, color:'#6ef',
    desc:'Freezes in AOE', bulletColor:'#aef', bulletSpeed:5, splash:45, slow:0.6 },
  { id:'missile', name:'Missile Battery', cost:175, range:220, damage:45, rate:35, color:'#f92',
    desc:'Homing missiles', bulletColor:'#f92', bulletSpeed:4, splash:40, homing:true },
];

export const MINE_DEF = { id:'mine', name:'Proximity Mine', cost:40, color:'#f42', damage:80, splashRadius:50,
  desc:'Place on road' };

export const ENEMY_TYPES = [
  { name:'Scout', hp:30, speed:1.8, reward:10, color:'#f44', size:6 },
  { name:'Soldier', hp:80, speed:1.2, reward:20, color:'#fa0', size:8 },
  { name:'Tank', hp:200, speed:0.7, reward:40, color:'#a44', size:11 },
  { name:'Drone', hp:50, speed:2.5, reward:15, color:'#4af', size:5 },
  { name:'Mech', hp:500, speed:0.5, reward:80, color:'#f4f', size:14 },
  { name:'Swarm', hp:20, speed:2.2, reward:5, color:'#4f4', size:4 },
  { name:'Titan', hp:1500, speed:0.35, reward:200, color:'#fff', size:16 },
];
