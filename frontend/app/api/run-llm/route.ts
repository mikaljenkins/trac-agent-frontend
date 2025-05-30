import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import path from 'path';

// Constants for model paths - update these based on your setup
const MODEL_PATH = path.join(process.cwd(), 'models/mistral/mistral-7b-instruct-v0.1.Q4_K_M.gguf');
const LLAMA_CLI_PATH = path.join(process.cwd(), 'llama.cpp/build/bin/llama-cli');

export async function POST(req: Request) {
  const { prompt } = await req.json();

  return new Promise((resolve) => {
    const child = spawn(LLAMA_CLI_PATH, [
      '-m', MODEL_PATH,
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