import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import Pako from 'pako';
import PQueue from 'p-queue';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { MapDef, readMapDef } from '../io/map-defs';
import { Object3dDef, readObject3dDef } from '../io/object3d-defs';
import { Object2dDef, readObject2dDef } from '../io/object2d-defs';
import { CalMesh, readCalMesh } from '../io/cal3d-meshes';
import { CalBone, readCalSkeleton } from '../io/cal3d-skeletons';
import { CalAnimation, readCalAnimation } from '../io/cal3d-animations';
import { expandXmlEntityRefs, parseXmlEntityDecls } from '../io/xml-entities';

// The various in-memory caches for different types of assets.
const actorDefs = new Map<number, ActorDef>();
const mapDefs = new Map<string, MapDef>();
const object3dDefs = new Map<string, Object3dDef>();
const object2dDefs = new Map<string, Object2dDef>();
const ddsTextures = new Map<string, THREE.CompressedTexture>();
const calMeshes = new Map<string, CalMesh>();
const calSkeletons = new Map<string, CalBone[]>();
const calAnimations = new Map<string, CalAnimation>();

// Ensure task promises are cached so that tasks aren't duplicated.
const taskCache = new Map<string, Promise<void>>();

// Ensure only one task "run" happens at a time.
const taskRunQueue = new PQueue({ concurrency: 1 });

// To not overload the server or browser, limit concurrency of network requests.
const requestQueue = new PQueue({
  concurrency: process.env.NODE_ENV === 'production' ? 50 : 200,
});

type CacheTask = { id: string; run: () => Promise<void> };

/**
 * Run a task that populates the cache.
 */
function runCacheTask(task: CacheTask): Promise<void> {
  let taskPromise = taskCache.get(task.id);
  if (taskPromise) return taskPromise;

  taskPromise = task.run().catch((error: unknown) => {
    taskCache.delete(task.id);
    throw error;
  });
  taskCache.set(task.id, taskPromise);
  return taskPromise;
}

function cacheAllActorDefs(): CacheTask {
  // Don't load the following actor defs, since they aren't like the others.
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

  return {
    id: 'cacheAllActorDefs',
    run: async () => {
      const manifestXml = await loadString('actor_defs/actor_defs.xml');
      const entityUris = parseXmlEntityDecls(manifestXml);
      const entityXmls = new Map<string, string>();
      await Promise.all(
        [...entityUris].map(([entityName, entityUri]) =>
          loadString(`actor_defs/${entityUri}`).then((entityXml) =>
            entityXmls.set(entityName, entityXml)
          )
        )
      );
      const expandedXml = expandXmlEntityRefs(manifestXml, entityXmls);
      await allPromisesDone(
        readActorDefs(expandedXml)
          .filter((actorDef) => !ignoredActorDefs.has(actorDef.name))
          .map((actorDef) => runCacheTask(cacheActorDef(actorDef)))
      );
    },
  };
}

function cacheActorDef(actorDef: ActorDef): CacheTask {
  return {
    id: `cacheActorDef-${actorDef.type}`,
    run: async () => {
      actorDefs.set(actorDef.type, actorDef);
      await allPromisesDone([
        runCacheTask(cacheDDSTexture(actorDef.skinPath)),
        runCacheTask(cacheCalMesh(actorDef.meshPath)),
        runCacheTask(cacheCalSkeleton(actorDef.skeletonPath)),
        ...actorDef.animations.map((animation) =>
          runCacheTask(cacheCalAnimation(animation.path))
        ),
      ]);
    },
  };
}

function cacheAllMapDefs(): CacheTask {
  // Don't load the following map defs, since they reference missing(?) assets.
  const ignoredMapDefs = new Set([
    'guildmap_ozu.elm.gz',
    'guildmap_boc.elm.gz',
    'guildmap_riva.elm.gz',
    'guildmap_pigs.elm.gz',
    'guildmap_nu.elm.gz',
  ]);

  return {
    id: 'cacheAllMapDefs',
    run: async () => {
      const defPaths = (await loadJSON('../maps.json')) as string[];
      await allPromisesDone(
        defPaths
          .filter((defPath) => !ignoredMapDefs.has(defPath))
          .map((defPath) => runCacheTask(cacheMapDef(`maps/${defPath}`)))
      );
    },
  };
}

function cacheMapDef(defPath: string): CacheTask {
  return {
    id: `cacheMapDef-${defPath}`,
    run: async () => {
      const buffer = await loadBuffer(defPath);
      const mapDef = readMapDef(Pako.inflate(buffer).buffer);
      mapDefs.set(defPath, mapDef);

      await allPromisesDone([
        ...mapDef.object3ds.map((object3d) =>
          runCacheTask(cacheObject3dDef(object3d.defPath))
        ),
        ...mapDef.object2ds.map((object2d) =>
          runCacheTask(cacheObject2dDef(object2d.defPath))
        ),
      ]);
    },
  };
}

