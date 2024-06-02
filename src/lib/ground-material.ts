import * as THREE from 'three';

/**
 * A custom shader material to use for the ground.
 *
 * This is needed because we don't want a point light shining from the camera
 * to affect the lighting of the ground. This material ignores point light.
 *
 * Adapted from: https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
 */
export class GroundMaterial extends THREE.ShaderMaterial {
  constructor(parameters: {
    color: THREE.ColorRepresentation;
    shadowIntensity: number;
  }) {
    super({
      uniforms: {
        ...THREE.UniformsLib.lights,
        uColor: { value: new THREE.Color(parameters.color) },
        uShadowIntensity: { value: parameters.shadowIntensity },
      },
      vertexShader,
      fragmentShader,
      lights: true,
      depthTest: false,
    });
  }
}

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
