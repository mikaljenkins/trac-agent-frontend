import { LLMResponse } from './invokeLLM';
import fs from 'fs/promises';
import path from 'path';

export interface SymbolicMemoryNode {
  label: string;
  decayScore: number;
  reinforcementScore: number;
  lastReinforced?: string;
}

export interface ReinforcementEvent {
  timestamp: string;
  symbol: string;
  source: 'llm_reflection';
  confidence: number;
  context: string;
}

/**
 * Extracts potential symbolic keywords from LLM response text.
 * TODO: Replace with more sophisticated NLP or pattern matching
 */
function extractSymbolsFromText(text: string): string[] {
  // Simple keyword extraction - replace with better NLP
  const words = text.toLowerCase().split(/\W+/);
  const symbols = new Set<string>();
  
  // Filter for potential symbolic keywords (3+ chars, not common words)
  const commonWords = new Set(['the', 'and', 'that', 'this', 'with', 'from']);
  words.forEach(word => {
    if (word.length >= 3 && !commonWords.has(word)) {
      symbols.add(word);
    }
  });
  
  return Array.from(symbols);
}

/**
 * Reinforces symbolic memory based on LLM reflection content.
 * Updates decay scores and tracks reinforcement events.
 */
export async function reinforceSymbolsFromReflection(
  response: LLMResponse,
  currentMemory: SymbolicMemoryNode[]
): Promise<{
  updatedMemory: SymbolicMemoryNode[];
  reinforcementEvents: ReinforcementEvent[];
}> {
  const symbols = extractSymbolsFromText(response.text);
  const reinforcementEvents: ReinforcementEvent[] = [];
  const updatedMemory = [...currentMemory];

  // Process each extracted symbol
  for (const symbol of symbols) {
    // Find matching memory node or create new one
    let node = updatedMemory.find(n => n.label === symbol);
    if (!node) {
      node = {
        label: symbol,
        decayScore: 1.0,
        reinforcementScore: 0
      };
      updatedMemory.push(node);
    }

    // Calculate reinforcement based on LLM confidence
    const confidence = response.metadata?.confidence ?? 0.5;
    const reinforcement = 0.1 * confidence; // Scale reinforcement by confidence

    // Update node scores
    node.decayScore = Math.max(0, node.decayScore - reinforcement);
    node.reinforcementScore = (node.reinforcementScore || 0) + reinforcement;
    node.lastReinforced = new Date().toISOString();

    // Log reinforcement event
    reinforcementEvents.push({
      timestamp: node.lastReinforced,
      symbol: node.label,
      source: 'llm_reflection',
      confidence,
      context: response.text.slice(0, 100) + '...' // Store snippet of context
    });
  }

  // Log reinforcement events
  await logReinforcementEvents(reinforcementEvents);

  return { updatedMemory, reinforcementEvents };
}

/**
 * Logs reinforcement events to the journal.
 */
async function logReinforcementEvents(events: ReinforcementEvent[]): Promise<void> {
  const journalDir = path.join(process.cwd(), 'journal', 'reinforcements');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `reinforce-${date}.json`;
  const filePath = path.join(journalDir, fileName);

  try {
    // Ensure directory exists
    await fs.mkdir(journalDir, { recursive: true });

    // Read existing events if any
    let existingEvents: ReinforcementEvent[] = [];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existingEvents = JSON.parse(content);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }

    // Append new events
    const allEvents = [...existingEvents, ...events];

    // Write updated events
    await fs.writeFile(filePath, JSON.stringify(allEvents, null, 2), 'utf-8');
    console.log(`📝 Logged ${events.length} reinforcement events to ${filePath}`);
  } catch (err) {
    console.error('Failed to log reinforcement events:', err);
  }
} 