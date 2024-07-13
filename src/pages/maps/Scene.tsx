import React, { useCallback } from 'react';
import { FlyControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { MapsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { GameMap } from '../../components/Map';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import { AssetCache } from '../../lib/asset-cache';
import { TILE_SIZE } from '../../io/map-defs';

export function MapsScene(): React.JSX.Element {
  const mapDefPath = useAtomValue(MapsPageState.mapDefPath);
  const showObject3ds = useAtomValue(MapsPageState.showObject3ds);
  const showObject2ds = useAtomValue(MapsPageState.showObject2ds);
  const showTiles = useAtomValue(MapsPageState.showTiles);
  const showTileExtensions = useAtomValue(MapsPageState.showTileExtensions);
  const showSkybox = useAtomValue(MapsPageState.showSkybox);
  const showStats = useAtomValue(MapsPageState.showStats);
  const mapDef = AssetCache.mapDefs.get(mapDefPath)!;
  const tileMapCenterX = (mapDef.tileMap.width * TILE_SIZE) / 2;
  const tileMapCenterY = (mapDef.tileMap.height * TILE_SIZE) / 2;

  const onMapDefPathChange: CameraResetListener = useCallback(
    (camera) => {
      camera.position.set(
        tileMapCenterX, // Horizontal center of map.
        30, // A reasonable height above map so we're looking down on it.
        30 // A reasonable distance from the bottom of map.
      );
      camera.lookAt(tileMapCenterX, 0, -tileMapCenterY); // Target map center.
    },
    [tileMapCenterX, tileMapCenterY]
  );

  return (
    <Scene className="MapsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={1} far={1000} makeDefault />
      <FlyControls movementSpeed={15} rollSpeed={0.4} dragToLook makeDefault />
      <CameraReset
        key={mapDefPath} // Reset camera whenever map def path changes.
        onReset={onMapDefPathChange}
        disable // Don't apply any centering.
      >
        <GameMap
          defPath={mapDefPath}
          showObject3ds={showObject3ds}
          showObject2ds={showObject2ds}
          showTiles={showTiles}
          showTileExtensions={showTileExtensions}
          showSkybox={showSkybox}
        />
      </CameraReset>
    </Scene>
  );
}
