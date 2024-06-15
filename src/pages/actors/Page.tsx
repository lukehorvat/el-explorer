import React from 'react';
import { useAtom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { Loading } from '../../components/Loading';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';
import { ActorsPageState } from './page-state';

export function ActorsPage(): React.JSX.Element {
  const [isLoaded, setIsLoaded] = useAtom(ActorsPageState.isLoaded);

  if (!isLoaded) {
    return (
      <Loading
        load={() => assetCache.loadAssets()}
        onLoaded={() => setIsLoaded(true)}
      />
    );
  }

  return (
    <Page sidebar={<ActorsSidebar />}>
      <ActorsScene />
    </Page>
  );
}
