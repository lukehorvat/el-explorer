import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { assetCache } from '../lib/asset-cache';

/**
 * An EL 3D object as a Three.js mesh!
 */
export function Object3d({
  defPath,
  ...meshProps
}: { defPath: string } & ThreeElements['mesh']): React.JSX.Element {
  const object3dDef = assetCache.object3dDefs.get(defPath)!;
  console.log('!obj', object3dDef);

  return <mesh {...meshProps} receiveShadow></mesh>;
}
