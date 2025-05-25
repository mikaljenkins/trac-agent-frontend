/**
 * Safely removes circular references from an object for JSON serialization
 */
export function removeCircular(obj: any, seen = new WeakSet()): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);
  
    if (Array.isArray(obj)) {
      return obj.map(item => removeCircular(item, seen));
    }
  
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = removeCircular(obj[key], seen);
      }
    }
    return result;
  }