import { SceneManager } from './scene-manager';

export async function render(containerEl: Element): Promise<void> {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.textContent = 'Loading...';
  containerEl.appendChild(loadingEl);

  await SceneManager.loadAssets();
  loadingEl.remove();
}
