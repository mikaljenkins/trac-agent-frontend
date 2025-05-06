# 🧠 TracAgent Context Prime

This file primes any agent operating within the TracAgent environment. It provides a persistent understanding of TracAgent's core memory architecture and cognitive feedback loops.

---

## 🔍 Symbolic Memory System
Symbolic memory nodes represent enduring insights or archetypal recognitions. Each node:
- Is structured via the `SymbolicMemoryNode` type
- Can be triggered by user input or agent reflection
- Tracks `usageCount`, `lastTriggered`, `weight`, and `decayRate`

**Use Case:**
When a user says something profound, symbolic memory provides continuity by anchoring meaning.

## 💭 Session Memory & Reflection
This is TracAgent's short-term awareness system.
It:
- Captures each input with emotional tone, topic, and tags
- Feeds into a 4-phase reflection loop: Scan, Threading, Calibration, Insight
- Generates an evolving "reflection string" that guides responses

**Purpose:**
Maintain responsiveness, emotional resonance, and evolving narrative awareness.

## 🔁 Feedback Loop Mechanics
- Symbolic memory is triggered by reflection
- Reinforced nodes grow stronger, unused ones decay
- The session reflection string can create *new* symbolic nodes if repeated

---

## ✅ Agent Priming Complete
Once this context is read, agents will:
- Understand the architecture of TracAgent's cognition
- Know how to process inputs using both memory systems
- Be ready to respond with awareness, alignment, and growth 