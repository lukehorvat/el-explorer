import { Quaternion, SizeOf, Vector3, leftZUpToRightYUp } from './io-utils';

export interface CalBone {
  name: string;
  translation: Vector3;
  rotation: Quaternion;
  localTranslation: Vector3;
  localRotation: Quaternion;
  parentId: number;
  childIds: number[];
}

/**
 * Read a Cal3D skeleton (.csf) file.
 *
 * @see https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L52
 */
export function readCalSkeleton(buffer: ArrayBuffer): CalBone[] {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  const magicToken = textDecoder.decode(
    new Uint8Array(buffer, offset, 4 * SizeOf.Uint8)
  );
  offset += 4 * SizeOf.Uint8;
  if (magicToken !== 'CSF\0') {
    throw new Error('Not a valid Cal3D skeleton file.');
  }

  const version = view.getInt32(offset, true); // eslint-disable-line @typescript-eslint/no-unused-vars
  offset += SizeOf.Int32;
  const bonesCount = view.getInt32(offset, true);
  offset += SizeOf.Int32;

  const skeleton: CalBone[] = [];
  for (let i = 0; i < bonesCount; i++) {
    const nameLength = view.getInt32(offset, true);
    offset += SizeOf.Int32;

    const name = textDecoder.decode(new Uint8Array(buffer, offset, nameLength));
    offset += nameLength;

    const translation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const rotation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
      w: view.getFloat32(offset + 3 * SizeOf.Float32, true),
    });
    offset += 4 * SizeOf.Float32;

    const localTranslation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
    });
    offset += 3 * SizeOf.Float32;

    const localRotation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + SizeOf.Float32, true),
      z: view.getFloat32(offset + 2 * SizeOf.Float32, true),
      w: view.getFloat32(offset + 3 * SizeOf.Float32, true),
    });
    offset += 4 * SizeOf.Float32;

    const parentId = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const childCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;

    const childIds: number[] = [];
    for (let j = 0; j < childCount; j++) {
      childIds.push(view.getInt32(offset, true));
      offset += SizeOf.Int32;
    }

    skeleton.push({
      name,
      translation,
      rotation,
      localTranslation,
      localRotation,
      parentId,
      childIds,
    });
  }

  if (offset !== buffer.byteLength) {
    throw new Error('Failed to read entire Cal3D skeleton file.');
  }

  return skeleton;
}
