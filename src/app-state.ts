import { atom } from 'jotai';

const page = atom<'home' | 'actors' | 'maps' | 'object3ds' | 'object2ds'>(
  process.env.NODE_ENV === 'production' ? 'home' : 'actors'
);

export const AppState = {
  page,
};
