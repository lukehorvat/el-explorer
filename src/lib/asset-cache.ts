import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { Cal3DMesh, readCal3DMesh } from '../io/cal3d-meshes';
import { Cal3DBone, readCal3DSkeleton } from '../io/cal3d-skeletons';
import { Cal3DAnimation, readCal3DAnimation } from '../io/cal3d-animations';
import groundImageUrl from '../images/ground.jpg';

class AssetCache {
  readonly actorDefs: Map<number, ActorDef>;
  readonly actorSkins: Map<number, THREE.Texture>;
  readonly actorMeshes: Map<number, Cal3DMesh>;
  readonly actorSkeletons: Map<number, Map<number, Cal3DBone>>;
  readonly actorAnimations: Map<number, Map<string, Cal3DAnimation>>;
  readonly customAssets: /* "Custom" = not bundled with EL client; not from /data. */ {
    textures: Map<string, THREE.Texture>;
  };
  private readonly stringLoader: THREE.FileLoader;
  private readonly bufferLoader: THREE.FileLoader;
  private readonly textureLoader: THREE.TextureLoader;
  private readonly ddsLoader: DDSLoader;

  constructor() {
    this.actorDefs = new Map();
    this.actorSkins = new Map();
    this.actorMeshes = new Map();
    this.actorSkeletons = new Map();
    this.actorAnimations = new Map();
    this.customAssets = {
      textures: new Map(),
    };

    this.stringLoader = new THREE.FileLoader();
    this.bufferLoader = new THREE.FileLoader();
    this.bufferLoader.setResponseType('arraybuffer');
    this.textureLoader = new THREE.TextureLoader();
    this.ddsLoader = new DDSLoader();
  }

  async *loadAssets(): AsyncGenerator<string> {
    yield 'Loading actor definitions...';
    await this.loadActorDefinitions();

    yield 'Loading actor skins...';
    await this.loadActorSkins();

    yield 'Loading actor meshes...';
    await this.loadActorMeshes();

    yield 'Loading actor skeletons...';
    await this.loadActorSkeletons();

    yield 'Loading actor animations...';
    await this.loadActorAnimations();

    yield 'Loading custom assets...';
    await this.loadCustomAssets();
  }

  private async loadActorDefinitions(): Promise<void> {
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

  private async loadActorSkins(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const skin = await this.ddsLoader.loadAsync(`data/${actorDef.skinPath}`);
      skin.wrapS = skin.wrapT = THREE.RepeatWrapping;
      this.actorSkins.set(actorDef.type, skin);
    }
  }

  private async loadActorMeshes(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const meshData = (await this.bufferLoader.loadAsync(
        `data/${actorDef.meshPath}`
      )) as ArrayBuffer;
      const calMesh = readCal3DMesh(Buffer.from(meshData))[0]; // EL's actors only have one sub-mesh. 🤷‍♂️
      this.actorMeshes.set(actorDef.type, calMesh);
    }
  }

  private async loadActorSkeletons(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const skeletonData = (await this.bufferLoader.loadAsync(
        `data/${actorDef.skeletonPath}`
      )) as ArrayBuffer;
      const calSkeleton = readCal3DSkeleton(Buffer.from(skeletonData));
      this.actorSkeletons.set(actorDef.type, calSkeleton);
    }
  }

  private async loadActorAnimations(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const calAnimations = new Map<string, Cal3DAnimation>();

      for (const animationFrame of actorDef.animationFrames) {
        const animationData = (await this.bufferLoader.loadAsync(
          `data/${animationFrame.path}`
        )) as ArrayBuffer;
        const calAnimation = readCal3DAnimation(Buffer.from(animationData));
        calAnimations.set(animationFrame.type, calAnimation);
      }

      this.actorAnimations.set(actorDef.type, calAnimations);
    }
  }

  private async loadCustomAssets(): Promise<void> {
    const groundImage = await this.textureLoader.loadAsync(groundImageUrl);
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
]);

export const assetCache = new AssetCache();
