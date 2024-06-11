import React, { useRef } from 'react';
import * as THREE from 'three';
import { assetCache } from '../../lib/asset-cache';
import { useCalSkeleton } from '../../hooks/useCalSkeleton';

export function Actor(props: {
  actorType: number;
  showSkeleton?: boolean;
}): React.JSX.Element {
  const actorDef = assetCache.actorDefs.get(props.actorType)!;
  const skin = assetCache.ddsTextures.get(actorDef.skinPath)!;
  const calMesh = assetCache.calMeshes.get(actorDef.meshPath)!;
  const calSkeleton = assetCache.calSkeletons.get(actorDef.skeletonPath)!;
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  useCalSkeleton(meshRef, calSkeleton, props.showSkeleton);

  return (
    <skinnedMesh receiveShadow castShadow ref={meshRef}>
      <meshBasicMaterial
        map={skin}
        alphaTest={hasAlphaTest ? 0.06 : undefined}
        blending={isTransparent ? THREE.CustomBlending : undefined}
        blendSrc={isTransparent ? THREE.SrcAlphaFactor : undefined}
        blendDst={isTransparent ? THREE.OneMinusSrcAlphaFactor : undefined}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[calMesh.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-normal"
          args={[calMesh.normals, 3]}
        />
        <bufferAttribute attach="attributes-uv" args={[calMesh.uvs, 2]} />
        <bufferAttribute attach="index" args={[calMesh.indices, 1]} />
        <bufferAttribute
          attach="attributes-skinIndex"
          args={[calMesh.skinIndices, 4]}
        />
        <bufferAttribute
          attach="attributes-skinWeight"
          args={[calMesh.skinWeights, 4]}
        />
      </bufferGeometry>
    </skinnedMesh>
  );
}
