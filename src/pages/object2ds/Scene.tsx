import React, { useCallback } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { Object2dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { GameMap } from '../../components/Map';
import { Object2d } from '../../components/Object2d';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import { AssetCache } from '../../lib/asset-cache';
import { TILE_SIZE } from '../../io/map-defs';
import './Scene.css';

export function Object2dsScene(): React.JSX.Element {
  const mapDefPath = useAtomValue(Object2dsPageState.mapDefPath);
  const object2dDefPath = useAtomValue(Object2dsPageState.object2dDefPath);
  const showEnvironment = useAtomValue(Object2dsPageState.showEnvironment);
  const showStats = useAtomValue(Object2dsPageState.showStats);
  const autoRotate = useAtomValue(Object2dsPageState.autoRotate);
  const mapDef = AssetCache.mapDefs.get(mapDefPath)!;
  const tileMapCenterX = (mapDef.tileMap.width * TILE_SIZE) / 2;
  const tileMapCenterY = (mapDef.tileMap.height * TILE_SIZE) / 2;

  const onObject2dDefPathChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        tileMapCenterX,
        center.y + 2.2, // Slightly above object's center so we're looking down on it.
        -tileMapCenterY + 3 // A reasonable distance away for most objects...
      );
      orbitControls.target.set(
        tileMapCenterX,
        center.y, // Orbit object's vertical center.
        -tileMapCenterY
      );
    },
    [tileMapCenterX, tileMapCenterY]
  );

  return (
    <Scene className="Object2dsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={0.1} far={1000} makeDefault />
      <GameMap
        visible={showEnvironment}
        defPath={mapDefPath}
        onlyWaterTileExtensions={false}
      />
      <OrbitControls
        autoRotateSpeed={3}
        enableDamping
        enableZoom
        enablePan={false}
        minDistance={1}
        maxDistance={40}
        autoRotate={autoRotate}
        makeDefault
      />
      <CameraReset
        key={object2dDefPath} // Reset camera whenever object def path changes.
        onReset={onObject2dDefPathChange}
        position-x={tileMapCenterX}
        position-y={0}
        position-z={-tileMapCenterY}
        disableY
      >
        <Object2d defPath={object2dDefPath} />
      </CameraReset>
    </Scene>
  );
}
