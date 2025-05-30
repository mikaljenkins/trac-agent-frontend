import { MODEL_PATHS, validateModelPaths } from '@/config/model-paths';
import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Validate model paths before proceeding
  if (!validateModelPaths()) {
    return new NextResponse('Model files not found. Please check configuration.', { status: 500 });
  }

  const { prompt } = await req.json();

  return new Promise((resolve) => {
    const child = spawn(MODEL_PATHS.LLAMA_CLI, [
      '-m', MODEL_PATHS.MISTRAL_MODEL,
      '-p', prompt,
      '-n', '256',
    ]);

    let output = '';
    let error = '';

    child.stdout.on('data', chunk => output += chunk);
    child.stderr.on('data', chunk => error += chunk);

    child.on('error', (err) => {
      console.error('LLM spawn error:', err);
      resolve(new NextResponse('Error running model', { status: 500 }));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('LLM process exited with code:', code);
        console.error('Error output:', error);
        resolve(new NextResponse('Model execution failed', { status: 500 }));
      } else {
        resolve(new NextResponse(output));
      }
    });
  });
} 