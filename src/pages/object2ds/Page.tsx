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
      loader={() => assetCache.loadAssets()}
    >
      <Object2dsScene />
    </Page>
  );
}
