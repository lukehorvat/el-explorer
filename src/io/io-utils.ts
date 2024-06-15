export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 extends Vector2 {
  z: number;
}

export interface Quaternion extends Vector3 {
  w: number;
}

type Vector = Vector2 | Vector3 | Quaternion;

/**
 * Convert a vector from a left-handed Z-up coordinate system to a right-handed
 * Y-up coordinate system.
 *
 * Necessary because many 3D dev tools (e.g. Three.js) are right-handed Y-up and
 * EL's Cal3D files appear to be left-handed Z-up.
 */
export function leftZUpToRightYUp(v: Quaternion): Quaternion;
export function leftZUpToRightYUp(v: Vector3): Vector3;
export function leftZUpToRightYUp(v: Vector2): Vector2;
export function leftZUpToRightYUp(v: Vector): Vector {
  return 'w' in v
    ? { x: v.x, y: v.z, z: -v.y, w: -v.w }
    : 'z' in v
    ? { x: v.x, y: v.z, z: -v.y }
    : { x: v.x, y: -v.y };
}
