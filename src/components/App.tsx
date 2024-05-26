import React from 'react';
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
    <div className="App">
      <TopBar />
      <div className={`Middle ${isLoaded ? 'Loaded' : ''}`}>
        {isLoaded && <LeftBar />}
        {isLoaded ? <Scene /> : <Loading />}
      </div>
      <BottomBar />
    </div>
  );
}
