import { readFile } from 'node:fs/promises';

const requiredFields = ['id', 'name', 'kind', 'district', 'summary', 'hours', 'url', 'artist', 'effect'];
const spots = JSON.parse(await readFile(new URL('../src/data/spots.json', import.meta.url), 'utf8'));

if (!Array.isArray(spots) || spots.length < 6) {
  throw new Error('spots.json must contain at least 6 board spaces.');
}

const ids = new Set();
for (const [index, spot] of spots.entries()) {
  for (const field of requiredFields) {
    if (!spot[field]) throw new Error(`spot[${index}] is missing ${field}.`);
  }
  if (ids.has(spot.id)) throw new Error(`Duplicate spot id: ${spot.id}`);
  ids.add(spot.id);
  if (!['fund', 'score', 'item', 'move'].includes(spot.effect.type)) {
    throw new Error(`Unsupported effect type for ${spot.id}.`);
  }
  if (!spot.effect.label) throw new Error(`Missing effect label for ${spot.id}.`);
}

console.log(`Validated ${spots.length} spots.`);
