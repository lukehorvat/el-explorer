import React from 'react';
import { assetCache } from '../../lib/asset-cache';
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

const loader = (): Promise<void> =>
  assetCache.runCacheTask(assetCache.tasks.cacheAllActorDefs());
