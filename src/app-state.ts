import { atom } from 'jotai';

export const pages = {
  home: {
    name: 'Home',
    enabled: true,
  },
  actors: {
    name: 'Actors',
    enabled: true,
  },
  maps: {
    name: 'Maps',
    enabled: false,
  },
  object3ds: {
    name: '3D Objects',
    enabled: false,
  },
  object2ds: {
    name: '2D Objects',
    enabled: false,
  },
};

const page = atom<keyof typeof pages>(
  process.env.NODE_ENV === 'production' ? 'home' : 'actors'
);

export const AppState = {
  page,
};
