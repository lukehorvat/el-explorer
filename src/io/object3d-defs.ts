import { SizeOf, Vector3 } from './io-utils';
import { halfToFloat } from './half-lut';

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
  normals?: Float32Array | null;
  uvs: Float32Array;
  colors?: Uint8Array | null;
  indices: Uint16Array | Uint32Array;
  materials: {
    isTransparent: boolean;
    texturePath: string;
    min: Vector3;
    max: Vector3;
    minVerticesIndex: number;
    maxVerticesIndex: number;
    index: number;
    materialCount: number;
  }[];
}

/**
 * Read an EL 3D object definition (.e3d) file.
 */
export function readObject3dDef(buffer: ArrayBuffer): Object3dDef {
  const header = readHeader(buffer);
  const { vertices, normals, uvs, colors } = readVertices(
    buffer,
    header.vertexOffset,
    header.vertexCount,
    header.vertexFormat,
    header.vertexOptions
  );
  const indices = readIndices(
    buffer,
    header.indexOffset,
    header.indexCount,
    header.indexSize
  );
  const materials = readMaterials(
    buffer,
    header.materialOffset,
    header.materialCount,
    header.materialSize
  );

  return {
    vertices,
    normals,
    uvs,
    colors,
    indices,
    materials,
  };
}

function readHeader(buffer: ArrayBuffer): {
  vertexCount: number;
  vertexSize: number;
  vertexOffset: number;
  vertexOptions: number;
  vertexFormat: number;
  indexCount: number;
  indexSize: number;
  indexOffset: number;
  materialCount: number;
  materialSize: number;
  materialOffset: number;
} {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  const magicToken = textDecoder.decode(
    new Uint8Array(buffer, offset, 4 * SizeOf.Uint8)
  );
  offset += 4 * SizeOf.Uint8;
  if (magicToken !== 'e3dx') {
    throw new Error('Not a valid 3D object definition file.');
  }

  const version = view.getUint32(4, true);
  offset += SizeOf.Uint32;
  if (!(version in SupportedVersion)) {
    throw new Error('Not a supported 3D object definition file version.');
  }

  // TODO: check that hash is correct
  const md5Hash = textDecoder.decode(
    new Uint8Array(buffer, offset, 16 * SizeOf.Uint8)
  );
  offset += 16 * SizeOf.Uint8;
  offset = view.getUint32(offset, true);
  const vertexCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const vertexSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const vertexOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const indexCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const indexSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const indexOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const materialCount = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const materialSize = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  const materialOffset = view.getUint32(offset, true);
  offset += SizeOf.Uint32;
  let vertexOptions = view.getUint8(offset);
  offset += SizeOf.Uint8;
  let vertexFormat = view.getUint8(offset);
  offset += SizeOf.Uint8;

  if ((version as SupportedVersion) === SupportedVersion.VERSION_1_1) {
    vertexOptions &= VertexOption.OPTION_1_1_MASK;
    vertexFormat &= VertexFormat.FORMAT_MASK;
  } else if ((version as SupportedVersion) === SupportedVersion.VERSION_1_0) {
    vertexOptions |= VertexOption.HAS_NORMAL;
    vertexOptions &= VertexOption.OPTION_1_0_MASK;
    vertexFormat = 0;
  }

  if (vertexSize !== calculateVertexSize(vertexOptions, vertexFormat)) {
    throw new Error('Incorrect vertex size.');
  }

  if (indexSize !== calculateIndexSize(vertexFormat)) {
    throw new Error('Incorrect index size.');
  }

  if (materialSize !== calculateMaterialSize(vertexOptions)) {
    throw new Error('Incorrect material size.');
  }

  return {
    vertexCount,
    vertexSize,
    vertexOffset,
    vertexOptions,
    vertexFormat,
    indexCount,
    indexSize,
    indexOffset,
    materialCount,
    materialSize,
    materialOffset,
  };
}

