import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { spawn } from 'node:child_process';

const version = '4.13.1';
const jarName = `antlr-${version}-complete.jar`;
const jarDir = path.resolve('tools');
const jarPath = path.join(jarDir, jarName);
const jarUrl = `https://www.antlr.org/download/${jarName}`;

function downloadJar() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(jarDir, { recursive: true });
    const file = fs.createWriteStream(jarPath);
    https
      .get(jarUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed (${response.statusCode})`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (error) => {
        fs.unlink(jarPath, () => reject(error));
      });
  });
}

async function ensureJar() {
  if (fs.existsSync(jarPath)) {
    return;
  }
  await downloadJar();
}

async function run() {
  await ensureJar();
  const args = ['-jar', jarPath, ...process.argv.slice(2)];
  const child = spawn('java', args, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 1));
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
