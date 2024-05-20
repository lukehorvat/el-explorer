import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './index.css';

void registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);

async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.error('Failed to register service worker.', error);
    }
  }
}
