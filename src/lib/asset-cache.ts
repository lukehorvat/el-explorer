import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { expandXmlEntityRefs, parseXmlEntityDecls } from '../io/xml-entities';
import { Object3dDef, readObject3dDef } from '../io/object3d-defs';
import {
  Object2dDef,
  Object2dType,
  readObject2dDef,
} from '../io/object2d-defs';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { CalMesh, readCalMesh } from '../io/cal3d-meshes';
import { CalBone, readCalSkeleton } from '../io/cal3d-skeletons';
import { CalAnimation, readCalAnimation } from '../io/cal3d-animations';

class AssetCache {
  readonly object3dDefs: Map<string, Object3dDef>;
  readonly object2dDefs: Map<string, Object2dDef>;
  readonly actorDefs: Map<number, ActorDef>;
  readonly ddsTextures: Map<string, THREE.Texture>;
  readonly calMeshes: Map<string, CalMesh>;
  readonly calSkeletons: Map<string, CalBone[]>;
  readonly calAnimations: Map<string, CalAnimation>;
  private readonly stringLoader: THREE.FileLoader;
  private readonly bufferLoader: THREE.FileLoader;
  private readonly textureLoader: THREE.TextureLoader;
  private readonly ddsTextureLoader: DDSLoader;

  constructor() {
    this.object3dDefs = new Map();
    this.object2dDefs = new Map();
    this.actorDefs = new Map();
    this.ddsTextures = new Map();
    this.calMeshes = new Map();
    this.calSkeletons = new Map();
    this.calAnimations = new Map();

    this.stringLoader = new THREE.FileLoader();
    this.bufferLoader = new THREE.FileLoader();
    this.bufferLoader.setResponseType('arraybuffer');
    this.textureLoader = new THREE.TextureLoader();
    this.ddsTextureLoader = new DDSLoader();
  }

  async *loadActors(): AsyncGenerator<[message: string, error?: unknown]> {
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
  }

  async *loadObject3ds(): AsyncGenerator<[message: string, error?: unknown]> {
    yield ['Loading 3D object definitions...'];
    try {
      await this.loadObject3dDefs();
    } catch (error) {
      yield ['Failed to load 3D object definitions.', error];
    }

    yield ['Loading 3D object textures...'];
    try {
      for (const object3dDef of this.object3dDefs.values()) {
        for (const material of object3dDef.materials) {
          await this.loadDDSTexture(material.texturePath);
        }
      }
    } catch (error) {
      yield ['Failed to load 3D object textures.', error];
    }
  }

  async *loadObject2ds(): AsyncGenerator<[message: string, error?: unknown]> {
    yield ['Loading 2D object definitions...'];
    try {
      await this.loadObject2dDefs();
    } catch (error) {
      yield ['Failed to load 2D object definitions.', error];
    }

    yield ['Loading 2D object textures...'];
    try {
      for (const object2dDef of this.object2dDefs.values()) {
        await this.loadDDSTexture(object2dDef.texturePath);
      }
    } catch (error) {
      yield ['Failed to load 2D object textures.', error];
    }
  }

  private async loadObject3dDefs(): Promise<void> {
    const object3dDefPaths: string[] = JSON.parse(
      (await this.stringLoader.loadAsync('3dobjects.json')) as string
    );

    for (const object3dDefPath of object3dDefPaths.filter(
      (defPath) => !ignoredObject3dDefs.has(defPath)
    )) {
      await this.loadObject3dDef(`3dobjects/${object3dDefPath}`);
    }
  }

  private async loadObject2dDefs(): Promise<void> {
    const object2dDefPaths: string[] = JSON.parse(
      (await this.stringLoader.loadAsync('2dobjects.json')) as string
    );

    for (const object2dDefPath of object2dDefPaths) {
      await this.loadObject2dDef(`2dobjects/${object2dDefPath}`);
    }
  }

  private async loadActorDefs(): Promise<void> {
    const xml = (await this.stringLoader.loadAsync(
      'data/actor_defs/actor_defs.xml'
    )) as string;
    const entityXmls = new Map<string, string>();

    for (const [entityName, entityUri] of parseXmlEntityDecls(xml)) {
      const entityXml = (await this.stringLoader.loadAsync(
        `data/actor_defs/${entityUri}`
      )) as string;
      entityXmls.set(entityName, entityXml);
    }

    const expandedXml = expandXmlEntityRefs(xml, entityXmls);
    const actorDefs = readActorDefs(expandedXml).filter(
      (def) => !ignoredActorDefs.has(def.name)
    );

    for (const actorDef of actorDefs) {
      this.actorDefs.set(actorDef.type, actorDef);
    }
  }

  private async loadObject3dDef(filePath: string): Promise<void> {
    if (this.object3dDefs.has(filePath)) return;

    const buffer = await this.bufferLoader.loadAsync(`data/${filePath}`);
    const object3dDef = readObject3dDef(buffer as ArrayBuffer);
    const dir = filePath.slice(0, filePath.lastIndexOf('/'));
    for (const material of object3dDef.materials) {
      material.texturePath = `${dir}/${material.texturePath}`; // Make texture path absolute.
    }
    this.object3dDefs.set(filePath, object3dDef);
  }

  private async loadObject2dDef(filePath: string): Promise<void> {
    if (this.object2dDefs.has(filePath)) return;

    const data = await this.stringLoader.loadAsync(`data/${filePath}`);
    const object2dDef = readObject2dDef(data as string);
    if (object2dDef.type !== Object2dType.GROUND) {
      // It's not clear how to handle non-ground 2D objects. They aren't used anymore anyway...
      throw new Error('Unsupported 2D object type encountered.');
    }
    const dir = filePath.slice(0, filePath.lastIndexOf('/'));
    object2dDef.texturePath = `${dir}/${object2dDef.texturePath}`; // Make texture path absolute.
    this.object2dDefs.set(filePath, object2dDef);
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

/**
 * Don't load the following 3D object defs, since their texture files are missing(?).
 */
const ignoredObject3dDefs = new Set(['sled1.e3d']);

export const assetCache = new AssetCache(); // singleton
