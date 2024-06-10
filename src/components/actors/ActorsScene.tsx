import React from 'react';
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
import './ActorsScene.css';

export function ActorsScene(): React.JSX.Element {
  return (
    <Canvas className="ActorsScene flex-grow-1" linear shadows>
      <PerspectiveCamera makeDefault fov={45} near={0.001} far={5000}>
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
      >
        <meshBasicMaterial side={THREE.BackSide}>
          <GradientTexture colors={['#7cbfff', '#fff']} stops={[0, 1]} />
        </meshBasicMaterial>
      </Sphere>
      <Plane
        args={[10000, 10000]}
        rotation-x={THREE.MathUtils.degToRad(-90)}
        receiveShadow
      >
        <meshToonMaterial color="#e5e3e2" />
      </Plane>
      <OrbitControls
        autoRotateSpeed={3}
        enableDamping
        enableZoom
        enablePan={false}
        minDistance={1}
        maxDistance={20}
      />
      <Stats />
    </Canvas>
  );
}
