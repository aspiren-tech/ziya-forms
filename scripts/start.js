const dotenv = require('dotenv');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Load .env.prod 
const envPath = path.join(__dirname, '../.env.prod');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading ${envPath}:`, result.error);
  process.exit(1);
}

console.log(`✅ Loaded environment from .env.prod`);
const port = process.env.PORT || 3000;

// Start Next.js server using npm exec (works cross-platform with spaces in paths)
const server = spawn('npm', ['exec', 'next', '--', 'start', '-p', port.toString()], {
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
