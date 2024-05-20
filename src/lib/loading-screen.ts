import { AssetCache } from './asset-cache';
import './loading-screen.css';

export async function render(containerEl: Element): Promise<AssetCache> {
  const assetCache = new AssetCache();

  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  containerEl.appendChild(loadingEl);

  const titleEl = document.createElement('h1');
  titleEl.className = 'title';
  titleEl.textContent = 'Creatures of EL';
  loadingEl.appendChild(titleEl);

  const descriptionEl = document.createElement('p');
  descriptionEl.className = 'description';
  descriptionEl.textContent =
    'An online showcase of the creatures in the 3D fantasy MMORPG, Eternal Lands.';
  loadingEl.appendChild(descriptionEl);

  const statusEl = document.createElement('div');
  statusEl.className = 'status';
  statusEl.textContent = 'Loading...';
  loadingEl.appendChild(statusEl);

  await assetCache.loadAssets();
  loadingEl.remove();

  return assetCache;
}
