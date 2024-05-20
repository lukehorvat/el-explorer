import React, { useState } from 'react';
import { Loading } from './Loading';
import { Scene } from './Scene';
import './App.css';

export function App(): React.JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="App">
      <div className="TopBar">Creatures of EL</div>
      {isLoaded ? (
        <Scene />
      ) : (
        <Loading
          onLoaded={() => {
            setIsLoaded(true);
          }}
        />
      )}
      <div className="BottomBar">TODO</div>
    </div>
  );
}
