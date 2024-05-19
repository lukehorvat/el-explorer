import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { Cal3DMesh, readCal3DMesh } from '../io/cal3d-meshes';
import { Cal3DBone, readCal3DSkeleton } from '../io/cal3d-skeletons';

export class SceneManager {
  private static assets: {
    actorDefs: ActorDef[];
    actorSkins: Map<number, THREE.Texture>;
    actorMeshes: Map<number, Cal3DMesh[]>;
    actorSkeletons: Map<number, Cal3DBone[]>;
  };

  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly controls: OrbitControls;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.z = 3;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    const ambientLight = new THREE.AmbientLight('#ffffff');
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 3;
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;

    const actorDef = SceneManager.assets.actorDefs.find(
      (def) => def.name === 'feros'
    )!;
    const skin = SceneManager.assets.actorSkins.get(actorDef.type)!;
    const subMeshes = SceneManager.assets.actorMeshes.get(actorDef.type)!;
    const skeleton = SceneManager.assets.actorSkeletons.get(actorDef.type)!;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(subMeshes[0].vertices, 3)
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(subMeshes[0].normals, 3)
    );
    geometry.setAttribute('uv', new THREE.BufferAttribute(subMeshes[0].uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(subMeshes[0].indices, 1));
    const skinIndices: number[] = [];
    subMeshes[0].vertexInfo.forEach((v) => {
      skinIndices.push(
        v.influences[0]?.boneId || 0,
        v.influences[1]?.boneId || 0,
        v.influences[2]?.boneId || 0,
        v.influences[3]?.boneId || 0
      );
    });
    geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(new Uint16Array(skinIndices), 4)
    );
    const skinWeights: number[] = [];
    subMeshes[0].vertexInfo.forEach((v) => {
      skinWeights.push(
        v.influences[0]?.weight || 0,
        v.influences[1]?.weight || 0,
        v.influences[2]?.weight || 0,
        v.influences[3]?.weight || 0
      );
    });
    geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(new Float32Array(skinWeights), 4)
    );

    // geometry.rotateX(THREE.MathUtils.degToRad(-90));
    // geometry.center();
    const material = new THREE.MeshBasicMaterial({ map: skin });
    const mesh = new THREE.SkinnedMesh(geometry, material);
    this.scene.add(mesh);

    fixMesh(geometry, skin);

    const bones = skeleton.map((boneData) => {
      const bone = new THREE.Bone();
      const translationMatrix = new THREE.Matrix4().makeTranslation(
        boneData.translation.x,
        boneData.translation.y,
        boneData.translation.z
      );
      const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion(
          boneData.rotation.x,
          boneData.rotation.y,
          boneData.rotation.z,
          -boneData.rotation.w // Cal3D stores it negated for some reason...
        )
      );
      const transformMatrix = new THREE.Matrix4().multiplyMatrices(
        translationMatrix,
        rotationMatrix
      );
      bone.applyMatrix4(transformMatrix);
      return bone;
    });

    bones.forEach((bone, boneId) => {
      const parentBone = bones[skeleton[boneId].parentId];
      if (parentBone) {
        parentBone.add(bone);
      }
    });

    const rootBone =
      bones[skeleton.findIndex((boneData) => boneData.parentId === -1)];
    mesh.add(rootBone);
    mesh.bind(new THREE.Skeleton(bones));

    const skeletonHelper = new THREE.SkeletonHelper(mesh);
    this.scene.add(skeletonHelper);
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
    this.controls.update();

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
    const actorSkeletons = new Map<number, Cal3DBone[]>();

    for (const actorDef of actorDefs) {
      const skin = await textureLoader.loadAsync(`data/${actorDef.skinPath}`);
      const meshData = (await bufferLoader.loadAsync(
        `data/${actorDef.meshPath}`
      )) as ArrayBuffer;
      const subMeshes = readCal3DMesh(Buffer.from(meshData));
      const skeletonData = (await bufferLoader.loadAsync(
        `data/${actorDef.skeletonPath}`
      )) as ArrayBuffer;
      const skeleton = readCal3DSkeleton(Buffer.from(skeletonData));

      actorSkins.set(actorDef.type, skin);
      actorMeshes.set(actorDef.type, subMeshes);
      actorSkeletons.set(actorDef.type, skeleton);
    }

    this.assets = {
      actorDefs,
      actorSkins,
      actorMeshes,
      actorSkeletons,
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

/**
 * The .dds texture files don't map onto the mesh geometry correctly for some
 * reason that I don't understand. Opening them in Gimp and re-exporting them
 * with the "Flip the image vertically" option enabled seems to fix them, but
 * I don't want to manually do this for every .dds file. I also want the .dds
 * files to remain untouched and identical to the ones in the EL client's data
 * directory.
 *
 * So, through some trial and error, I found the following programmatic way of
 * fixing them.
 */
function fixMesh(geometry: THREE.BufferGeometry, texture: THREE.Texture): void {
  // Swap every U and V pair.
  const uvs = geometry.getAttribute('uv');
  for (let i = 0; i < uvs.count; i++) {
    uvs.setXY(i, uvs.getY(i), uvs.getX(i));
  }

  // Rotate the texture itself.
  texture.center.set(0.5, 0.5);
  texture.rotation = THREE.MathUtils.degToRad(90);
}
