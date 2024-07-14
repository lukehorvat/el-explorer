import React from 'react';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';

export function ActorsPage(): React.JSX.Element {
  return (
    <Page className="ActorsPage" sidebar={<ActorsSidebar />} loader={loader}>
      <ActorsScene />
    </Page>
  );
}

const loader = async (): Promise<void> => {
  await AssetCache.runCacheTask(AssetCache.tasks.cacheAllActorDefs());
  await AssetCache.runCacheTask(
    AssetCache.tasks.cacheMapDef('maps/testermap.elm.gz')
  );
};
