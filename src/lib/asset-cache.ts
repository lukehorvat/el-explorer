import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { CalMesh, readCalMesh } from '../io/cal3d-meshes';
import { CalBone, readCalSkeleton } from '../io/cal3d-skeletons';
import { CalAnimation, readCalAnimation } from '../io/cal3d-animations';
import groundImageUrl from '../../images/ground.jpg';

class AssetCache {
  readonly actorDefs: Map<number, ActorDef>;
  readonly ddsTextures: Map<string, THREE.Texture>;
  readonly calMeshes: Map<string, CalMesh>;
  readonly calSkeletons: Map<string, Map<number, CalBone>>;
  readonly calAnimations: Map<string, CalAnimation>;
  readonly customAssets: /* "Custom" = not bundled with EL client; not from /data. */ {
    textures: Map<string, THREE.Texture>;
  };
  private readonly stringLoader: THREE.FileLoader;
  private readonly bufferLoader: THREE.FileLoader;
  private readonly textureLoader: THREE.TextureLoader;
  private readonly ddsTextureLoader: DDSLoader;

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

    yield ['Loading actor skins...'];
    try {
      for (const actorDef of this.actorDefs.values()) {
        await this.loadDDSTexture(actorDef.skinPath);
      }
    } catch (error) {
      yield ['Failed to load actor skins.', error];
    }

    yield ['Loading actor meshes...'];
    try {
      for (const actorDef of this.actorDefs.values()) {
        await this.loadCalMesh(actorDef.meshPath);
      }
    } catch (error) {
      yield ['Failed to load actor meshes.', error];
    }

    yield ['Loading actor skeletons...'];
    try {
      for (const actorDef of this.actorDefs.values()) {
        await this.loadCalSkeleton(actorDef.skeletonPath);
      }
    } catch (error) {
      yield ['Failed to load actor skeletons.', error];
    }

    yield ['Loading actor animations...'];
    try {
      for (const actorDef of this.actorDefs.values()) {
        for (const animation of actorDef.animations) {
          await this.loadCalAnimation(animation.path);
        }
      }
    } catch (error) {
      yield ['Failed to load actor animations.', error];
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
    const xmlExpander = new XmlEntitiesExpander(xml);
    const entityXmls: string[] = [];

    for (const entityUri of xmlExpander.entityUris) {
      const entityXml = (await this.stringLoader.loadAsync(
        `data/actor_defs/${entityUri}`
      )) as string;
      entityXmls.push(entityXml);
    }

    const expandedXml = xmlExpander.expand(entityXmls);
    const actorDefs = readActorDefs(expandedXml).filter(
      (def) => !ignoredActorDefs.has(def.name)
    );

    for (const actorDef of actorDefs) {
      this.actorDefs.set(actorDef.type, actorDef);
    }
  }

  private async loadDDSTexture(filePath: string): Promise<void> {
    if (this.ddsTextures.has(filePath)) return;

    const texture = await this.ddsTextureLoader.loadAsync(`data/${filePath}`);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.ddsTextures.set(filePath, texture);
  }

  private async loadCalMesh(filePath: string): Promise<void> {
    if (this.calMeshes.has(filePath)) return;

    const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
    const calMesh = readCalMesh(buffer as ArrayBuffer)[0]; // EL's Cal3D meshes only have one sub-mesh. 🤷‍♂️
    this.calMeshes.set(filePath, calMesh);
  }

  private async loadCalSkeleton(filePath: string): Promise<void> {
    if (this.calSkeletons.has(filePath)) return;

    const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
    const calSkeleton = readCalSkeleton(buffer as ArrayBuffer);
    this.calSkeletons.set(filePath, calSkeleton);
  }

  private async loadCalAnimation(filePath: string): Promise<void> {
    if (this.calAnimations.has(filePath)) return;

    const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
    const calAnimation = readCalAnimation(buffer as ArrayBuffer);
    this.calAnimations.set(filePath, calAnimation);
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
