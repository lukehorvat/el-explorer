import * as THREE from 'three';

/**
 * A custom shader material to use for the sky. It renders a 2-color gradient.
 *
 * Adapted from: https://threejs.org/examples/webgl_lights_hemisphere.html
 */
export class SkyMaterial extends THREE.ShaderMaterial {
  constructor(parameters: {
    topColor: THREE.ColorRepresentation;
    bottomColor: THREE.ColorRepresentation;
    offset: number;
    exponent: number;
  }) {
    super({
      uniforms: {
        topColor: { value: new THREE.Color(parameters.topColor) },
        bottomColor: { value: new THREE.Color(parameters.bottomColor) },
        offset: { value: parameters.offset },
        exponent: { value: parameters.exponent },
      },
      vertexShader,
      fragmentShader,
      depthTest: false,
      side: THREE.BackSide,
    });
  }
}

const vertexShader = /* GLSL */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* GLSL */ `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;

  void main() {
    float h = normalize(vWorldPosition + offset).y;
    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h , 0.0), exponent), 0.0)), 1.0);
  }
`;
