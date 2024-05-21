import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { Atom } from 'jotai';
import { atoms, store } from './state';
import { Actor } from './actor';

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock: THREE.Clock;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly ground: THREE.Mesh;
  private readonly orbitControls: OrbitControls;
  private readonly stats: Stats;
  private actor?: Actor;

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

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.autoRotateSpeed = 3;
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = false;

    this.stats = new Stats();
    this.stats.dom.className = 'Stats';
    document.body.appendChild(this.stats.dom);

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
    this.orbitControls.update();
    this.actor?.animationMixer.update(delta);

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
    if (this.actor) {
      this.scene.remove(this.actor);
      this.actor.dispose();
    }

    const actorType = store.get(atoms.actorType);
    this.actor = new Actor(actorType);
    this.scene.add(this.actor);

    // Sync the current state with the new actor.
    this.onShowMesh();
    this.onShowWireframe();
    this.onShowSkeleton();
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
    this.actor!.mesh.visible = showMesh;
  }

  private onShowWireframe(): void {
    const showWireframe = store.get(atoms.showWireframe);
    (this.actor!.mesh.material as THREE.MeshBasicMaterial).wireframe =
      showWireframe;
  }

  private onShowSkeleton(): void {
    const showSkeleton = store.get(atoms.showSkeleton);
    this.actor!.skeletonHelper.visible = showSkeleton;
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
