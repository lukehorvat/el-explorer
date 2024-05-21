import React from 'react';
import { useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';
import { Loading } from './Loading';
import { Scene } from './Scene';
import './App.css';

export function App(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);

  return (
    <div className="App">
      <TopBar />
      {isLoaded ? <Scene /> : <Loading />}
      <BottomBar />
    </div>
  );
}
