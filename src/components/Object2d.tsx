import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetCache } from '../lib/asset-cache';
import { Object2dType } from '../io/object2d-defs';

/**
 * An EL 2D object as a Three.js mesh!
 */
export function Object2d({
  defPath,
  ...meshProps
}: { defPath: string } & ThreeElements['mesh']): React.JSX.Element {
  return (
    <mesh {...meshProps} receiveShadow>
      <Object2dGeometry defPath={defPath} />
      <Object2dMaterial defPath={defPath} />
    </mesh>
  );
}

export function Object2dGeometry({
  defPath,
}: {
  defPath: string;
}): React.JSX.Element {
  const object2dDef = AssetCache.object2dDefs.get(defPath)!;
  const planeRef = useRef<THREE.PlaneGeometry>(null!);

  useLayoutEffect(() => {
    if (object2dDef.type === Object2dType.GROUND) {
      planeRef.current.rotateX(THREE.MathUtils.degToRad(-90));
    } else {
      // It's not clear how to render non-ground 2D objects. They aren't used anymore anyway...
      throw new Error('Unsupported 2D object type encountered.');
    }
  }, [object2dDef]);

  return (
    <planeGeometry
      args={[object2dDef.width, object2dDef.height]}
      ref={planeRef}
    >
      {object2dDef.uvs && (
        <bufferAttribute attach="attributes-uv" args={[object2dDef.uvs, 2]} />
      )}
    </planeGeometry>
  );
}

export function Object2dMaterial({
  defPath,
}: {
  defPath: string;
}): React.JSX.Element {
  const object2dDef = AssetCache.object2dDefs.get(defPath)!;
  const texture = AssetCache.ddsTextures.get(object2dDef.texturePath)!;

  return (
    <meshBasicMaterial
      map={texture}
      side={THREE.DoubleSide}
      alphaTest={object2dDef.alphaTest ?? 0.18}
      blending={THREE.CustomBlending}
      blendSrc={THREE.SrcAlphaFactor}
      blendDst={THREE.OneMinusSrcAlphaFactor}
    />
  );
}
