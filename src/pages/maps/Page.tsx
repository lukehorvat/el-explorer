import React from 'react';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { MapsSidebar } from './Sidebar';
import { MapsScene } from './Scene';

export function MapsPage(): React.JSX.Element {
  return (
    <Page className="MapsPage" sidebar={<MapsSidebar />} loader={loader}>
      <MapsScene />
    </Page>
  );
}

const loader = (): Promise<void> =>
  AssetCache.runCacheTask(AssetCache.tasks.cacheAllMapDefs());
