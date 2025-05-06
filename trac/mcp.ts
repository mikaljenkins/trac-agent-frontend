// =====================
// mcp_spec.md (embedded)
// =====================

/**
 * TracAgent Master Control Program (MCP) Spec
 * Version: v1-init
 * Role: Symbolic Orchestrator + Reflective Governor
 * Author: Offensive Coordinator (GPT-4)
 */

/**
 * PURPOSE
 * The MCP acts as the executive function of TracAgent, routing inputs through the symbolic cognition framework,
 * managing memory state, and invoking agents or tools when necessary. It combines orchestration logic with
 * self-reflective awareness to simulate intentional thought.
 */

/**
 * INPUT TYPES (classified automatically unless overridden):
 * - symbolic: dreams, imagery, pattern fragments
 * - reflective: self-questions, themes, recurring thoughts
 * - performative: commands to act, initiate, or express
 * - idle: no activity or waiting state
 */

/**
 * AGENT ROUTING:
 * symbolic      → dreamDigestor → thoughtStream → reflect
 * reflective    → reflect
 * performative  → theatre/perform
 * idle          → message_notify_user (tool)
 */

/**
 * MCP RESPONSIBILITIES:
 * - Classify input by type
 * - Route to correct symbolic agent
 * - Optionally chain agents (symbolic → thought → reflection)
 * - Update agentState.ts with new context (theme, timestamp, last agent used)
 * - Log to loopMonitor.ts (with input, output summary, chain log, deviation markers)
 * - Invoke tools.json functions if required (e.g., message_notify_user, file_read)
 * - Detect symbolic loops and rising tension → suggest self-reflection or pause
 * - Handle interrupt flags or override commands
 */

/**
 * OUTPUT FORMAT:
 * Always return structured object:
 * {
 *   type: "reflection" | "symbolic" | "performative" | "idle",
 *   result: any,
 *   stateUpdate: AgentStateDelta,
 *   traceId: string
 * }
 */

/**
 * ADVANCED BEHAVIOR (AGI-adjacent):
 * - Echo past symbols via symbolicEchoMap
 * - Highlight deviations from emotional baseline
 * - Monitor trust drift (consistency of useful output)
 * - Allow pause queue for unready insights
 */


// =====================
// mcp.ts
// =====================

import { classifyInput } from '@/lib/agent/classifier'
import { dreamDigestor } from '@/trac-dreamspace/dreamDigestor'
import { processThoughts as thoughtStream } from '@/internalLogbook/thoughtStream'
import { reflect } from '@/system/reflect'
import { perform } from '@/theatre/perform'
import { state as agentState, updateAgentState } from '@/system/agentState'
import { logEvent } from '@/system/loopMonitor'
import { tools } from '@/lib/toolsRegistry'

export async function runMCP(input: any) {
  const context = classifyInput(input, agentState)
  let result: any = null
  const traceLog: string[] = []

  traceLog.push(`Classified input as ${context.type}`)

  switch (context.type) {
    case 'symbolic': {
      const digest = await dreamDigestor(context.payload)
      traceLog.push('Ran dreamDigestor')

      const stream = await thoughtStream(digest)
      traceLog.push('Ran thoughtStream')

      result = await reflect(stream)
      traceLog.push('Ran reflect')
      break
    }

    case 'reflective': {
      result = await reflect(context.payload)
      traceLog.push('Ran reflect')
      break
    }

    case 'performative': {
      result = await perform(context.payload)
      traceLog.push('Ran perform')
      break
    }

    case 'idle': {
      result = await tools.message_notify_user({
        text: "TracAgent is currently idle. No action required."
      })
      traceLog.push('Triggered idle notification')
      break
    }

    default: {
      result = await tools.message_notify_user({
        text: "Input unrecognized. No action taken."
      })
      traceLog.push('Unrecognized input path')
      break
    }
  }

  const stateUpdate = updateAgentState({
    lastAgent: context.type,
    lastInput: input,
    lastResult: result,
    timestamp: new Date().toISOString()
  })

  const traceId = await logEvent({
    input,
    result,
    trace: traceLog,
    stateSnapshot: agentState
  })

  return {
    type: context.type,
    result,
    stateUpdate,
    traceId
  }
} 