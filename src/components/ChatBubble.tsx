'use client';

import { useState, useEffect } from 'react';
import { proposeMutation } from '@/time-chamber/mutationEngine';
import { ClonedAgentState } from '@/time-chamber/systemMirror/clonedAgentState';
import { MutationLogEntry } from '@/time-chamber/mutationLogger';

interface ChatBubbleProps {
  message: string;
  isAgent?: boolean;
  agentState?: ClonedAgentState;
  onMutationProposed?: (mutation: any) => void;
  debug?: boolean;
}

export default function ChatBubble({ 
  message, 
  isAgent = false, 
  agentState,
  onMutationProposed,
  debug = false
}: ChatBubbleProps) {
  const [showMutation, setShowMutation] = useState(false);
  const [mutation, setMutation] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const logMutation = async (mutationData: MutationLogEntry) => {
    try {
      const response = await fetch('/api/logMutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutation: mutationData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (debug) {
        console.log('Mutation logged successfully:', {
          ...result.mutation,
          logFile: result.logFile
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to log mutation:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isAgent || !agentState) {
      setDebugInfo(debug ? 'No mutation: ' + (!isAgent ? 'not agent message' : 'no agent state') : '');
      return;
    }

    if (Math.random() < 0.3) { // 30% chance to propose mutation
      try {
        const proposedMutation = proposeMutation(agentState);
        setMutation(proposedMutation);
        setShowMutation(true);
        onMutationProposed?.(proposedMutation);
        
        // Calculate final state after mutation
        const finalState = {
          ...agentState,
          [proposedMutation.field]: proposedMutation.value
        };
        
        // Calculate outcome and metadata
        const trustChange = finalState.currentTrustScore - agentState.currentTrustScore;
        const loopChange = finalState.loopCount - agentState.loopCount;
        const outcome = trustChange > 0.1 && loopChange <= 0 ? 'success' 
          : trustChange < -0.1 || loopChange > 0 ? 'conflicted' 
          : 'neutral';
        
        // Create mutation log entry
        const mutationEntry: MutationLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          simulationId: agentState.simulationId,
          timestamp: new Date().toISOString(),
          mutation: proposedMutation,
          initialState: agentState,
          finalState,
          outcome,
          impact: proposedMutation.impact,
          metadata: {
            trustChange,
            loopCountChange: loopChange,
            symbolShift: finalState.lastDreamSymbol !== agentState.lastDreamSymbol
          }
        };
        
        // Log mutation via API
        logMutation(mutationEntry)
          .then(result => {
            if (debug) {
              setDebugInfo(
                `Mutation logged: ${outcome} (impact: ${proposedMutation.impact})\n` +
                `Log file: ${result.logFile}`
              );
            }
          })
          .catch(error => {
            setDebugInfo(debug ? `Logging error: ${error.message}` : '');
          });
      } catch (error: any) {
        console.error('Error proposing mutation:', error);
        setDebugInfo(debug ? `Error: ${error?.message || 'Unknown error'}` : '');
      }
    } else {
      setDebugInfo(debug ? 'No mutation: random chance not met' : '');
    }
  }, [isAgent, agentState, onMutationProposed, debug]);

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-4 ${
        isAgent ? 'bg-gray-800' : 'bg-blue-600'
      }`}>
        <p className="text-white">{message}</p>
        
        {showMutation && mutation && (
          <div className="mt-2 p-2 bg-gray-700 rounded">
            <p className="text-sm text-gray-300">Proposed Mutation:</p>
            <p className="text-sm text-gray-300">{mutation.reason}</p>
            <p className="text-xs text-gray-400">Impact: {mutation.impact}</p>
          </div>
        )}

        {debug && debugInfo && (
          <div className="mt-2 p-2 bg-gray-900 rounded">
            <p className="text-xs text-gray-400 whitespace-pre-line">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
} 