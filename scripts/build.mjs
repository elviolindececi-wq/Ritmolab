import { spawn } from 'node:child_process';

const bin = process.platform === 'win32' ? 'next.cmd' : 'next';
const child = spawn(bin, ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NEXT_PRIVATE_BUILD_WORKER: '0' }
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
