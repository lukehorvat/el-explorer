import { atom, createStore } from 'jotai';
import { assetCache } from './asset-cache';

const isLoaded = atom<boolean>(false);
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
const skinType = atom<
  | 'texture'
  | 'wireframe'
  | 'vectors'
  | 'metal'
  | 'crystal'
  | 'silhouette'
  | null
>('texture');
const showSkeleton = atom<boolean>(false);
const showGround = atom<boolean>(true);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(true);
const animationType = atom<string | null>(null);
const animationLoop = atom<boolean>(true);
const animationSpeed = atom<number>(1);
const animationHandlers = atom<{
  playAnimation: () => void;
  getAnimationTime: () => number;
  isAnimationPlaying: () => boolean;
} | null>(null);

export const stateAtoms = {
  isLoaded,
  actorType: actorTypeWithEffects,
  skinType,
  showSkeleton,
  showGround,
  showStats,
  autoRotate,
  animationType,
  animationLoop,
  animationSpeed,
  animationHandlers,
};

export const store = createStore();
