import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const serverDir = path.join(distDir, 'server');
const clientDir = path.join(distDir, 'client');
const outputDir = path.join(root, 'vercel-static');

for (const requiredDir of [serverDir, clientDir]) {
  if (!existsSync(requiredDir)) {
    throw new Error(`Missing Expo web export directory: ${path.relative(root, requiredDir)}`);
  }
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await cp(clientDir, outputDir, { recursive: true });
await cp(serverDir, outputDir, { recursive: true });

console.log(`Prepared Vercel static output at ${path.relative(root, outputDir)}`);
