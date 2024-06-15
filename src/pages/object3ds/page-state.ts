import { atom } from 'jotai';

const object3dDefPath = atom<string>('3dobjects/house1.e3d');
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');

export const Object3dsPageState = {
  object3dDefPath,
  showStats,
  autoRotate,
};