function readVertices(
  buffer: ArrayBuffer,
  vertexOffset: number,
  vertexCount: number,
  vertexFormat: number,
  vertexOptions: number
): {
  vertices: Object3dDef['vertices'];
  normals: Object3dDef['normals'];
  uvs: Object3dDef['uvs'];
  colors: Object3dDef['colors'];
} {
  const view = new DataView(buffer);
  const vertices: number[] = [];
  const normals: number[] | null =
    vertexOptions & VertexOption.HAS_NORMAL ? [] : null;
  const uvs: number[] = [];
  const colors: number[] | null =
    vertexOptions & VertexOption.HAS_COLOR ? [] : null;

  for (let i = 0; i < vertexCount; ++i) {
    if (vertexFormat & VertexFormat.HALF_UV) {
      uvs.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertexOffset += SizeOf.Uint16;
      uvs.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertexOffset += SizeOf.Uint16;
    } else {
      uvs.push(view.getFloat32(vertexOffset, true));
      vertexOffset += SizeOf.Float32;
      uvs.push(view.getFloat32(vertexOffset, true));
      vertexOffset += SizeOf.Float32;
    }

    if (vertexOptions & VertexOption.HAS_SECONDARY_TEXTURE_COORDINATE) {
      // Skip secondary texture coordinates.
      if (vertexFormat & VertexFormat.HALF_EXTRA_UV) {
        vertexOffset += 2 * SizeOf.Uint16;
      } else {
        vertexOffset += 2 * SizeOf.Float32;
      }
    }

    if (vertexOptions & VertexOption.HAS_NORMAL) {
      if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
        const normal = uncompressNormal(view.getUint16(vertexOffset, true));
        normals!.push(normal.x);
        normals!.push(normal.y);
        normals!.push(normal.z);
        vertexOffset += SizeOf.Uint16;
      } else {
        normals!.push(view.getFloat32(vertexOffset, true));
        vertexOffset += SizeOf.Float32;
        normals!.push(view.getFloat32(vertexOffset, true));
        vertexOffset += SizeOf.Float32;
        normals!.push(view.getFloat32(vertexOffset, true));
        vertexOffset += SizeOf.Float32;
      }
    }

    if (vertexOptions & VertexOption.HAS_TANGENT) {
      // Skip tangents.
      if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
        vertexOffset += SizeOf.Uint16;
      } else {
        vertexOffset += 3 * SizeOf.Float32;
      }
    }

    if (vertexFormat & VertexFormat.HALF_POSITION) {
      vertices.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertexOffset += SizeOf.Uint16;
      vertices.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertexOffset += SizeOf.Uint16;
      vertices.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertexOffset += SizeOf.Uint16;
    } else {
      vertices.push(view.getFloat32(vertexOffset, true));
      vertexOffset += SizeOf.Float32;
      vertices.push(view.getFloat32(vertexOffset, true));
      vertexOffset += SizeOf.Float32;
      vertices.push(view.getFloat32(vertexOffset, true));
      vertexOffset += SizeOf.Float32;
    }

    if (vertexOptions & VertexOption.HAS_COLOR) {
      colors!.push(view.getUint8(vertexOffset));
      vertexOffset += SizeOf.Uint8;
      colors!.push(view.getUint8(vertexOffset));
      vertexOffset += SizeOf.Uint8;
      colors!.push(view.getUint8(vertexOffset));
      vertexOffset += SizeOf.Uint8;
      colors!.push(view.getUint8(vertexOffset));
      vertexOffset += SizeOf.Uint8;
    }
  }

  return {
    vertices: new Float32Array(vertices),
    normals: normals ? new Float32Array(normals) : null,
    uvs: new Float32Array(uvs),
    colors: colors ? new Uint8Array(colors) : null,
  };
}

function readIndices(
  buffer: ArrayBuffer,
  indexOffset: number,
  indexCount: number,
  indexSize: number
): Object3dDef['indices'] {
  const view = new DataView(buffer);
  const indices: number[] = [];

  for (let i = 0; i < indexCount; i++) {
    indices.push(
      indexSize === SizeOf.Uint16
        ? view.getUint16(indexOffset, true)
        : view.getUint32(indexOffset, true)
    );
    indexOffset += indexSize;
  }

  return new (indexSize === SizeOf.Uint16 ? Uint16Array : Uint32Array)(indices);
}

