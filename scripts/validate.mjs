#!/usr/bin/env node
// Validates this workspace template before it is published to the Camillia
// Community Hub, including the anti-collision placement contract: hub.json
// declares the extension id, and every payload file stays under workspace/
// with no reserved cam-ext- segments.
// Zero dependencies; run with Node 22 or later:
//   node scripts/validate.mjs

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceDir = join(repoRoot, 'workspace');
const MIN_WORKSPACE_FILES = 10;
const KEBAB_ID = /^[a-z0-9](-?[a-z0-9]){2,39}$/;

const failures = [];

async function listFilesRecursive(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toPosix(path) {
  return path.split(sep).join('/');
}

// 0. hub.json declares the extension id and the workspace contentDir.
let hub;
try {
  hub = JSON.parse(await readFile(join(repoRoot, 'hub.json'), 'utf8'));
} catch {
  failures.push('hub.json is missing or not valid JSON.');
}
if (hub) {
  if (typeof hub.id !== 'string' || !KEBAB_ID.test(hub.id)) {
    failures.push("hub.json must declare a unique kebab-case extension 'id'.");
  }
  if (hub.kind !== 'workspace-template') {
    failures.push(`hub.json kind must be 'workspace-template' (found '${hub.kind}').`);
  }
  if (hub.contentDir !== 'workspace') {
    failures.push(`hub.json contentDir must be 'workspace' (found '${hub.contentDir}').`);
  }
}

// 1. workspace/ must exist and contain at least MIN_WORKSPACE_FILES files.
let workspaceFiles = [];
try {
  const info = await stat(workspaceDir);
  if (!info.isDirectory()) {
    failures.push('workspace/ exists but is not a directory.');
  } else {
    workspaceFiles = await listFilesRecursive(workspaceDir);
  }
} catch {
  failures.push('workspace/ directory is missing.');
}

if (workspaceFiles.length > 0 && workspaceFiles.length < MIN_WORKSPACE_FILES) {
  failures.push(
    `workspace/ must contain at least ${MIN_WORKSPACE_FILES} files; found ${workspaceFiles.length}.`,
  );
}

// 2. workspace/README.md must exist.
const hasWorkspaceReadme = workspaceFiles.some(
  (file) => toPosix(relative(workspaceDir, file)) === 'README.md',
);
if (workspaceFiles.length > 0 && !hasWorkspaceReadme) {
  failures.push('workspace/README.md is missing.');
}

// 3. Every *.camflow.yaml under workspace/ must be non-empty, tab-free and
//    declare "type:" and "nodes:" (trigger binding files declare "bindings:"
//    instead of "nodes:").
const camflowFiles = workspaceFiles.filter((file) => file.endsWith('.camflow.yaml'));
for (const file of camflowFiles) {
  const label = toPosix(relative(repoRoot, file));
  const text = await readFile(file, 'utf8');
  if (text.trim().length === 0) {
    failures.push(`${label} is empty.`);
    continue;
  }
  if (text.includes('\t')) {
    failures.push(`${label} contains tab characters; YAML must be indented with spaces.`);
  }
  if (!text.includes('type:')) {
    failures.push(`${label} does not declare a "type:".`);
  }
  const isTriggersFile = /^\s*type:\s*triggers\s*$/m.test(text);
  const requiredKey = isTriggersFile ? 'bindings:' : 'nodes:';
  if (!text.includes(requiredKey)) {
    failures.push(`${label} does not contain "${requiredKey}".`);
  }
}

// 4. Placement: every payload file stays under workspace/ (the template is
//    the workspace's own future content) and no path segment uses the
//    reserved cam-ext- prefix — templates never use Rules 1-2.
for (const file of workspaceFiles) {
  const label = toPosix(relative(repoRoot, file));
  if (!label.startsWith('workspace/')) {
    failures.push(`${label} is outside the template's workspace/ content area.`);
    continue;
  }
  for (const segment of label.split('/')) {
    if (segment.startsWith('cam-ext-')) {
      failures.push(`${label} misuses the reserved cam-ext- prefix (templates never carry it).`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error('Workspace template validation failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `OK: workspace/ has ${workspaceFiles.length} files; ${camflowFiles.length} camflow file(s) checked.`,
);
