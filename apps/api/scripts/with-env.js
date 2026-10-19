const fs = require('fs');
const { spawn } = require('child_process');

const file = process.argv[2];
const command = process.argv[3];
const text = fs.readFileSync(file, 'utf8');

for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (!match) continue;
  process.env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const child = spawn('npx', ['strapi', command], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 1));
