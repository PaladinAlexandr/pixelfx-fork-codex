#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, realpathSync, readFileSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../assets/pixelfx'));
const arg = process.argv.slice(2);
if (arg.length !== 1 || arg[0].startsWith('--')) {
  console.error('Usage: node workspace.mjs <empty-workspace-directory>');
  process.exit(1);
}
// Resolve existing ancestors so a junction cannot place a workspace inside the skill.
const destination = resolve(arg[0]);
let ancestor = destination;
while (!existsSync(ancestor)) ancestor = dirname(ancestor);
const physical = resolve(realpathSync(ancestor), relative(ancestor, destination));
const skillRoot = realpathSync(resolve(source, '../..'));
const under = relative(skillRoot, physical);
if (under === '' || (under !== '..' && !under.startsWith(`..${sep}`) && !isAbsolute(under))) {
  console.error('Choose a workspace outside the installed skill.');
  process.exit(1);
}
if (existsSync(destination) && readdirSync(destination).length) {
  console.error(`Workspace is not empty; reuse it or choose a new directory: ${destination}`);
  process.exit(1);
}
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true, force: false, errorOnExist: true });
const manifest = JSON.parse(readFileSync(resolve(destination, 'package.json'), 'utf8'));
console.log(`PixelFX ${manifest.version} workspace: ${destination}`);
console.log('Next: node tools/list.mjs lightning');
console.log('Then: node tools/render.mjs fire/torch --sheet --html');
