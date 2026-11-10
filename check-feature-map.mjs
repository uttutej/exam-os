import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const ids = [...source.matchAll(/\{ id: (\d+), title:/g)].map((m) => Number(m[1]));
const expected = Array.from({ length: 55 }, (_, i) => i + 1);
const unique = [...new Set(ids)].sort((a, b) => a - b);
const moduleFeatureLists = [...source.matchAll(/features: \[([^\]]+)\]/g)];
const moduleIds = moduleFeatureLists.flatMap((m) => [...m[1].matchAll(/\d+/g)].map((n) => Number(n[0])));
const moduleUnique = [...new Set(moduleIds)].sort((a, b) => a - b);
const missing = expected.filter((id) => !unique.includes(id));
const duplicate = ids.filter((id, i) => ids.indexOf(id) !== i);
const notMapped = expected.filter((id) => !moduleUnique.includes(id));
const mappedTwice = moduleIds.filter((id, i) => moduleIds.indexOf(id) !== i);
if (missing.length || duplicate.length || unique.length !== 55 || notMapped.length || mappedTwice.length || moduleFeatureLists.length !== 13) {
  console.error({ catalogueCount: unique.length, missing, duplicate, moduleCount: moduleFeatureLists.length, notMapped, mappedTwice });
  process.exit(1);
}
console.log(`Feature map passed: ${unique.length}/55 unique IDs mapped once across ${moduleFeatureLists.length}/13 modules.`);
