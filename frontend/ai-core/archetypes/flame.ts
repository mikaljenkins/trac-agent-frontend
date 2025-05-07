import { AgentState } from '@/system/agentState';

/**
 * The Flame archetype represents intensity and recursion-breaking.
 * Used when the agent needs to break out of loops or provide direct, clarifying responses.
 */

export interface FlameResponse {
  content: string;
  intensity: number;
  clarityScore: number;
}

/**
 * Transforms input into a more emotionally intense, direct, or clarifying version.
 * 
 * @param input Original response content
 * @param state Current agent state
 * @returns Transformed response with Flame characteristics
 */
export function respondAsFlame(input: string, state: AgentState): FlameResponse {
  // TODO: Transform input to be more direct and intense
  // TODO: Add emotional markers and clarity indicators
  // TODO: Break recursive patterns if detected
  return {
    content: input,
    intensity: 0.5,
    clarityScore: 0.5
  };
}

/**
 * Future Integration Points:
 * - Override reflect() module for deeper pattern breaking
 * - Override perform() module for more direct action
 * - Add intensity calibration based on symbolic state
 * - Implement emergency recursion detection and breaking
 */

// Flame-specific constants
export const FLAME_CONSTANTS = {
  MIN_INTENSITY: 0.3,
  MAX_INTENSITY: 0.8,
  CLARITY_THRESHOLD: 0.7,
  RECURSION_BREAK_THRESHOLD: 3
}; 