function cacheAllObject3dDefs(): CacheTask {
  // Don't load the following 3D object defs, since their texture files are missing(?).
  const ignoredObject3dDefs = new Set(['sled1.e3d']);

  return {
    id: 'cacheAllObject3dDefs',
    run: async () => {
      const defPaths = (await loadJSON('../3dobjects.json')) as string[];
      await allPromisesDone(
        defPaths
          .filter((defPath) => !ignoredObject3dDefs.has(defPath))
          .map((defPath) =>
            runCacheTask(cacheObject3dDef(`3dobjects/${defPath}`))
          )
      );
    },
  };
}

function cacheObject3dDef(defPath: string): CacheTask {
  return {
    id: `cacheObject3dDef-${defPath}`,
    run: async () => {
      const buffer = await loadBuffer(defPath);
      const object3dDef = readObject3dDef(buffer);
      object3dDefs.set(defPath, object3dDef);

      const dir = defPath.slice(0, defPath.lastIndexOf('/'));
      for (const material of object3dDef.materials) {
        material.texturePath = `${dir}/${material.texturePath}`; // Make texture paths absolute.
      }

      await allPromisesDone(
        object3dDef.materials.map((material) =>
          runCacheTask(cacheDDSTexture(material.texturePath))
        )
      );
    },
  };
}

function cacheAllObject2dDefs(): CacheTask {
  return {
    id: 'cacheAllObject2dDefs',
    run: async () => {
      const defPaths = (await loadJSON('../2dobjects.json')) as string[];
      await allPromisesDone(
        defPaths.map((defPath) =>
          runCacheTask(cacheObject2dDef(`2dobjects/${defPath}`))
        )
      );
    },
  };
}

function cacheObject2dDef(defPath: string): CacheTask {
  return {
    id: `cacheObject2dDef-${defPath}`,
    run: async () => {
      const data = await loadString(defPath);
      const object2dDef = readObject2dDef(data);
      object2dDefs.set(defPath, object2dDef);

      const dir = defPath.slice(0, defPath.lastIndexOf('/'));
      object2dDef.texturePath = `${dir}/${object2dDef.texturePath}`; // Make texture path absolute.
      await runCacheTask(cacheDDSTexture(object2dDef.texturePath));
    },
  };
}

function cacheDDSTexture(texturePath: string): CacheTask {
  return {
    id: `cacheDDSTexture-${texturePath}`,
    run: async () => {
      const texture = await loadDDS(texturePath);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      ddsTextures.set(texturePath, texture);
    },
  };
}

function cacheCalMesh(meshPath: string): CacheTask {
  return {
    id: `cacheCalMesh-${meshPath}`,
    run: async () => {
      const buffer = await loadBuffer(meshPath);
      const calMesh = readCalMesh(buffer)[0]; // EL's Cal3D meshes only have one sub-mesh. 🤷‍♂️
      calMeshes.set(meshPath, calMesh);
    },
  };
}

function cacheCalSkeleton(skeletonPath: string): CacheTask {
  return {
    id: `cacheCalSkeleton-${skeletonPath}`,
    run: async () => {
      const buffer = await loadBuffer(skeletonPath);
      const calSkeleton = readCalSkeleton(buffer);
      calSkeletons.set(skeletonPath, calSkeleton);
    },
  };
}

function cacheCalAnimation(animationPath: string): CacheTask {
  return {
    id: `cacheCalAnimation-${animationPath}`,
    run: async () => {
      const buffer = await loadBuffer(animationPath);
      const calAnimation = readCalAnimation(buffer);
      calAnimations.set(animationPath, calAnimation);
    },
  };
}

async function loadBuffer(path: string): Promise<ArrayBuffer> {
  const loader = new THREE.FileLoader()
    .setPath('data/')
    .setResponseType('arraybuffer');
  return (await requestQueue.add(() => loader.loadAsync(path))) as ArrayBuffer;
}

async function loadString(path: string): Promise<string> {
  const loader = new THREE.FileLoader()
    .setPath('data/')
    .setResponseType('text');
  return (await requestQueue.add(() => loader.loadAsync(path))) as string;
}

async function loadJSON(path: string): Promise<unknown> {
  const loader = new THREE.FileLoader()
    .setPath('data/')
    .setResponseType('json');
  return (await requestQueue.add(() => loader.loadAsync(path))) as unknown;
}

async function loadDDS(path: string): Promise<THREE.CompressedTexture> {
  const loader = new DDSLoader().setPath('data/');
  return (await requestQueue.add(() =>
    loader.loadAsync(path)
  )) as THREE.CompressedTexture;
}

async function allPromisesDone(promises: Promise<void>[]): Promise<void> {
  await Promise.allSettled(promises); // Wait for all to finish (whether success or fail).
  await Promise.all(promises); // Use the rejection value of the first failure.
}

export const AssetCache = {
  actorDefs,
  mapDefs,
  object3dDefs,
  object2dDefs,
  ddsTextures,
  calMeshes,
  calSkeletons,
  calAnimations,

  /**
   * Populate the cache by running the specified task.
   */
  runCacheTask: (task: CacheTask): Promise<void> => {
    return taskRunQueue.add(() => runCacheTask(task));
  },

  /**
   * Various tasks that can be run to populate the cache.
   */
  tasks: {
    cacheAllActorDefs,
    cacheAllMapDefs,
    cacheAllObject3dDefs,
    cacheAllObject2dDefs,
  },
};
