import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.x = 0;
    this.camera.position.y = 2;
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
    this.ground.material = new THREE.MeshToonMaterial({
      color: '#c6c6c6',
      depthTest: false,
    });
    this.ground.geometry = new THREE.CircleGeometry(this.camera.far);
    this.ground.rotation.x = THREE.MathUtils.degToRad(-90);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.autoRotateSpeed = 3;
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = false;
    this.orbitControls.minDistance = 1;
    this.orbitControls.maxDistance = 20;

    this.stats = new Stats();
    this.stats.dom.className = 'Stats';
    document.body.appendChild(this.stats.dom);

    this.handleStateChanges();
  }

  /**
   * Start the animation frame loop.
   */
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
   * Sync the rendered scene with the current state.
   */
  private syncState(): void {
    const actorType = store.get(atoms.actorType);
    const skinType = store.get(atoms.skinType);
    const showSkeleton = store.get(atoms.showSkeleton);
    const showGround = store.get(atoms.showGround);
    const showStats = store.get(atoms.showStats);
    const autoRotate = store.get(atoms.autoRotate);
    const animationType = store.get(atoms.animationType);
    const loopAnimation = store.get(atoms.loopAnimation);

    if (!this.actor || this.actor.actorType !== actorType) {
      if (this.actor) {
        this.scene.remove(this.actor);
        this.actor.dispose();
      }

      this.actor = new Actor(actorType);
      this.scene.add(this.actor);

      // Center the actor's mesh and orbit its center.
      const boundingBox = new THREE.Box3().setFromObject(this.actor.mesh);
      const center = boundingBox.getCenter(new THREE.Vector3());
      this.actor.mesh.position.x -= center.x;
      this.actor.mesh.position.z -= center.z;
      this.orbitControls.target = new THREE.Vector3(0, center.y, 0);
    }

    this.actor.mesh.visible = !!skinType;
    switch (skinType) {
      case 'texture':
        this.actor.mesh.material = this.actor.material;
        break;
      case 'wireframe':
        this.actor.mesh.material = new THREE.MeshBasicMaterial({
          color: '#00cc8d',
          wireframe: true,
        });
        break;
      case 'vectors':
        this.actor.mesh.material = new THREE.MeshNormalMaterial();
        break;
      case 'metal':
        this.actor.mesh.material = new THREE.MeshPhysicalMaterial({
          color: '#fff',
          emissive: '#cd7f32',
          emissiveIntensity: 0.5,
          roughness: 0.4,
          metalness: 0.4,
          thickness: 2,
          transmission: 1,
          iridescence: 4,
          ior: 20,
        });
        break;
      case 'crystal':
        this.actor.mesh.material = new THREE.MeshPhysicalMaterial({
          color: '#fff',
          emissive: '#f653a6',
          sheenColor: '#8ab9f1',
          emissiveIntensity: 0.5,
          sheen: 3,
          roughness: 0.3,
          thickness: 2,
          transmission: 1,
          ior: 2,
          flatShading: true,
          anisotropy: 20,
        });
        break;
      case 'silhouette':
        this.actor.mesh.material = new THREE.MeshBasicMaterial({
          color: '#a2a4a5',
        });
        break;
    }

    this.actor.skeletonHelper.visible = showSkeleton;
    this.actor.playAnimation(animationType, loopAnimation);
    this.ground.visible = showGround;
    this.stats.dom.classList.toggle('hidden', !showStats);
    this.orbitControls.autoRotate = autoRotate;
  }

  /**
   * Ensure that the scene is synced with the initial state and any state changes.
   */
  private handleStateChanges(): void {
    this.syncState();

    for (const atom of Object.values(atoms)) {
      store.sub(atom, this.syncState.bind(this));
    }
  }
}
