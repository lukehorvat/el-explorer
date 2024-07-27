import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { AssetCache } from '../lib/asset-cache';
import { InstancedObject3d, groupMapObject3ds } from './InstancedObject3d';
import { InstancedObject2d, groupMapObject2ds } from './InstancedObject2d';
import {
  InstancedTile,
  groupMapTileExtensions,
  groupMapTiles,
} from './InstancedTile';
import { Skybox } from './Skybox';
import { TILE_SIZE, WATER_TILE_ELEVATION } from '../io/map-defs';

/**
 * An EL map as a Three.js group!
 */
export function GameMap({
  defPath,
  showObject3ds = true,
  showObject2ds = true,
  showTiles = true,
  showTileExtensions = true,
  onlyWaterTileExtensions = true,
  showSkybox = true,
  ...groupProps
}: {
  defPath: string;
  showObject3ds?: boolean;
  showObject2ds?: boolean;
  showTiles?: boolean;
  showTileExtensions?: boolean;
  onlyWaterTileExtensions?: boolean;
  showSkybox?: boolean;
} & ThreeElements['group']): React.JSX.Element {
  const mapDef = AssetCache.mapDefs.get(defPath)!;
  const mapName = defPath.match(/maps\/(.+)\.elm\.gz$/)![1];
  const tileMapCenterX = (mapDef.tileMap.width * TILE_SIZE) / 2;
  const tileMapCenterY = (mapDef.tileMap.height * TILE_SIZE) / 2;
  const skyboxRadius = 500;

  return (
    <group {...groupProps}>
      <group visible={showTiles}>
        {[...groupMapTiles(mapDef.tileMap)].map(([tileId, tilePositions]) => (
          <InstancedTile
            key={tileId}
            tileId={tileId}
            tilePositions={tilePositions}
          />
        ))}
      </group>
      <group visible={showTileExtensions}>
        {[
          ...groupMapTileExtensions(
            mapDef.tileMap,
            skyboxRadius + 100,
            onlyWaterTileExtensions
          ),
        ].map(([tileId, tilePositions]) => (
          <InstancedTile
            key={tileId}
            tileId={tileId}
            tilePositions={tilePositions}
          />
        ))}
      </group>
      <group visible={showObject3ds}>
        {[...groupMapObject3ds(mapDef.object3ds)].map(
          ([defPath, object3ds]) => (
            <InstancedObject3d
              key={defPath}
              defPath={defPath}
              object3ds={object3ds}
            />
          )
        )}
      </group>
      <group visible={showObject2ds}>
        {[...groupMapObject2ds(mapDef.object2ds)].map(
          ([defPath, object2ds]) => (
            <InstancedObject2d
              key={defPath}
              defPath={defPath}
              object2ds={object2ds}
            />
          )
        )}
      </group>
      <Skybox
        visible={showSkybox}
        position-x={tileMapCenterX}
        position-y={WATER_TILE_ELEVATION}
        position-z={-tileMapCenterY}
        radius={skyboxRadius}
        mapName={mapName}
        isDungeonMap={mapDef.isDungeon}
      />
    </group>
  );
}
