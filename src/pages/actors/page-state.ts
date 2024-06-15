import { atom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { ActorSkinType } from '../../components/Actor';
import { CalAnimationController } from '../../hooks/useCalAnimation';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.
const actorTypeWithEffects = atom(
  (get) => get(actorType),
  (get, set, newActorType: number) => {
    set(actorType, newActorType);

    // Clear the animation if the new actor doesn't have the current one.
    const actorDef = assetCache.actorDefs.get(newActorType)!;
    const hasAnimation = actorDef.animations.find(
      (animation) => animation.name === get(animationName)
    );
    if (!hasAnimation) {
      set(animationName, null);
    }
  }
);
const skinType = atom<ActorSkinType>(ActorSkinType.TEXTURE);
const showSkeleton = atom<boolean>(false);
const showEnvironment = atom<boolean>(false);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');
const animationName = atom<string | null>(null);
const animationLoop = atom<boolean>(true);
const animationSpeed = atom<number>(1);
const animationController = atom<CalAnimationController | null>(null);

export const ActorsPageState = {
  isLoaded,
  actorType: actorTypeWithEffects,
  skinType,
  showSkeleton,
  showEnvironment,
  showStats,
  autoRotate,
  animationName,
  animationLoop,
  animationSpeed,
  animationController,
};
