import React from 'react';
import { assetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';

export function ActorsPage(): React.JSX.Element {
  return (
    <Page sidebar={<ActorsSidebar />} loader={() => assetCache.loadAssets()}>
      <ActorsScene />
    </Page>
  );
}
