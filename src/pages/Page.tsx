import React from 'react';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { appState } from '../components/app-state';
import { Loading } from '../components/home/Loading';
import { Home } from '../components/home/Home';
import { Actors } from '../components/actors/Actors';
import './Page.css';

export function Page(): React.JSX.Element {
  const page = useAtomValue(appState.page);

  return (
    <Stack className="Page" direction="vertical">
      {(() => {
        switch (page) {
          case 'loading':
            return <Loading />;
          case 'home':
            return <Home />;
          case 'actors':
            return <Actors />;
        }
      })()}
    </Stack>
  );
}
