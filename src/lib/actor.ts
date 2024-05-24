import * as THREE from 'three';
import { assetCache } from './asset-cache';
import { Cal3DAnimation } from '../io/cal3d-animations';

export class Actor extends THREE.Group {
  readonly actorType: number;
  readonly mesh: THREE.SkinnedMesh;
  readonly material: THREE.MeshBasicMaterial; // Allows original material to be restored if changed.
  readonly skeletonHelper: THREE.SkeletonHelper;
  readonly animationMixer: THREE.AnimationMixer;

  constructor(actorType: number) {
    super();

    this.actorType = actorType;
    const skin = assetCache.actorSkins.get(actorType)!;
    const calMesh = assetCache.actorMeshes.get(actorType)!;

    this.mesh = new THREE.SkinnedMesh();
    this.material = this.mesh.material = new THREE.MeshBasicMaterial({
      map: skin,
    });
    this.mesh.geometry = new THREE.BufferGeometry();
    this.mesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(calMesh.vertices, 3)
    );
    this.mesh.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(calMesh.normals, 3)
    );
    this.mesh.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(calMesh.uvs, 2)
    );
    this.mesh.geometry.setIndex(new THREE.BufferAttribute(calMesh.indices, 1));
    this.mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(calMesh.skinIndices, 4)
    );
    this.mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(calMesh.skinWeights, 4)
    );
    this.mesh.castShadow = true;
    this.composeSkeleton();
    this.add(this.mesh);

    this.skeletonHelper = new THREE.SkeletonHelper(this.mesh);
    this.add(this.skeletonHelper);

    this.animationMixer = new THREE.AnimationMixer(this.mesh);
    this.prepareAnimationClips();
  }

  /**
   * Play the specified animation.
   */
  playAnimation(animationType: string | null, looped?: boolean): void {
    // Revert back to default pose if no animation type specified.
    if (!animationType) {
      this.animationMixer.stopAllAction();
      this.mesh.pose();
      return;
    }

    const clip = THREE.AnimationClip.findByName(
      this.mesh.animations,
      animationType
    );
    const action = this.animationMixer.existingAction(clip)!;
    action.loop = looped ? THREE.LoopRepeat : THREE.LoopOnce;

    // Play the animation (if not already playing).
    if (!action.isRunning()) {
      this.animationMixer.stopAllAction();
      action.play();
    }
  }

  /**
   * Prepare cached animation "clips" and "actions" that can be played on demand.
   */
  private prepareAnimationClips(): void {
    const actorDef = assetCache.actorDefs.get(this.actorType)!;
    const calAnimations = assetCache.actorAnimations.get(this.actorType)!;
    const clips = actorDef.animationFrames.map((animationFrame) => {
      const calAnimation = calAnimations.get(animationFrame.type)!;
      const tracks = this.createAnimationKeyframeTracks(calAnimation);
      const clip = new THREE.AnimationClip(animationFrame.type, -1, tracks);
      const action = this.animationMixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.timeScale =
        // Override the natural duration when a custom duration is defined.
        animationFrame.duration > 0
          ? clip.duration / (animationFrame.duration / 1000)
          : 1;
      return clip;
    });

    this.mesh.animations = clips;
  }

  /**
   * Transform a Cal3D animation into Three.js-compatible keyframe tracks.
   *
   * See: https://threejs.org/docs/manual/en/introduction/Animation-system.html
   */
  private createAnimationKeyframeTracks(
    calAnimation: Cal3DAnimation
  ): THREE.KeyframeTrack[] {
    const trackTimes = calAnimation.tracks.map((track) => {
      return track.keyframes.map((keyframe) => keyframe.time);
    });
    const trackTranslations = calAnimation.tracks.map((track) => {
      return track.keyframes
        .map((keyframe) => keyframe.translation)
        .map(({ x, y, z }) => [x, y, z])
        .flat();
    });
    const trackRotations = calAnimation.tracks.map((track) => {
      return track.keyframes
        .map((keyframe) => keyframe.rotation)
        .map(({ x, y, z, w }) => [x, y, z, w])
        .flat();
    });
    return calAnimation.tracks
      .map((track, i) => [
        new THREE.VectorKeyframeTrack(
          `.bones[${track.boneId}].position`,
          trackTimes[i],
          trackTranslations[i],
          THREE.InterpolateSmooth
        ),
        new THREE.QuaternionKeyframeTrack(
          `.bones[${track.boneId}].quaternion`,
          trackTimes[i],
          trackRotations[i]
        ),
      ])
      .flat();
  }

  /**
   * Construct the bone hierarchy that represents the actor's skeleton and bind
   * it to the mesh.
   */
  private composeSkeleton(): void {
    const calSkeleton = assetCache.actorSkeletons.get(this.actorType)!;
    const boneMatrices = [...calSkeleton.values()].map((calBone) => {
      const translationMatrix = new THREE.Matrix4().makeTranslation(
        new THREE.Vector3().copy(calBone.translation)
      );
      const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion().copy(calBone.rotation)
      );
      return new THREE.Matrix4().multiplyMatrices(
        translationMatrix,
        rotationMatrix
      );
    });
    const bones = boneMatrices.map((transformMatrix) => {
      const bone = new THREE.Bone();
      bone.applyMatrix4(transformMatrix);
      return bone;
    });

    bones.forEach((bone, boneId) => {
      const parentBone = bones[calSkeleton.get(boneId)!.parentId];
      if (parentBone) {
        parentBone.add(bone);
      }
    });

    this.mesh.add(bones.find((bone) => !bone.parent)!); // Assume only one root bone...
    this.mesh.bind(new THREE.Skeleton(bones));
  }

  dispose(): void {
    this.remove(this.mesh);
    this.remove(this.skeletonHelper);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    this.skeletonHelper.dispose();
    this.animationMixer.stopAllAction();
    this.animationMixer.uncacheRoot(this.mesh);
  }
}
