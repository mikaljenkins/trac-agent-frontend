import path from 'path';

export const MODEL_PATHS = {
  LLAMA_CLI: path.join(process.cwd(), 'llama.cpp/build/bin/llama-cli'),
  MISTRAL_MODEL: path.join(process.cwd(), 'models/mistral/mistral-7b-instruct-v0.1.Q4_K_M.gguf'),
} as const;

// Validate paths exist
export function validateModelPaths() {
  const fs = require('fs');
  const missingPaths = Object.entries(MODEL_PATHS)
    .filter(([_, filePath]) => !fs.existsSync(filePath))
    .map(([name]) => name);

  if (missingPaths.length > 0) {
    console.warn('⚠️ Missing model files:', missingPaths.join(', '));
    console.warn('Please update the paths in config/model-paths.ts');
    return false;
  }
  return true;
} 