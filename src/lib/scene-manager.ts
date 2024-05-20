import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';
import { Cal3DMesh, readCal3DMesh } from '../io/cal3d-meshes';
import { Cal3DBone, readCal3DSkeleton } from '../io/cal3d-skeletons';
import { Cal3DAnimation, readCal3DAnimation } from '../io/cal3d-animations';
import './scene-manager.css';

export class SceneManager {
  private static assets: {
    actorDefs: ActorDef[];
    actorSkins: Map<number, THREE.Texture>;
    actorMeshes: Map<number, Cal3DMesh[]>;
    actorSkeletons: Map<number, Cal3DBone[]>;
    actorAnimations: Map<number, Cal3DAnimation[]>;
  };

  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly controls: OrbitControls;
  private readonly animationMixer: THREE.AnimationMixer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.domElement.className = 'scene';
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.y = 3;
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
      (def) => def.name === 'fox'
    )!;
    const actorSkin = SceneManager.assets.actorSkins.get(actorDef.type)!;
    const actorMesh = SceneManager.assets.actorMeshes.get(actorDef.type)![0]; // Assume only one submesh...
    const actorSkeleton = SceneManager.assets.actorSkeletons.get(
      actorDef.type
    )!;
    const actorAnimations = SceneManager.assets.actorAnimations.get(
      actorDef.type
    )!;

    const mesh = new THREE.SkinnedMesh();
    mesh.material = new THREE.MeshBasicMaterial({ map: actorSkin });
    mesh.geometry = new THREE.BufferGeometry();
    mesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(actorMesh.vertices, 3)
    );
    mesh.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(actorMesh.normals, 3)
    );
    mesh.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(actorMesh.uvs, 2)
    );
    mesh.geometry.setIndex(new THREE.BufferAttribute(actorMesh.indices, 1));
    mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(actorMesh.skinIndices, 4)
    );
    mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(actorMesh.skinWeights, 4)
    );
    const bones = composeSkeleton(actorSkeleton);
    mesh.add(bones[actorSkeleton.findIndex(({ parentId }) => parentId === -1)]); // Assume only one root bone...
    mesh.bind(new THREE.Skeleton(bones));
    mesh.rotateX(THREE.MathUtils.degToRad(-90));
    fixMesh(mesh.geometry, actorSkin);
    this.scene.add(mesh);

    const skeletonHelper = new THREE.SkeletonHelper(mesh);
    skeletonHelper.visible = false;
    this.scene.add(skeletonHelper);

    this.animationMixer = new THREE.AnimationMixer(mesh);

    const animationIndex = actorDef.animationFrames.findIndex(
      (frame) => frame.type === 'CAL_die1'
    );
    const animationFrame = actorDef.animationFrames[animationIndex];
    const animation = actorAnimations[animationIndex];
    const tracks = animation.tracks
      .map((track) => {
        const times: number[] = track.keyframes.map(
          (keyframe) => keyframe.time
        );
        const positions = track.keyframes
          .map((keyframe) => [
            keyframe.translation.x,
            keyframe.translation.y,
            keyframe.translation.z,
          ])
          .flat();
        const rotations = track.keyframes
          .map((keyframe) => [
            keyframe.rotation.x,
            keyframe.rotation.y,
            keyframe.rotation.z,
            -keyframe.rotation.w, // Cal3D stores it negated for some reason...
          ])
          .flat();
        const positionTrack = new THREE.VectorKeyframeTrack(
          `.bones[${track.boneId}].position`,
          times,
          positions,
          THREE.InterpolateSmooth
        );
        const rotationTrack = new THREE.QuaternionKeyframeTrack(
          `.bones[${track.boneId}].quaternion`,
          times,
          rotations
        );
        return [positionTrack, rotationTrack];
      })
      .flat();

    const clip = new THREE.AnimationClip('', -1, tracks);
    const action = this.animationMixer.clipAction(clip);
    action.timeScale =
      // If a custom animation duration was defined, override the natural duration.
      animationFrame.duration > 0
        ? clip.duration / (animationFrame.duration / 1000)
        : 1;
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
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
    this.animationMixer.update(delta);

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
    const actorAnimations = new Map<number, Cal3DAnimation[]>();

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
      const animations: Cal3DAnimation[] = [];

      for (const animationFrame of actorDef.animationFrames) {
        const animationData = (await bufferLoader.loadAsync(
          `data/${animationFrame.path}`
        )) as ArrayBuffer;
        const animation = readCal3DAnimation(Buffer.from(animationData));
        animations.push(animation);
      }

      actorSkins.set(actorDef.type, skin);
      actorMeshes.set(actorDef.type, subMeshes);
      actorSkeletons.set(actorDef.type, skeleton);
      actorAnimations.set(actorDef.type, animations);
    }

    this.assets = {
      actorDefs,
      actorSkins,
      actorMeshes,
      actorSkeletons,
      actorAnimations,
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

function composeSkeleton(skeleton: Cal3DBone[]): THREE.Bone[] {
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

  return bones;
}
