import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { MapDef } from '../io/map-defs';
import { Object2dGeometry, Object2dMaterial } from './Object2d';
import { calculateTransformationMatrix } from '../lib/three-utils';

/**
 * An EL 2D object as a Three.js instanced mesh!
 *
 * Useful for when you want to draw a large number of the same 2D object.
 */
export function InstancedObject2d({
  defPath,
  object2ds,
  ...meshProps
}: {
  defPath: string;
  object2ds: MapDef['object2ds'];
} & ThreeElements['instancedMesh']): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    object2ds.forEach((object2d, i) => {
      const matrix = calculateTransformationMatrix(
        object2d.position,
        object2d.rotation
      );
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [object2ds]);

  return (
    <instancedMesh
      {...meshProps}
      args={[undefined, undefined, object2ds.length]}
      receiveShadow
      ref={meshRef}
    >
      <Object2dGeometry defPath={defPath} />
      <Object2dMaterial defPath={defPath} />
    </instancedMesh>
  );
}

/**
 * Helper function to group 2D object defs by path. Can be used for instancing.
 */
export function groupObject2dsByDef(
  object2ds: MapDef['object2ds']
): Map<string, MapDef['object2ds']> {
  return object2ds.reduce((map, object2d) => {
    let object2ds = map.get(object2d.defPath);
    if (!object2ds) map.set(object2d.defPath, (object2ds = []));
    object2ds.push(object2d);
    return map;
  }, new Map<string, MapDef['object2ds']>());
}
