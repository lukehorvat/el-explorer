import React from 'react';
import { createRoot } from 'react-dom/client';
import { Stack } from 'react-bootstrap';
import { useAtomValue } from 'jotai';
import { AppState } from './app-state';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/home/Page';
import { ActorsPage } from './pages/actors/Page';
import './App.css';

function App(): React.JSX.Element {
  const page = useAtomValue(AppState.page);

  return (
    <Stack className="App" direction="vertical">
      <Navbar />
      {(() => {
        switch (page) {
          case 'home':
            return <HomePage />;
          case 'actors':
            return <ActorsPage />;
        }
      })()}
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
