import { atom } from 'jotai';

const mapDefPath = atom<string>('maps/testermap.elm.gz');
const object2dDefPath = atom<string>('2dobjects/ground/b_skeleton1.2d0');
const showEnvironment = atom<boolean>(false);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');

export const Object2dsPageState = {
  mapDefPath,
  object2dDefPath,
  showEnvironment,
  showStats,
  autoRotate,
};
