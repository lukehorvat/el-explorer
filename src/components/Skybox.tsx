import React from 'react';
import { GradientTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A sky dome with color gradient.
 */
export function Skybox({
  radius,
  mapName,
  isDungeonMap,
  ...sphereProps
}: {
  radius: number;
  mapName: string;
  isDungeonMap: boolean;
} & React.ComponentProps<typeof Sphere>): React.JSX.Element {
  return (
    <Sphere
      {...sphereProps}
      args={[radius]}
      scale={[1, 0.15, 1]} // ellipsoid
    >
      <meshBasicMaterial side={THREE.BackSide}>
        <GradientTexture
          stops={[0.1, 0.2, 0.3, 0.4, 0.5]}
          colors={getSkyColors(mapName, isDungeonMap)}
        />
      </meshBasicMaterial>
    </Sphere>
  );
}

function getSkyColors(
  mapName: string,
  isDungeonMap: boolean
): THREE.ColorRepresentation[] {
  if (mapName.includes('underworld')) {
    return [
      'rgb(33,6,16)',
      'rgb(83,31,23)',
      'rgb(201,58,13)',
      'rgb(230,104,11)',
      'rgb(230,104,11)',
    ];
  } else if (isDungeonMap) {
    return [
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(0,0,0)',
    ];
  } else {
    // TODO: Read colors from skybox_defs.xml
    return [
      'rgb(48,104,170)',
      'rgb(66,126,197)',
      'rgb(114,164,204)',
      'rgb(160,202,223)',
      'rgb(204,204,204)',
    ];
  }
}
