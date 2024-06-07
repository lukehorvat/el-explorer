import React from 'react';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';
import { Loading } from './Loading';
import { Actors } from './Actors';
import './App.css';

export function App(): React.JSX.Element {
  const page = useAtomValue(stateAtoms.page);

  return (
    <Stack className="App" direction="vertical">
      <TopBar />
      <Stack className="Middle" direction="vertical">
        {(() => {
          switch (page) {
            case 'loading':
              return <Loading />;
            case 'actors':
              return <Actors />;
          }
        })()}
      </Stack>
      <BottomBar />
    </Stack>
  );
}
