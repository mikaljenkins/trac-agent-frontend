const fs = require('fs');
const path = require('path');
const { loadSymbolicMemories } = require('../src/lib/memory/symbolicServerManager');

const outputPath = path.resolve(__dirname, '../public/static/symbolic-snapshot.json');

async function run() {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load and export memories
    const memories = await loadSymbolicMemories();
    fs.writeFileSync(outputPath, JSON.stringify(memories, null, 2));
    console.log('✅ Exported symbolic memory snapshot to:', outputPath);
  } catch (error) {
    console.error('❌ Failed to export symbolic memory snapshot:', error);
    process.exit(1);
  }
}

run(); 