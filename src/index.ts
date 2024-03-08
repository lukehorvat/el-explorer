import * as THREE from 'three';
import { XmlEntitiesExpander } from './io/xml-entities';
import { readActorDefs } from './io/actor-defs';
import './index.css';

void registerServiceWorker();
void main();

async function main(): Promise<void> {
  const appEl = document.querySelector('.app')!;
  const fileLoader = new THREE.FileLoader();
  const xml = (await fileLoader.loadAsync(
    'data/actor_defs/actor_defs.xml'
  )) as string;
  const xmlExpander = new XmlEntitiesExpander(xml);
  const entityXmls = (await Promise.all(
    xmlExpander.entityUris.map((entityUri) =>
      fileLoader.loadAsync(`data/actor_defs/${entityUri}`)
    )
  )) as string[];
  const expandedXml = xmlExpander.expand(entityXmls);
  const actorDefs = readActorDefs(expandedXml);

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(actorDefs, null, 2);
  appEl.appendChild(pre);
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
