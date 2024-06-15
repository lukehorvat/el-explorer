import { atom } from 'jotai';

const object2dType = atom<number>(1); // Initially default to XXXXXXXXX.
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');

export const Object2dsPageState = {
  object2dType,
  showStats,
  autoRotate,
};
