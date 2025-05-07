import { invokeArchetypeLLM } from '../../frontend/ai-core/invokeArchetypeLLM';

// Stub for getMockAgentState if not implemented
function getMockAgentState() {
  return {
    activeArchetype: 'Mirror',
    predictedArchetype: 'Flame',
    trustIndex: 0.7,
    symbolicMemory: [
      { label: 'mirror' },
      { label: 'loop' },
      { label: 'fire' }
    ],
    lastSymbolicHealth: { entropy: 0.42 },
    // ...add other fields as needed for testing
  };
}

async function testLLMInvocation() {
  const agentState = getMockAgentState();

  try {
    const result = await invokeArchetypeLLM(agentState);
    console.log('🧠 Archetype LLM Invocation Result:');
    console.log(`Archetype Used: ${result.archetypeUsed}`);
    console.log(`Prompt:\n${result.prompt}`);
    console.log(`Response:\n${result.response}`);
    console.log(`Timestamp: ${result.timestamp}`);
  } catch (err) {
    console.error('❌ Error invoking archetype LLM:', err);
  }
}

testLLMInvocation(); 