function readMaterials(
  buffer: ArrayBuffer,
  materialOffset: number,
  materialCount: number,
  materialSize: number
): Object3dDef['materials'] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  const materials = [];
  let offset = materialOffset;

  for (let i = 0; i < materialCount; i++) {
    const isTransparent = view.getUint32(offset, true) !== 0;
    offset += SizeOf.Uint32;

    const texturePath = textDecoder
      .decode(new Uint8Array(buffer, offset, MATERIAL_TEXTURE_NAME_SIZE))
      .replace(/\0*$/, '');
    offset += MATERIAL_TEXTURE_NAME_SIZE;

    const min: Vector3 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    };
    offset += 3 * SizeOf.Float32;

    const max: Vector3 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    };
    offset += 3 * SizeOf.Float32;

    const minVerticesIndex = view.getUint32(offset, true);
    offset += SizeOf.Uint32;
    const maxVerticesIndex = view.getUint32(offset, true);
    offset += SizeOf.Uint32;
    const index = view.getUint32(offset, true);
    offset += SizeOf.Uint32;
    const materialCount = view.getUint32(offset, true);
    offset += SizeOf.Uint32;

    materials.push({
      isTransparent,
      texturePath,
      min,
      max,
      minVerticesIndex,
      maxVerticesIndex,
      index,
      materialCount,
    });
  }

  if (offset - materialOffset !== materialCount * materialSize) {
    throw new Error('Failed to read 3D object materials.');
  }

  return materials;
}

function calculateVertexSize(
  vertexOptions: number,
  vertexFormat: number
): number {
  let size = 0;

  if (vertexFormat & VertexFormat.HALF_POSITION) {
    size += 3 * SizeOf.Uint16;
  } else {
    size += 3 * SizeOf.Float32;
  }

  if (vertexFormat & VertexFormat.HALF_UV) {
    size += 2 * SizeOf.Uint16;
  } else {
    size += 2 * SizeOf.Float32;
  }

  if (vertexOptions & VertexOption.HAS_NORMAL) {
    if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
      size += SizeOf.Uint16;
    } else {
      size += 3 * SizeOf.Float32;
    }
  }

  if (vertexOptions & VertexOption.HAS_TANGENT) {
    if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
      size += SizeOf.Uint16;
    } else {
      size += 3 * SizeOf.Float32;
    }
  }

  if (vertexOptions & VertexOption.HAS_SECONDARY_TEXTURE_COORDINATE) {
    if (vertexFormat & VertexFormat.HALF_EXTRA_UV) {
      size += 2 * SizeOf.Uint16;
    } else {
      size += 2 * SizeOf.Float32;
    }
  }

  if (vertexOptions & VertexOption.HAS_COLOR) {
    size += 4 * SizeOf.Uint8;
  }

  return size;
}

function calculateIndexSize(vertexFormat: number): number {
  return vertexFormat & VertexFormat.SHORT_INDEX
    ? SizeOf.Uint16
    : SizeOf.Uint32;
}

function calculateMaterialSize(vertexOptions: number): number {
  let size = MATERIAL_DATA_SIZE;

  if (vertexOptions & VertexOption.HAS_SECONDARY_TEXTURE_COORDINATE) {
    size += 128;
  }

  return size;
}

/**
 * Uncompress a compressed normal.
 */
function uncompressNormal(compressedNormal: number): Vector3 {
  let x = (compressedNormal & 0x1f80) >> 7;
  let y = compressedNormal & 0x007f;

  if (x + y >= 127) {
    x = 127 - x;
    y = 127 - y;
  }

  let z = 126 - x - y;

  if (compressedNormal & 0x8000) {
    x = -x;
  }

  if (compressedNormal & 0x4000) {
    y = -y;
  }

  if (compressedNormal & 0x2000) {
    z = -z;
  }

  const len = Math.sqrt(x * x + y * y + z * z);
  x /= len;
  y /= len;
  z /= len;

  return { x, y, z };
}

/**
 * Supported version numbers for 3D object definition files.
 */
enum SupportedVersion {
  VERSION_1_0 = 0x0001,
  VERSION_1_1 = 0x0101,
}

/**
 * Options for the vertices in 3D object definition files.
 */
enum VertexOption {
  HAS_NORMAL = 0x01,
  HAS_TANGENT = 0x02,
  HAS_SECONDARY_TEXTURE_COORDINATE = 0x04,
  HAS_COLOR = 0x08,
  OPTION_1_0_MASK = 0x07,
  OPTION_1_1_MASK = 0x0f,
}

/**
 * Options for how vertices are stored in 3D object definition files.
 */
enum VertexFormat {
  HALF_POSITION = 0x01,
  HALF_UV = 0x02,
  HALF_EXTRA_UV = 0x04,
  HALF_MASK = 0x07,
  COMPRESSED_NORMAL = 0x08,
  SHORT_INDEX = 0x10,
  FORMAT_MASK = 0x1f,
}

/**
 * The size of a material in a 3D object definition file.
 */
const MATERIAL_DATA_SIZE = 172;

/**
 * The maximum length of a texture filename in a 3D object definition file.
 */
const MATERIAL_TEXTURE_NAME_SIZE = 128;
