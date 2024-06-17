import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { assetCache } from '../lib/asset-cache';

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
  const mapDef = assetCache.mapDefs.get(defPath)!;
  console.log('!mapDef', mapDef);

  return (
    <group {...groupProps}>
      <group visible={showObject3ds}></group>
      <group visible={showObject2ds}></group>
      <group visible={showTiles}></group>
      <group visible={showTileExtensions}></group>
      <group visible={showSkybox}></group>
    </group>
  );
}
