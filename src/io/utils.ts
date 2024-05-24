export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export function leftZUpToRightYUpV2(v2: Vector2): Vector2 {
  return { x: v2.x, y: -v2.y };
}

export function leftZUpToRightYUpV3(v3: Vector3): Vector3 {
  const v2 = leftZUpToRightYUpV2(v3);
  return { x: v2.x, y: v3.z, z: v2.y };
}

export function leftZUpToRightYUpQ(q: Quaternion): Quaternion {
  const v3 = leftZUpToRightYUpV3(q);
  return { x: v3.x, y: v3.y, z: v3.z, w: -q.w };
}
