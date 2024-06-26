import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetCache } from '../lib/asset-cache';
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
  const { calSkeleton, calAnimations } = useActorAssets(actorType);
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  useCalSkeleton(meshRef, calSkeleton, showSkeleton);
  const animationController = useCalAnimation(meshRef, calAnimations);

  useEffect(() => {
    getAnimationController?.(animationController);
  }, [getAnimationController, animationController]);

  return (
    <skinnedMesh {...meshProps} receiveShadow castShadow ref={meshRef}>
      <ActorGeometry actorType={actorType} />
      <ActorMaterial
        key={skinType} // Remount whenever skin type changes.
        actorType={actorType}
        skinType={skinType}
      />
    </skinnedMesh>
  );
}

export function ActorGeometry({
  actorType,
}: {
  actorType: number;
}): React.JSX.Element {
  const { calMesh } = useActorAssets(actorType);

  return (
    <bufferGeometry>
      <bufferAttribute
        attach="attributes-position"
        args={[calMesh.positions, 3]}
      />
      <bufferAttribute attach="attributes-normal" args={[calMesh.normals, 3]} />
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
  );
}

export function ActorMaterial({
  actorType,
  skinType,
}: {
  actorType: number;
  skinType?: ActorSkinType;
}): React.JSX.Element {
  const { actorDef, skin } = useActorAssets(actorType);
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;

  switch (skinType) {
    case ActorSkinType.NONE:
      return <meshBasicMaterial visible={false} />;
    case ActorSkinType.WIREFRAME:
      return <meshBasicMaterial color="#d75a45" wireframe />;
    case ActorSkinType.NORMALS:
      return <meshNormalMaterial />;
    case ActorSkinType.COLOR:
      return <meshBasicMaterial color="#a2a4a5" />;
    case ActorSkinType.TEXTURE:
    default:
      return (
        <meshBasicMaterial
          map={skin}
          alphaTest={hasAlphaTest ? 0.06 : undefined}
          blending={isTransparent ? THREE.CustomBlending : undefined}
          blendSrc={isTransparent ? THREE.SrcAlphaFactor : undefined}
          blendDst={isTransparent ? THREE.OneMinusSrcAlphaFactor : undefined}
        />
      );
  }
}

function useActorAssets(actorType: number): {
  actorDef: ActorDef;
  skin: THREE.Texture;
  calMesh: CalMesh;
  calSkeleton: CalBone[];
  calAnimations: CalAnimationWithConfig[];
} {
  const actorDef = AssetCache.actorDefs.get(actorType)!;
  const skin = AssetCache.ddsTextures.get(actorDef.skinPath)!;
  const calMesh = AssetCache.calMeshes.get(actorDef.meshPath)!;
  const calSkeleton = AssetCache.calSkeletons.get(actorDef.skeletonPath)!;
  const calAnimations = useMemo(() => {
    return actorDef.animations.map((animation) => ({
      ...AssetCache.calAnimations.get(animation.path)!,
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
