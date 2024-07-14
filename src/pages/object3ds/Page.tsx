import React from 'react';
import { AssetCache } from '../../lib/asset-cache';
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

const loader = async (): Promise<void> => {
  await AssetCache.runCacheTask(AssetCache.tasks.cacheAllObject3dDefs());
  await AssetCache.runCacheTask(
    AssetCache.tasks.cacheMapDef('maps/testermap.elm.gz')
  );
};
