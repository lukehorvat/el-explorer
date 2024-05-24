import { leftZUpToRightYUpV2, leftZUpToRightYUpV3 } from './utils';

export interface Cal3DMesh {
  vertices: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  skinIndices: Uint16Array;
  skinWeights: Float32Array;
  vertexCollapseIds: number[];
  vertexFaceCollapses: number[];
  vertexWeights: (number | null)[];
  springs: {
    vertexId1: number;
    vertexId2: number;
    springCoefficient: number;
    idleLength: number;
  }[];
  materialId: number;
  lodSteps: number;
}

/**
 * Read a Cal3D mesh (.cmf) file.
 *
 * Implemented according to the spec defined here:
 * https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L134
 */
export function readCal3DMesh(fileData: Buffer): Cal3DMesh[] {
  let offset = 0;

  const magicToken = fileData.toString('ascii', offset, (offset += 4));
  if (magicToken !== 'CMF\0') {
    throw new Error('Not a valid Cal3D mesh file.');
  }

  const subMeshCount = fileData.readInt32LE((offset += 4));
  const subMeshes: Cal3DMesh[] = [];

  for (let i = 0; i < subMeshCount; i++) {
    const materialId = fileData.readInt32LE((offset += 4));
    const vertexCount = fileData.readInt32LE((offset += 4));
    const faceCount = fileData.readInt32LE((offset += 4));
    const lodSteps = fileData.readInt32LE((offset += 4));
    const springCount = fileData.readInt32LE((offset += 4));
    const mapCount = fileData.readInt32LE((offset += 4));
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const skinIndices: number[] = [];
    const skinWeights: number[] = [];
    const vertexCollapseIds: Cal3DMesh['vertexCollapseIds'] = [];
    const vertexFaceCollapses: Cal3DMesh['vertexFaceCollapses'] = [];
    const vertexWeights: Cal3DMesh['vertexWeights'] = [];
    const springs: Cal3DMesh['springs'] = [];

    for (let j = 0; j < vertexCount; j++) {
      const position = leftZUpToRightYUpV3({
        x: fileData.readFloatLE((offset += 4)),
        y: fileData.readFloatLE((offset += 4)),
        z: fileData.readFloatLE((offset += 4)),
      });
      vertices.push(position.x, position.y, position.z);

      const normal = leftZUpToRightYUpV3({
        x: fileData.readFloatLE((offset += 4)),
        y: fileData.readFloatLE((offset += 4)),
        z: fileData.readFloatLE((offset += 4)),
      });
      normals.push(normal.x, normal.y, normal.z);

      vertexCollapseIds.push(fileData.readInt32LE((offset += 4)));
      vertexFaceCollapses.push(fileData.readInt32LE((offset += 4)));

      for (let k = 0; k < mapCount; k++) {
        const uv = leftZUpToRightYUpV2({
          x: fileData.readFloatLE((offset += 4)),
          y: fileData.readFloatLE((offset += 4)),
        });
        uvs.push(uv.x, uv.y);
      }

      const boneInfluenceCount = fileData.readInt32LE((offset += 4));
      for (let k = 0; k < boneInfluenceCount; k++) {
        skinIndices.push(fileData.readUInt32LE((offset += 4)));
        skinWeights.push(fileData.readFloatLE((offset += 4)));
      }

      // Each vertex can be influenced by up to 4 bones. For vertices with
      // less than 4 bone influences, pad the skinning arrays with zeroes.
      for (let k = 0; k < 4 - boneInfluenceCount; k++) {
        skinIndices.push(0);
        skinWeights.push(0);
      }

      vertexWeights.push(
        springCount > 0 ? fileData.readFloatLE((offset += 4)) : null
      );
    }

    for (let j = 0; j < springCount; j++) {
      const vertexId1 = fileData.readInt32LE((offset += 4));
      const vertexId2 = fileData.readInt32LE((offset += 4));
      const springCoefficient = fileData.readFloatLE((offset += 4));
      const idleLength = fileData.readFloatLE((offset += 4));

      springs.push({
        vertexId1,
        vertexId2,
        springCoefficient,
        idleLength,
      });
    }

    for (let j = 0; j < faceCount; j++) {
      indices.push(fileData.readUInt32LE((offset += 4)));
      indices.push(fileData.readUInt32LE((offset += 4)));
      indices.push(fileData.readUInt32LE((offset += 4)));
    }

    subMeshes.push({
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint32Array(indices),
      skinIndices: new Uint16Array(skinIndices),
      skinWeights: new Float32Array(skinWeights),
      vertexCollapseIds,
      vertexFaceCollapses,
      vertexWeights,
      springs,
      materialId,
      lodSteps,
    });
  }

  return subMeshes;
}
