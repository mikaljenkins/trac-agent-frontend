import fs from 'fs';
import path from 'path';
import readline from 'readline';

const TARGET_DIR = './src';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function listFilesRecursively(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      listFilesRecursively(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function confirmAndDelete(dir: string) {
  rl.question(`🚨 Confirm deletion of orphaned directory: ${dir} ? (y/n): `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Deleted: ${dir}`);
    } else {
      console.log('❌ Skipped deletion.');
    }
    rl.close();
  });
}

if (!fs.existsSync(TARGET_DIR)) {
  console.log("🎉 No orphaned src/ directory found. You're clean.");
  process.exit(0);
}

const orphanedFiles = listFilesRecursively(TARGET_DIR);
console.log(`📦 Found ${orphanedFiles.length} orphaned file(s) in: ${TARGET_DIR}`);
orphanedFiles.forEach(f => console.log(` - ${f}`));

confirmAndDelete(TARGET_DIR); 