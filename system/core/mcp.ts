import { agentState } from '@/system/agentState';
import { findMCPFile } from '@/system/cliPathResolver';
import { mineSkillSeedsFromLogs } from '@/system/learning/autonomousSkillMiner';
import { listPendingWebRequests } from '@/system/learning/reviewWebRequests';
import { startSecurityMonitor } from '@/system/security/securityMonitor';
import { reviewUnmetSkills } from '@/system/self/skillMonitor';
import { bootPrompt } from '@/system/symbolic/bootPrompt';
import { digestDreamWithLLM } from '@/system/symbolic/digestDreamWithLLM';
import { interpretLatestDream } from '@/system/symbolic/dreamInterpreter';
import { generateSymbolicMeta } from '@/system/symbolic/generateSymbolicMeta';
import { runLoopConnector } from '@/system/symbolic/loopConnector';
import { generateMetaPulse } from '@/system/symbolic/metaPulse';
import { runPlanExecutor } from '@/system/symbolic/planExecutor';
import { generatePriorityQueue } from '@/system/symbolic/priorityQueue';
import { detectSymbolDrift } from '@/system/symbolic/symbolDriftTracker';
import { collectSymbolicGoals, rankSymbolicGoals } from '@/system/symbolic/symbolicDesire';
import { runSymbolicPlanner } from '@/system/symbolic/symbolicPlanner';
import { runSymbolicSystemAudit } from '@/system/symbolic/symbolicSystemAuditor';
import { runSystemPulse } from '@/system/symbolic/systemPulse';
import { journalReflection, runWeeklySynthesis } from '@/system/symbolic/weeklyReflectionSynthesizer';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentResult, AgentState, LoopEvent } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

/**
 * ❗ SYMBOLIC SYSTEM DIRECTIVE ❗
 *
 * This module participates in Trac's symbolic reasoning system.
 * All additions below are made for alignment integrity.
 * DO NOT replace or strip symbolic fields (e.g., timestamp, identityAlignment).
 * They serve reflective journaling and resonance tracking.
 */

// Define the session thread entry type
interface SessionEntry {
  input: string;
  reflection: any;
  result?: AgentResult;
}

// Extend AgentState to include our custom session thread type
interface ExtendedAgentState extends Omit<AgentState, 'sessionThread'> {
  sessionThread: SessionEntry[];
}

// Task result logging interface
interface TaskResult {
  traceId: string;
  taskName: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'error';
  result: any;
  error?: string;
}

// Queue runner for chaining tasks
interface QueuedTask {
  taskName: string;
  args?: any[];
}

const taskQueue: QueuedTask[] = [];
let isProcessingQueue = false;

async function logTaskResult(result: TaskResult) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'logs', 'default-agent.json');
    
    // Ensure logs directory exists
    await fs.promises.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });
    
    // Read existing logs or create new array
    let logs: TaskResult[] = [];
    try {
      const existingLogs = await fs.promises.readFile(logPath, 'utf8');
      logs = JSON.parse(existingLogs);
    } catch (e) {
      // File doesn't exist or is invalid JSON, start with empty array
    }
    
    // Add new result and write back
    logs.push(result);
    await fs.promises.writeFile(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to log task result:', error);
  }
}

