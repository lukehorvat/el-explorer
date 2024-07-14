import React, { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { AssetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { ActorsPageState } from './page-state';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';

export function ActorsPage(): React.JSX.Element {
  const mapDefPath = useAtomValue(ActorsPageState.mapDefPath);
  const loader = useCallback(async () => {
    await AssetCache.runCacheTask(AssetCache.tasks.cacheAllActorDefs());
    await AssetCache.runCacheTask(AssetCache.tasks.cacheMapDef(mapDefPath));
  }, [mapDefPath]);

  return (
    <Page className="ActorsPage" sidebar={<ActorsSidebar />} loader={loader}>
      <ActorsScene />
    </Page>
  );
}
