import { atom } from 'jotai';

const object2dDefPath = atom<string>('2dobjects/ground/b_skulls.2d0');
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');

export const Object2dsPageState = {
  object2dDefPath,
  showStats,
  autoRotate,
};
