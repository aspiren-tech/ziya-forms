const dotenv = require('dotenv');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading ${envPath}:`, result.error);
  process.exit(1);
}

console.log(`✅ Loaded environment from .env.local`);
const port = process.env.PORT || 3000;

// Start Next.js dev server using npm exec (works cross-platform with spaces in paths)
const server = spawn('npm', ['exec', 'next', '--', 'dev', '--turbopack', '-p', port.toString(), '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: process.env,
  shell: os.platform() === 'win32' // Use shell on Windows only
});

// Handle termination signals
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
