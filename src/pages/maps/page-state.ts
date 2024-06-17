import { atom } from 'jotai';

const mapDefPath = atom<string>('maps/startmap.elm.gz');
const showObject3ds = atom<boolean>(true);
const showObject2ds = atom<boolean>(true);
const showTiles = atom<boolean>(true);
const showTileExtensions = atom<boolean>(true);
const showSkybox = atom<boolean>(true);
const showStats = atom<boolean>(false);

export const MapsPageState = {
  mapDefPath,
  showObject3ds,
  showObject2ds,
  showTiles,
  showTileExtensions,
  showSkybox,
  showStats,
};
