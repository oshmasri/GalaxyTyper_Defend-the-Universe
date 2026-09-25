import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌌 Starting Galaxy Typer MERN Environment...');

// Start Express Server
const serverProc = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Start Vite Client
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const clientProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Shutting down Galaxy Typer servers...');
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
