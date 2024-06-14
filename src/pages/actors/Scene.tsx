import React, { useCallback, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, StatsGl } from '@react-three/drei';
import * as THREE from 'three';
import { useAtom, useAtomValue } from 'jotai';
import { ActorsPageState } from './page-state';
import { Sky } from '../../components/Sky';
import { Ground } from '../../components/Ground';
import { Actor } from '../../components/Actor';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import './Scene.css';

export function ActorsScene(): React.JSX.Element {
  const actorType = useAtomValue(ActorsPageState.actorType);
  const skinType = useAtomValue(ActorsPageState.skinType);
  const showSkeleton = useAtomValue(ActorsPageState.showSkeleton);
  const showEnvironment = useAtomValue(ActorsPageState.showEnvironment);
  const showStats = useAtomValue(ActorsPageState.showStats);
  const autoRotate = useAtomValue(ActorsPageState.autoRotate);
  const animationName = useAtomValue(ActorsPageState.animationName);
  const animationLoop = useAtomValue(ActorsPageState.animationLoop);
  const animationSpeed = useAtomValue(ActorsPageState.animationSpeed);
  const [animationController, setAnimationController] = useAtom(
    ActorsPageState.animationController
  );

  useLayoutEffect(() => {
    animationController?.play(animationName, animationLoop, animationSpeed);
  }, [animationController, animationName, animationLoop, animationSpeed]);

  const onActorTypeChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        0,
        center.y + 1.1, // Slightly above actor's center so we're looking down on it.
        4 // A reasonable distance away for most actor meshes...
      );
      orbitControls.target.set(0, center.y, 0); // Orbit actor's vertical center.
    },
    []
  );

  return (
    <Canvas
      className="ActorsScene flex-grow-1"
      gl={{ toneMapping: THREE.NoToneMapping }}
      linear
      shadows
    >
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
      <Sky visible={showEnvironment} />
      <Ground visible={showEnvironment} />
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
        key={actorType} // Reset camera whenever actor type changes.
        onReset={onActorTypeChange}
      >
        <Actor
          actorType={actorType}
          skinType={skinType}
          showSkeleton={showSkeleton}
          getAnimationController={setAnimationController}
        />
      </CameraReset>
      {showStats && (
        <StatsGl className="Stats m-3" horizontal={false} precision={1} />
      )}
    </Canvas>
  );
}
