import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { Cal3DMesh, readCal3DMesh } from '../io/cal3d-meshes';

export class SceneManager {
  private static assets: {
    actorDefs: ActorDef[];
    actorSkins: Map<number, THREE.Texture>;
    actorMeshes: Map<number, Cal3DMesh[]>;
  };

  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.camera = new THREE.PerspectiveCamera();
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    const ambientLight = new THREE.AmbientLight('#ffffff');
    this.scene.add(ambientLight);
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

  static async loadAssets(): Promise<void> {
    const textLoader = new THREE.FileLoader();
    const bufferLoader = new THREE.FileLoader();
    bufferLoader.setResponseType('arraybuffer');
    const textureLoader = new DDSLoader();
    const xml = (await textLoader.loadAsync(
      'data/actor_defs/actor_defs.xml'
    )) as string;
    const xmlExpander = new XmlEntitiesExpander(xml);
    const entityXmls = (await Promise.all(
      xmlExpander.entityUris.map((entityUri) =>
        textLoader.loadAsync(`data/actor_defs/${entityUri}`)
      )
    )) as string[];
    const expandedXml = xmlExpander.expand(entityXmls);
    const actorDefs = readActorDefs(expandedXml).filter(
      (def) => !ignoredActorDefs.has(def.name)
    );
    const actorSkins = new Map<number, THREE.Texture>();
    const actorMeshes = new Map<number, Cal3DMesh[]>();

    for (const actorDef of actorDefs) {
      const skin = await textureLoader.loadAsync(`data/${actorDef.skinPath}`);
      const meshData = (await bufferLoader.loadAsync(
        `data/${actorDef.meshPath}`
      )) as ArrayBuffer;
      const subMeshes = readCal3DMesh(Buffer.from(meshData));
      // const skeletonData = (await bufferLoader.loadAsync(
      //   `data/${actorDef.skeletonPath}`
      // )) as ArrayBuffer;

      actorSkins.set(actorDef.type, skin);
      actorMeshes.set(actorDef.type, subMeshes);
      // actorSkeletons.set(actorDef.type, skeleton);
    }

    this.assets = {
      actorDefs,
      actorSkins,
      actorMeshes,
    };
  }
}

const ignoredActorDefs = new Set([
  'human male',
  'human female',
  'elf male',
  'elf female',
  'dwarf male',
  'dwarf female',
  'gnome male',
  'gnome female',
  'orchan male',
  'orchan female',
  'draegoni male',
  'draegoni female',
]);
