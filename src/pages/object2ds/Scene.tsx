import React, { useCallback } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAtomValue } from 'jotai';
import { Object2dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { Object2d } from '../../components/Object2d';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import './Scene.css';

export function Object2dsScene(): React.JSX.Element {
  const object2dDefPath = useAtomValue(Object2dsPageState.object2dDefPath);
  const showStats = useAtomValue(Object2dsPageState.showStats);
  const autoRotate = useAtomValue(Object2dsPageState.autoRotate);

  const onObject2dDefPathChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        0,
        center.y + 2.2, // Slightly above object's center so we're looking down on it.
        3 // A reasonable distance away for most objects...
      );
      orbitControls.target.set(0, center.y, 0); // Orbit object's vertical center.
    },
    []
  );

  return (
    <Scene className="Object2dsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={0.001} far={100} makeDefault />
      <OrbitControls
        autoRotateSpeed={3}
        enableDamping
        enableZoom
        enablePan={false}
        minDistance={1}
        maxDistance={20}
        autoRotate={autoRotate}
        makeDefault
      />
      <CameraReset
        key={object2dDefPath} // Reset camera whenever object def path changes.
        onReset={onObject2dDefPathChange}
      >
        <Object2d
          defPath={object2dDefPath}
          rotation-x={THREE.MathUtils.degToRad(-90)}
        />
      </CameraReset>
    </Scene>
  );
}
