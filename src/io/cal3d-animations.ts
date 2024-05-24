import { Quaternion, Vector3, leftZUpToRightYUp } from './utils';

export interface Cal3DAnimation {
  duration: number;
  tracks: {
    boneId: number;
    keyframes: {
      time: number;
      translation: Vector3;
      rotation: Quaternion;
    }[];
  }[];
}

/**
 * Read a Cal3D animation (.caf) file.
 *
 * Implemented according to the spec defined here:
 * https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L96
 */
export function readCal3DAnimation(buffer: ArrayBuffer): Cal3DAnimation {
  const view = new DataView(buffer);
  let offset = 0;

  const magicToken = String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  );
  offset += 8;
  if (magicToken !== 'CAF\0') {
    throw new Error('Not a valid Cal3D animation file.');
  }

  const duration = view.getFloat32(offset, true);
  offset += 4;

  const trackCount = view.getInt32(offset, true);
  offset += 4;

  const tracks: Cal3DAnimation['tracks'] = [];
  for (let i = 0; i < trackCount; i++) {
    const boneId = view.getInt32(offset, true);
    offset += 4;

    const keyframeCount = view.getInt32(offset, true);
    offset += 4;

    const keyframes: Cal3DAnimation['tracks'][0]['keyframes'] = [];
    for (let j = 0; j < keyframeCount; j++) {
      const time = view.getFloat32(offset, true);
      offset += 4;

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

      keyframes.push({
        time,
        translation,
        rotation,
      });
    }

    tracks.push({
      boneId,
      keyframes,
    });
  }

  return {
    duration,
    tracks,
  };
}
