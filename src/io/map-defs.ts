import { Color, SizeOf, Vector3, leftZUpToRightYUp } from './io-utils';

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
  tileMap: {
    width: number;
    height: number;
    tiles: number[];
  };
  elevationMap: {
    width: number;
    height: number;
    blocks: number[];
  };
  object3ds: {
    id: number;
    defPath: string;
    position: Vector3;
    rotation: Vector3;
    isSelfLit: boolean;
    isBlended: boolean;
    color: Color;
    scale: number;
  }[];
  object2ds: {
    id: number;
    defPath: string;
    position: Vector3;
    rotation: Vector3;
  }[];
  lights: {
    id: number;
    position: Vector3;
    color: Color;
    quadricAttenuation: number;
  }[];
  particles: {
    id: number;
    defPath: string;
    position: Vector3;
  }[];
}

/**
 * Read an EL map definition (.elm) file.
 */
export function readMapDef(buffer: ArrayBuffer): MapDef {
  const header = readHeader(buffer);
  const tileMap = {
    width: header.tileMapWidth,
    height: header.tileMapHeight,
    tiles: readTiles(
      buffer,
      header.tileMapWidth,
      header.tileMapHeight,
      header.tileMapOffset
    ),
  };
  const elevationMap = {
    width: header.elevationMapWidth,
    height: header.elevationMapHeight,
    blocks: readElevationBlocks(
      buffer,
      header.elevationMapWidth,
      header.elevationMapHeight,
      header.elevationMapOffset
    ),
  };
  const object3ds = readObject3ds(
    buffer,
    header.object3dSize,
    header.object3dsCount,
    header.object3dsOffset
  );
  const object2ds = readObject2ds(
    buffer,
    header.object2dSize,
    header.object2dsCount,
    header.object2dsOffset
  );
  const lights = readLights(
    buffer,
    header.lightSize,
    header.lightsCount,
    header.lightsOffset
  );
  const particles = readParticles(
    buffer,
    header.particleSize,
    header.particlesCount,
    header.particlesOffset
  );

  return {
    tileMap,
    elevationMap,
    object3ds,
    object2ds,
    lights,
    particles,
  };
}

function readHeader(buffer: ArrayBuffer): {
  tileMapWidth: number;
  tileMapHeight: number;
  tileMapOffset: number;
  elevationMapWidth: number;
  elevationMapHeight: number;
  elevationMapOffset: number;
  object3dSize: number;
  object3dsCount: number;
  object3dsOffset: number;
  object2dSize: number;
  object2dsCount: number;
  object2dsOffset: number;
  lightSize: number;
  lightsCount: number;
  lightsOffset: number;
  isDungeon: boolean;
  ambientColor: Color;
  particleSize: number;
  particlesCount: number;
  particlesOffset: number;
  clustersOffset: number;
  version: number;
  terrainOffset: number;
} {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  const magicToken = textDecoder.decode(
    new Uint8Array(buffer, offset, 4 * SizeOf.Uint8)
  );
  offset += 4 * SizeOf.Uint8;
  if (magicToken !== 'elmf') {
    throw new Error('Not a valid map definition file.');
  }

  const tileMapWidth = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const tileMapHeight = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const tileMapOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const elevationMapWidth = tileMapWidth * ELEVATION_MAP_BLOCKS_PER_TILE_AXIS;
  const elevationMapHeight = tileMapHeight * ELEVATION_MAP_BLOCKS_PER_TILE_AXIS;
  const elevationMapOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object3dSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object3dsCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object3dsOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object2dSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object2dsCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const object2dsOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const lightSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const lightsCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const lightsOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const dungeon = view.getUint8(offset);
  offset += SizeOf.Uint8;
  offset += 3; // Bytes reserved for future expansions.
  const ambientColor: Color = {
    r: view.getFloat32(offset, true),
    g: view.getFloat32(offset + SizeOf.Float32, true),
    b: view.getFloat32(offset + 2 * SizeOf.Float32, true),
  };
  offset += 3 * SizeOf.Float32;
  const particleSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const particlesCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const particlesOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const clustersOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const version = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const terrainOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  offset += 7 * SizeOf.Uint32; // Bytes reserved for future expansions.

  return {
    tileMapWidth,
    tileMapHeight,
    tileMapOffset,
    elevationMapWidth,
    elevationMapHeight,
    elevationMapOffset,
    object3dSize,
    object3dsCount,
    object3dsOffset,
    object2dSize,
    object2dsCount,
    object2dsOffset,
    lightSize,
    lightsCount,
    lightsOffset,
    isDungeon: dungeon === 1,
    ambientColor,
    particleSize,
    particlesCount,
    particlesOffset,
    clustersOffset,
    version,
    terrainOffset,
  };
}

function readTiles(
  buffer: ArrayBuffer,
  tileMapWidth: number,
  tileMapHeight: number,
  tileMapOffset: number
): MapDef['tileMap']['tiles'] {
  const tiles = new Uint8Array(
    buffer,
    tileMapOffset,
    tileMapWidth * tileMapHeight
  );
  return [...tiles];
}

function readElevationBlocks(
  buffer: ArrayBuffer,
  elevationMapWidth: number,
  elevationMapHeight: number,
  elevationMapOffset: number
): MapDef['elevationMap']['blocks'] {
  const elevationBlocks = new Uint8Array(
    buffer,
    elevationMapOffset,
    elevationMapWidth * elevationMapHeight
  );
  return [...elevationBlocks];
}

