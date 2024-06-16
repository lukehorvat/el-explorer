import { Quaternion, SizeOf, Vector3, leftZUpToRightYUp } from './io-utils';

export interface CalAnimation {
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
 * @see https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L96
 */
export function readCalAnimation(buffer: ArrayBuffer): CalAnimation {
  const view = new DataView(buffer);
  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  const magicToken = textDecoder.decode(
    new Uint8Array(buffer, offset, 4 * SizeOf.Uint8)
  );
  offset += 4 * SizeOf.Uint8;
  if (magicToken !== 'CAF\0') {
    throw new Error('Not a valid Cal3D animation file.');
  }

  const version = view.getInt32(offset, true); // eslint-disable-line @typescript-eslint/no-unused-vars
  offset += SizeOf.Int32;
  const duration = view.getFloat32(offset, true);
  offset += SizeOf.Float32;
  const trackCount = view.getInt32(offset, true);
  offset += SizeOf.Int32;

  const tracks: CalAnimation['tracks'] = [];
  for (let i = 0; i < trackCount; i++) {
    const boneId = view.getInt32(offset, true);
    offset += SizeOf.Int32;
    const keyframeCount = view.getInt32(offset, true);
    offset += SizeOf.Int32;

    const keyframes: CalAnimation['tracks'][0]['keyframes'] = [];
    for (let j = 0; j < keyframeCount; j++) {
      const time = view.getFloat32(offset, true);
      offset += SizeOf.Float32;

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

  if (offset !== buffer.byteLength) {
    throw new Error('Failed to read entire Cal3D animation file.');
  }

  return {
    duration,
    tracks,
  };
}
