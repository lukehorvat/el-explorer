import React from 'react';
import { GradientTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A sky dome with color gradient.
 */
export function Skybox({
  radius,
  ...sphereProps
}: {
  radius: number;
} & React.ComponentProps<typeof Sphere>): React.JSX.Element {
  return (
    <Sphere
      {...sphereProps}
      args={[
        radius,
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
        <GradientTexture
          stops={[0.2, 0.4, 0.6, 0.8, 1]}
          colors={[
            // TODO: Read colors from skybox_defs.xml
            'rgb(48,104,170)',
            'rgb(66,126,197)',
            'rgb(114,164,204)',
            'rgb(160,202,223)',
            'rgb(204,204,204)',
          ]}
        />
      </meshBasicMaterial>
    </Sphere>
  );
}
