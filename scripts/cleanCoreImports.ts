import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..', 'frontend');
const TARGET_ALIAS = '@core/';
const REPLACEMENTS: Record<string, string> = {
  '@core/symbolicForecaster': '@/ai-core/symbolicForecaster',
  '@core/forecastWriter': '@/ai-core/forecastWriter',
  '@core/types': '@/types',
  '@core/symbolicDiffer': '@/ai-core/symbolicDiffer',
  '@core/memorySync': '@/ai-core/memorySync',
  '@core/symbolicFrame': '@/ai-core/symbolicFrame',
};

function walk(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((filename) => {
    const fullPath = path.join(dir, filename);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walk(fullPath, callback);
    else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) callback(fullPath);
  });
}

function replaceAliases(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const [oldAlias, newAlias] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(`(['"\`])${oldAlias}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newAlias}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`🔧 Rewritten imports in: ${path.relative(rootDir, filePath)}`);
  }
}

console.log(`🔍 Scanning for @core/ imports in ${rootDir}...\n`);
walk(rootDir, replaceAliases);
console.log('\n✅ Rewrite complete.'); 