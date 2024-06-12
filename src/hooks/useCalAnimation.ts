import { useMemo } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { CalAnimation } from '../io/cal3d-animations';

/**
 * Hook that binds Cal3D animations to a Three.js skinned mesh and returns an
 * object that can be used to control animation playback.
 */
export function useCalAnimation(
  meshRef: React.MutableRefObject<THREE.SkinnedMesh>,
  calAnimations: CalAnimationWithConfig[]
): CalAnimationController {
  const clips = useMemo(
    () => getAnimationClips(calAnimations),
    [calAnimations]
  );
  const { mixer, actions } = useAnimations(clips, meshRef);
  const animationController = useMemo(() => {
    return new CalAnimationController(mixer, actions, calAnimations);
  }, [mixer, actions, calAnimations]);
  return animationController;
}

/**
 * Controller for Three.js playback of Cal3D animations.
 */
export class CalAnimationController {
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions: Record<string, THREE.AnimationAction | null>;
  private readonly calAnimations: CalAnimationWithConfig[];

  constructor(
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction | null>,
    calAnimations: CalAnimationWithConfig[]
  ) {
    this.mixer = mixer;
    this.actions = actions;
    this.calAnimations = calAnimations;
  }

  /**
   * Play the specified animation.
   */
  play(name: string | null, loop?: boolean, speed?: number): void {
    const action = name && this.actions[name];
    if (!action) {
      this.mixer.stopAllAction(); // Stop all animation and revert back to default pose.
      return;
    }

    action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
    action.clampWhenFinished = true;
    this.mixer.timeScale = speed ?? 1;

    const calAnimation = this.calAnimations.find(
      (calAnimation) => calAnimation.name === name
    )!;
    if (calAnimation.durationOverride > 0) {
      action.setDuration(calAnimation.durationOverride);
    }

    // Play the animation (if not already playing).
    if (!action.isRunning()) {
      this.mixer.stopAllAction(); // Ensure only one animation is played at a time.
      action.play();
    }
  }

  /**
   * Get the elapsed time of the specified animation (as a percentage between 0
   * and 1).
   */
  getElapsedTime(name: string | null): number {
    const action = name && this.actions[name];
    return action ? action.time / action.getClip().duration : 0;
  }

  /**
   * Check if the specified animation is currently playing.
   */
  isPlaying(name: string | null): boolean {
    const action = name && this.actions[name];
    return action ? action.isRunning() : false;
  }
}

/**
 * Convert Cal3D animations to Three.js animation clips that can be played.
 */
function getAnimationClips(
  calAnimations: CalAnimationWithConfig[]
): THREE.AnimationClip[] {
  return calAnimations.map((calAnimation) => {
    return new THREE.AnimationClip(
      calAnimation.name,
      calAnimation.duration,
      getAnimationKeyframeTracks(calAnimation)
    );
  });
}

/**
 * Convert a Cal3D animation to Three.js keyframe tracks.
 *
 * @see https://threejs.org/docs/manual/en/introduction/Animation-system.html
 */
function getAnimationKeyframeTracks(
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
        trackTranslations[i]
      ),
      new THREE.QuaternionKeyframeTrack(
        `.bones[${track.boneId}].quaternion`,
        trackTimes[i],
        trackRotations[i]
      ),
    ])
    .flat();
}

export type CalAnimationWithConfig = CalAnimation & {
  name: string;
  durationOverride: number;
};
