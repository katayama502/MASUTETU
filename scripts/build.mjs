import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import './validate-data.mjs';

await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/src/data', import.meta.url), { recursive: true });
await cp(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url));
await cp(new URL('../src/main.js', import.meta.url), new URL('../dist/src/main.js', import.meta.url));
await cp(new URL('../src/styles.css', import.meta.url), new URL('../dist/src/styles.css', import.meta.url));
await cp(new URL('../src/data/spots.json', import.meta.url), new URL('../dist/src/data/spots.json', import.meta.url));
await writeFile(new URL('../dist/_redirects', import.meta.url), '/* /index.html 200\n');
await writeFile(new URL('../dist/_headers', import.meta.url), `/src/data/spots.json
  Cache-Control: public, max-age=60, stale-while-revalidate=300
  Content-Type: application/json; charset=utf-8

/src/*
  Cache-Control: public, max-age=31536000, immutable

/
  Cache-Control: public, max-age=0, must-revalidate
`);
console.log('Static build generated in dist/. Netlify publish directory is ready.');
