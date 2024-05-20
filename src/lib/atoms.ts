import { atom } from 'jotai';

const isLoaded = atom<boolean>(false);
const actorType = atom<number | null>(null);

export const atoms = {
  isLoaded,
  actorType,
};
