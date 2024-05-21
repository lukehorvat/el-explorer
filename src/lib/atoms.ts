import { atom } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.
const actorAnimation = atom<string | null>(null); // TODO: Reset animation when actorType changes?

export const atoms = {
  isLoaded,
  actorType,
  actorAnimation,
};
