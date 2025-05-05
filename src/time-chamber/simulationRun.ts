// Manages simulation runs and mutation application
// Tracks outcomes and updates mutation log

import { agentState } from '@/system/agentState';
import { ClonedAgentState, createClonedState, applyMutation } from './systemMirror/clonedAgentState';
import { proposeMutation } from './mutationEngine';
import { generateSimulationInsight } from './systemMirror/clonedReflect';
import { LoopEvent } from '@/system/loopMonitor';
import fs from 'fs/promises';
import path from 'path';
import { getLogFilePath } from './logPathManager';

export interface SimulationRun {
  id: string;
  startTime: string;
  endTime: string;
  initialState: ClonedAgentState;
  finalState: ClonedAgentState;
  mutations: any[];
  insights: any[];
}

export const runSimulation = async (
  duration: number = 1000,
  events: LoopEvent[] = []
): Promise<SimulationRun> => {
  const simulationId = Math.random().toString(36).substr(2, 9);
  const startTime = new Date().toISOString();
  
  let state = createClonedState(agentState, simulationId);
  const mutations = [];
  const insights = [];

  for (let i = 0; i < duration; i++) {
    const mutation = proposeMutation(state);
    state = applyMutation(state, mutation);
    mutations.push(mutation);

    if (i % 100 === 0) {
      const insight = generateSimulationInsight(state, events);
      insights.push(insight);
    }
  }

  const run: SimulationRun = {
    id: simulationId,
    startTime,
    endTime: new Date().toISOString(),
    initialState: createClonedState(agentState, simulationId),
    finalState: state,
    mutations,
    insights
  };

  await logSimulationRun(run);
  return run;
};

async function logSimulationRun(run: SimulationRun) {
  const logPath = getLogFilePath(new Date(run.startTime));
  let existingLogs = [];
  
  try {
    const logContent = await fs.readFile(logPath, 'utf-8');
    existingLogs = JSON.parse(logContent);
  } catch (error) {
    // File doesn't exist or is invalid, start fresh
  }

  existingLogs.push(run);
  await fs.writeFile(logPath, JSON.stringify(existingLogs, null, 2));
} 