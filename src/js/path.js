import { TILE } from './config.js';

const PATH_POINTS = [
  [0,3],[4,3],[4,7],[10,7],[10,2],[15,2],[15,10],[19,10]
];

function buildPath() {
  let path = [];
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    let [x1,y1] = PATH_POINTS[i], [x2,y2] = PATH_POINTS[i+1];
    let dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
    let cx = x1, cy = y1;
    while (cx !== x2 || cy !== y2) {
      path.push([cx, cy]);
      if (cx !== x2) cx += dx;
      else cy += dy;
    }
  }
  path.push(PATH_POINTS[PATH_POINTS.length-1]);
  return path;
}

export const PATH = buildPath();
export const pathSet = new Set(PATH.map(p => p[0]+','+p[1]));
