import { Vector2, Vector3, leftZUpToRightYUp } from './utils';

export interface Cal3DMesh {
  positions: Vector3[];
  normals: Vector3[];
  uvs: Vector2[];
  indices: number[];
  skinIndices: number[];
  skinWeights: number[];
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
    const positions: Cal3DMesh['positions'] = [];
    const normals: Cal3DMesh['normals'] = [];
    const uvs: Cal3DMesh['uvs'] = [];
    const indices: Cal3DMesh['indices'] = [];
    const skinIndices: Cal3DMesh['skinIndices'] = [];
    const skinWeights: Cal3DMesh['skinWeights'] = [];
    const vertexCollapseIds: Cal3DMesh['vertexCollapseIds'] = [];
    const vertexFaceCollapses: Cal3DMesh['vertexFaceCollapses'] = [];
    const vertexWeights: Cal3DMesh['vertexWeights'] = [];
    const springs: Cal3DMesh['springs'] = [];

    for (let j = 0; j < vertexCount; j++) {
      positions.push(
        leftZUpToRightYUp({
          x: fileData.readFloatLE((offset += 4)),
          y: fileData.readFloatLE((offset += 4)),
          z: fileData.readFloatLE((offset += 4)),
        })
      );

      normals.push(
        leftZUpToRightYUp({
          x: fileData.readFloatLE((offset += 4)),
          y: fileData.readFloatLE((offset += 4)),
          z: fileData.readFloatLE((offset += 4)),
        })
      );

      vertexCollapseIds.push(fileData.readInt32LE((offset += 4)));
      vertexFaceCollapses.push(fileData.readInt32LE((offset += 4)));

      for (let k = 0; k < mapCount; k++) {
        uvs.push(
          leftZUpToRightYUp({
            x: fileData.readFloatLE((offset += 4)),
            y: fileData.readFloatLE((offset += 4)),
          })
        );
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
      indices.push(
        fileData.readUInt32LE((offset += 4)),
        fileData.readUInt32LE((offset += 4)),
        fileData.readUInt32LE((offset += 4))
      );
    }

    subMeshes.push({
      positions,
      normals,
      uvs,
      indices,
      skinIndices,
      skinWeights,
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
