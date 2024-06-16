import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../lib/asset-cache';

/**
 * An EL 3D object as a Three.js mesh!
 */
export function Object3d({
  defPath,
  ...meshProps
}: { defPath: string } & ThreeElements['mesh']): React.JSX.Element {
  const object3dDef = assetCache.object3dDefs.get(defPath)!;
  const textures = object3dDef.materials.map((material) => {
    return assetCache.ddsTextures.get(material.texturePath)!;
  });
  const isGround = !object3dDef.normals?.length;

  return (
    <mesh {...meshProps} receiveShadow castShadow>
      {object3dDef.materials.map((material, i) => (
        <meshBasicMaterial
          key={i}
          attach={`material-${i}`}
          map={textures[i]}
          side={material.isTransparent ? THREE.DoubleSide : THREE.FrontSide}
          alphaTest={
            material.isTransparent ? (isGround ? 0.23 : 0.3) : undefined
          }
          blending={material.isTransparent ? THREE.CustomBlending : undefined}
          blendSrc={material.isTransparent ? THREE.SrcAlphaFactor : undefined}
          blendDst={
            material.isTransparent ? THREE.OneMinusSrcAlphaFactor : undefined
          }
        />
      ))}
      <bufferGeometry
        groups={object3dDef.materials.map((material, i) => ({
          start: material.index,
          count: material.materialCount,
          materialIndex: i,
        }))}
      >
        <bufferAttribute
          attach="attributes-position"
          args={[object3dDef.positions, 3]}
        />
        {object3dDef.normals && (
          <bufferAttribute
            attach="attributes-normal"
            args={[object3dDef.normals, 3]}
          />
        )}
        <bufferAttribute attach="attributes-uv" args={[object3dDef.uvs, 2]} />
        <bufferAttribute attach="index" args={[object3dDef.indices, 1]} />
      </bufferGeometry>
    </mesh>
  );
}
