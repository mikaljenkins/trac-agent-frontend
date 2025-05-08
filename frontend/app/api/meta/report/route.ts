import { NextResponse } from 'next/server';
import { AgentState } from '../../../ai-core/agentState';
import { SymbolicMemoryNode } from '../../../ai-core/memorySync';
import { DriftScoreReport } from '../../../ai-core/symbolicDriftScorer';
import { WeeklyReflectionEntry } from '../../../ai-core/weeklyReflectionSynthesizer';
import fs from 'fs/promises';
import path from 'path';

interface MetaAgentReport {
  archetype: {
    current: string;
    recent: string[];
    confidence: number;
  };
  memoryStats: {
    total: number;
    fading: number;
    reinforced: number;
    averageDecay: number;
  };
  drift: {
    convergence: number;
    divergence: number;
    entropy: number;
    timestamp: string;
  };
  recentLLMConfidence: number[];
  lastReflectionSummary: string;
  loopHealth: {
    completionRate: number;
    averageDuration: number;
    stuckLoopCount: number;
    healthScore: number;
  };
}

export async function GET() {
  try {
    // Load agent state
    const statePath = path.join(process.cwd(), 'system', 'state.json');
    const content = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(content) as AgentState;
    
    // Load recent reflections
    const journalDir = path.join(process.cwd(), 'journal', 'weekly');
    const files = await fs.readdir(journalDir);
    const reflectionFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 3);
    
    const reflections: WeeklyReflectionEntry[] = [];
    for (const file of reflectionFiles) {
      const content = await fs.readFile(path.join(journalDir, file), 'utf-8');
      reflections.push(JSON.parse(content));
    }
    
    // Calculate memory stats
    const memory = state.symbolicMemory || [];
    const fading = memory.filter(node => node.decayScore > 0.7).length;
    const reinforced = memory.filter(node => node.reinforcementScore > 0.7).length;
    const averageDecay = memory.reduce((sum, node) => sum + node.decayScore, 0) / memory.length;
    
    // Get latest drift report
    const driftPath = path.join(process.cwd(), 'system', 'drift.json');
    const driftContent = await fs.readFile(driftPath, 'utf-8');
    const driftReport = JSON.parse(driftContent) as DriftScoreReport;
    
    // Calculate LLM confidence from recent interactions
    const recentConfidence = state.recentInteractions
      ?.map(interaction => interaction.confidence || 0)
      .slice(-3) || [];
    
    const report: MetaAgentReport = {
      archetype: {
        current: state.currentArchetype || 'unknown',
        recent: state.archetypeHistory?.slice(-3) || [],
        confidence: state.archetypeConfidence || 0
      },
      memoryStats: {
        total: memory.length,
        fading,
        reinforced,
        averageDecay
      },
      drift: {
        convergence: driftReport.convergence,
        divergence: driftReport.divergence,
        entropy: driftReport.entropy,
        timestamp: driftReport.timestamp
      },
      recentLLMConfidence: recentConfidence,
      lastReflectionSummary: reflections[0]?.summary || 'No recent reflections',
      loopHealth: {
        completionRate: state.loopHealth?.completionRate || 0,
        averageDuration: state.loopHealth?.averageDuration || 0,
        stuckLoopCount: state.loopHealth?.stuckLoopCount || 0,
        healthScore: state.loopHealth?.healthScore || 0
      }
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to generate meta report:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta report' },
      { status: 500 }
    );
  }
} 