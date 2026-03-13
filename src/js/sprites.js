export const sprites = {};

const SPRITE_PATHS = {
  // Tower sprites
  'platform': 'src/sprites/towers/platform.svg',
  'laser-base': 'src/sprites/towers/laser-base.svg',
  'laser-barrel': 'src/sprites/towers/laser-barrel.svg',
  'plasma-base': 'src/sprites/towers/plasma-base.svg',
  'plasma-barrel': 'src/sprites/towers/plasma-barrel.svg',
  'emp': 'src/sprites/towers/emp.svg',
  'rail-base': 'src/sprites/towers/rail-base.svg',
  'rail-barrel': 'src/sprites/towers/rail-barrel.svg',
  'tesla': 'src/sprites/towers/tesla.svg',
  'cryo-base': 'src/sprites/towers/cryo-base.svg',
  'cryo-barrel': 'src/sprites/towers/cryo-barrel.svg',
  'missile-base': 'src/sprites/towers/missile-base.svg',
  'missile-launcher': 'src/sprites/towers/missile-launcher.svg',
  // Robot sprites
  'scout': 'src/sprites/robots/scout.svg',
  'soldier': 'src/sprites/robots/soldier.svg',
  'tank-body': 'src/sprites/robots/tank-body.svg',
  'tank-turret': 'src/sprites/robots/tank-turret.svg',
  'drone': 'src/sprites/robots/drone.svg',
  'mech': 'src/sprites/robots/mech.svg',
  'swarm': 'src/sprites/robots/swarm.svg',
  'titan': 'src/sprites/robots/titan.svg',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    img.src = src;
  });
}

export async function loadSprites() {
  const entries = Object.entries(SPRITE_PATHS);
  const promises = entries.map(async ([name, path]) => {
    const img = await loadImage(path);
    sprites[name] = img;
  });
  await Promise.all(promises);
}
