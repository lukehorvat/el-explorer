import React from 'react';
import { Canvas } from '@react-three/fiber';
import './ActorsScene.css';

export function ActorsScene(): React.JSX.Element {
  return (
    <Canvas className="ActorsScene flex-grow-1">
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1}
        position={[10, 10, -5]}
        castShadow
        shadow-mapSize={[4096, 4096]}
      />
    </Canvas>
  );
}
