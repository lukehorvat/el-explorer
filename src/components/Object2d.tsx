import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../lib/asset-cache';

/**
 * An EL 2D object as a Three.js mesh!
 */
export function Object2d({
  defPath,
  ...meshProps
}: { defPath: string } & ThreeElements['mesh']): React.JSX.Element {
  const object2dDef = assetCache.object2dDefs.get(defPath)!;
  const texture = assetCache.ddsTextures.get(object2dDef.texturePath)!;

  return (
    <mesh {...meshProps} receiveShadow>
      <planeGeometry args={[object2dDef.width, object2dDef.height]}>
        {object2dDef.uvs && (
          <bufferAttribute attach="attributes-uv" args={[object2dDef.uvs, 2]} />
        )}
      </planeGeometry>
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        alphaTest={object2dDef.alphaTest ?? 0.18}
        blending={THREE.CustomBlending}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
      />
    </mesh>
  );
}
