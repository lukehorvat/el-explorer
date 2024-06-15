import React from 'react';
import { assetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';

export function ActorsPage(): React.JSX.Element {
  return (
    <Page
      className="ActorsPage"
      sidebar={<ActorsSidebar />}
      loader={() => assetCache.loadActors()}
    >
      <ActorsScene />
    </Page>
  );
}
