import { atom, createStore } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.
const skinType = atom<
  'texture' | 'wireframe' | 'vectors' | 'metal' | 'silhouette' | null
>('texture');
const showSkeleton = atom<boolean>(false);
const showGround = atom<boolean>(true);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(true);
const animationType = atom<string | null>(null); // TODO: Reset when actorType changes?
const loopAnimation = atom<boolean>(true);

export const atoms = {
  isLoaded,
  actorType,
  skinType,
  showSkeleton,
  showGround,
  showStats,
  autoRotate,
  animationType,
  loopAnimation,
};

export const store = createStore();
