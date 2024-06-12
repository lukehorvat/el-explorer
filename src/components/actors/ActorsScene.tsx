import React, { useCallback, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  GradientTexture,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  Sphere,
  Stats,
} from '@react-three/drei';
import * as THREE from 'three';
import { useAtom, useAtomValue } from 'jotai';
import { actorsState } from './actors-state';
import { Actor } from './Actor';
import { CameraReset, CameraResetListener } from './CameraReset';
import './ActorsScene.css';

export function ActorsScene(): React.JSX.Element {
  const actorType = useAtomValue(actorsState.actorType);
  const skinType = useAtomValue(actorsState.skinType);
  const showSkeleton = useAtomValue(actorsState.showSkeleton);
  const showEnvironment = useAtomValue(actorsState.showEnvironment);
  const showStats = useAtomValue(actorsState.showStats);
  const autoRotate = useAtomValue(actorsState.autoRotate);
  const animationName = useAtomValue(actorsState.animationName);
  const animationLoop = useAtomValue(actorsState.animationLoop);
  const animationSpeed = useAtomValue(actorsState.animationSpeed);
  const [animationController, setAnimationController] = useAtom(
    actorsState.animationController
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
      <Sphere
        args={[
          4000,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          Math.PI / 2, // half-sphere (dome)
        ]}
        scale={[1, 0.15, 1]} // ellipsoid
        visible={showEnvironment}
      >
        <meshBasicMaterial side={THREE.BackSide} depthTest={false}>
          <GradientTexture colors={['#7cbfff', '#fff']} stops={[0, 1]} />
        </meshBasicMaterial>
      </Sphere>
      <Plane
        args={[10000, 10000]}
        rotation-x={THREE.MathUtils.degToRad(-90)}
        receiveShadow
        visible={showEnvironment}
      >
        <meshToonMaterial color="#e5e3e2" depthTest={false} />
      </Plane>
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
      {showStats && <Stats className="Stats m-3" />}
    </Canvas>
  );
}
