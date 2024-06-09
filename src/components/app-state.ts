import { atom } from 'jotai';

const page = atom<
  'loading' | 'home' | 'actors' | 'maps' | 'object3ds' | 'object2ds'
>('loading');

export const appState = {
  page,
};
