import { atom, createStore } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.
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
  actorType,
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
