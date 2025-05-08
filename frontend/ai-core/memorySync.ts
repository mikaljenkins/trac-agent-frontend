import { LLMResponse } from './invokeLLM';
import fs from 'fs/promises';
import path from 'path';

export interface SymbolicMemoryNode {
  label: string;
  relevanceScore: number;
  lastReinforced?: string;
  reinforcementCount: number;
  decayRate: number;
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
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index); // unique
}

/**
 * Updates symbolic memory based on LLM reflection content.
 * Reinforces matching symbols and optionally adds new ones.
 */
export async function reinforceSymbolsFromReflection(
  response: LLMResponse,
  currentMemory: SymbolicMemoryNode[]
): Promise<SymbolicMemoryNode[]> {
  const symbols = extractSymbolsFromText(response.text);
  const now = new Date().toISOString();
  const updatedMemory = [...currentMemory];
  
  // Track reinforcement events for logging
  const reinforcements: ReinforcementEvent[] = [];

  // Update existing memory nodes
  for (const node of updatedMemory) {
    if (symbols.includes(node.label.toLowerCase())) {
      // Reinforce matching symbol
      node.relevanceScore = Math.min(1, node.relevanceScore + 0.1);
      node.lastReinforced = now;
      node.reinforcementCount++;
      node.decayRate = Math.max(0.1, node.decayRate - 0.05);

      reinforcements.push({
        timestamp: now,
        symbol: node.label,
        source: 'llm_reflection',
        confidence: response.metadata?.confidence ?? 0.5,
        context: response.text.slice(0, 100) + '...'
      });
    }
  }

  // Add new symbols if they appear multiple times
  const symbolCounts = symbols.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [symbol, count] of Object.entries(symbolCounts)) {
    if (count >= 2 && !updatedMemory.some(node => node.label.toLowerCase() === symbol)) {
      updatedMemory.push({
        label: symbol,
        relevanceScore: 0.3,
        lastReinforced: now,
        reinforcementCount: 1,
        decayRate: 0.5
      });

      reinforcements.push({
        timestamp: now,
        symbol,
        source: 'llm_reflection',
        confidence: response.metadata?.confidence ?? 0.5,
        context: response.text.slice(0, 100) + '...'
      });
    }
  }

  // Log reinforcement events
  if (reinforcements.length > 0) {
    await logReinforcementEvents(reinforcements);
  }

  return updatedMemory;
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