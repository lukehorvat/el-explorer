import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { stateAtoms, store } from './state';
import { Actor } from './actor';
import { GroundMaterial } from './ground-material';

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock: THREE.Clock;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly ground: THREE.Mesh;
  private readonly orbitControls: OrbitControls;
  private readonly stats: Stats;
  private actor!: Actor;

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
    this.camera.near = 0.001;
    this.camera.far = 1000;
    this.scene.add(this.camera);

    const ambientLight = new THREE.AmbientLight('#fff', 0.5);
    this.scene.add(ambientLight);

    // Shine a light from the sky that casts shadows on the ground.
    const directionalLight = new THREE.DirectionalLight('#fff', 1);
    directionalLight.position.set(10, 10, -5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;
    this.scene.add(directionalLight);

    // Shine a light from the camera.
    const pointLight = new THREE.PointLight('#fff', 1.5, 0, 0);
    this.camera.add(pointLight);

    this.ground = new THREE.Mesh();
    this.ground.material = new GroundMaterial({
      color: '#e6e6e6',
      shadowIntensity: 0.4,
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
    this.stats.dom.classList.add('Stats', 'm-3');
    document.body.appendChild(this.stats.dom);

    this.handleStateChanges();
    requestAnimationFrame(this.animate.bind(this)); // Start the animation frame loop.
  }

  /**
   * Render the current frame.
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    this.resizeRendererToDisplaySize();
    this.orbitControls.update();
    this.actor.animationMixer.update(delta);

    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }

  /**
   * Sync the renderer size with the current canvas size.
   *
   * @see https://threejs.org/manual/en/responsive.html
   */
  private resizeRendererToDisplaySize(): void {
    const canvas = this.renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Ensure that the scene is synced with the initial state and any state changes.
   */
  private handleStateChanges(): void {
    this.syncActorType();
    this.syncSkinType();
    this.syncSkeleton();
    this.syncAnimation();
    this.syncGround();
    this.syncStats();
    this.syncAutoRotate();

    store.sub(stateAtoms.actorType, () => {
      this.syncActorType();
      this.syncSkinType();
      this.syncSkeleton();
      this.syncAnimation();
    });
    store.sub(stateAtoms.skinType, () => this.syncSkinType());
    store.sub(stateAtoms.showSkeleton, () => this.syncSkeleton());
    store.sub(stateAtoms.animationType, () => this.syncAnimation());
    store.sub(stateAtoms.animationLoop, () => this.syncAnimation());
    store.sub(stateAtoms.animationSpeed, () => this.syncAnimation());
    store.sub(stateAtoms.showGround, () => this.syncGround());
    store.sub(stateAtoms.showStats, () => this.syncStats());
    store.sub(stateAtoms.autoRotate, () => this.syncAutoRotate());
  }

  private syncActorType(): void {
    const actorType = store.get(stateAtoms.actorType);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    // Reset to a sensible camera position.
    this.camera.position.x = 0;
    this.camera.position.y = center.y;
    this.camera.position.z = 4;
  }

  private syncSkinType(): void {
    const skinType = store.get(stateAtoms.skinType);
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
          emissive: '#808080',
          emissiveIntensity: 0.8,
          roughness: 0.5,
          metalness: 1,
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
  }

  private syncSkeleton(): void {
    const showSkeleton = store.get(stateAtoms.showSkeleton);
    this.actor.skeletonHelper.visible = showSkeleton;
  }

  private syncAnimation(): void {
    const animationHandlers = {
      playAnimation: () => {
        const animationType = store.get(stateAtoms.animationType)!;
        const animationLoop = store.get(stateAtoms.animationLoop);
        const animationSpeed = store.get(stateAtoms.animationSpeed);
        this.actor.playAnimation(animationType, animationLoop, animationSpeed);
      },
      getAnimationTime: () => {
        const animationType = store.get(stateAtoms.animationType);
        return animationType ? this.actor.getAnimationTime(animationType) : 0;
      },
      isAnimationPlaying: () => {
        const animationType = store.get(stateAtoms.animationType);
        return !!animationType && this.actor.isAnimationPlaying(animationType);
      },
    };

    store.set(stateAtoms.animationHandlers, animationHandlers);
    animationHandlers.playAnimation();
  }

  private syncGround(): void {
    const showGround = store.get(stateAtoms.showGround);
    this.ground.visible = showGround;
  }

  private syncStats(): void {
    const showStats = store.get(stateAtoms.showStats);
    this.stats.dom.classList.toggle('Hidden', !showStats);
  }

  private syncAutoRotate(): void {
    const autoRotate = store.get(stateAtoms.autoRotate);
    this.orbitControls.autoRotate = autoRotate;
  }
}
