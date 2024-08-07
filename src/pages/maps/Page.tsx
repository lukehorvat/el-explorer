import React, { useCallback } from 'react';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { MapsSidebar } from './Sidebar';
import { MapsScene } from './Scene';

export function MapsPage(): React.JSX.Element {
  const loader = useCallback(async () => {
    await AssetCache.runCacheTask(AssetCache.tasks.cacheAllMapDefs());
  }, []);

  return (
    <Page className="MapsPage" sidebar={<MapsSidebar />} loader={loader}>
      <MapsScene />
    </Page>
  );
}
