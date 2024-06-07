import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as StateProvider } from 'jotai';
import { store } from './lib/state';
import { App } from './components/App';
import './index.css';

void registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StateProvider store={store}>
    <App />
  </StateProvider>
);

async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('service-worker.js');
    } catch (error) {
      console.error('Failed to register service worker.', error);
    }
  }
}
