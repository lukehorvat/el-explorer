import * as THREE from 'three';
import { assetCache } from './asset-cache';
import { CalAnimation } from '../io/cal3d-animations';

export class Actor extends THREE.Group {
  readonly actorType: number;
  readonly mesh: THREE.SkinnedMesh;
  readonly material: THREE.MeshBasicMaterial; // Allows original material to be restored if changed.
  readonly skeletonHelper: THREE.SkeletonHelper;
  readonly animationMixer: THREE.AnimationMixer;

  constructor(actorType: number) {
    super();

    this.actorType = actorType;
    const actorDef = assetCache.actorDefs.get(this.actorType)!;
    const skin = assetCache.ddsTextures.get(actorDef.skinPath)!;
    const calMesh = assetCache.calMeshes.get(actorDef.meshPath)!;

    this.mesh = new THREE.SkinnedMesh();
    this.material = this.mesh.material = new THREE.MeshBasicMaterial({
      map: skin,
    });
    this.mesh.geometry = new THREE.BufferGeometry();
    this.mesh.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        calMesh.positions.map((p) => [p.x, p.y, p.z]).flat(),
        3
      )
    );
    this.mesh.geometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(
        calMesh.normals.map((n) => [n.x, n.y, n.z]).flat(),
        3
      )
    );
    this.mesh.geometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute(
        calMesh.uvs.map((uv) => [uv.x, uv.y]).flat(),
        2
      )
    );
    this.mesh.geometry.setIndex(calMesh.indices);
    this.mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.Uint16BufferAttribute(calMesh.skinIndices, 4)
    );
    this.mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.Float32BufferAttribute(calMesh.skinWeights, 4)
    );
    this.mesh.castShadow = true;
    this.composeSkeleton();
    this.add(this.mesh);

    this.skeletonHelper = new THREE.SkeletonHelper(this.mesh);
    this.skeletonHelper.material = new THREE.LineBasicMaterial({
      color: '#ffaa7f',
      depthTest: false,
    });
    this.add(this.skeletonHelper);

    this.animationMixer = new THREE.AnimationMixer(this.mesh);
    this.prepareAnimationClips();
  }

  /**
   * Play the specified animation.
   */
  playAnimation(
    animationType: string | null,
    loop: boolean,
    speed: number
  ): void {
    // Revert back to default pose if no animation type specified.
    if (!animationType) {
      this.animationMixer.stopAllAction();
      this.mesh.pose();
      return;
    }

    const action = this.getAnimationAction(animationType);
    action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
    this.animationMixer.timeScale = speed;

    // Play the animation (if not already playing).
    if (!action.isRunning()) {
      this.animationMixer.stopAllAction();
      action.play();
    }
  }

  /**
   * Get the elapsed time of the specified animation (as a percentage between 0
   * and 1).
   */
  getAnimationTime(animationType: string): number {
    const action = this.getAnimationAction(animationType);
    return action.time / action.getClip().duration;
  }

  /**
   * Check if the specified animation is currently playing.
   */
  isAnimationPlaying(animationType: string): boolean {
    const action = this.getAnimationAction(animationType);
    return action.isRunning();
  }

  /**
   * Get the action associated with the specified animation.
   */
  private getAnimationAction(animationType: string): THREE.AnimationAction {
    const clip = THREE.AnimationClip.findByName(
      this.mesh.animations,
      animationType
    );
    return this.animationMixer.existingAction(clip)!;
  }

  /**
   * Prepare cached animation "clips" and "actions" that can be played on demand.
   */
  private prepareAnimationClips(): void {
    const actorDef = assetCache.actorDefs.get(this.actorType)!;
    const clips = actorDef.animations.map((animation) => {
      const calAnimation = assetCache.calAnimations.get(animation.path)!;
      const tracks = this.createAnimationKeyframeTracks(calAnimation);
      const clip = new THREE.AnimationClip(animation.type, -1, tracks);
      const action = this.animationMixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.timeScale =
        // Override the natural duration when a custom duration is defined.
        animation.duration > 0
          ? clip.duration / (animation.duration / 1000)
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
    calAnimation: CalAnimation
  ): THREE.KeyframeTrack[] {
    const trackTimes = calAnimation.tracks.map((track) => {
      return track.keyframes.map((keyframe) => keyframe.time);
    });
    const trackTranslations = calAnimation.tracks.map((track) => {
      return track.keyframes
        .map((keyframe) => keyframe.translation)
        .map((t) => [t.x, t.y, t.z])
        .flat();
    });
    const trackRotations = calAnimation.tracks.map((track) => {
      return track.keyframes
        .map((keyframe) => keyframe.rotation)
        .map((r) => [r.x, r.y, r.z, r.w])
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
    const actorDef = assetCache.actorDefs.get(this.actorType)!;
    const calSkeleton = assetCache.calSkeletons.get(actorDef.skeletonPath)!;
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
