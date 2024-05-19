export interface Cal3DAnimation {
  duration: number;
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

  return {
    duration,
  };
}
