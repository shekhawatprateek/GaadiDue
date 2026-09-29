import type { Asset } from './model';

export function removeLegacyDemoDates(assets: Asset[]): { assets: Asset[]; changed: boolean } {
  let changed = false;
  const updated = assets.map((asset) => {
    if (asset.source !== 'demo' || asset.identifier.startsWith('DEMO')) return asset;
    changed = true;
    return { ...asset, source: 'pending' as const, records: [], checkedAt: '' };
  });
  return { assets: updated, changed };
}
