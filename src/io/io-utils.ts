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

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Convert a vector from a left-handed Z-up coordinate system to a right-handed
 * Y-up coordinate system.
 *
 * Necessary because many 3D dev tools (e.g. Three.js) are right-handed Y-up and
 * EL's mesh files appear to be left-handed Z-up.
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

export enum SizeOf {
  Int8 = Int8Array.BYTES_PER_ELEMENT,
  Uint8 = Uint8Array.BYTES_PER_ELEMENT,
  Int16 = Int16Array.BYTES_PER_ELEMENT,
  Uint16 = Uint16Array.BYTES_PER_ELEMENT,
  Int32 = Int32Array.BYTES_PER_ELEMENT,
  Uint32 = Uint32Array.BYTES_PER_ELEMENT,
  Float32 = Float32Array.BYTES_PER_ELEMENT,
}
