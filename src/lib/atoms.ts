import { atom } from 'jotai';

const isLoaded = atom<boolean>(false);

export const atoms = {
  isLoaded,
};
