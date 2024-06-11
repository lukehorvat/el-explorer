import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../../lib/asset-cache';
import { CalBone } from '../../io/cal3d-skeletons';

export function Actor(props: {
  actorType: number;
  showSkeleton?: boolean;
}): React.JSX.Element {
  const actorDef = assetCache.actorDefs.get(props.actorType)!;
  const skin = assetCache.ddsTextures.get(actorDef.skinPath)!;
  const calMesh = assetCache.calMeshes.get(actorDef.meshPath)!;
  const calSkeleton = assetCache.calSkeletons.get(actorDef.skeletonPath)!;
  const [skeleton, rootBone] = useMemo(
    () => composeSkeleton(calSkeleton),
    [calSkeleton]
  );
  const hasAlpha = skin.format === THREE.RGBA_S3TC_DXT5_Format;
  const hasAlphaTest = hasAlpha && !actorDef.ghost;
  const isTransparent = hasAlpha || actorDef.ghost;
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);

  useLayoutEffect(() => {
    // See: https://github.com/pmndrs/drei/issues/1605
    materialRef.current.needsUpdate = true;
  }, [props.actorType]);

  useLayoutEffect(() => {
    meshRef.current.bind(skeleton);
  }, [skeleton]);

  useSkeletonHelper(!!props.showSkeleton && meshRef, props.actorType);

  return (
    <skinnedMesh receiveShadow castShadow ref={meshRef}>
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
      <primitive object={rootBone} />
    </skinnedMesh>
  );
}

/**
 * Hook that creates a SkeletonHelper (and recreates it when the `watchValue`
 * changes).
 */
function useSkeletonHelper(
  objectRef: React.MutableRefObject<THREE.Object3D | null> | false,
  watchValue: any // Value that, when changed, will recreate the helper.
): void {
  const helperRef = useRef<THREE.SkeletonHelper>(null!);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    if (!objectRef || !objectRef.current) return;
    helperRef.current = new THREE.SkeletonHelper(objectRef.current);
    scene.add(helperRef.current);
    return () => {
      scene.remove(helperRef.current);
      helperRef.current.dispose();
    };
  }, [scene, objectRef, watchValue]);
}

/**
 * Convert the actor's Cal3D skeleton to a Three.js one.
 */
function composeSkeleton(
  calSkeleton: CalBone[]
): [skeleton: THREE.Skeleton, rootBone: THREE.Bone] {
  const bones = calSkeleton.map((calBone) => {
    const bone = new THREE.Bone();
    bone.position.copy(calBone.translation);
    bone.quaternion.copy(calBone.rotation);
    return bone;
  });
  const rootBone =
    bones[calSkeleton.findIndex((calBone) => calBone.parentId < 0)];
  bones.forEach((bone, boneId) => {
    if (bone === rootBone) return;
    bones[calSkeleton[boneId].parentId].add(bone); // Construct the bone hierarchy.
  });
  return [new THREE.Skeleton(bones), rootBone];
}
