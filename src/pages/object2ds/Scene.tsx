import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { Object2dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { Object2d } from '../../components/Object2d';
import './Scene.css';

export function Object2dsScene(): React.JSX.Element {
  const object2dType = useAtomValue(Object2dsPageState.object2dType);
  const showStats = useAtomValue(Object2dsPageState.showStats);
  const autoRotate = useAtomValue(Object2dsPageState.autoRotate);

  return (
    <Scene className="Object2dsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={0.001} far={5000} makeDefault>
        {/* Shine a light from the camera. */}
        <pointLight intensity={1.5} distance={0} decay={0} />
      </PerspectiveCamera>
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1}
        position={[10, 10, -5]}
        castShadow
        shadow-mapSize={[4096, 4096]}
      />
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
      <Object2d key={object2dType} object2dType={object2dType} />
    </Scene>
  );
}
