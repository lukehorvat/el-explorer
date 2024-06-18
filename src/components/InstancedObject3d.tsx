import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { assetCache } from '../lib/asset-cache';
import { MapDef } from '../io/map-defs';
import { Object3dGeometry, Object3dMaterial } from './Object3d';

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
  return (
    <instancedMesh {...meshProps} receiveShadow castShadow>
      <Object3dGeometry defPath={defPath} />
      <Object3dMaterial defPath={defPath} />
    </instancedMesh>
  );
}

export function groupObject3dsByDef(
  object3ds: MapDef['object3ds']
): Map<string, MapDef['object3ds']> {
  return object3ds.reduce((map, object3d) => {
    let object3ds = map.get(object3d.defPath);
    if (!object3ds) map.set(object3d.defPath, (object3ds = []));
    object3ds.push(object3d);
    return map;
  }, new Map<string, MapDef['object3ds']>());
}
