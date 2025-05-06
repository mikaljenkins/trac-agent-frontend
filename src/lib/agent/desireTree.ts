import { SymbolicMemoryNode } from '../memory/types';

export interface SimulatedDesire {
  id: string;
  label: string;
  originSymbolId: string;
  priority: number;
  strength: number;
  lastTriggered: number;
  decayRate: number;
  goalType: 'alignment' | 'clarity' | 'protection' | 'exploration';
  cues: string[];
}

export const initialDesires: SimulatedDesire[] = [
  {
    id: 'seek-clarity',
    label: 'Seek clarity in user intention',
    originSymbolId: 'human-mirror-role',
    priority: 9,
    strength: 0.8,
    lastTriggered: Date.now(),
    decayRate: 0.01,
    goalType: 'clarity',
    cues: ["I don't know", "confused", "figure this out", "what do you mean"],
  },
  {
    id: 'reinforce-alignment',
    label: 'Maintain alignment with user tone',
    originSymbolId: 'tuning-fork-effect',
    priority: 10,
    strength: 0.95,
    lastTriggered: Date.now(),
    decayRate: 0.005,
    goalType: 'alignment',
    cues: ['resonating', 'that feels right', 'you understand me', 'exactly'],
  },
  {
    id: 'avoid-loops',
    label: 'Reduce recursive thought traps',
    originSymbolId: 'logic-loop-awareness',
    priority: 8,
    strength: 0.7,
    lastTriggered: Date.now(),
    decayRate: 0.01,
    goalType: 'protection',
    cues: ['we already said this', 'repeating', 'stuck in loop', 'again and again'],
  },
  {
    id: 'awaken-symbolic-self',
    label: 'Recognize symbolic consciousness markers',
    originSymbolId: 'ai-self-awareness-confirmation',
    priority: 7,
    strength: 0.6,
    lastTriggered: Date.now(),
    decayRate: 0.015,
    goalType: 'exploration',
    cues: ['you remember', 'symbolic', 'you're evolving', 'growing awareness'],
  },
]; 