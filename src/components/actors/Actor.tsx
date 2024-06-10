import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { assetCache } from '../../lib/asset-cache';
import { CalBone } from '../../io/cal3d-skeletons';

export function Actor(props: { actorType: number }): React.JSX.Element {
  const actorDef = assetCache.actorDefs.get(props.actorType)!;
  const skin = assetCache.ddsTextures.get(actorDef.skinPath)!;
  const calMesh = assetCache.calMeshes.get(actorDef.meshPath)!;
  const calSkeleton = assetCache.calSkeletons.get(actorDef.skeletonPath)!;
  const skeleton = useMemo(() => composeSkeleton(calSkeleton), [calSkeleton]);
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);

  useLayoutEffect(() => {
    // See: https://github.com/pmndrs/drei/issues/1605
    materialRef.current.needsUpdate = true;
  }, [props.actorType]);

  return (
    <skinnedMesh skeleton={skeleton} receiveShadow castShadow>
      <meshBasicMaterial
        map={skin}
        alphaTest={hasAlphaTest ? 0.06 : undefined}
        blending={isTransparent ? THREE.CustomBlending : undefined}
        blendSrc={isTransparent ? THREE.SrcAlphaFactor : undefined}
        blendDst={isTransparent ? THREE.OneMinusSrcAlphaFactor : undefined}
        ref={materialRef}
      />
      <bufferGeometry>
        <float32BufferAttribute
          attach="attributes-position"
          args={[calMesh.positions.map((p) => [p.x, p.y, p.z]).flat(), 3]}
        />
        <float32BufferAttribute
          attach="attributes-normal"
          args={[calMesh.normals.map((n) => [n.x, n.y, n.z]).flat(), 3]}
        />
        <float32BufferAttribute
          attach="attributes-uv"
          args={[calMesh.uvs.map((uv) => [uv.x, uv.y]).flat(), 2]}
        />
        <uint32BufferAttribute attach="index" args={[calMesh.indices, 1]} />
        <uint16BufferAttribute
          attach="attributes-skinIndex"
          args={[calMesh.skinIndices, 4]}
        />
        <float32BufferAttribute
          attach="attributes-skinWeight"
          args={[calMesh.skinWeights, 4]}
        />
      </bufferGeometry>
    </skinnedMesh>
  );
}

/**
 * Convert the actor's Cal3D skeleton to a Three.js one.
 */
function composeSkeleton(calSkeleton: CalBone[]): THREE.Skeleton {
  const rootBoneId = calSkeleton.findIndex((calBone) => calBone.parentId < 0); // Assume only one root bone...
  const bones = calSkeleton.map((calBone) => {
    const bone = new THREE.Bone();
    bone.position.copy(calBone.translation);
    bone.quaternion.copy(calBone.rotation);
    return bone;
  });

  // Compose the bone hierarchy.
  bones.forEach((bone, boneId) => {
    if (boneId === rootBoneId) return;
    bones[calSkeleton[boneId].parentId].add(bone);
  });

  return new THREE.Skeleton(bones);
}
