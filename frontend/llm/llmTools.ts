import type { SymbolicGoal } from '@/system/symbolic/symbolicDesire';
import type { SymbolEntry } from '@/system/symbolic/symbolMap';
import type { EvolutionPlan } from '@/types/symbolic';
import { invokeLLM } from './invokeLLM';

/**
 * Summarizes a symbol map using LLM to identify patterns and insights
 * @param map Array of symbol entries to analyze
 * @returns Promise resolving to a string containing the LLM's analysis
 * @throws Error if the map is empty or LLM invocation fails
 */
export async function summarizeSymbolMap(map: SymbolEntry[]): Promise<string> {
  if (!map.length) {
    throw new Error('Cannot summarize empty symbol map');
  }

  try {
    const prompt = `
Analyze the following symbolic patterns and generate insights:

${map.map(entry => `• ${entry.issue} (Frequency: ${entry.frequency})
  - Modules: ${Array.from(entry.modules).join(', ')}
  - Source: ${entry.sourceModule}
  - Last Seen: ${entry.lastSeen}
  - Related: ${Array.from(entry.related || []).join(', ') || 'None'}`).join('\n\n')}

Provide a concise summary of the key patterns and their potential significance.
`.trim();

    const result = await invokeLLM({
      prompt,
      systemMessage: 'You are a symbolic pattern analyzer identifying meaningful connections and insights.',
      temperature: 0.7
    });

    return result.text;
  } catch (error) {
    console.error('Failed to summarize symbol map:', error);
    throw new Error('LLM summarization failed');
  }
}

/**
 * Rewrites an evolution plan using LLM to enhance its clarity and effectiveness
 * @param plan The evolution plan to enhance
 * @returns Promise resolving to an enhanced version of the plan
 * @throws Error if LLM invocation fails
 */
export async function rewritePlan(plan: EvolutionPlan): Promise<EvolutionPlan> {
  try {
    const prompt = `
Review and enhance the following evolution plan:

Action: ${plan.action}
Reason: ${plan.reason}
Target Module: ${plan.targetModule || 'N/A'}
Urgency: ${plan.urgency || 'N/A'}
Source Module: ${plan.sourceModule || 'N/A'}
Status: ${plan.status || 'N/A'}
Origin: ${plan.origin || 'N/A'}

Provide an improved version that maintains the core intent while enhancing clarity and effectiveness.
`.trim();

    const result = await invokeLLM({
      prompt,
      systemMessage: 'You are an evolution plan optimizer improving clarity and effectiveness.',
      temperature: 0.6
    });

    // Parse the LLM response and update the plan
    const enhancedPlan: EvolutionPlan = {
      ...plan,
      reason: result.text,
      // Preserve other fields but enhance the reason
    };

    return enhancedPlan;
  } catch (error) {
    console.error('Failed to rewrite evolution plan:', error);
    throw new Error('LLM plan enhancement failed');
  }
}

/**
 * Reflects on a symbolic goal using LLM to generate deeper insights
 * @param goal The symbolic goal to analyze
 * @returns Promise resolving to a string containing the LLM's reflection
 * @throws Error if LLM invocation fails
 */
export async function reflectOnDesire(goal: SymbolicGoal): Promise<string> {
  try {
    const prompt = `
Analyze the following symbolic desire:

Description: ${goal.description}
Urgency: ${goal.urgency}
Origin: ${goal.origin}
Context: ${goal.context || 'N/A'}
Timestamp: ${goal.timestamp}

Provide a deep reflection on the meaning and potential implications of this desire.
`.trim();

    const result = await invokeLLM({
      prompt,
      systemMessage: 'You are a symbolic desire analyzer providing deep insights into motivations and implications.',
      temperature: 0.8
    });

    return result.text;
  } catch (error) {
    console.error('Failed to reflect on symbolic desire:', error);
    throw new Error('LLM reflection failed');
  }
} 