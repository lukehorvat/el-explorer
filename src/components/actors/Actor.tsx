import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { assetCache } from '../../lib/asset-cache';
import { ActorDef } from '../../io/actor-defs';
import { CalMesh } from '../../io/cal3d-meshes';
import { CalBone } from '../../io/cal3d-skeletons';
import { useCalSkeleton } from '../../hooks/useCalSkeleton';
import {
  CalAnimationWithConfig,
  useCalAnimation,
} from '../../hooks/useCalAnimation';

export function Actor(props: {
  actorType: number;
  skinType?: ActorSkinType;
  showSkeleton?: boolean;
  animationName?: string | null;
  animationLoop?: boolean;
  animationSpeed?: number;
}): React.JSX.Element {
  const { actorDef, skin, calMesh, calSkeleton, calAnimations } =
    useActorAssets(props.actorType);
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  useCalSkeleton(meshRef, calSkeleton, props.showSkeleton);
  useCalAnimation(
    meshRef,
    calAnimations,
    props.animationName,
    props.animationLoop,
    props.animationSpeed
  );

  return (
    <skinnedMesh receiveShadow castShadow ref={meshRef}>
      {(() => {
        switch (props.skinType) {
          case ActorSkinType.NONE:
            return <meshBasicMaterial key={props.skinType} visible={false} />;
          case ActorSkinType.WIREFRAME:
            return (
              <meshBasicMaterial
                key={props.skinType}
                color="#d75a45"
                wireframe
              />
            );
          case ActorSkinType.VECTORS:
            return <meshNormalMaterial key={props.skinType} />;
          case ActorSkinType.METAL:
            return (
              <meshPhysicalMaterial
                key={props.skinType}
                color="#fffcef"
                emissive="#808080"
                emissiveIntensity={0.8}
                roughness={0.5}
                metalness={1}
              />
            );
          case ActorSkinType.CRYSTAL:
            return (
              <meshPhysicalMaterial
                key={props.skinType}
                color="#fff"
                emissive="#f653a6"
                sheenColor="#8ab9f1"
                emissiveIntensity={0.5}
                sheen={3}
                roughness={0.3}
                thickness={2}
                transmission={1}
                ior={5}
                anisotropy={1}
                flatShading
              />
            );
          case ActorSkinType.SILHOUETTE:
            return <meshBasicMaterial key={props.skinType} color="#a2a4a5" />;
          case ActorSkinType.TEXTURE:
          default:
            return (
              <meshBasicMaterial
                key={props.skinType} // Remount whenever skin type changes.
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
  VECTORS,
  METAL,
  CRYSTAL,
  SILHOUETTE,
}
