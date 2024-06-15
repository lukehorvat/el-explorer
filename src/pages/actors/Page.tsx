import React from 'react';
import { Stack } from 'react-bootstrap';
import { Provider as StateProvider, useAtom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { ActorsPageState } from './page-state';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';
import { Loading } from '../../components/Loading';
import './Page.css';

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
    <StateProvider>
      <Stack
        className="ActorsPage flex-grow-1 align-items-stretch"
        direction="horizontal"
      >
        <ActorsSidebar />
        <ActorsScene />
      </Stack>
    </StateProvider>
  );
}
