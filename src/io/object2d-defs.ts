import { Vector2 } from './io-utils';

/**
 * An EL 2D object definition.
 *
 * It doesn't represent an actual 2D object instance that exists in-game at a
 * position on a map; it's merely a definition.
 *
 * Ideally it should only be read from file once, cached somewhere, and then
 * reused as needed by actual 2D object instances in-game.
 */
export interface Object2dDef {
  type: Object2dType;
  texturePath: string;
  width: number;
  height: number;
  uvs: Float32Array | null;
  alphaTest: number | null;
}

/**
 * Read an EL 2D object definition (.2d0) file.
 */
export function readObject2dDef(data: string): Object2dDef {
  const lines = data
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/[:=]/))
    .map(([key, value]) => [key.trim(), value.trim()]);

  if (!lines.length) {
    throw new Error('Not a valid 2D object definition file.');
  }

  let type!: Object2dType;
  let texturePath!: string;
  let width!: number;
  let height!: number;
  let uStart: number | null = null;
  let uEnd: number | null = null;
  let vStart: number | null = null;
  let vEnd: number | null = null;
  let alphaTest: number | null = null;
  let fileWidth = 1;
  let fileHeight = 1;

  for (const [key, value] of lines) {
    switch (key) {
      case 'type': {
        const valueUppercased = value.toUpperCase();
        type =
          valueUppercased in Object2dType
            ? Object2dType[valueUppercased as keyof typeof Object2dType]
            : Object2dType.INVALID;
        break;
      }
      case 'texture': {
        texturePath = value;
        break;
      }
      case 'x_size': {
        width = Number(value);
        break;
      }
      case 'y_size': {
        height = Number(value);
        break;
      }
      case 'u_start': {
        uStart = Number(value);
        break;
      }
      case 'u_end': {
        uEnd = Number(value);
        break;
      }
      case 'v_start': {
        vStart = Number(value);
        break;
      }
      case 'v_end': {
        vEnd = Number(value);
        break;
      }
      case 'alpha_test': {
        alphaTest = Number(value);
        break;
      }
      case 'file_x_len': {
        fileWidth = Number(value);
        break;
      }
      case 'file_y_len': {
        fileHeight = Number(value);
        break;
      }
    }
  }

  let uvs!: Vector2[] | null;
  if (uStart != null && uEnd != null && vStart != null && vEnd != null) {
    uStart /= fileWidth;
    uEnd /= fileWidth;
    vStart /= fileHeight;
    vEnd /= fileHeight;
    uvs = [
      { x: uStart, y: vEnd },
      { x: uEnd, y: vEnd },
      { x: uStart, y: vStart },
      { x: uEnd, y: vStart },
    ];
  }

  if (alphaTest != null && alphaTest < 0) {
    alphaTest = 0;
  }

  return {
    type,
    texturePath,
    width,
    height,
    uvs: uvs ? new Float32Array(uvs.map((uv) => [uv.x, uv.y]).flat()) : null,
    alphaTest,
  };
}

export enum Object2dType {
  INVALID = -1,
  GROUND = 0,
  PLANT = 1,
  FENCE = 2,
}
