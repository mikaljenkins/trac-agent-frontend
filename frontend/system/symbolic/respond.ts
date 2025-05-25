import type { Reflection } from './reflect';

interface ResponseContext {
  isFirstInteraction: boolean;
  hasRepeatedThemes: boolean;
  dominantTheme?: string;
}

/**
 * Analyzes the conversation thread to extract context
 */
function analyzeContext(threadContext: Array<{ input: string; reflection: any }>): ResponseContext {
  return {
    isFirstInteraction: threadContext.length === 0,
    hasRepeatedThemes: false, // TODO: Implement theme tracking
    dominantTheme: threadContext[threadContext.length - 1]?.reflection?.keyInsights[0]
  };
}

/**
 * Generates a natural language opening based on context
 */
function generateOpening(input: string, context: ResponseContext): string {
  if (context.isFirstInteraction) {
    return "I appreciate you sharing that with me. Let me process what you've said.";
  }
  
  const openings = [
    "I see what you mean.",
    "That's an interesting perspective.",
    "I understand where you're coming from.",
    "Thank you for elaborating.",
    "I've carefully considered your input."
  ];
  
  return openings[Math.floor(Math.random() * openings.length)];
}

/**
 * Formats insights in a natural way
 */
function formatInsights(insights: string[]): string {
  if (insights.length === 0) return '';
  
  const formatted = insights.map(insight => `• ${insight}`).join('\n');
  return `\nHere's what I've observed:\n${formatted}`;
}

/**
 * Formats recommendations with priority and rationale
 */
function formatRecommendations(recommendations: Array<{ action: string; priority: number; rationale: string }>): string {
  if (recommendations.length === 0) return '';
  
  const formatted = recommendations
    .sort((a, b) => b.priority - a.priority)
    .map(rec => `• ${rec.action}\n  ${rec.rationale}`)
    .join('\n');
  
  return `\nBased on this, I suggest:\n${formatted}`;
}

/**
 * Generates a natural language closing based on context and confidence
 */
function generateClosing(confidence: number, context: ResponseContext): string {
  const confidencePhrase = confidence > 0.8 
    ? "I'm quite confident about this analysis"
    : confidence > 0.6
    ? "I have a moderate level of confidence in this assessment"
    : "While I'm still forming a complete picture";

  const followUp = context.isFirstInteraction
    ? "\nPlease feel free to share more or ask questions."
    : "\nLet me know your thoughts on this.";

  return `\n\n${confidencePhrase}.${followUp}`;
}

/**
 * Generates a natural language response based on reflection and context
 */
export function generateResponse(
  input: string,
  reflection: Reflection,
  threadContext: Array<{ input: string; reflection: any }> = []
): string {
  const context = analyzeContext(threadContext);
  
  const opening = generateOpening(input, context);
  const summary = `\n\n${reflection.summary}`;
  const insights = formatInsights(reflection.keyInsights);
  const recommendations = formatRecommendations(reflection.recommendations);
  const closing = generateClosing(reflection.confidence, context);

  return `${opening}${summary}${insights}${recommendations}${closing}`;
} 