import { cp, mkdir, rm } from 'node:fs/promises';
import './validate-data.mjs';

await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/src/data', import.meta.url), { recursive: true });
await cp(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url));
await cp(new URL('../src/main.js', import.meta.url), new URL('../dist/src/main.js', import.meta.url));
await cp(new URL('../src/styles.css', import.meta.url), new URL('../dist/src/styles.css', import.meta.url));
await cp(new URL('../src/data/spots.json', import.meta.url), new URL('../dist/src/data/spots.json', import.meta.url));
console.log('Static build generated in dist/.');
