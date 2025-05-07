import { NextRequest, NextResponse } from 'next/server';
import { runMutationCycle } from '@/../frontend/time-chamber/mutationEngine';
// import { z } from 'zod'; // Uncomment if using Zod for body validation

export async function POST(
  req: NextRequest,
  { params }: { params: { traceId: string } }
) {
  const traceId = params.traceId;
  // Optional: parse body for maxMutations
  // let maxMutations: number | undefined = undefined;
  // try {
  //   const body = await req.json();
  //   maxMutations = body.maxMutations;
  // } catch {}

  try {
    const summary = await runMutationCycle(traceId);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Mutation cycle error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error running mutation cycle' },
      { status: 500 }
    );
  }
} 