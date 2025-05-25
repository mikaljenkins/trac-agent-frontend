/**
 * SYMBOLIC TRACE SERIALIZER
 *
 * Converts mixed trace inputs (objects, thoughts, summaries)
 * into a normalized string[] format for LoopEvent logging.
 *
 * Future evolution: replace with symbolic thread rehydrator.
 */

/**
 * Normalizes any input into a string[] format for symbolic trace logging.
 * Preserves symbolic meaning while ensuring consistent structure.
 * 
 * @param input - Any value to be serialized into the trace
 * @returns string[] - Normalized trace array
 */
export function serializeTrace(input: unknown): string[] {
  return Array.isArray(input)
    ? input.map(t => typeof t === 'string' ? t : JSON.stringify(t))
    : [JSON.stringify(input)];
} 