/** Canonical integrity hash matching backend `computeClinicalIntegrityHash`. */
export function canonicalResourceCounts(
  resourceCounts: Record<string, number> | null | undefined,
): string {
  const counts = resourceCounts || {};
  const keys = Object.keys(counts).sort();
  return keys.map((k) => `${k}:${Number(counts[k]) || 0}`).join('|') || 'empty';
}

export async function computeClinicalIntegrityHash(
  resourceCounts: Record<string, number> | null | undefined,
): Promise<string> {
  const canonical = canonicalResourceCounts(resourceCounts);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(canonical);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Non-browser fallback (tests / SSR without subtle): FNV-1a 32-bit hex (not used for gate equality).
  let hash = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv_${(hash >>> 0).toString(16)}`;
}

export async function verifyClinicalIntegrityHash(
  resourceCounts: Record<string, number> | null | undefined,
  expectedHash: string | null | undefined,
): Promise<boolean> {
  if (!expectedHash) return false;
  if (expectedHash.startsWith('fnv_')) return false;
  const actual = await computeClinicalIntegrityHash(resourceCounts);
  return actual === expectedHash;
}
