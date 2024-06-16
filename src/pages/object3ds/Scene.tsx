import React, { useCallback } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { Object3dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { Object3d } from '../../components/Object3d';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import './Scene.css';

export function Object3dsScene(): React.JSX.Element {
  const object3dDefPath = useAtomValue(Object3dsPageState.object3dDefPath);
  const showStats = useAtomValue(Object3dsPageState.showStats);
  const autoRotate = useAtomValue(Object3dsPageState.autoRotate);

  const onObject3dDefPathChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        0,
        center.y + 1.1, // Slightly above object's center so we're looking down on it.
        10 // A reasonable distance away for most objects...
      );
      orbitControls.target.set(0, center.y, 0); // Orbit object's vertical center.
    },
    []
  );

  return (
    <Scene className="Object3dsScene" showStats={showStats}>
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
        key={object3dDefPath} // Reset camera whenever object def path changes.
        onReset={onObject3dDefPathChange}
      >
        <Object3d defPath={object3dDefPath} />
      </CameraReset>
    </Scene>
  );
}