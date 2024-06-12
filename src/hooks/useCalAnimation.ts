import { useEffect, useMemo } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { CalAnimation } from '../io/cal3d-animations';

/**
 * Hook that binds Cal3D animations to a Three.js skinned mesh.
 *
 * Optionally plays a specified animation via the `animationName` parameter.
 */
export function useCalAnimation(
  meshRef: React.MutableRefObject<THREE.SkinnedMesh>,
  calAnimations: CalAnimationWithConfig[],
  animationName?: string | null,
  animationLoop?: boolean,
  animationSpeed?: number
): void {
  const clips = useMemo(
    () => getAnimationClips(calAnimations),
    [calAnimations]
  );
  const { mixer, actions } = useAnimations(clips, meshRef);

  useEffect(() => {
    const calAnimation = calAnimations.find(
      (calAnimation) => calAnimation.name === animationName
    );

    if (!calAnimation) {
      mixer.stopAllAction();
      return;
    }

    const action = actions[calAnimation.name]!;
    action.loop = animationLoop ? THREE.LoopRepeat : THREE.LoopOnce;
    action.clampWhenFinished = true;
    if (calAnimation.durationOverride > 0) {
      action.setDuration(calAnimation.durationOverride);
    }
    mixer.timeScale = animationSpeed ?? 1;

    // Play the animation (if not already playing).
    if (!action.isRunning()) {
      mixer.stopAllAction(); // Ensure only one animation is played at a time.
      action.play();
    }
  }, [
    mixer,
    actions,
    calAnimations,
    animationName,
    animationLoop,
    animationSpeed,
  ]);
}

/**
 * Convert Cal3D animations to Three.js animation clips that can be played on demand.
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
