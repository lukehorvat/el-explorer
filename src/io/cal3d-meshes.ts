import { SizeOf, Vector2, Vector3, leftZUpToRightYUp } from './io-utils';

export interface CalMesh {
  positions: Float32Array;
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
 * @see https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L134
 */
export function readCalMesh(buffer: ArrayBuffer): CalMesh[] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  const magicToken = textDecoder.decode(
    new Uint8Array(buffer, offset, 4 * SizeOf.Uint8)
  );
  offset += 4 * SizeOf.Uint8;
  if (magicToken !== 'CMF\0') {
    throw new Error('Not a valid Cal3D mesh file.');
  }

  const version = view.getInt32(offset, true); // eslint-disable-line @typescript-eslint/no-unused-vars
  offset += SizeOf.Int32;
  const subMeshCount = view.getInt32(offset, true);
  offset += SizeOf.Int32;

  const subMeshes: CalMesh[] = [];
  for (let i = 0; i < subMeshCount; i++) {
    const materialId = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const vertexCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const faceCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const lodSteps = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const springCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const mapCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;

    const positions: Vector3[] = [];
    const normals: Vector3[] = [];
    const uvs: Vector2[] = [];
    const faces: Vector3[] = [];
    const skinIndices: number[] = [];
    const skinWeights: number[] = [];
    const vertexCollapseIds: CalMesh['vertexCollapseIds'] = [];
    const vertexFaceCollapses: CalMesh['vertexFaceCollapses'] = [];
    const vertexWeights: CalMesh['vertexWeights'] = [];
    const springs: CalMesh['springs'] = [];

    for (let j = 0; j < vertexCount; j++) {
      positions.push({
        x: view.getFloat32(offset, true),
        y: view.getFloat32(offset + SizeOf.Float32, true),
        z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
      });
      offset += 3 * SizeOf.Float32;

      normals.push({
        x: view.getFloat32(offset, true),
        y: view.getFloat32(offset + SizeOf.Float32, true),
        z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
      });
      offset += 3 * SizeOf.Float32;

      vertexCollapseIds.push(view.getInt32(offset, true));
      offset += SizeOf.Int32;
      vertexFaceCollapses.push(view.getInt32(offset, true));
      offset += SizeOf.Int32;

      for (let k = 0; k < mapCount; k++) {
        uvs.push({
          x: view.getFloat32(offset, true),
          y: view.getFloat32(offset + SizeOf.Float32, true),
        });
        offset += 2 * SizeOf.Float32;
      }

      const boneInfluenceCount = view.getInt32(offset, true);
      offset += SizeOf.Int32;

      const boneInfluences: { boneId: number; weight: number }[] = [];
      for (let k = 0; k < boneInfluenceCount; k++) {
        boneInfluences.push({
          boneId: view.getInt32(offset, true),
          weight: view.getFloat32(offset + SizeOf.Int32, true),
        });
        offset += SizeOf.Int32 + SizeOf.Float32;
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
        offset += SizeOf.Float32;
      } else {
        vertexWeights.push(null);
      }
    }

    for (let j = 0; j < springCount; j++) {
      const vertexId1 = view.getInt32(offset, true);
      offset += SizeOf.Int32;
      const vertexId2 = view.getInt32(offset, true);
      offset += SizeOf.Int32;
      const springCoefficient = view.getFloat32(offset, true);
      offset += SizeOf.Float32;
      const idleLength = view.getFloat32(offset, true);
      offset += SizeOf.Float32;

      springs.push({
        vertexId1,
        vertexId2,
        springCoefficient,
        idleLength,
      });
    }

    for (let j = 0; j < faceCount; j++) {
      faces.push({
        x: view.getInt32(offset, true),
        y: view.getInt32(offset + SizeOf.Int32, true),
        z: view.getInt32(offset + 2 * SizeOf.Int32, true),
      });
      offset += 3 * SizeOf.Int32;
    }

    subMeshes.push({
      positions: new Float32Array(
        positions
          .map<Vector3>(leftZUpToRightYUp)
          .map((p) => [p.x, p.y, p.z])
          .flat()
      ),
      normals: new Float32Array(
        normals
          .map<Vector3>(leftZUpToRightYUp)
          .map((n) => [n.x, n.y, n.z])
          .flat()
      ),
      uvs: new Float32Array(
        uvs
          .map<Vector2>(leftZUpToRightYUp)
          .map((uv) => [uv.x, uv.y])
          .flat()
      ),
      indices: new Uint32Array(faces.map((f) => [f.x, f.y, f.z]).flat()),
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

  if (offset !== buffer.byteLength) {
    throw new Error('Failed to read entire Cal3D mesh file.');
  }

  return subMeshes;
}
