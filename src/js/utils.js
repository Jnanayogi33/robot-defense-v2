export function hexColor(hex, alpha) {
  let r, g, b;
  if (hex.length === 4) {
    r = parseInt(hex[1],16)*17; g = parseInt(hex[2],16)*17; b = parseInt(hex[3],16)*17;
  } else {
    r = parseInt(hex.slice(1,3),16); g = parseInt(hex.slice(3,5),16); b = parseInt(hex.slice(5,7),16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
}
