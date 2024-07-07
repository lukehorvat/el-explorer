import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MapDef,
  isInvalidTile,
  isWaterTile,
  TILE_SIZE,
  DEFAULT_TILE_ELEVATION,
  WATER_TILE_ELEVATION,
} from '../io/map-defs';
import { TileGeometry, TileMaterial } from './Tile';
import { calculateTransformationMatrix } from '../lib/three-utils';

/**
 * An EL map tile as a Three.js instanced mesh!
 *
 * Useful for when you want to draw a large number of the same tile.
 */
export function InstancedTile({
  tileId,
  tilePositions,
  ...meshProps
}: {
  tileId: number;
  tilePositions: THREE.Vector2Like[];
} & ThreeElements['instancedMesh']): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    tilePositions.forEach((tilePosition, i) => {
      const matrix = calculateTransformationMatrix({
        x: tilePosition.x * TILE_SIZE + TILE_SIZE / 2,
        y: isWaterTile(tileId) ? WATER_TILE_ELEVATION : DEFAULT_TILE_ELEVATION,
        z: -(tilePosition.y * TILE_SIZE + TILE_SIZE / 2),
      });
      meshRef.current.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [tileId, tilePositions]);

  return (
    <instancedMesh
      {...meshProps}
      args={[undefined, undefined, tilePositions.length]}
      receiveShadow
      ref={meshRef}
    >
      <TileGeometry />
      <TileMaterial tileId={tileId} />
    </instancedMesh>
  );
}

/**
 * Instancing helper function to group an EL map's tiles by ID.
 */
export function groupMapTiles(
  tileMap: MapDef['tileMap']
): Map<number, THREE.Vector2Like[]> {
  const groups = new Map<number, THREE.Vector2Like[]>();

  for (let x = 0; x < tileMap.width; x++) {
    for (let y = 0; y < tileMap.height; y++) {
      const tileId = tileMap.tiles[y * tileMap.width + x];
      if (isInvalidTile(tileId)) continue;
      let tilePositions = groups.get(tileId);
      if (!tilePositions) groups.set(tileId, (tilePositions = []));
      tilePositions.push({ x, y });
    }
  }

  return groups;
}
