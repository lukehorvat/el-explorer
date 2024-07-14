import React, { useCallback } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { Object3dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { GameMap } from '../../components/Map';
import { Object3d } from '../../components/Object3d';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import { AssetCache } from '../../lib/asset-cache';
import { TILE_SIZE } from '../../io/map-defs';
import './Scene.css';

export function Object3dsScene(): React.JSX.Element {
  const object3dDefPath = useAtomValue(Object3dsPageState.object3dDefPath);
  const skinType = useAtomValue(Object3dsPageState.skinType);
  const showEnvironment = useAtomValue(Object3dsPageState.showEnvironment);
  const showStats = useAtomValue(Object3dsPageState.showStats);
  const autoRotate = useAtomValue(Object3dsPageState.autoRotate);
  const mapDef = AssetCache.mapDefs.get('maps/testermap.elm.gz')!;
  const tileMapCenterX = (mapDef.tileMap.width * TILE_SIZE) / 2;
  const tileMapCenterY = (mapDef.tileMap.height * TILE_SIZE) / 2;

  const onObject3dDefPathChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        tileMapCenterX,
        center.y + 1.1, // Slightly above object's center so we're looking down on it.
        -tileMapCenterY + 10 // A reasonable distance away for most objects...
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
    <Scene className="Object3dsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={0.1} far={1000} makeDefault />
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1}
        position={[10, 10, -5]}
        castShadow
        shadow-mapSize={[4096, 4096]}
      />
      <GameMap
        visible={showEnvironment}
        defPath="maps/testermap.elm.gz"
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
        key={object3dDefPath} // Reset camera whenever object def path changes.
        onReset={onObject3dDefPathChange}
        position-x={tileMapCenterX}
        position-y={0}
        position-z={-tileMapCenterY}
        disableY
      >
        <Object3d defPath={object3dDefPath} skinType={skinType} />
      </CameraReset>
    </Scene>
  );
}
