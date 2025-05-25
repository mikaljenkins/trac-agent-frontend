/**
 * Safely strips circular references from objects before serialization
 */
function stripCircular(obj: any) {
  const seen = new WeakSet();
  function _clean(o: any) {
    if (o && typeof o === 'object') {
      if (seen.has(o)) return '[Circular]';
      seen.add(o);
      const out: any = Array.isArray(o) ? [] : {};
      for (const key in o) {
        out[key] = _clean(o[key]);
      }
      return out;
    }
    return o;
  }
  return _clean(obj);
}

/**
 * Invokes the LLM with the given input
 * @param input The input to process
 * @returns The LLM response
 */
export function invokeLLM(input: any) {
  // Safely serialize the input
  const safeInput = stripCircular(input);
  
  // For now return mock response
  return {
    text: `LLM invoked with: ${JSON.stringify(safeInput)}`,
    metadata: {
      timestamp: new Date().toISOString(),
      inputSize: JSON.stringify(safeInput).length
    }
  };
} 