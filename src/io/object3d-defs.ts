import { Vector3 } from './io-utils';
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
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
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

  const magicToken = textDecoder.decode(new Uint8Array(buffer, 0, 4));
  if (magicToken !== 'e3dx') {
    throw new Error('Not a valid 3D object definition file.');
  }

  const version = view.getUint32(4, true);
  if (!(version in SupportedVersion)) {
    throw new Error('Not a supported 3D object definition file version.');
  }

  const md5Hash = textDecoder.decode(new Uint8Array(buffer, 8, 16)); // TODO: check hash is correct
  const offset = view.getUint32(24, true);
  const vertexCount = view.getUint32(offset, true);
  const vertexSize = view.getUint32(offset + 4, true);
  const vertexOffset = view.getUint32(offset + 8, true);
  const indexCount = view.getUint32(offset + 12, true);
  const indexSize = view.getUint32(offset + 16, true);
  const indexOffset = view.getUint32(offset + 20, true);
  const materialCount = view.getUint32(offset + 24, true);
  const materialSize = view.getUint32(offset + 28, true);
  const materialOffset = view.getUint32(offset + 32, true);
  let vertexOptions = view.getUint8(offset + 36);
  let vertexFormat = view.getUint8(offset + 37);

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
      uvs.push(halfToFloat(view.getUint16(vertexOffset + 2, true)));
      vertexOffset += 4;
    } else {
      uvs.push(view.getFloat32(vertexOffset, true));
      uvs.push(view.getFloat32(vertexOffset + 4, true));
      vertexOffset += 8;
    }

    if (vertexOptions & VertexOption.HAS_SECONDARY_TEXTURE_COORDINATE) {
      if (vertexFormat & VertexFormat.HALF_EXTRA_UV) {
        vertexOffset += 4;
      } else {
        vertexOffset += 8;
      }
    }

    if (vertexOptions & VertexOption.HAS_NORMAL) {
      if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
        const normal = uncompressNormal(view.getUint16(vertexOffset, true));
        normals!.push(normal.x);
        normals!.push(normal.y);
        normals!.push(normal.z);
        vertexOffset += 2;
      } else {
        normals!.push(view.getFloat32(vertexOffset, true));
        normals!.push(view.getFloat32(vertexOffset + 4, true));
        normals!.push(view.getFloat32(vertexOffset + 8, true));
        vertexOffset += 12;
      }
    }

    if (vertexOptions & VertexOption.HAS_TANGENT) {
      if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
        vertexOffset += 2;
      } else {
        vertexOffset += 12;
      }
    }

    if (vertexFormat & VertexFormat.HALF_POSITION) {
      vertices.push(halfToFloat(view.getUint16(vertexOffset, true)));
      vertices.push(halfToFloat(view.getUint16(vertexOffset + 2, true)));
      vertices.push(halfToFloat(view.getUint16(vertexOffset + 4, true)));
      vertexOffset += 6;
    } else {
      vertices.push(view.getFloat32(vertexOffset, true));
      vertices.push(view.getFloat32(vertexOffset + 4, true));
      vertices.push(view.getFloat32(vertexOffset + 8, true));
      vertexOffset += 12;
    }

    if (vertexOptions & VertexOption.HAS_COLOR) {
      colors!.push(view.getUint8(vertexOffset));
      colors!.push(view.getUint8(vertexOffset + 1));
      colors!.push(view.getUint8(vertexOffset + 2));
      colors!.push(view.getUint8(vertexOffset + 3));
      vertexOffset += 4;
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
      indexSize === 2
        ? view.getUint16(indexOffset, true)
        : view.getUint32(indexOffset, true)
    );
    indexOffset += indexSize;
  }

  return new (indexSize === 2 ? Uint16Array : Uint32Array)(indices);
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

  for (let i = 0; i < materialCount; i++) {
    const isTransparent = view.getUint32(materialOffset, true) !== 0;
    const texturePath = textDecoder
      .decode(
        new Uint8Array(buffer, materialOffset + 4, MATERIAL_TEXTURE_NAME_SIZE)
      )
      .replace(/\0*$/, '');
    const min = {
      x: view.getFloat32(materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 4, true),
      y: view.getFloat32(materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 8, true),
      z: view.getFloat32(
        materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 12,
        true
      ),
    };
    const max = {
      x: view.getFloat32(
        materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 16,
        true
      ),
      y: view.getFloat32(
        materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 20,
        true
      ),
      z: view.getFloat32(
        materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 24,
        true
      ),
    };
    const minVerticesIndex = view.getUint32(
      materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 28,
      true
    );
    const maxVerticesIndex = view.getUint32(
      materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 32,
      true
    );
    const index = view.getUint32(
      materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 36,
      true
    );
    const materialCount = view.getUint32(
      materialOffset + MATERIAL_TEXTURE_NAME_SIZE + 40,
      true
    );

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
    materialOffset += materialSize;
  }

  return materials;
}

function calculateVertexSize(
  vertexOptions: number,
  vertexFormat: number
): number {
  let size = 0;

  if (vertexFormat & VertexFormat.HALF_POSITION) {
    size += 6;
  } else {
    size += 12;
  }

  if (vertexFormat & VertexFormat.HALF_UV) {
    size += 4;
  } else {
    size += 8;
  }

  if (vertexOptions & VertexOption.HAS_NORMAL) {
    if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
      size += 2;
    } else {
      size += 12;
    }
  }

  if (vertexOptions & VertexOption.HAS_TANGENT) {
    if (vertexFormat & VertexFormat.COMPRESSED_NORMAL) {
      size += 2;
    } else {
      size += 12;
    }
  }

  if (vertexOptions & VertexOption.HAS_SECONDARY_TEXTURE_COORDINATE) {
    if (vertexFormat & VertexFormat.HALF_EXTRA_UV) {
      size += 4;
    } else {
      size += 8;
    }
  }

  if (vertexOptions & VertexOption.HAS_COLOR) {
    size += 4;
  }

  return size;
}

function calculateIndexSize(vertexFormat: number): number {
  return vertexFormat & VertexFormat.SHORT_INDEX ? 2 : 4;
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
