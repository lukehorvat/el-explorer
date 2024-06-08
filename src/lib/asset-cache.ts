import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import PromiseQueue from 'p-queue';
import { expandXmlEntityRefs, parseXmlEntityDecls } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { CalMesh, readCalMesh } from '../io/cal3d-meshes';
import { CalBone, readCalSkeleton } from '../io/cal3d-skeletons';
import { CalAnimation, readCalAnimation } from '../io/cal3d-animations';
import groundImageUrl from '../../images/ground.jpg';

class AssetCache {
  readonly actorDefs: Map<number, ActorDef>;
  readonly ddsTextures: Map<string, THREE.Texture>;
  readonly calMeshes: Map<string, CalMesh>;
  readonly calSkeletons: Map<string, CalBone[]>;
  readonly calAnimations: Map<string, CalAnimation>;
  readonly customAssets: /* "Custom" = not bundled with EL client; not from /data. */ {
    textures: Map<string, THREE.Texture>;
  };
  private readonly stringLoader: THREE.FileLoader;
  private readonly bufferLoader: THREE.FileLoader;
  private readonly textureLoader: THREE.TextureLoader;
  private readonly ddsTextureLoader: DDSLoader;
  private readonly taskQueue: PromiseQueue;

  constructor() {
    this.actorDefs = new Map();
    this.ddsTextures = new Map();
    this.calMeshes = new Map();
    this.calSkeletons = new Map();
    this.calAnimations = new Map();
    this.customAssets = {
      textures: new Map(),
    };

    this.stringLoader = new THREE.FileLoader();
    this.bufferLoader = new THREE.FileLoader();
    this.bufferLoader.setResponseType('arraybuffer');
    this.textureLoader = new THREE.TextureLoader();
    this.ddsTextureLoader = new DDSLoader();

    this.taskQueue = new PromiseQueue({ concurrency: 10 });
  }

  async *loadAssets(): AsyncGenerator<[message: string, error?: unknown]> {
    if (!WebGL.isWebGLAvailable()) {
      yield [
        'Your browser does not support WebGL.',
        new Error('WebGL not supported.'),
      ];
    }

    yield ['Loading actor definitions...'];
    try {
      await this.loadActorDefs();
    } catch (error) {
      yield ['Failed to load actor definitions.', error];
    }

    for (const actorDef of this.actorDefs.values()) {
      void this.loadDDSTexture(actorDef.skinPath);
      void this.loadCalMesh(actorDef.meshPath);
      void this.loadCalSkeleton(actorDef.skeletonPath);
      for (const animation of actorDef.animations) {
        void this.loadCalAnimation(animation.path);
      }
    }

    try {
      await this.taskQueue.onIdle();
    } catch (error) {
      yield ['Failed to load actors.', error];
    }

    yield ['Loading custom assets...'];
    try {
      await this.loadCustomAssets();
    } catch (error) {
      yield ['Failed to load custom assets.', error];
    }
  }

  private async loadActorDefs(): Promise<void> {
    const xml = (await this.stringLoader.loadAsync(
      'data/actor_defs/actor_defs.xml'
    )) as string;
    const entityXmls = new Map<string, string>();
    const tasks: Promise<void>[] = [];

    for (const [entityName, entityUri] of parseXmlEntityDecls(xml)) {
      tasks.push(
        this.taskQueue.add(async () => {
          const entityXml = (await this.stringLoader.loadAsync(
            `data/actor_defs/${entityUri}`
          )) as string;
          entityXmls.set(entityName, entityXml);
        })
      );
    }

    await Promise.all(tasks);
    const expandedXml = expandXmlEntityRefs(xml, entityXmls);
    const actorDefs = readActorDefs(expandedXml).filter(
      (def) => !ignoredActorDefs.has(def.name)
    );

    for (const actorDef of actorDefs) {
      this.actorDefs.set(actorDef.type, actorDef);
    }
  }

  private async loadDDSTexture(filePath: string): Promise<void> {
    return this.taskQueue.add(async () => {
      if (this.ddsTextures.has(filePath)) return;
      const texture = await this.ddsTextureLoader.loadAsync(`data/${filePath}`);
      if (this.ddsTextures.has(filePath)) return;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      this.ddsTextures.set(filePath, texture);
    });
  }

  private async loadCalMesh(filePath: string): Promise<void> {
    return this.taskQueue.add(async () => {
      if (this.calMeshes.has(filePath)) return;
      const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
      if (this.calMeshes.has(filePath)) return;
      const calMesh = readCalMesh(buffer as ArrayBuffer)[0]; // EL's Cal3D meshes only have one sub-mesh. 🤷‍♂️
      this.calMeshes.set(filePath, calMesh);
    });
  }

  private async loadCalSkeleton(filePath: string): Promise<void> {
    return this.taskQueue.add(async () => {
      if (this.calSkeletons.has(filePath)) return;
      const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
      if (this.calSkeletons.has(filePath)) return;
      const calSkeleton = readCalSkeleton(buffer as ArrayBuffer);
      this.calSkeletons.set(filePath, calSkeleton);
    });
  }

  private async loadCalAnimation(filePath: string): Promise<void> {
    return this.taskQueue.add(async () => {
      if (this.calAnimations.has(filePath)) return;
      const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
      if (this.calAnimations.has(filePath)) return;
      const calAnimation = readCalAnimation(buffer as ArrayBuffer);
      this.calAnimations.set(filePath, calAnimation);
    });
  }

  private async loadCustomAssets(): Promise<void> {
    const groundImage = await this.textureLoader.loadAsync(groundImageUrl); // TODO: Delete?
    this.customAssets.textures.set('ground', groundImage);
  }
}

/**
 * Don't load the following actor defs, since they aren't like the others.
 */
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
  'target',
]);

export const assetCache = new AssetCache(); // singleton
