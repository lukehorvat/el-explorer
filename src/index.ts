import * as loadingScreen from './lib/loading-screen';
import './index.css';

void registerServiceWorker();
void main();

async function main(): Promise<void> {
  const appEl = document.querySelector('.app')!;
  const actorDefs = await loadingScreen.render(appEl);
  const actorDef = actorDefs.find((def) => def.name === 'yeti');

  console.log(actorDef);
}

async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.error('Failed to register service worker.', error);
    }
  }
}
