import React from 'react';
import { GradientTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A sky dome with color gradient.
 */
export function Sky(
  props: React.ComponentProps<typeof Sphere>
): React.JSX.Element {
  return (
    <Sphere
      {...props}
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
      <meshBasicMaterial side={THREE.BackSide} depthTest={false}>
        <GradientTexture colors={['#7cbfff', '#fff']} stops={[0, 1]} />
      </meshBasicMaterial>
    </Sphere>
  );
}
