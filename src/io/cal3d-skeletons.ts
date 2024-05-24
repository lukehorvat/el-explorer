import { Quaternion, Vector3, leftZUpToRightYUp } from './utils';

export interface Cal3DBone {
  id: number;
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
 * Implemented according to the spec defined here:
 * https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L52
 */
export function readCal3DSkeleton(fileData: Buffer): Map<number, Cal3DBone> {
  let offset = 0;

  const magicToken = fileData.toString('ascii', offset, (offset += 4));
  if (magicToken !== 'CSF\0') {
    throw new Error('Not a valid Cal3D skeleton file.');
  }

  const bonesCount = fileData.readInt32LE((offset += 4));
  const skeleton = new Map<number, Cal3DBone>();

  for (let i = 0; i < bonesCount; i++) {
    const nameLength = fileData.readInt32LE((offset += 4));
    const name = fileData.toString(
      'ascii',
      (offset += 4),
      (offset += nameLength)
    );
    const translation = leftZUpToRightYUp({
      x: fileData.readFloatLE(offset),
      y: fileData.readFloatLE((offset += 4)),
      z: fileData.readFloatLE((offset += 4)),
    });
    const rotation = leftZUpToRightYUp({
      x: fileData.readFloatLE((offset += 4)),
      y: fileData.readFloatLE((offset += 4)),
      z: fileData.readFloatLE((offset += 4)),
      w: fileData.readFloatLE((offset += 4)),
    });
    const localTranslation = leftZUpToRightYUp({
      x: fileData.readFloatLE((offset += 4)),
      y: fileData.readFloatLE((offset += 4)),
      z: fileData.readFloatLE((offset += 4)),
    });
    const localRotation = leftZUpToRightYUp({
      x: fileData.readFloatLE((offset += 4)),
      y: fileData.readFloatLE((offset += 4)),
      z: fileData.readFloatLE((offset += 4)),
      w: fileData.readFloatLE((offset += 4)),
    });
    const parentId = fileData.readInt32LE((offset += 4));
    const childCount = fileData.readInt32LE((offset += 4));
    const childIds: number[] = [];

    for (let j = 0; j < childCount; j++) {
      childIds.push(fileData.readInt32LE((offset += 4)));
    }

    skeleton.set(i, {
      id: i,
      name,
      translation,
      rotation,
      localTranslation,
      localRotation,
      parentId,
      childIds,
    });
  }

  return skeleton;
}
