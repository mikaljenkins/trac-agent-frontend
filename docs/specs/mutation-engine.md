📎 _Linked Spec:_ [Reasoning Guardrails](/ai-docs/reasoning-guardrails.md)  
> Defines reflection stagnation logic, mutation risk detection, and disengagement protocols.

⸻

🔍 **Feature Overview**

The Mutation Engine observes symbolic trace patterns and proposes structural or memory adjustments based on perceived misalignment, emotional shifts, or pattern decay. By analyzing symbolic traces, the engine identifies stagnation, insight loops, or misalignments and generates targeted mutation proposals to optimize the agent's symbolic memory and behavior.

⸻

🎯 **Objectives**
- Monitor symbolic trace outputs for insight loops or stagnation
- Propose symbolic mutations (create, reinforce, decay, reroute)
- Log mutation attempts alongside rationale and confidence
- Optionally feed mutation proposals to `wisdomHarvest.ts` for weekly summaries

⸻

🧩 **System Components Involved**
- `mcp.ts` (initiates symbolic loop)
- `symbolicManager.ts` (memory node registry)
- `reflectionEngine.ts` (tone calibration and introspection)
- `selfAudit.ts` (provides misalignment flags)
- `mutationEngine.ts` (this module)
- `logMutation.ts` (API route to persist mutation outcome)

⸻

🔁 **Mutation Flow**
1. Receive symbolic trace
2. Detect stagnation patterns or mismatch via score thresholds
3. Generate candidate mutations:
   - reinforce existing node
   - decay low-weight node
   - reroute reflection to new symbolic tag
   - propose new symbolic node
4. Log proposal (with rationale, type, confidence score)
5. Await outcome (accepted, rejected, needs review)

⸻

✅ **Acceptance Criteria**
- Proposed mutations are logged with rationale
- Feedback loop includes audit + reflection trace
- Engine avoids redundant mutation spam
- UI can preview mutation proposals before activation

⸻

🧪 **Mutation Types**
- reinforce
- decay
- create
- reroute

Each mutation includes:
- `confidenceScore`
- `rationale` (from symbolic/reflective link)
- `expected effect` (clarity, trust, alignment)

⸻

🔧 **CLI / Dev Commands**
- `/propose-mutations [traceId]`
- `/review-mutations`
- `/apply-mutation [mutationId]` 