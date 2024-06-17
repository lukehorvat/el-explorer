import { atom } from 'jotai';
import { HomePage } from './pages/home/Page';
import { ActorsPage } from './pages/actors/Page';
import { MapsPage } from './pages/maps/Page';
import { Object3dsPage } from './pages/object3ds/Page';
import { Object2dsPage } from './pages/object2ds/Page';

export const pages = {
  home: {
    name: 'Home',
    enabled: true,
    Component: HomePage,
  },
  actors: {
    name: 'Actors',
    enabled: true,
    Component: ActorsPage,
  },
  maps: {
    name: 'Maps',
    enabled: process.env.NODE_ENV !== 'production',
    Component: MapsPage,
  },
  object3ds: {
    name: '3D Objects',
    enabled: true,
    Component: Object3dsPage,
  },
  object2ds: {
    name: '2D Objects',
    enabled: true,
    Component: Object2dsPage,
  },
};

const page = atom<keyof typeof pages>(
  process.env.NODE_ENV === 'production' ? 'home' : 'object3ds'
);

export const AppState = {
  page,
};
