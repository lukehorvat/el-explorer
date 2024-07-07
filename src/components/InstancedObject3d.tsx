import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { MapDef } from '../io/map-defs';
import { Object3dGeometry, Object3dMaterial } from './Object3d';
import { calculateTransformationMatrix } from '../lib/three-utils';

/**
 * An EL 3D object as a Three.js instanced mesh!
 *
 * Useful for when you want to draw a large number of the same 3D object.
 */
export function InstancedObject3d({
  defPath,
  object3ds,
  ...meshProps
}: {
  defPath: string;
  object3ds: MapDef['object3ds'];
} & ThreeElements['instancedMesh']): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    object3ds.forEach((object3d, i) => {
      const matrix = calculateTransformationMatrix(
        object3d.position,
        object3d.rotation
      );
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [object3ds]);

  return (
    <instancedMesh
      {...meshProps}
      args={[undefined, undefined, object3ds.length]}
      receiveShadow
      castShadow
      ref={meshRef}
    >
      <Object3dGeometry defPath={defPath} />
      <Object3dMaterial defPath={defPath} />
    </instancedMesh>
  );
}

/**
 * Instancing helper function to group an EL map's 3D objects by def.
 */
export function groupMapObject3ds(
  object3ds: MapDef['object3ds']
): Map<string, MapDef['object3ds']> {
  return object3ds.reduce((groups, object3d) => {
    let object3ds = groups.get(object3d.defPath);
    if (!object3ds) groups.set(object3d.defPath, (object3ds = []));
    object3ds.push(object3d);
    return groups;
  }, new Map<string, MapDef['object3ds']>());
}
