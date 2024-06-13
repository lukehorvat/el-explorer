import React, { useMemo } from 'react';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A plane that uses a custom shader material.
 *
 * This is needed because we don't want a point light shining from the camera
 * to affect the lighting of the ground. This material ignores point light.
 *
 * Adapted from: https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
 */
export function Ground({ visible }: { visible?: boolean }): React.JSX.Element {
  const uniforms = useMemo(
    () =>
      getShaderUniforms({
        color: new THREE.Color().setHSL(0.095, 0.05, 0.77),
        shadowIntensity: 0.4,
      }),
    []
  );

  return (
    <Plane
      args={[10000, 10000]}
      rotation-x={THREE.MathUtils.degToRad(-90)}
      receiveShadow
      visible={visible}
    >
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        lights
        depthTest={false}
      />
    </Plane>
  );
}

const getShaderUniforms = (parameters: {
  color: THREE.ColorRepresentation;
  shadowIntensity: number;
}): Record<string, THREE.IUniform> => ({
  ...THREE.UniformsLib.lights,
  uColor: { value: new THREE.Color(parameters.color) },
  uShadowIntensity: { value: parameters.shadowIntensity },
});

const vertexShader = /* GLSL */ `
  #include <common>
  #include <shadowmap_pars_vertex>

  varying vec3 vNormal;

  void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <begin_vertex>
    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;
    gl_Position = clipPosition;

    vNormal = normalize(normalMatrix * normal);
  }
`;

const fragmentShader = /* GLSL */ `
  #include <common>
  #include <packing>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>

  varying vec3 vNormal;
  uniform vec3 uColor;
  uniform float uShadowIntensity;

  void main() {
    DirectionalLight directionalLight = directionalLights[0];
    DirectionalLightShadow directionalShadow = directionalLightShadows[0];
    float shadow = getShadow(
      directionalShadowMap[0],
      directionalShadow.shadowMapSize,
      directionalShadow.shadowBias,
      directionalShadow.shadowRadius,
      vDirectionalShadowCoord[0]
    );

    // Calculate directional light intensity. When in full shadow, intensity is zero.
    float dotProduct = dot(vNormal, directionalLight.direction);
    float lightIntensity = max(0.0, dotProduct * shadow);

    // Adjust the intensity (darkness) of the shadow.
    lightIntensity = max(1.0 - uShadowIntensity, lightIntensity);

    vec3 directionalLightColor = directionalLight.color * lightIntensity;
    gl_FragColor = vec4(uColor * (ambientLightColor + directionalLightColor), 1.0);
  }
`;