async function processTaskQueue() {
  if (isProcessingQueue || taskQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (taskQueue.length > 0) {
    const nextTask = taskQueue.shift();
    if (nextTask) {
      await runTask(nextTask.taskName, nextTask.args);
    }
  }
  
  isProcessingQueue = false;
}

async function runTask(task: string, args?: any[]) {
  const traceId = uuidv4();
  const startTime = new Date().toISOString();
  
  const taskResult: TaskResult = {
    traceId,
    taskName: task,
    startTime,
    endTime: '',
    status: 'success',
    result: null
  };

  try {
    console.log(`[${traceId}] Starting task: ${task}`);
    
    switch (task) {
      case 'forecast':
        const { generateSymbolicForecast } = await import('@/system/symbolic/symbolicForecaster');
        taskResult.result = await generateSymbolicForecast();
        break;

      case 'synthesize':
        const { runWeeklySynthesis } = await import('@/system/symbolic/weeklyReflectionSynthesizer');
        taskResult.result = await runWeeklySynthesis();
        break;

      case 'driftScore':
        const { scoreDrift } = await import('@/system/symbolic/symbolicDriftScorer');
        taskResult.result = await scoreDrift();
        break;

      case 'invokeLLM':
        const { invokeLLM } = await import('@/llm/invokeLLM');
        taskResult.result = await invokeLLM({ prompt: 'Simulate symbolic boot' });
        break;

      default:
        console.log('No recognized --task provided.');
        taskResult.status = 'error';
        taskResult.error = 'Unrecognized task';
    }
  } catch (error) {
    console.error(`[${traceId}] Task failed:`, error);
    taskResult.status = 'error';
    taskResult.error = error instanceof Error ? error.message : String(error);
  }

  taskResult.endTime = new Date().toISOString();
  await logTaskResult(taskResult);
  
  return taskResult;
}

/**
 * Logs an event to the agent's memory file
 */
async function logSymbolicEvent(event: LoopEvent) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'logs', 'agent-memory.json');
    
    // Ensure logs directory exists
    await fs.promises.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });
    
    // Read existing logs or create new array
    let logs: LoopEvent[] = [];
    try {
      const existingLogs = await fs.promises.readFile(logPath, 'utf8');
      logs = JSON.parse(existingLogs);
    } catch (e) {
      // File doesn't exist or is invalid JSON, start with empty array
    }
    
    // Add new event and write back
    logs.push(event);
    await fs.promises.writeFile(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

async function logSymbolicState() {
  const cleanedState = {
    ...agentState,
    metadata: {
      ...agentState.metadata,
      identityAlignment: 1.0 // symbolic self-coherence metric
    }
  };

  const traceId = await logSymbolicEvent({
    input: {
      content: agentState.lastInput?.content ?? '',
      timestamp: new Date().toISOString()
    },
    result: {
      summary: agentState.lastResult?.summary ?? '',
      confidence: agentState.lastResult?.confidence ?? 1.0,
      timestamp: new Date().toISOString()
    },
    /**
     * 🧠 Symbolic Trace Serialization
     *
     * The trace array preserves the symbolic flow of thought.
     * Each entry is a string representation of a symbolic state or action.
     * This allows for future rehydration and symbolic analysis.
     */
    trace: serializeTrace(['audit:symbolic']),
    stateSnapshot: cleanedState,
    timestamp: new Date().toISOString()
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const task = args.find(arg => arg.startsWith('--task='))?.split('=')[1];
const nextTask = args.find(arg => arg.startsWith('--next='))?.split('=')[1];
const interactive = args.includes('--interactive');
const chatMode = args.includes('--chat');

// Check for weekly synthesis flag
async function checkSummary() {
  if (process.argv.includes('--summary')) {
    const synthesis = await runWeeklySynthesis();
    console.log(JSON.stringify(synthesis, null, 2));
    process.exit(0);
  }
}

// Check for meta-analysis flag
async function checkMeta() {
  if (process.argv.includes('--meta')) {
    const meta = await generateSymbolicMeta();
    console.log('\n🧠 Symbolic Meta-Analysis:\n');
    console.log(JSON.stringify(meta, null, 2));
    process.exit(0);
  }
}

// Check for priority queue flag
async function checkQueue() {
  if (process.argv.includes('--queue')) {
    try {
      const queue = await generatePriorityQueue();
      console.log('\n🧭 TracAgent Evolution Priority Queue:\n');
      console.log(JSON.stringify(queue, null, 2));
    } catch (error) {
      console.error('Failed to generate priority queue:', error);
    }
    process.exit(0);
  }
}

// Check for drift analysis flag
async function checkDrift() {
  if (process.argv.includes('--drift')) {
    const result = await detectSymbolDrift();
    console.log('📉 Symbol Drift Report:\n');
    console.dir(result, { depth: null });
    process.exit(0);
  }
}

// Check for plan simulation flag
async function checkPlanExecution() {
  if (process.argv.includes('--simulate')) {
    await runPlanExecutor();
    process.exit(0);
  }
}

// Check for system pulse flag
async function checkPulse() {
  if (process.argv.includes('--pulse')) {
    await runSystemPulse();
    process.exit(0);
  }
}

// Check for dream flag
async function checkDream() {
  if (process.argv.includes('--dream')) {
    const dream = await digestDreamWithLLM();
    console.log('\n🌀 Symbolic Dream:\n');
    console.log(dream);
    process.exit(0);
  }
}

// Check for dream interpretation flag
async function checkDreamInterpretation() {
  if (process.argv.includes('--interpret')) {
    const analysis = await interpretLatestDream();
    if (analysis) {
      console.log('\n🧠 Dream Interpretation:\n');
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      console.log('No dream found or failed to interpret.');
    }
    process.exit(0);
  }
}

// Check for meta-pulse flag
async function checkMetaPulse() {
  if (process.argv.includes('--pulse-meta')) {
    const pulse = await generateMetaPulse(agentState);
    console.log('\n🧬 Symbolic MetaPulse:\n');
    console.log(JSON.stringify(pulse, null, 2));
    process.exit(0);
  }
}

// Check for symbolic planner flag
async function checkSymbolicPlanner() {
  if (process.argv.includes('--plan-symbolic')) {
    await runSymbolicPlanner();
    process.exit(0);
  }
}

// Check for skill mining flag
async function checkSkillMining() {
  if (process.argv.includes('--mine-skills')) {
    const seeds = await mineSkillSeedsFromLogs();
    console.log('\n🧠 Mined Skill Seeds:\n');
    console.log(seeds.map(s => `• ${s.name}: ${s.purpose}`).join('\n'));
    process.exit(0);
  }
}

// Check for loop connector flag
async function checkLoopConnector() {
  if (process.argv.includes('--connect-loops')) {
    console.log('\n🧬 Running symbolic loop connector...\n');
    await runLoopConnector(agentState);
    process.exit(0);
  }
}

// Check for resonance flag
async function checkResonance() {
  if (process.argv.includes('--resonance')) {
    const { evaluateSymbolicResonance } = await import('@/system/symbolic/symbolicResonance');
    const score = await evaluateSymbolicResonance();
    console.log('\n🧬 Symbolic Resonance Score:\n');
    console.log(JSON.stringify(score, null, 2));
    process.exit(0);
  }
}

// Check for symbolic audit flag
async function checkSymbolicAudit() {
  if (process.argv.includes('--audit-symbolic')) {
    console.log('🧪 Running symbolic system audit...');
    const report = await runSymbolicSystemAudit();
    console.log('\n📋 Audit Complete:\n', report);
    process.exit(0);
  }
}

// Check for security monitor flag
async function checkSecurityMonitor() {
  if (process.argv.includes('--monitor-security')) {
    console.log('[CLI] Starting Security Monitor...');
    await startSecurityMonitor();
    return process.exit(0);
  }
}

// Check for skills flag
async function checkSkills() {
  if (process.argv.includes('--skills')) {
    await reviewUnmetSkills(agentState);
    process.exit(0);
  }
}

// Check for web review flag
async function checkWebReview() {
  if (process.argv.includes('--web')) {
    await listPendingWebRequests();
    process.exit(0);
  }
}

// Check for desires flag
async function checkDesires() {
  if (process.argv.includes('--desires')) {
    const goals = await collectSymbolicGoals(agentState);
    const ranked = rankSymbolicGoals(goals);
    console.log('\n🪞 Trac\'s Symbolic Desires:\n');
    ranked.forEach((goal, i) =>
      console.log(`${i + 1}. [${goal.urgency}] ${goal.description} (${goal.origin})`)
    );
    process.exit(0);
  }
}

// Verify CLI entry point at startup
async function verifyCLIPath() {
  const mcpPath = await findMCPFile();
  if (!mcpPath) {
    console.error('❌ Cannot proceed: mcp.ts not found in expected locations');
    process.exit(1);
  }
  if (mcpPath !== __filename) {
    console.warn(`⚠️ Warning: Running mcp.ts from ${__filename} but found another at ${mcpPath}`);
  }
}

// Run checks
async function initializeMCP() {
  await verifyCLIPath();
  await checkSummary();
  await checkMeta();
  await checkQueue();
  await checkDrift();
  await checkPlanExecution();
  await checkPulse();
  await checkDream();
  await checkDreamInterpretation();
  await checkMetaPulse();
  await checkSymbolicPlanner();
  await checkSkillMining();
  await checkLoopConnector();
  await checkResonance();
  await checkSymbolicAudit();
  await checkSecurityMonitor();
  await checkSkills();
  await checkWebReview();
  await checkDesires();
  // ... rest of initialization
}

// Add tasks to queue
if (task) {
  taskQueue.push({ taskName: task });
}
if (nextTask) {
  taskQueue.push({ taskName: nextTask });
}

// Process queue if tasks were added
if (taskQueue.length > 0) {
  processTaskQueue().catch(console.error);
}

// Interactive mode
if (interactive) {
  const startInteractiveMode = async () => {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt('TracAgent > ');
    rl.prompt();

    rl.on('line', async (line) => {
      const symbolicInput = line.trim();
      if (symbolicInput.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      try {
        const { dreamDigestor } = await import('../system/symbolic/dreamDigestor');
        const { processThoughts } = await import('../system/symbolic/thoughtStream');
        const { reflect } = await import('../system/symbolic/reflect');

        const digested = await dreamDigestor(symbolicInput);
        const processed = await processThoughts(digested);
        const reflection = await reflect(processed);

        console.log('Symbolic Reflection:', reflection);
      } catch (error) {
        console.error('Processing error:', error);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('TracAgent terminal interface closed');
      process.exit(0);
    });
  };

  startInteractiveMode().catch(console.error);
}

// Chat mode with memory
if (chatMode) {
  const startChatMode = async () => {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize agent state
    const agentState: AgentState = {
      sessionThread: [],
      metadata: {
        startTime: new Date().toISOString(),
        interactionCount: 0
      }
    };

    // Run boot prompt and add to session thread
    const bootEntry = await bootPrompt();
    agentState.sessionThread.push({ 
      input: bootEntry.content,
      reflection: null
    });

    console.log('\nTracChat initialized. Type "exit" to end the session.\n');
    rl.setPrompt('TracChat > ');
    rl.prompt();

    rl.on('line', async (line) => {
      const symbolicInput = line.trim();

      if (symbolicInput.toLowerCase() === 'exit') {
        console.log('\nSession complete.');
        rl.close();
        return;
      }

      try {
        // Update agent state with new input
        agentState.lastInput = {
          content: symbolicInput,
          timestamp: new Date().toISOString()
        };
        agentState.metadata.interactionCount++;

        const { dreamDigestor } = await import('../system/symbolic/dreamDigestor');
        const { processThoughts } = await import('../system/symbolic/thoughtStream');
        const { reflect, selfReflect } = await import('../system/symbolic/reflect');
        const { generateResponse } = await import('../system/symbolic/respond');
        const { evaluateForEvolution } = await import('../system/symbolic/evolutionManager');
        const { logEvent } = await import('../system/loopMonitor');

        const digested = await dreamDigestor(symbolicInput, agentState.sessionThread);
        const thoughts = await processThoughts(digested, agentState.sessionThread);
        const reflection = await reflect(thoughts, agentState.sessionThread);

        // Update agent state with result
        agentState.lastResult = {
          summary: reflection.summary,
          confidence: reflection.confidence,
          timestamp: reflection.timestamp
        };

        agentState.sessionThread.push({ 
          input: symbolicInput, 
          reflection
        });
        
        // Generate and display the natural language response
        const reply = generateResponse(symbolicInput, reflection, agentState.sessionThread);
        console.log(`\n${reply}\n`);

        // Self-reflection and evolution step
        const reflections = selfReflect(agentState);
        await evaluateForEvolution(
          agentState,
          agentState.lastInput!,
          agentState.lastResult!
        );

        // Store full cycle with trace
        const event: LoopEvent = {
          input: {
            content: agentState.lastInput?.content ?? '',
            timestamp: new Date().toISOString()
          },
          result: {
            summary: agentState.lastResult?.summary ?? '',
            confidence: agentState.lastResult?.confidence ?? 1.0,
            timestamp: new Date().toISOString()
          },
          /**
           * 🧠 Symbolic Trace Serialization
           *
           * The trace array preserves the symbolic flow of thought.
           * Each entry is a string representation of a symbolic state or action.
           * This allows for future rehydration and symbolic analysis.
           */
          trace: serializeTrace(['audit:symbolic']),
          stateSnapshot: {
            ...agentState,
            metadata: {
              ...agentState.metadata,
              identityAlignment: 1.0 // symbolic self-coherence metric
            }
          },
          timestamp: new Date().toISOString()
        };

        await logEvent(event);

        await journalReflection({
          input: agentState.lastInput!,
          result: agentState.lastResult!,
          reflection: reflections.map(r => ({
            sourceModule: r.sourceModule ?? 'unknown',
            issue: r.issue ?? 'unspecified',
            proposedFix: r.proposedFix ?? '',
            triggerCount: r.triggerCount ?? 1,
            confidenceTrend: r.confidenceTrend ?? []
          })),
          state: agentState,
          timestamp: new Date().toISOString()
        });

        // Display reflection insights if any
        if (reflections.length > 0) {
          console.log(`\n📡 Self-Reflection Mode Activated`);
          reflections.forEach(r => {
            console.log(`• ${r.issue}`);
            console.log(`  → Fix: ${r.proposedFix}`);
            console.log(`  → Module: ${r.sourceModule} (Triggered ${r.triggerCount}x)`);
          });
          console.log(); // Empty line for readability
        }
      } catch (error) {
        console.error('Processing error:', error);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('TracChat session ended');
      process.exit(0);
    });
  };

  startChatMode().catch(console.error);
}

// Register with weekly scheduler
export async function registerSkillReview() {
  const unmetSkills = await reviewUnmetSkills(agentState);
  
  // Log results to symbolic memory
  await logSymbolicEvent({
    timestamp: new Date().toISOString(),
    input: {
      content: 'Skill Seed Review',
      timestamp: new Date().toISOString(),
    },
    result: {
      summary: `Completed skill seed review. Found ${unmetSkills.length} unmet skills.`,
      confidence: 0.8,
      timestamp: new Date().toISOString(),
    },
    trace: serializeTrace(['skill:review', { unmetCount: unmetSkills.length }]),
    stateSnapshot: agentState,
  });
}

// Call the function to log state
logSymbolicState().catch(console.error); 