import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../lib/asset-cache';
import { ActorDef } from '../io/actor-defs';
import { CalMesh } from '../io/cal3d-meshes';
import { CalBone } from '../io/cal3d-skeletons';
import { useCalSkeleton } from '../hooks/useCalSkeleton';
import {
  CalAnimationController,
  CalAnimationWithConfig,
  useCalAnimation,
} from '../hooks/useCalAnimation';

/**
 * An EL actor as a Three.js skinned mesh!
 */
export function Actor({
  actorType,
  skinType,
  showSkeleton,
  getAnimationController,
  ...meshProps
}: {
  actorType: number;
  skinType?: ActorSkinType;
  showSkeleton?: boolean;
  getAnimationController?: (
    animationController: CalAnimationController
  ) => void;
} & ThreeElements['skinnedMesh']): React.JSX.Element {
  const { actorDef, skin, calMesh, calSkeleton, calAnimations } =
    useActorAssets(actorType);
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  useCalSkeleton(meshRef, calSkeleton, showSkeleton);
  const animationController = useCalAnimation(meshRef, calAnimations);

  useEffect(() => {
    getAnimationController?.(animationController);
  }, [getAnimationController, animationController]);

  return (
    <skinnedMesh {...meshProps} receiveShadow castShadow ref={meshRef}>
      {(() => {
        switch (skinType) {
          case ActorSkinType.NONE:
            return <meshBasicMaterial key={skinType} visible={false} />;
          case ActorSkinType.WIREFRAME:
            return (
              <meshBasicMaterial key={skinType} color="#d75a45" wireframe />
            );
          case ActorSkinType.NORMALS:
            return <meshNormalMaterial key={skinType} />;
          case ActorSkinType.COLOR:
            return <meshBasicMaterial key={skinType} color="#a2a4a5" />;
          case ActorSkinType.TEXTURE:
          default:
            return (
              <meshBasicMaterial
                key={skinType} // Remount whenever skin type changes.
                map={skin}
                alphaTest={hasAlphaTest ? 0.06 : undefined}
                blending={isTransparent ? THREE.CustomBlending : undefined}
                blendSrc={isTransparent ? THREE.SrcAlphaFactor : undefined}
                blendDst={
                  isTransparent ? THREE.OneMinusSrcAlphaFactor : undefined
                }
              />
            );
        }
      })()}
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

function useActorAssets(actorType: number): {
  actorDef: ActorDef;
  skin: THREE.Texture;
  calMesh: CalMesh;
  calSkeleton: CalBone[];
  calAnimations: CalAnimationWithConfig[];
} {
  const actorDef = assetCache.actorDefs.get(actorType)!;
  const skin = assetCache.ddsTextures.get(actorDef.skinPath)!;
  const calMesh = assetCache.calMeshes.get(actorDef.meshPath)!;
  const calSkeleton = assetCache.calSkeletons.get(actorDef.skeletonPath)!;
  const calAnimations = useMemo(() => {
    return actorDef.animations.map((animation) => ({
      ...assetCache.calAnimations.get(animation.path)!,
      name: animation.name,
      durationOverride: animation.duration / 1000,
    }));
  }, [actorDef.animations]);

  return { actorDef, skin, calMesh, calSkeleton, calAnimations };
}

export enum ActorSkinType {
  NONE,
  TEXTURE,
  WIREFRAME,
  NORMALS,
  COLOR,
}
