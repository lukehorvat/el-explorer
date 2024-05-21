import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { Atom } from 'jotai';
import { atoms, store } from './state';
import { assetCache } from './asset-cache';
import { Cal3DBone } from '../io/cal3d-skeletons';

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock: THREE.Clock;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly ground: THREE.Mesh;
  private readonly mesh: THREE.SkinnedMesh;
  private readonly animationMixer: THREE.AnimationMixer;
  private readonly skeletonHelper: THREE.SkeletonHelper;
  private readonly orbitControls: OrbitControls;
  private readonly stats: Stats;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.x = 0;
    this.camera.position.y = 3;
    this.camera.position.z = 4;

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

    this.ground = new THREE.Mesh();
    this.ground.material = new THREE.MeshPhysicalMaterial({ color: '#ccc' });
    this.ground.geometry = new THREE.CircleGeometry(2, 100);
    this.ground.rotation.x = THREE.MathUtils.degToRad(-90);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    const actorDef = [...assetCache.actorDefs.values()].find(
      (def) => def.name === 'yeti'
    )!;
    const actorSkin = assetCache.actorSkins.get(actorDef.type)!;
    const actorMesh = assetCache.actorMeshes.get(actorDef.type)![0]; // Assume only one submesh...
    const actorSkeleton = assetCache.actorSkeletons.get(actorDef.type)!;
    const actorAnimations = assetCache.actorAnimations.get(actorDef.type)!;

    this.mesh = new THREE.SkinnedMesh();
    this.mesh.material = new THREE.MeshBasicMaterial({ map: actorSkin });
    this.mesh.geometry = new THREE.BufferGeometry();
    this.mesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(actorMesh.vertices, 3)
    );
    this.mesh.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(actorMesh.normals, 3)
    );
    this.mesh.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(actorMesh.uvs, 2)
    );
    this.mesh.geometry.setIndex(
      new THREE.BufferAttribute(actorMesh.indices, 1)
    );
    this.mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(actorMesh.skinIndices, 4)
    );
    this.mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(actorMesh.skinWeights, 4)
    );
    const bones = composeSkeleton(actorSkeleton);
    this.mesh.add(
      // Assume only one root bone...
      bones[actorSkeleton.findIndex(({ parentId }) => parentId === -1)]
    );
    this.mesh.bind(new THREE.Skeleton(bones));
    this.mesh.rotation.x = THREE.MathUtils.degToRad(-90);
    fixMesh(this.mesh.geometry, actorSkin);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    this.animationMixer = new THREE.AnimationMixer(this.mesh);

    this.skeletonHelper = new THREE.SkeletonHelper(this.mesh);
    this.scene.add(this.skeletonHelper);

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.autoRotateSpeed = 3;
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = false;

    this.stats = new Stats();
    this.stats.dom.className = 'Stats';
    document.body.appendChild(this.stats.dom);

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

    this.handleStateChanges();
  }

  render(): void {
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Render the current frame.
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    this.syncRendererSize();
    this.animationMixer.update(delta);
    this.orbitControls.update();

    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
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

  /**
   * Render the initial state and any state changes.
   */
  private handleStateChanges(): void {
    const subscribers = new Map<Atom<any>, () => void>([
      [atoms.actorType, this.onActorType.bind(this)],
      [atoms.animationType, this.onAnimationType.bind(this)],
      [atoms.loopAnimation, this.onLoopAnimation.bind(this)],
      [atoms.showMesh, this.onShowMesh.bind(this)],
      [atoms.showWireframe, this.onShowWireframe.bind(this)],
      [atoms.showSkeleton, this.onShowSkeleton.bind(this)],
      [atoms.showGround, this.onShowGround.bind(this)],
      [atoms.showStats, this.onShowStats.bind(this)],
      [atoms.autoRotate, this.onAutoRotate.bind(this)],
    ]);

    for (const [atom, subscriber] of subscribers) {
      subscriber();
      store.sub(atom, subscriber);
    }
  }

  private onActorType(): void {
    const actorType = store.get(atoms.actorType);
    // TODO
  }

  private onAnimationType(): void {
    const animationType = store.get(atoms.animationType);
    // TODO
  }

  private onLoopAnimation(): void {
    const loopAnimation = store.get(atoms.loopAnimation);
    // TODO
  }

  private onShowMesh(): void {
    const showMesh = store.get(atoms.showMesh);
    this.mesh.visible = showMesh;
  }

  private onShowWireframe(): void {
    const showWireframe = store.get(atoms.showWireframe);
    (this.mesh.material as THREE.MeshBasicMaterial).wireframe = showWireframe;
  }

  private onShowSkeleton(): void {
    const showSkeleton = store.get(atoms.showSkeleton);
    this.skeletonHelper.visible = showSkeleton;
  }

  private onShowGround(): void {
    const showGround = store.get(atoms.showGround);
    this.ground.visible = showGround;
  }

  private onShowStats(): void {
    const showStats = store.get(atoms.showStats);
    this.stats.dom.classList.toggle('hidden', !showStats);
  }

  private onAutoRotate(): void {
    const autoRotate = store.get(atoms.autoRotate);
    this.orbitControls.autoRotate = autoRotate;
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
