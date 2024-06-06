import { Vector2, Vector3, leftZUpToRightYUp } from './utils';

export interface CalMesh {
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
export function readCalMesh(buffer: ArrayBuffer): CalMesh[] {
  const view = new DataView(buffer);
  let offset = 0;

  const magicToken = String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  );
  offset += 8;
  if (magicToken !== 'CMF\0') {
    throw new Error('Not a valid Cal3D mesh file.');
  }

  const subMeshCount = view.getInt32(offset, true);
  offset += 4;

  const subMeshes: CalMesh[] = [];
  for (let i = 0; i < subMeshCount; i++) {
    const materialId = view.getInt32(offset, true);
    offset += 4;

    const vertexCount = view.getInt32(offset, true);
    offset += 4;

    const faceCount = view.getInt32(offset, true);
    offset += 4;

    const lodSteps = view.getInt32(offset, true);
    offset += 4;

    const springCount = view.getInt32(offset, true);
    offset += 4;

    const mapCount = view.getInt32(offset, true);
    offset += 4;

    const positions: CalMesh['positions'] = [];
    const normals: CalMesh['normals'] = [];
    const uvs: CalMesh['uvs'] = [];
    const indices: CalMesh['indices'] = [];
    const skinIndices: CalMesh['skinIndices'] = [];
    const skinWeights: CalMesh['skinWeights'] = [];
    const vertexCollapseIds: CalMesh['vertexCollapseIds'] = [];
    const vertexFaceCollapses: CalMesh['vertexFaceCollapses'] = [];
    const vertexWeights: CalMesh['vertexWeights'] = [];
    const springs: CalMesh['springs'] = [];

    for (let j = 0; j < vertexCount; j++) {
      positions.push(
        leftZUpToRightYUp({
          x: view.getFloat32(offset, true),
          y: view.getFloat32(offset + 4, true),
          z: view.getFloat32(offset + 8, true),
        })
      );
      offset += 12;

      normals.push(
        leftZUpToRightYUp({
          x: view.getFloat32(offset, true),
          y: view.getFloat32(offset + 4, true),
          z: view.getFloat32(offset + 8, true),
        })
      );
      offset += 12;

      vertexCollapseIds.push(view.getInt32(offset, true));
      offset += 4;

      vertexFaceCollapses.push(view.getInt32(offset, true));
      offset += 4;

      for (let k = 0; k < mapCount; k++) {
        uvs.push(
          leftZUpToRightYUp({
            x: view.getFloat32(offset, true),
            y: view.getFloat32(offset + 4, true),
          })
        );
        offset += 8;
      }

      const boneInfluenceCount = view.getInt32(offset, true);
      offset += 4;

      const boneInfluences: { boneId: number; weight: number }[] = [];
      for (let k = 0; k < boneInfluenceCount; k++) {
        boneInfluences.push({
          boneId: view.getInt32(offset, true),
          weight: view.getFloat32(offset + 4, true),
        });
        offset += 8;
      }

      // Each vertex can be influenced by up to 4 bones. If a vertex has more
      // than 4, keep the 4 with the highest weights and discard the rest; if a
      // vertex has less than 4, pad the skinning arrays with zeroes.
      boneInfluences.sort((a, b) => b.weight - a.weight);
      for (let k = 0; k < 4; k++) {
        if (k < boneInfluenceCount) {
          skinIndices.push(boneInfluences[k].boneId);
          skinWeights.push(boneInfluences[k].weight);
        } else {
          skinIndices.push(0);
          skinWeights.push(0);
        }
      }

      if (springCount > 0) {
        vertexWeights.push(view.getFloat32(offset, true));
        offset += 4;
      } else {
        vertexWeights.push(null);
      }
    }

    for (let j = 0; j < springCount; j++) {
      const vertexId1 = view.getInt32(offset, true);
      offset += 4;

      const vertexId2 = view.getInt32(offset, true);
      offset += 4;

      const springCoefficient = view.getFloat32(offset, true);
      offset += 4;

      const idleLength = view.getFloat32(offset, true);
      offset += 4;

      springs.push({
        vertexId1,
        vertexId2,
        springCoefficient,
        idleLength,
      });
    }

    for (let j = 0; j < faceCount; j++) {
      indices.push(
        view.getInt32(offset, true),
        view.getInt32(offset + 4, true),
        view.getInt32(offset + 8, true)
      );
      offset += 12;
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
