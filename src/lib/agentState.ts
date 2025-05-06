// src/lib/agentState.ts

// Basic agent memory for this session
let memoryLog: { user: string; timestamp: number }[] = [];

export function logUserMessage(userInput: string) {
  memoryLog.push({
    user: userInput,
    timestamp: Date.now(),
  });
}

export function getSessionMemory() {
  return [...memoryLog];
}

export function clearSessionMemory() {
  memoryLog = [];
} 