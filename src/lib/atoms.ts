import { atom } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.
const animationType = atom<string | null>(null); // TODO: Reset when actorType changes?
const loopAnimation = atom<boolean>(true);
const showMesh = atom<boolean>(true);
const showSkeleton = atom<boolean>(false);
const showWireframe = atom<boolean>(false);
const showGround = atom<boolean>(true);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(true);

export const atoms = {
  isLoaded,
  actorType,
  animationType,
  loopAnimation,
  showMesh,
  showSkeleton,
  showWireframe,
  showGround,
  showStats,
  autoRotate,
};
