import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AssetCache } from './asset-cache';
import { Cal3DBone } from '../io/cal3d-skeletons';
import './scene-manager.css';

export class SceneManager {
  private readonly assetCache: AssetCache;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly controls: OrbitControls;
  private readonly animationMixer: THREE.AnimationMixer;

  constructor(assetCache: AssetCache) {
    this.assetCache = assetCache;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.domElement.className = 'scene';
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.y = 3;
    this.camera.position.z = 3;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    const hemisphereLight = new THREE.HemisphereLight('#fff', '#fff', Math.PI);
    hemisphereLight.position.y = 20;
    this.scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight('#fff', Math.PI / 2);
    directionalLight.position.set(10, 10, -5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;
    this.scene.add(directionalLight);

    const ground = new THREE.Mesh();
    ground.material = new THREE.MeshPhysicalMaterial({ color: '#ccc' });
    ground.geometry = new THREE.CircleGeometry(2, 100);
    ground.rotation.x = THREE.MathUtils.degToRad(-90);
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 3;
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;

    const actorDef = [...this.assetCache.actorDefs.values()].find(
      (def) => def.name === 'fox'
    )!;
    const actorSkin = this.assetCache.actorSkins.get(actorDef.type)!;
    const actorMesh = this.assetCache.actorMeshes.get(actorDef.type)![0]; // Assume only one submesh...
    const actorSkeleton = this.assetCache.actorSkeletons.get(actorDef.type)!;
    const actorAnimations = this.assetCache.actorAnimations.get(actorDef.type)!;

    const mesh = new THREE.SkinnedMesh();
    mesh.material = new THREE.MeshBasicMaterial({ map: actorSkin });
    mesh.geometry = new THREE.BufferGeometry();
    mesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(actorMesh.vertices, 3)
    );
    mesh.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(actorMesh.normals, 3)
    );
    mesh.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(actorMesh.uvs, 2)
    );
    mesh.geometry.setIndex(new THREE.BufferAttribute(actorMesh.indices, 1));
    mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(actorMesh.skinIndices, 4)
    );
    mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(actorMesh.skinWeights, 4)
    );
    const bones = composeSkeleton(actorSkeleton);
    mesh.add(bones[actorSkeleton.findIndex(({ parentId }) => parentId === -1)]); // Assume only one root bone...
    mesh.bind(new THREE.Skeleton(bones));
    mesh.rotation.x = THREE.MathUtils.degToRad(-90);
    fixMesh(mesh.geometry, actorSkin);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const skeletonHelper = new THREE.SkeletonHelper(mesh);
    skeletonHelper.visible = false;
    this.scene.add(skeletonHelper);

    this.animationMixer = new THREE.AnimationMixer(mesh);

    const animationIndex = actorDef.animationFrames.findIndex(
      (frame) => frame.type === 'CAL_walk'
    );
    const animationFrame = actorDef.animationFrames[animationIndex];
    const animation = actorAnimations[animationIndex];
    const tracks = animation.tracks
      .map((track) => {
        const times: number[] = track.keyframes.map(
          (keyframe) => keyframe.time
        );
        const positions = track.keyframes
          .map((keyframe) => [
            keyframe.translation.x,
            keyframe.translation.y,
            keyframe.translation.z,
          ])
          .flat();
        const rotations = track.keyframes
          .map((keyframe) => [
            keyframe.rotation.x,
            keyframe.rotation.y,
            keyframe.rotation.z,
            -keyframe.rotation.w, // Cal3D stores it negated for some reason...
          ])
          .flat();
        const positionTrack = new THREE.VectorKeyframeTrack(
          `.bones[${track.boneId}].position`,
          times,
          positions,
          THREE.InterpolateSmooth
        );
        const rotationTrack = new THREE.QuaternionKeyframeTrack(
          `.bones[${track.boneId}].quaternion`,
          times,
          rotations
        );
        return [positionTrack, rotationTrack];
      })
      .flat();

    const clip = new THREE.AnimationClip('', -1, tracks);
    const action = this.animationMixer.clipAction(clip);
    action.timeScale =
      // If a custom animation duration was defined, override the natural duration.
      animationFrame.duration > 0
        ? clip.duration / (animationFrame.duration / 1000)
        : 1;
    // action.loop = THREE.LoopOnce;
    // action.clampWhenFinished = true;
    action.play();
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Render the current frame.
   */
  private animate(): void {
    const delta = this.clock.getDelta();

    this.syncRendererSize();
    this.controls.update();
    this.animationMixer.update(delta);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Sync the renderer size with the current canvas size.
   */
  private syncRendererSize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }
}

/**
 * The .dds texture files don't map onto the mesh geometry correctly for some
 * reason that I don't understand. Opening them in Gimp and re-exporting them
 * with the "Flip the image vertically" option enabled seems to fix them, but
 * I don't want to manually do this for every .dds file. I also want the .dds
 * files to remain untouched and identical to the ones in the EL client's data
 * directory.
 *
 * So, through some trial and error, I found the following programmatic way of
 * fixing them.
 */
function fixMesh(geometry: THREE.BufferGeometry, texture: THREE.Texture): void {
  // Swap every U and V pair.
  const uvs = geometry.getAttribute('uv');
  for (let i = 0; i < uvs.count; i++) {
    uvs.setXY(i, uvs.getY(i), uvs.getX(i));
  }

  // Rotate the texture itself.
  texture.center.set(0.5, 0.5);
  texture.rotation = THREE.MathUtils.degToRad(90);
}

function composeSkeleton(skeleton: Cal3DBone[]): THREE.Bone[] {
  const bones = skeleton.map((boneData) => {
    const bone = new THREE.Bone();
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      boneData.translation.x,
      boneData.translation.y,
      boneData.translation.z
    );
    const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
      new THREE.Quaternion(
        boneData.rotation.x,
        boneData.rotation.y,
        boneData.rotation.z,
        -boneData.rotation.w // Cal3D stores it negated for some reason...
      )
    );
    const transformMatrix = new THREE.Matrix4().multiplyMatrices(
      translationMatrix,
      rotationMatrix
    );
    bone.applyMatrix4(transformMatrix);
    return bone;
  });

  bones.forEach((bone, boneId) => {
    const parentBone = bones[skeleton[boneId].parentId];
    if (parentBone) {
      parentBone.add(bone);
    }
  });

  return bones;
}
