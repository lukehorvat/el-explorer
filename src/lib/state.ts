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

export type StateAtomValues = {
  [K in keyof typeof stateAtoms]: ExtractAtomValue<(typeof stateAtoms)[K]>;
};

export const store = createStore();

/**
 * Subscribe to state changes.
 *
 * The subscriber callback will be passed the current state and previous state
 * when state changes. But keep in mind that the previous state will only start
 * being recorded from the time that the subscriber is initially registered.
 */
export function onStateChange(
  subscriber: (state: StateAtomValues, previousState?: StateAtomValues) => void,
  flush?: boolean
): () => void {
  let state: StateAtomValues;
  let previousState: StateAtomValues | undefined;

  const handleStateChange = (): void => {
    state = Object.entries(stateAtoms).reduce((map, [key, atom]) => {
      return { ...map, [key]: store.get(atom as Atom<any>) };
    }, {}) as StateAtomValues;
    subscriber(state, previousState);
    previousState = state;
  };

  if (flush) {
    // Immediately call the subscriber now with the current state.
    handleStateChange();
  }

  // Call the subscriber whenever state changes.
  const unsubscribers: (() => void)[] = [];
  for (const atom of Object.values(stateAtoms)) {
    unsubscribers.push(store.sub(atom, handleStateChange));
  }

  return () => {
    for (const unsubscriber of unsubscribers) unsubscriber();
  };
}
