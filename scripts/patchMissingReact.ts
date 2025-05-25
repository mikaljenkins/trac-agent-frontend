const fs = require('fs');
const path = require('path');

const ROOT_DIR = './frontend';
const EXT = '.tsx';
const IMPORT_LINE = `import React from 'react';`;

function walk(dir: string, allFiles: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, allFiles);
    } else if (fullPath.endsWith(EXT)) {
      allFiles.push(fullPath);
    }
  }
  return allFiles;
}

function isLikelyJSX(code: string): boolean {
  const jsxPatterns = [
    /<\w+/,
    /\/>/,
    /<\w+.*?>.*?<\/\w+>/,
    /return\s*\(/
  ];
  return jsxPatterns.some((regex) => regex.test(code));
}

function hasReactImport(code: string): boolean {
  return /import\s+React(\s+from)?\s+['"]react['"]/.test(code);
}

const tsxFiles = walk(ROOT_DIR);
let patched = 0;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');

  if (isLikelyJSX(content) && !hasReactImport(content)) {
    const updated = `${IMPORT_LINE}\n\n${content}`;
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Patched: ${file}`);
    patched++;
  }
}

if (patched === 0) {
  console.log('🎉 All JSX files already have React imported.');
} else {
  console.log(`🚀 Patched ${patched} file(s) with missing React import.`);
} 