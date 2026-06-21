import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const port = process.env.PORT || '8081';
const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.MUSA_PUBLIC_DOMAIN || '';

process.env.EXPO_NO_DOTENV = process.env.EXPO_NO_DOTENV || '1';

if (publicDomain) {
  const publicBaseUrl = publicDomain.startsWith('http') ? publicDomain : `https://${publicDomain}`;
  process.env.EXPO_PACKAGER_PROXY_URL = process.env.EXPO_PACKAGER_PROXY_URL || publicBaseUrl;
  process.env.EXPO_PUBLIC_API_BASE = process.env.EXPO_PUBLIC_API_BASE || publicBaseUrl;
}

const localExpoBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'expo.cmd' : 'expo',
);
const command = existsSync(localExpoBin) ? localExpoBin : 'npx';
const args = command === 'npx'
  ? ['expo', 'start', '--go', '--lan', '--port', port, '--no-dev', '--minify']
  : ['start', '--go', '--lan', '--port', port, '--no-dev', '--minify'];

console.log('Starting MUSA Expo Go server', {
  port,
  proxyUrl: process.env.EXPO_PACKAGER_PROXY_URL || null,
  apiBase: process.env.EXPO_PUBLIC_API_BASE || null,
});

const child = spawn(command, args, { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' });

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Expo server stopped by ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
