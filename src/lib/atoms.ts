import { atom } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number>(77); // Initially default to Feros.

export const atoms = {
  isLoaded,
  actorType,
};
