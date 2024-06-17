import React from 'react';
import { assetCache } from '../../lib/asset-cache';
import { Page } from '../../components/Page';
import { MapsSidebar } from './Sidebar';
import { MapsScene } from './Scene';

export function MapsPage(): React.JSX.Element {
  return (
    <Page
      className="MapsPage"
      sidebar={<MapsSidebar />}
      loader={() => assetCache.loadMaps()}
    >
      <MapsScene />
    </Page>
  );
}
