import { llmAdapter } from '@/system/llm/llmAdapter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, model } = await req.json();
  try {
    const result = await llmAdapter(model, message);
    return NextResponse.json({
      summary: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({ error: 'LLM error', detail: `${err}` }, { status: 500 });
  }
} 