import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { Object3dsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { Object3d } from '../../components/Object3d';
import './Scene.css';

export function Object3dsScene(): React.JSX.Element {
  const object3dDefPath = useAtomValue(Object3dsPageState.object3dDefPath);
  const showStats = useAtomValue(Object3dsPageState.showStats);
  const autoRotate = useAtomValue(Object3dsPageState.autoRotate);

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
      <Object3d
        key={object3dDefPath} // Reset camera whenever object def path changes.
        defPath={object3dDefPath}
      />
    </Scene>
  );
}
