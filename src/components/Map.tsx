import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { AssetCache } from '../lib/asset-cache';
import { InstancedObject3d, groupMapObject3ds } from './InstancedObject3d';
import { InstancedObject2d, groupMapObject2ds } from './InstancedObject2d';
import { InstancedTile, groupMapTiles } from './InstancedTile';

/**
 * An EL map as a Three.js group!
 */
export function GameMap({
  defPath,
  showObject3ds,
  showObject2ds,
  showTiles,
  showTileExtensions,
  showSkybox,
  ...groupProps
}: {
  defPath: string;
  showObject3ds?: boolean;
  showObject2ds?: boolean;
  showTiles?: boolean;
  showTileExtensions?: boolean;
  showSkybox?: boolean;
} & ThreeElements['group']): React.JSX.Element {
  const mapDef = AssetCache.mapDefs.get(defPath)!;

  return (
    <group {...groupProps}>
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
      <group visible={showTiles}>
        {[...groupMapTiles(mapDef.tileMap)].map(([tileId, tilePositions]) => (
          <InstancedTile
            key={tileId}
            tileId={tileId}
            tilePositions={tilePositions}
          />
        ))}
      </group>
      <group visible={showTileExtensions}></group>
      <group visible={showSkybox}></group>
    </group>
  );
}
