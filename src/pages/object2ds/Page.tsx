import React, { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { Object2dsPageState } from './page-state';
import { Object2dsSidebar } from './Sidebar';
import { Object2dsScene } from './Scene';

export function Object2dsPage(): React.JSX.Element {
  const mapDefPath = useAtomValue(Object2dsPageState.mapDefPath);
  const loader = useCallback(async () => {
    await AssetCache.runCacheTask(AssetCache.tasks.cacheAllObject2dDefs());
    await AssetCache.runCacheTask(AssetCache.tasks.cacheMapDef(mapDefPath));
  }, [mapDefPath]);

  return (
    <Page
      className="Object2dsPage"
      sidebar={<Object2dsSidebar />}
      loader={loader}
    >
      <Object2dsScene />
    </Page>
  );
}
