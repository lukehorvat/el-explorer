import * as THREE from 'three';
import { XmlEntitiesExpander } from '../io/xml-entities';
import { ActorDef, readActorDefs } from '../io/actor-defs';

export async function render(containerEl: Element): Promise<ActorDef[]> {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.textContent = 'Loading...';
  containerEl.appendChild(loadingEl);

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

  loadingEl.remove();
  return actorDefs;
}
