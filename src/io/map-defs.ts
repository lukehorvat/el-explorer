/**
 * An EL map definition.
 *
 * It doesn't represent an actual map instance that exists in-game with actors
 * operating on it; it's merely a definition.
 *
 * Ideally it should only be read from file once, cached somewhere, and then
 * reused as needed by actual map instances in-game.
 */
export interface MapDef {
  foo: number;
}

/**
 * Read an EL map definition (.elm) file.
 */
export function readMapDef(buffer: ArrayBuffer): MapDef {
  return { foo: buffer.byteLength };
}
