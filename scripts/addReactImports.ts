import * as fs from 'fs';
import * as path from 'path';

const PROJECT_DIR = './frontend'; // Adjust if needed
const FILE_EXTENSION = '.tsx';

function walk(dir: string, filelist: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file: string) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      filelist = walk(filepath, filelist);
    } else if (filepath.endsWith(FILE_EXTENSION)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function ensureReactImport(filepath: string): void {
  const code = fs.readFileSync(filepath, 'utf8');
  const hasReact = code.includes("import React") || code.includes("from 'react'");

  if (!hasReact) {
    const updated = `import React from 'react';\n\n${code}`;
    fs.writeFileSync(filepath, updated, 'utf8');
    console.log(`✅ Added import to ${filepath}`);
  } else {
    console.log(`⏭️ Already has import: ${filepath}`);
  }
}

const tsxFiles = walk(PROJECT_DIR);
tsxFiles.forEach(ensureReactImport); 