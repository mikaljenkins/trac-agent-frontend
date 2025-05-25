import { generateSandboxResponse } from './sandboxResponses.js';

// Test the sandbox response generation
const testInput = 'Hello, symbolic playground!';
const response = generateSandboxResponse(testInput);

console.log('Test Input:', testInput);
console.log('Generated Response:', response);

// Expected output:
// Test Input: Hello, symbolic playground!
// Generated Response: [PLAYGROUND] Received: Hello, symbolic playground! 