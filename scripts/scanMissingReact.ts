import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = './frontend';
const EXT = '.tsx';

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
const missingReactImports: string[] = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');

  if (isLikelyJSX(content) && !hasReactImport(content)) {
    missingReactImports.push(file);
  }
}

if (missingReactImports.length === 0) {
  console.log('🎉 All JSX files have React imported!');
} else {
  console.log(`🚨 Missing React import in ${missingReactImports.length} files:`);
  missingReactImports.forEach((f) => console.log(`- ${f}`));
} 