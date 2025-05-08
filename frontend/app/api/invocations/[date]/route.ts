import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { JournaledInvocation } from '../../../../journal/invocations/writeLLMInvocation';

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    const journalDir = path.join(process.cwd(), 'journal', 'invocations');
    const fileName = `invoke-${date}.json`;
    const filePath = path.join(journalDir, fileName);

    // Read the journal file
    const content = await fs.readFile(filePath, 'utf-8');
    const invocations: JournaledInvocation[] = JSON.parse(content);

    return NextResponse.json({ invocations });
  } catch (err) {
    // Return empty array if file doesn't exist or other error
    console.error(`Failed to read invocations for ${params.date}:`, err);
    return NextResponse.json({ invocations: [] });
  }
} 