import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { Cal3DMesh, readCal3DMesh } from '../io/cal3d-meshes';
import { Cal3DBone, readCal3DSkeleton } from '../io/cal3d-skeletons';
import { Cal3DAnimation, readCal3DAnimation } from '../io/cal3d-animations';

export class AssetCache {
  readonly actorDefs: Map<number, ActorDef>;
  readonly actorSkins: Map<number, THREE.Texture>;
  readonly actorMeshes: Map<number, Cal3DMesh[]>;
  readonly actorSkeletons: Map<number, Cal3DBone[]>;
  readonly actorAnimations: Map<number, Cal3DAnimation[]>;
  private readonly textLoader: THREE.FileLoader;
  private readonly bufferLoader: THREE.FileLoader;
  private readonly textureLoader: DDSLoader;

  constructor() {
    this.actorDefs = new Map();
    this.actorSkins = new Map();
    this.actorMeshes = new Map();
    this.actorSkeletons = new Map();
    this.actorAnimations = new Map();
    this.textLoader = new THREE.FileLoader();
    this.bufferLoader = new THREE.FileLoader();
    this.bufferLoader.setResponseType('arraybuffer');
    this.textureLoader = new DDSLoader();
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
  }

  private async loadActorDefinitions(): Promise<void> {
    const xml = (await this.textLoader.loadAsync(
      'data/actor_defs/actor_defs.xml'
    )) as string;
    const xmlExpander = new XmlEntitiesExpander(xml);
    const entityXmls: string[] = [];

    for (const entityUri of xmlExpander.entityUris) {
      const entityXml = (await this.textLoader.loadAsync(
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
      const skin = await this.textureLoader.loadAsync(
        `data/${actorDef.skinPath}`
      );

      this.actorSkins.set(actorDef.type, skin);
    }
  }

  private async loadActorMeshes(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const meshData = (await this.bufferLoader.loadAsync(
        `data/${actorDef.meshPath}`
      )) as ArrayBuffer;
      const subMeshes = readCal3DMesh(Buffer.from(meshData));

      this.actorMeshes.set(actorDef.type, subMeshes);
    }
  }

  private async loadActorSkeletons(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const skeletonData = (await this.bufferLoader.loadAsync(
        `data/${actorDef.skeletonPath}`
      )) as ArrayBuffer;
      const skeleton = readCal3DSkeleton(Buffer.from(skeletonData));

      this.actorSkeletons.set(actorDef.type, skeleton);
    }
  }

  private async loadActorAnimations(): Promise<void> {
    for (const actorDef of this.actorDefs.values()) {
      const animations: Cal3DAnimation[] = [];

      for (const animationFrame of actorDef.animationFrames) {
        const animationData = (await this.bufferLoader.loadAsync(
          `data/${animationFrame.path}`
        )) as ArrayBuffer;
        const animation = readCal3DAnimation(Buffer.from(animationData));
        animations.push(animation);
      }

      this.actorAnimations.set(actorDef.type, animations);
    }
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
