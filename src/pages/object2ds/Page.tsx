import React from 'react';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { Object2dsSidebar } from './Sidebar';
import { Object2dsScene } from './Scene';

export function Object2dsPage(): React.JSX.Element {
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

const loader = (): Promise<void> =>
  AssetCache.runCacheTask(AssetCache.tasks.cacheAllObject2dDefs());
