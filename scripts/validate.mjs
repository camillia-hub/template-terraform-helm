#!/usr/bin/env node
// Validates this workspace template before it is published to the Camillia
// Community Hub (template v2 contract — see extension-guidelines,
// docs/manifest-and-publishing.md "Workspace template contract"):
//  - extension.json declares the extension id and the workspace contentDir;
//  - every workspace payload file stays under workspace/ with no reserved
//    cam-ext- segments (templates are placement-exempt by design);
//  - template.json declares the expected repositories: kebab-case unique keys,
//    boolean required/overrideContent, and a seed under repos/<key>/ per repo
//    (an absent seed is documented as a warning: the repo is created empty);
//  - replacement tokens in payload files are limited to the three known ones
//    ({{ orgName }}, {{ projectName }}, {{ projectId }}); unknown tokens warn.
// Zero dependencies; run with Node 22 or later:
//   node scripts/validate.mjs

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceDir = join(repoRoot, 'workspace');
const reposDir = join(repoRoot, 'repos');
const MIN_WORKSPACE_FILES = 10;
const KEBAB_ID = /^[a-z0-9](-?[a-z0-9]){2,39}$/;
const REPO_KEY = /^[a-z0-9](-?[a-z0-9]){0,39}$/;
const KNOWN_TOKENS = new Set(['orgName', 'projectName', 'projectId']);
// Double-brace tokens, tolerant of inner whitespace: {{ projectName }},
// {{projectName}} or {{  projectName  }} are the same token.
const TOKEN_RE = /\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g;

const failures = [];
const warnings = [];

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

async function listFilesIfExists(dir) {
  try {
    const info = await stat(dir);
    return info.isDirectory() ? await listFilesRecursive(dir) : null;
  } catch {
    return null;
  }
}

function toPosix(path) {
  return path.split(sep).join('/');
}

function checkNoReservedPrefix(label) {
  for (const segment of label.split('/')) {
    if (segment.startsWith('cam-ext-')) {
      failures.push(`${label} misuses the reserved cam-ext- prefix (templates never carry it).`);
      return;
    }
  }
}

// 0. extension.json declares the extension id and the workspace contentDir.
let hub;
try {
  hub = JSON.parse(await readFile(join(repoRoot, 'extension.json'), 'utf8'));
} catch {
  failures.push('extension.json is missing or not valid JSON.');
}
if (hub) {
  if (typeof hub.id !== 'string' || !KEBAB_ID.test(hub.id)) {
    failures.push("extension.json must declare a unique kebab-case extension 'id'.");
  }
  if (hub.kind !== 'workspace-template') {
    failures.push(`extension.json kind must be 'workspace-template' (found '${hub.kind}').`);
  }
  if (hub.contentDir !== 'workspace') {
    failures.push(`extension.json contentDir must be 'workspace' (found '${hub.contentDir}').`);
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

// 4. Placement: templates are exempt from Rules 1-2, so workspace files stay
//    under workspace/, repo seeds stay under repos/, and no path segment uses
//    the reserved cam-ext- prefix anywhere.
for (const file of workspaceFiles) {
  const label = toPosix(relative(repoRoot, file));
  if (!label.startsWith('workspace/')) {
    failures.push(`${label} is outside the template's workspace/ content area.`);
    continue;
  }
  checkNoReservedPrefix(label);
}

// 5. template.json declares the expected repositories and each declared repo
//    ships its seed under repos/<key>/.
let template;
let declaredKeys = [];
try {
  template = JSON.parse(await readFile(join(repoRoot, 'template.json'), 'utf8'));
} catch {
  failures.push('template.json is missing or not valid JSON.');
}
if (template) {
  const repositories = template.repositories;
  if (!Array.isArray(repositories)) {
    failures.push('template.json must declare a "repositories" array.');
  } else {
    if (repositories.length === 0) {
      warnings.push('template.json declares an empty repositories array.');
    }
    const seen = new Set();
    for (const [index, repo] of repositories.entries()) {
      const where = `template.json repositories[${index}]`;
      if (typeof repo !== 'object' || repo === null || Array.isArray(repo)) {
        failures.push(`${where} must be an object.`);
        continue;
      }
      if (typeof repo.key !== 'string' || !REPO_KEY.test(repo.key)) {
        failures.push(`${where}.key must be kebab-case (found '${repo.key}').`);
        continue;
      }
      if (seen.has(repo.key)) {
        failures.push(`${where}.key '${repo.key}' is duplicated.`);
        continue;
      }
      seen.add(repo.key);
      declaredKeys.push(repo.key);
      if (repo.label !== undefined && typeof repo.label !== 'string') {
        failures.push(`${where}.label must be a string when present.`);
      }
      if (repo.description !== undefined && typeof repo.description !== 'string') {
        failures.push(`${where}.description must be a string when present.`);
      }
      if (typeof repo.required !== 'boolean') {
        failures.push(`${where}.required must be a boolean.`);
      }
      if (typeof repo.overrideContent !== 'boolean') {
        failures.push(`${where}.overrideContent must be a boolean.`);
      }
      const seedFiles = await listFilesIfExists(join(reposDir, repo.key));
      if (seedFiles === null || seedFiles.length === 0) {
        // The contract allows an absent seed (the repo is then created empty);
        // document it here so the choice is visible in CI output.
        warnings.push(
          `repos/${repo.key}/ has no seed files; the wizard will create '${repo.key}' as an empty repository.`,
        );
      }
    }
  }
}

// 5b. Every directory under repos/ must be the seed of a declared repository —
//     a stray directory usually means a key typo in template.json.
let seedDirs = [];
try {
  const entries = await readdir(reposDir, { withFileTypes: true });
  seedDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch {
  if (declaredKeys.length > 0) {
    failures.push('repos/ directory is missing although template.json declares repositories.');
  }
}
for (const dir of seedDirs) {
  const label = `repos/${dir}/`;
  checkNoReservedPrefix(label);
  if (!declaredKeys.includes(dir)) {
    failures.push(`${label} has no matching repositories[].key in template.json.`);
  }
}

// 6. Replacement tokens: payload files may only use the three known tokens
//    ({{ orgName }}, {{ projectName }}, {{ projectId }}). Unknown tokens are
//    left as-is at apply time, so they warn here instead of failing.
const seedFilesAll = (await listFilesIfExists(reposDir)) ?? [];
const tokenScanFiles = [...workspaceFiles, ...seedFilesAll];
const unknownTokens = new Map();
for (const file of tokenScanFiles) {
  const label = toPosix(relative(repoRoot, file));
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(TOKEN_RE)) {
    if (!KNOWN_TOKENS.has(match[1])) {
      unknownTokens.set(match[1], [...(unknownTokens.get(match[1]) ?? []), label]);
    }
  }
}
for (const [token, labels] of unknownTokens) {
  warnings.push(
    `unknown replacement token {{ ${token} }} in ${labels.join(', ')} (known tokens: orgName, projectName, projectId); it will be left as-is at apply time.`,
  );
}
// template.json itself is never substituted — flag tokens there so they are
// not mistaken for working placeholders.
if (template) {
  const raw = await readFile(join(repoRoot, 'template.json'), 'utf8');
  if (TOKEN_RE.test(raw)) {
    warnings.push('template.json contains {{ }} tokens; template.json is never substituted.');
  }
}

if (warnings.length > 0) {
  console.warn('Template validation warnings:');
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
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
  `OK: workspace/ has ${workspaceFiles.length} files; ${camflowFiles.length} camflow file(s) checked; template.json declares ${declaredKeys.length} repositories (${declaredKeys.join(', ')}).`,
);
