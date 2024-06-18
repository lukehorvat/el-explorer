import React from 'react';
import { assetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { Object3dsSidebar } from './Sidebar';
import { Object3dsScene } from './Scene';

export function Object3dsPage(): React.JSX.Element {
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

const loader = (): Promise<void> =>
  assetCache.runCacheTask(assetCache.tasks.cacheAllObject3dDefs());
