import * as THREE from 'three';
import { XmlEntitiesExpander } from './io/xml-entities';
import './index.css';

void main();

async function main(): Promise<void> {
  const appEl = document.querySelector('.app')!;
  const fileLoader = new THREE.FileLoader();
  const xml = (await fileLoader.loadAsync(
    'data/actor_defs/actor_defs.xml'
  )) as string;
  const xmlExpander = new XmlEntitiesExpander(xml);
  const entityXmls: string[] = [];
  for (const entityUri of xmlExpander.entityUris) {
    const entityXml = (await fileLoader.loadAsync(
      `data/actor_defs/${entityUri}`
    )) as string;
    entityXmls.push(entityXml);
  }
  const expandedXml = xmlExpander.expand(entityXmls);
  appEl.textContent = expandedXml;
}
