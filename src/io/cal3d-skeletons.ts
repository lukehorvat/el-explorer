import { Quaternion, Vector3, leftZUpToRightYUp } from './io-utils';

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
  let offset = 0;

  const magicToken = String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  );
  offset += 8;
  if (magicToken !== 'CSF\0') {
    throw new Error('Not a valid Cal3D skeleton file.');
  }

  const bonesCount = view.getInt32(offset, true);
  offset += 4;

  const skeleton: CalBone[] = [];
  for (let i = 0; i < bonesCount; i++) {
    const nameLength = view.getInt32(offset, true);
    offset += 4;

    let name = '';
    for (let j = 0; j < nameLength; j++) {
      name += String.fromCharCode(view.getUint8(offset++));
    }

    const translation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    });
    offset += 12;

    const rotation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
      w: view.getFloat32(offset + 12, true),
    });
    offset += 16;

    const localTranslation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    });
    offset += 12;

    const localRotation = leftZUpToRightYUp({
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
      w: view.getFloat32(offset + 12, true),
    });
    offset += 16;

    const parentId = view.getInt32(offset, true);
    offset += 4;

    const childCount = view.getInt32(offset, true);
    offset += 4;

    const childIds: number[] = [];
    for (let j = 0; j < childCount; j++) {
      childIds.push(view.getInt32(offset, true));
      offset += 4;
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
