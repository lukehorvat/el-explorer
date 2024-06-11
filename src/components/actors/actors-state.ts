import { atom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { ActorSkinType } from './Actor';

const actorType = atom<number>(77); // Initially default to Feros.
const actorTypeWithEffects = atom(
  (get) => get(actorType),
  (get, set, newActorType: number) => {
    set(actorType, newActorType);

    // Reset the animation type if the new actor doesn't have the current one.
    const actorDef = assetCache.actorDefs.get(newActorType)!;
    const hasAnimation = actorDef.animations.find(
      (animation) => animation.type === get(animationType)
    );
    if (!hasAnimation) {
      set(animationType, null);
    }
  }
);
const skinType = atom<ActorSkinType>(ActorSkinType.TEXTURE);
const showSkeleton = atom<boolean>(false);
const showEnvironment = atom<boolean>(false);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');
const animationType = atom<string | null>(null);
const animationLoop = atom<boolean>(true);
const animationSpeed = atom<number>(1);
const animationHandlers = atom<{
  playAnimation: () => void;
  getAnimationTime: () => number;
  isAnimationPlaying: () => boolean;
} | null>(null);

export const actorsState = {
  actorType: actorTypeWithEffects,
  skinType,
  showSkeleton,
  showEnvironment,
  showStats,
  autoRotate,
  animationType,
  animationLoop,
  animationSpeed,
  animationHandlers,
};
