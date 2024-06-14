import React from 'react';
import { createRoot } from 'react-dom/client';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { appState } from './components/app-state';
import { Navbar } from './components/shell/Navbar';
import { Footer } from './components/shell/Footer';
import { Loading } from './components/home/Loading';
import { Home } from './components/home/Home';
import { Actors } from './components/actors/Actors';
import './App.css';

function App(): React.JSX.Element {
  const page = useAtomValue(appState.page);

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

async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('service-worker.js');
    } catch (error) {
      console.error('Failed to register service worker.', error);
    }
  }
}

void registerServiceWorker();
createRoot(document.getElementById('root')!).render(<App />);
