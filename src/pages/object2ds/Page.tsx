import React from 'react';
import { assetCache } from '../../lib/asset-cache';
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
  assetCache.runCacheTask(assetCache.tasks.cacheAllObject2dDefs());
