import React from 'react';
import { useAtomValue } from 'jotai';
import { atoms } from '../lib/atoms';
import { Loading } from './Loading';
import { Scene } from './Scene';
import './App.css';

export function App(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);

  return (
    <div className="App">
      <div className="TopBar">Creatures of EL</div>
      {isLoaded ? <Scene /> : <Loading />}
      <div className="BottomBar">TODO</div>
    </div>
  );
}
