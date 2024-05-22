import * as THREE from 'three';
import { assetCache } from './asset-cache';

export class Actor extends THREE.Group {
  readonly actorType: number;
  readonly mesh: THREE.SkinnedMesh;
  readonly skeletonHelper: THREE.SkeletonHelper;
  readonly animationMixer: THREE.AnimationMixer;

  constructor(actorType: number) {
    super();

    this.actorType = actorType;
    const actorSkin = assetCache.actorSkins.get(actorType)!;
    const actorMesh = assetCache.actorMeshes.get(actorType)![0]; // Assume only one submesh...

    this.mesh = new THREE.SkinnedMesh();
    this.mesh.material = new THREE.MeshBasicMaterial({ map: actorSkin });
    this.mesh.geometry = new THREE.BufferGeometry();
    this.mesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(actorMesh.vertices, 3)
    );
    this.mesh.geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(actorMesh.normals, 3)
    );
    this.mesh.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(actorMesh.uvs, 2)
    );
    this.mesh.geometry.setIndex(
      new THREE.BufferAttribute(actorMesh.indices, 1)
    );
    this.mesh.geometry.setAttribute(
      'skinIndex',
      new THREE.BufferAttribute(actorMesh.skinIndices, 4)
    );
    this.mesh.geometry.setAttribute(
      'skinWeight',
      new THREE.BufferAttribute(actorMesh.skinWeights, 4)
    );
    this.fixMeshTexture();
    this.composeSkeleton();
    this.mesh.rotation.x = THREE.MathUtils.degToRad(-90);
    this.mesh.castShadow = true;
    this.add(this.mesh);

    this.skeletonHelper = new THREE.SkeletonHelper(this.mesh);
    this.add(this.skeletonHelper);

    this.animationMixer = new THREE.AnimationMixer(this.mesh);
    this.prepareAnimationClips();
  }

  /**
   * Play the specified animation type.
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
    const actorAnimations = assetCache.actorAnimations.get(this.actorType)!;
    const clips = actorDef.animationFrames.map((animationFrame) => {
      const animation = actorAnimations.get(animationFrame.type)!;
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

      const clip = new THREE.AnimationClip(animationFrame.type, -1, tracks);
      const action = this.animationMixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.timeScale =
        // If a custom duration is defined, override the natural duration.
        animationFrame.duration > 0
          ? clip.duration / (animationFrame.duration / 1000)
          : 1;

      return clip;
    });

    this.mesh.animations = clips;
  }

  /**
   * Construct the bone hierarchy that represents the actor's skeleton and bind
   * it to the mesh.
   */
  private composeSkeleton(): void {
    const actorSkeleton = assetCache.actorSkeletons.get(this.actorType)!;
    const boneMatrices = [...actorSkeleton.values()].map((bone) => {
      const translationMatrix = new THREE.Matrix4().makeTranslation(
        bone.translation.x,
        bone.translation.y,
        bone.translation.z
      );
      const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
        new THREE.Quaternion(
          bone.rotation.x,
          bone.rotation.y,
          bone.rotation.z,
          -bone.rotation.w // Cal3D stores it negated for some reason...
        )
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
      const parentBone = bones[actorSkeleton.get(boneId)!.parentId];
      if (parentBone) {
        parentBone.add(bone);
      }
    });

    this.mesh.add(bones.find((bone) => !bone.parent)!); // Assume only one root bone...
    this.mesh.bind(new THREE.Skeleton(bones));
  }

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
  private fixMeshTexture(): void {
    // Swap every U and V pair.
    const uvs = this.mesh.geometry.getAttribute('uv').clone();
    for (let i = 0; i < uvs.count; i++) {
      uvs.setXY(i, uvs.getY(i), uvs.getX(i));
    }
    this.mesh.geometry.setAttribute('uv', uvs);

    // Rotate the texture itself.
    const actorSkin = assetCache.actorSkins.get(this.actorType)!;
    actorSkin.center.set(0.5, 0.5);
    actorSkin.rotation = THREE.MathUtils.degToRad(90);
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
