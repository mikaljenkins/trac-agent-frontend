/**
 * Removes circular references from an object for safe JSON stringification
 */
export function removeCircular(obj: any, seen = new WeakSet()): any {
  // Handle null and non-objects
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular reference
  if (seen.has(obj)) {
    return '[Circular]';
  }

  // Add object to seen set
  seen.add(obj);

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => removeCircular(item, seen));
  }

  // Handle objects
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = removeCircular(obj[key], seen);
    }
  }
  return result;
} 