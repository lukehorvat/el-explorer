import { Atom, ExtractAtomValue, atom, createStore } from 'jotai';

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
const animationType = atom<string | null>(null); // TODO: Reset when actorType changes?
const loopAnimation = atom<boolean>(true);
const isAnimationPlaying = atom<boolean>(false);

export const stateAtoms = {
  isLoaded,
  actorType,
  skinType,
  showSkeleton,
  showGround,
  showStats,
  autoRotate,
  animationType,
  loopAnimation,
  isAnimationPlaying,
};

type StateAtomValues = {
  [K in keyof typeof stateAtoms]: ExtractAtomValue<(typeof stateAtoms)[K]>;
};

export const store = createStore();

/**
 * Subscribe to state changes.
 */
export function onStateChange(
  subscriber: () => void,
  flush?: boolean // If true, immediately call the subscriber once.
): () => void {
  if (flush) subscriber();

  const unsubscribers: (() => void)[] = [];
  for (const atom of Object.values(stateAtoms)) {
    unsubscribers.push(store.sub(atom, subscriber));
  }

  return () => {
    for (const unsubscriber of unsubscribers) unsubscriber();
  };
}

/**
 * Get the current state.
 */
export function getState(): {
  state: typeof state;
  previousState: typeof previousState;
} {
  return { state, previousState };
}

let state: StateAtomValues;
let previousState: StateAtomValues | undefined;

onStateChange(() => {
  previousState = state;
  state = Object.entries(stateAtoms).reduce((map, [key, atom]) => {
    return { ...map, [key]: store.get(atom as Atom<any>) };
  }, {}) as StateAtomValues;
}, true);
