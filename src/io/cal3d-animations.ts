export interface Cal3DAnimation {
  duration: number;
  tracks: {
    boneId: number;
    keyframes: {
      time: number;
      translation: {
        x: number;
        y: number;
        z: number;
      };
      rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    }[];
  }[];
}

/**
 * Read a Cal3D animation (.caf) file.
 *
 * Implemented according to the spec defined here:
 * https://github.com/mp3butcher/Cal3D/blob/cf9cb3ec1df6bf6afa0d7ccf72f98ed4484694f4/cal3d/fileformats.txt.in#L96
 */
export function readCal3DAnimation(fileData: Buffer): Cal3DAnimation {
  let offset = 0;

  const magicToken = fileData.toString('ascii', offset, (offset += 4));
  if (magicToken !== 'CAF\0') {
    throw new Error('Not a valid Cal3D animation file.');
  }

  const duration = fileData.readFloatLE((offset += 4));
  const trackCount = fileData.readInt32LE((offset += 4));
  const tracks: Cal3DAnimation['tracks'] = [];

  for (let i = 0; i < trackCount; i++) {
    const boneId = fileData.readInt32LE((offset += 4));
    const keyframeCount = fileData.readInt32LE((offset += 4));
    const keyframes: Cal3DAnimation['tracks'][0]['keyframes'] = [];

    for (let j = 0; j < keyframeCount; j++) {
      const time = fileData.readFloatLE((offset += 4));
      const translation = {
        x: fileData.readFloatLE((offset += 4)),
        y: fileData.readFloatLE((offset += 4)),
        z: fileData.readFloatLE((offset += 4)),
      };
      const rotation = {
        x: fileData.readFloatLE((offset += 4)),
        y: fileData.readFloatLE((offset += 4)),
        z: fileData.readFloatLE((offset += 4)),
        w: fileData.readFloatLE((offset += 4)),
      };

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
