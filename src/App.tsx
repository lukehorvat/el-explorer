import React from 'react';
import { createRoot } from 'react-dom/client';
import { Stack } from 'react-bootstrap';
import { Navbar } from './components/shell/Navbar';
import { Page } from './pages/Page';
import { Footer } from './components/shell/Footer';
import './App.css';

function App(): React.JSX.Element {
  return (
    <Stack className="App" direction="vertical">
      <Navbar />
      <Page />
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
