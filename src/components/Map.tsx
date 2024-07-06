import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { AssetCache } from '../lib/asset-cache';
import { InstancedObject3d, groupObject3dsByDef } from './InstancedObject3d';
import { InstancedObject2d, groupObject2dsByDef } from './InstancedObject2d';

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
        {[...groupObject3dsByDef(mapDef.object3ds)].map(
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
        {[...groupObject2dsByDef(mapDef.object2ds)].map(
          ([defPath, object2ds]) => (
            <InstancedObject2d
              key={defPath}
              defPath={defPath}
              object2ds={object2ds}
            />
          )
        )}
      </group>
      <group visible={showTiles}></group>
      <group visible={showTileExtensions}></group>
      <group visible={showSkybox}></group>
    </group>
  );
}
