import React from 'react';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';
import { LeftBar } from './LeftBar';
import { Loading } from './Loading';
import { Scene } from './Scene';
import './App.css';

export function App(): React.JSX.Element {
  const isLoaded = useAtomValue(stateAtoms.isLoaded);

  return (
    <Stack className="App" direction="vertical">
      <TopBar />
      <Stack
        className={`Middle flex-grow-1 align-items-stretch ${
          isLoaded ? 'Loaded' : ''
        }`}
        direction="horizontal"
      >
        {isLoaded && <LeftBar />}
        {isLoaded ? <Scene /> : <Loading />}
      </Stack>
      <BottomBar />
    </Stack>
  );
}
