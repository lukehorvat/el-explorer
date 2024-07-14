import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MapDef,
  isValidTile,
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
      if (!isValidTile(tileId)) continue;

      let tilePositions = groups.get(tileId);
      if (!tilePositions) groups.set(tileId, (tilePositions = []));
      tilePositions.push({ x, y });
    }
  }

  return groups;
}

/**
 * Instancing helper function to group an EL map's water tile extensions by ID.
 */
export function groupMapTileExtensions(
  tileMap: MapDef['tileMap'],
  tileExtensionDistance = 0,
  onlyWaterTiles = true
): Map<number, THREE.Vector2Like[]> {
  const groups = new Map<number, THREE.Vector2Like[]>();

  // Calculate the number of tiles to extend from the edge of the map.
  const horizontalTilesNeeded = Math.ceil(tileExtensionDistance / TILE_SIZE);
  const verticalTilesNeeded = Math.ceil(tileExtensionDistance / TILE_SIZE);

  for (
    let x = -horizontalTilesNeeded;
    x < tileMap.width + horizontalTilesNeeded;
    x++
  ) {
    for (
      let y = -verticalTilesNeeded;
      y < tileMap.height + verticalTilesNeeded;
      y++
    ) {
      // Skip tiles inside the map.
      if (x >= 0 && x < tileMap.width && y >= 0 && y < tileMap.height) {
        continue;
      }

      // Get the tile on the border of the map which could be extended to this position.
      const borderX = Math.min(Math.max(x, 0), tileMap.width - 1);
      const borderY = Math.min(Math.max(y, 0), tileMap.height - 1);
      const tileId = tileMap.tiles[borderY * tileMap.width + borderX];
      if (!isValidTile(tileId) || (onlyWaterTiles && !isWaterTile(tileId))) {
        continue;
      }

      let tilePositions = groups.get(tileId);
      if (!tilePositions) groups.set(tileId, (tilePositions = []));
      tilePositions.push({ x, y });
    }
  }

  return groups;
}
