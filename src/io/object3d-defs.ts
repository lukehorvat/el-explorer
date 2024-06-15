/**
 * An EL 3D object definition.
 *
 * It doesn't represent an actual 3D object instance that exists in-game at a
 * position on a map; it's merely a definition.
 *
 * Ideally it should only be read from file once, cached somewhere, and then
 * reused as needed by actual 3D object instances in-game.
 */
export interface Object3dDef {
  vertices: Float32Array;
}

/**
 * Read an EL 3D object definition (.e3d) file.
 */
export function readObject3dDef(buffer: ArrayBuffer): Object3dDef {
  return { vertices: new Float32Array() };
}
