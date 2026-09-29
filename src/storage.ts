import type { Asset } from './model';
import { removeLegacyDemoDates } from './savedAssets';

const ASSETS_KEY = 'parivahan.assets.v1';

export async function loadAssets(): Promise<Asset[]> {
  const saved = localStorage.getItem(ASSETS_KEY);
  if (!saved) return [];
  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed)) throw new Error('Saved data is invalid');
  const migrated = removeLegacyDemoDates(parsed as Asset[]);
  if (migrated.changed) await saveAssets(migrated.assets);
  return migrated.assets;
}

export async function saveAssets(assets: Asset[]): Promise<void> {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
}

export async function upsertAsset(asset: Asset): Promise<Asset[]> {
  const assets = await loadAssets();
  const index = assets.findIndex((item) => item.id === asset.id);
  if (index >= 0) assets[index] = asset;
  else assets.push(asset);
  await saveAssets(assets);
  return assets;
}

export async function removeAsset(id: string): Promise<Asset[]> {
  const assets = (await loadAssets()).filter((item) => item.id !== id);
  await saveAssets(assets);
  return assets;
}
