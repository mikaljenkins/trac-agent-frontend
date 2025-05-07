import fs from 'fs/promises';
import path from 'path';
import { ClonedAgentState } from './systemMirror/clonedAgentState';
import { Mutation } from './mutationEngine';

export type MutationOutcome = 'success' | 'neutral' | 'conflicted';

export interface MutationLogEntry {
  id: string;
  simulationId: string;
  timestamp: string;
  mutation: Mutation;
  initialState: ClonedAgentState;
  finalState: ClonedAgentState;
  outcome: MutationOutcome;
  impact: number;
  metadata: {
    trustChange?: number;
    loopCountChange?: number;
    symbolShift?: boolean;
  };
}

class MutationLogger {
  private logPath: string;
  private logCache: MutationLogEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.logPath = path.join(process.cwd(), 'src', 'time-chamber', 'mutationLog.json');
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      const logContent = await fs.readFile(this.logPath, 'utf-8');
      this.logCache = JSON.parse(logContent);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty array
      this.logCache = [];
      await this.persistLog();
    }

    this.isInitialized = true;
  }

  private async persistLog() {
    try {
      await fs.writeFile(this.logPath, JSON.stringify(this.logCache, null, 2));
    } catch (error) {
      console.error('Failed to persist mutation log:', error);
      throw new Error('Failed to persist mutation log');
    }
  }

  private calculateOutcome(
    initialState: ClonedAgentState,
    finalState: ClonedAgentState,
    mutation: Mutation
  ): MutationOutcome {
    const trustChange = (finalState.currentTrustScore ?? 0) - (initialState.currentTrustScore ?? 0);
    const loopChange = (finalState.loopCount ?? 0) - (initialState.loopCount ?? 0);
    
    if (trustChange > 0.1 && loopChange <= 0) return 'success';
    if (trustChange < -0.1 || loopChange > 0) return 'conflicted';
    return 'neutral';
  }

  private calculateMetadata(
    initialState: ClonedAgentState,
    finalState: ClonedAgentState
  ) {
    return {
      trustChange: (finalState.currentTrustScore ?? 0) - (initialState.currentTrustScore ?? 0),
      loopCountChange: (finalState.loopCount ?? 0) - (initialState.loopCount ?? 0),
      symbolShift: finalState.lastDreamSymbol !== initialState.lastDreamSymbol
    };
  }

  async logMutation(
    simulationId: string,
    mutation: Mutation,
    initialState: ClonedAgentState,
    finalState: ClonedAgentState
  ): Promise<MutationLogEntry> {
    await this.initialize();

    const entry: MutationLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      simulationId,
      timestamp: new Date().toISOString(),
      mutation,
      initialState,
      finalState,
      outcome: this.calculateOutcome(initialState, finalState, mutation),
      impact: mutation.impact,
      metadata: this.calculateMetadata(initialState, finalState)
    };

    this.logCache.push(entry);
    await this.persistLog();

    return entry;
  }

  async getMutationsBySimulation(simulationId: string): Promise<MutationLogEntry[]> {
    await this.initialize();
    return this.logCache.filter(entry => entry.simulationId === simulationId);
  }

  async getMutationsByOutcome(outcome: MutationOutcome): Promise<MutationLogEntry[]> {
    await this.initialize();
    return this.logCache.filter(entry => entry.outcome === outcome);
  }

  async getRecentMutations(limit: number = 10): Promise<MutationLogEntry[]> {
    await this.initialize();
    return this.logCache.slice(-limit);
  }
}

export const mutationLogger = new MutationLogger(); 