import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../lib/asset-cache';

/**
 * An EL 3D object as a Three.js mesh!
 */
export function Object3d({
  defPath,
  skinType,
  ...meshProps
}: {
  defPath: string;
  skinType?: Object3dSkinType;
} & ThreeElements['mesh']): React.JSX.Element {
  return (
    <mesh {...meshProps} receiveShadow castShadow>
      <Object3dGeometry defPath={defPath} />
      <Object3dMaterial
        key={skinType} // Remount whenever skin type changes.
        defPath={defPath}
        skinType={skinType}
      />
    </mesh>
  );
}

export function Object3dGeometry({
  defPath,
}: {
  defPath: string;
}): React.JSX.Element {
  const object3dDef = assetCache.object3dDefs.get(defPath)!;

  return (
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
  );
}

export function Object3dMaterial({
  defPath,
  skinType,
}: {
  defPath: string;
  skinType?: Object3dSkinType;
}): React.JSX.Element {
  const object3dDef = assetCache.object3dDefs.get(defPath)!;
  const textures = object3dDef.materials.map((material) => {
    return assetCache.ddsTextures.get(material.texturePath)!;
  });
  const isGround = !object3dDef.normals?.length;

  switch (skinType) {
    case Object3dSkinType.WIREFRAME:
      return <meshBasicMaterial color="#d75a45" wireframe />;
    case Object3dSkinType.NORMALS:
      return <meshNormalMaterial />;
    case Object3dSkinType.COLOR:
      return <meshBasicMaterial color="#a2a4a5" />;
    case Object3dSkinType.TEXTURE:
    default:
      return (
        <>
          {object3dDef.materials.map((material, i) => (
            <meshBasicMaterial
              key={i}
              attach={`material-${i}`}
              map={textures[i]}
              side={material.isTransparent ? THREE.DoubleSide : THREE.FrontSide}
              alphaTest={
                material.isTransparent ? (isGround ? 0.23 : 0.3) : undefined
              }
              blending={
                material.isTransparent ? THREE.CustomBlending : undefined
              }
              blendSrc={
                material.isTransparent ? THREE.SrcAlphaFactor : undefined
              }
              blendDst={
                material.isTransparent
                  ? THREE.OneMinusSrcAlphaFactor
                  : undefined
              }
            />
          ))}
        </>
      );
  }
}

export enum Object3dSkinType {
  TEXTURE,
  WIREFRAME,
  NORMALS,
  COLOR,
}
