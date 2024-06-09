import React from 'react';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { Navbar } from './shell/Navbar';
import { Footer } from './shell/Footer';
import { Loading } from './home/Loading';
import { Home } from './home/Home';
import { Actors } from './actors/Actors';
import './App.css';

export function App(): React.JSX.Element {
  const page = useAtomValue(stateAtoms.page);

  return (
    <Stack className="App" direction="vertical">
      <Navbar />
      <Stack className="Middle" direction="vertical">
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
      <Footer />
    </Stack>
  );
}
