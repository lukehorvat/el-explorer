import { useLayoutEffect, useMemo } from 'react';
import { useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { CalBone } from '../io/cal3d-skeletons';

/**
 * Bind a Cal3D skeleton to a Three.js skinned mesh.
 *
 * Optionally renders a skeleton helper via the `showSkeleton` parameter.
 */
export function useCalSkeleton(
  meshRef: React.MutableRefObject<THREE.SkinnedMesh>,
  calSkeleton: CalBone[],
  showSkeleton?: boolean
): void {
  const [skeleton, rootBone] = useMemo(
    () => composeSkeleton(calSkeleton),
    [calSkeleton]
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    mesh.add(rootBone).bind(skeleton);
    return () => {
      mesh.remove(rootBone);
    };
  }, [meshRef, skeleton, rootBone]);

  useHelper(showSkeleton && meshRef, THREE.SkeletonHelper);
}

/**
 * Convert a Cal3D skeleton to a Three.js one.
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
