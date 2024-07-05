import * as THREE from 'three';

/**
 * To set a mesh's position and rotation in world space, call this function to
 * calculate a transformation matrix that can be passed to `applyMatrix4` (if
 * it's a regular THREE.Mesh) or `setMatrixAt` (if it's a THREE.InstancedMesh).
 */
export function calculateTransformationMatrix(
  position: THREE.Vector3Like,
  rotation?: THREE.Vector3Like
): THREE.Matrix4 {
  const translationMatrix = new THREE.Matrix4().makeTranslation(
    position.x,
    position.y,
    position.z
  );

  if (!rotation) {
    return translationMatrix;
  }

  const rotationMatrix = new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(rotation.x)),
    new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(rotation.y))
  );
  rotationMatrix.premultiply(
    new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(rotation.z))
  );
  return translationMatrix.multiply(rotationMatrix);
}
