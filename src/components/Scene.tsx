import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { StatsGl } from '@react-three/drei';
import * as THREE from 'three';
import './Scene.css';

export function Scene({
  className,
  showStats,
  children,
}: {
  className?: string;
  showStats?: boolean;
  children?: ReactNode;
}): React.JSX.Element {
  return (
    <Canvas
      className={`Scene ${className ?? ''}`}
      gl={{ toneMapping: THREE.NoToneMapping }}
      linear
      shadows
    >
      {children}
      {showStats && (
        <StatsGl className="SceneStats m-3" horizontal={false} precision={1} />
      )}
    </Canvas>
  );
}
