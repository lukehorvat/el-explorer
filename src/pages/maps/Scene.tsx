import React, { useCallback } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { MapsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { GameMap } from '../../components/Map';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';

export function MapsScene(): React.JSX.Element {
  const mapDefPath = useAtomValue(MapsPageState.mapDefPath);
  const showObject3ds = useAtomValue(MapsPageState.showObject3ds);
  const showObject2ds = useAtomValue(MapsPageState.showObject2ds);
  const showTiles = useAtomValue(MapsPageState.showTiles);
  const showTileExtensions = useAtomValue(MapsPageState.showTileExtensions);
  const showSkybox = useAtomValue(MapsPageState.showSkybox);
  const showStats = useAtomValue(MapsPageState.showStats);

  const onMapDefPathChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      // TODO
    },
    []
  );

  return (
    <Scene className="MapsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={1} far={1000} makeDefault />
      <OrbitControls
        autoRotateSpeed={3}
        enableDamping
        enableZoom
        enablePan={false}
        minDistance={1}
        maxDistance={40}
        autoRotate={false}
        makeDefault
      />
      <CameraReset
        key={mapDefPath} // Reset camera whenever map def path changes.
        onReset={onMapDefPathChange}
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