function readObject3ds(
  buffer: ArrayBuffer,
  object3dSize: number,
  object3dsCount: number,
  object3dsOffset: number
): MapDef['object3ds'] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  const object3ds = [];
  let offset = object3dsOffset;

  for (let i = 0; i < object3dsCount; i++) {
    const id = i;
    const defPath = textDecoder
      .decode(new Uint8Array(buffer, offset, DEF_PATH_SIZE))
      .replace(/^\.\//, '')
      .replace(/\0*$/, '');
    offset += DEF_PATH_SIZE;

    const position: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const rotation: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const selfLit = view.getUint8(offset);
    offset += SizeOf.Uint8;

    const blended = view.getUint8(offset);
    offset += SizeOf.Uint8;
    offset += 2; // Padding bytes.

    const color: Color = {
      r: view.getFloat32(offset, true),
      g: view.getFloat32(offset + SizeOf.Float32, true),
      b: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    };
    offset += 3 * SizeOf.Float32;

    const scale = view.getFloat32(offset, true);
    offset += SizeOf.Float32;
    offset += 20; // Bytes reserved for future expansions.

    if (blended === 20) {
      continue;
    }

    object3ds.push({
      id,
      defPath,
      position,
      rotation,
      isSelfLit: selfLit === 1,
      isBlended: blended === 1,
      color,
      scale,
    });
  }

  if (offset - object3dsOffset !== object3dsCount * object3dSize) {
    throw new Error('Failed to read 3D objects.');
  }

  return object3ds;
}

function readObject2ds(
  buffer: ArrayBuffer,
  object2dSize: number,
  object2dsCount: number,
  object2dsOffset: number
): MapDef['object2ds'] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  const object2ds = [];
  let offset = object2dsOffset;

  for (let i = 0; i < object2dsCount; i++) {
    const id = i;
    const defPath = textDecoder
      .decode(new Uint8Array(buffer, offset, DEF_PATH_SIZE))
      .replace(/^\.\//, '')
      .replace(/\0*$/, '');
    offset += DEF_PATH_SIZE;

    const position: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const rotation: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;
    offset += 24; // Bytes reserved for future expansions.

    object2ds.push({
      id,
      defPath,
      position,
      rotation,
    });
  }

  if (offset - object2dsOffset !== object2dsCount * object2dSize) {
    throw new Error('Failed to read 2D objects.');
  }

  return object2ds;
}

function readLights(
  buffer: ArrayBuffer,
  lightSize: number,
  lightsCount: number,
  lightsOffset: number
): MapDef['lights'] {
  const view = new DataView(buffer);
  const lights = [];
  let offset = lightsOffset;

  for (let i = 0; i < lightsCount; i++) {
    const id = i;
    const position: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const color: Color = {
      r: view.getFloat32(offset, true),
      g: view.getFloat32(offset + SizeOf.Float32, true),
      b: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    };
    offset += 3 * SizeOf.Float32;

    const quadricAttenuation = view.getFloat32(offset, true);
    offset += SizeOf.Float32;
    offset += 12; // Bytes reserved for future expansions.

    lights.push({
      id,
      position,
      color,
      quadricAttenuation,
    });
  }

  if (offset - lightsOffset !== lightsCount * lightSize) {
    throw new Error('Failed to read lights.');
  }

  return lights;
}

function readParticles(
  buffer: ArrayBuffer,
  particleSize: number,
  particlesCount: number,
  particlesOffset: number
): MapDef['particles'] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  const particles = [];
  let offset = particlesOffset;

  for (let i = 0; i < particlesCount; i++) {
    const id = i;
    const defPath = textDecoder
      .decode(new Uint8Array(buffer, offset, DEF_PATH_SIZE))
      .replace(/^\.\//, '')
      .replace(/\0*$/, '');
    offset += DEF_PATH_SIZE;

    const position: Vector3 = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;
    offset += 12; // Bytes reserved for future expansions.

    particles.push({
      id,
      defPath,
      position,
    });
  }

  if (offset - particlesOffset !== particlesCount * particleSize) {
    throw new Error('Failed to read particles.');
  }

  return particles;
}

/**
 * The max reserved length of a definition file path.
 */
const DEF_PATH_SIZE = 80;

/**
 * The number of elevation map blocks per tile for a given axis (x or y).
 *
 * From a player's perspective, these blocks are the "walkable" positions/coordinates
 * on a map.
 */
export const ELEVATION_MAP_BLOCKS_PER_TILE_AXIS = 6;

/**
 * The total number of elevation map blocks per tile.
 */
export const ELEVATION_MAP_BLOCKS_PER_TILE =
  ELEVATION_MAP_BLOCKS_PER_TILE_AXIS * ELEVATION_MAP_BLOCKS_PER_TILE_AXIS;

/**
 * The actual size (in units/"metres") of an elevation map block.
 */
export const ELEVATION_MAP_BLOCK_SIZE = 0.5;

/**
 * The actual size (in units/"metres") of a tile.
 */
export const TILE_SIZE =
  ELEVATION_MAP_BLOCKS_PER_TILE_AXIS * ELEVATION_MAP_BLOCK_SIZE;

export const DEFAULT_TILE_ELEVATION = -0.001;

export const WATER_TILE_ELEVATION = -0.25;

export function isValidTile(tileId: number): boolean {
  return tileId >= 0 && tileId < 255;
}

export function isWaterTile(tileId: number): boolean {
  return tileId === 0 || (tileId > 230 && tileId < 255);
}
