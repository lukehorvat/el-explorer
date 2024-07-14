import { atom } from 'jotai';
import { Object3dSkinType } from '../../components/Object3d';

const mapDefPath = atom<string>('maps/testermap.elm.gz');
const object3dDefPath = atom<string>('3dobjects/house1.e3d');
const skinType = atom<Object3dSkinType>(Object3dSkinType.TEXTURE);
const showEnvironment = atom<boolean>(false);
const showStats = atom<boolean>(false);
const autoRotate = atom<boolean>(process.env.NODE_ENV === 'production');

export const Object3dsPageState = {
  mapDefPath,
  object3dDefPath,
  skinType,
  showEnvironment,
  showStats,
  autoRotate,
};
