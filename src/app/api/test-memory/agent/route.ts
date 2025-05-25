import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  const input = data.input as string;
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ input })
  }).then(res => res.json());
  return NextResponse.json({ response });
} 