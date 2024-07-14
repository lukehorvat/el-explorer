import React, { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { Object3dsPageState } from './page-state';
import { Object3dsSidebar } from './Sidebar';
import { Object3dsScene } from './Scene';

export function Object3dsPage(): React.JSX.Element {
  const mapDefPath = useAtomValue(Object3dsPageState.mapDefPath);
  const loader = useCallback(async () => {
    await AssetCache.runCacheTask(AssetCache.tasks.cacheAllObject3dDefs());
    await AssetCache.runCacheTask(AssetCache.tasks.cacheMapDef(mapDefPath));
  }, [mapDefPath]);

  return (
    <Page
      className="Object3dsPage"
      sidebar={<Object3dsSidebar />}
      loader={loader}
    >
      <Object3dsScene />
    </Page>
  );
}
