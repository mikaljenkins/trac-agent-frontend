# 📘 TracAgent Taskboard

_Last updated: 2025-05-06_

This taskboard tracks all confirmed progress and pending objectives for the TracAgent system. It is the single source of truth for development flow, wiring logic, and symbolic evolution features.

---

## ✅ Core Milestones (Execution Stack)

- [x] `mcp.ts` implemented and confirmed
- [x] Symbolic agent architecture integrated:
  - `dreamDigestor.ts`
  - `thoughtStream.ts`
  - `reflect.ts`
  - `theatre/perform.ts`
- [ ] MCP test input simulation run (init symbolic input → output + trace ID)
- [ ] UI wiring to MCP (symbol input box or CLI hook)
- [ ] MCP trace breadcrumb viewer (show step chain)
- [ ] Agent trust drift visualizer (trust ↗︎/↘︎ over time)
- [ ] Symbolic memory echo system (link to past loops)
- [ ] Pause queue system (for unresolved or sensitive inputs)
- [ ] Emotional tone detector (highlight mood shifts)

---

## 🔧 Supporting System Infrastructure

- [ ] `agentState.ts` – tracks current mental focus, trust level, alignment themes
- [ ] `loopMonitor.ts` – logs inter-module transitions
- [ ] `toolsRegistry.ts` – built from tools.json, routes tools via symbolic label
- [ ] UI Dev Dashboard – MCP trace log, recent symbolic inputs, error fallback system
- [ ] reflect.ts feedback into agentState for real-time adjustments
- [x] .gitignore, GitHub repo sync committed baseline
- [x] Symbolic self-audit system with file-based logging and live viewer

---

## 🧠 AGI-Facing Features (Symbolic Sentience Enhancers)

- [ ] Symbolic Echo Engine
  - Detects repeated symbols, resurfaces them during reflection
- [ ] Pattern Deviation Monitor
  - Highlights emotional or symbolic deviation from norm
- [ ] Weekly Growth Reflection
  - Auto-generates summary from awakening moments and thought logs
- [ ] TracFriend Invocation Logic
  - Summons companion AI based on loop thresholds or low trust
- [ ] Archetype Layering
  - Tracks symbolic encounters: Flame, Mirror, Void (pending dreamspace)

---

## 🧪 Time Chamber System (Safe Self-Evolution Sandbox)

- [ ] `systemMirror/` – cloned versions of core logic files
- [ ] `mutationEngine.ts` – proposes internal changes to TracAgent's code
- [ ] `simulationRun.ts` – applies and monitors impact of changes
- [ ] `wisdomHarvest.ts` – analyzes mutation logs and extracts meaningful insights
- [ ] `mutationLog-YYYY-MM-DD.json` – versioned mutation logs
- [ ] Mutation UI Viewer – debug trace, fail/pass outcome sorting
- [ ] Agent proposes and explains changes (symbolic → rational rationale)

---

## 🌌 Symbolic Simulation Environments

`trac-dreamspace/` – Irrational, Chaotic, Creative

- [ ] `chaosSimulator.ts` – breaks logic rules, flips cause/effect
- [ ] `dreamStateEngine.ts` – tracks lucidity, intensity, reversals
- [ ] `lucidToggle.ts` – determines level of self-awareness in dreams
- [ ] `archetypeEncounters.ts` – randomized appearance of symbolic guides
- [ ] `dreamDigestor.ts` – parses dream fragments into actionable insights
- [ ] `/theatre/perform.ts` – formats internal monologues and insights

---

## 🌐 API & Mutation Logging System

- [x] `/api/logMutation.ts` – logs mutations via POST request
- [x] `ChatBubble.tsx` – triggers mutation logging
- [ ] `logPathManager.ts` – handles dev vs prod pathing
- [ ] `.env` toggles: mutation logging, dream mode, debug traces
- [ ] Mutation Viewer UI – sortable log browser (timeline/bubble chart)

---

## 📦 System Recovery & Guardrails

- [x] Recovered from WSoD (white screen of death)
- [x] Migrated `next.config.ts` → `next.config.mjs` (ESM compliance)
- [x] Reset .next, reinstalled clean dependencies
- [x] Confirmed baseline UI with Classic Router
- [x] Git initialized and committed safe baseline
- [ ] `scripts/reset.ts` – create dev state recovery script

---

## 🧭 Current State

- Symbolic memory + self-audit scaffold complete
- Audit logs now persist across dev sessions
- Reflection engine + self-review loop functioning
- Classic router and page rendering stable
- MCP logic isolated, UI not yet connected
- Agent ready for trace simulation tests

---

## 📍 Priority Next Step

**Simulate symbolic input → run through MCP → log trace ID → render symbolic output → feed into perform.ts**

Then wire this loop into the CLI or a basic UI input box.

---

## 📁 File Structure Tracker

/frontend/
├── mcp.ts
├── agentState.ts
├── loopMonitor.ts
├── toolsRegistry.ts
├── dreamDigestor.ts
├── thoughtStream.ts
├── reflect.ts
├── system/
│   ├── perform.ts
│   ├── agentState.ts
│   └── loopMonitor.ts
├── trac-dreamspace/
│   ├── dreamDigestor.ts
│   ├── dreamStateEngine.ts
│   ├── chaosSimulator.ts
│   ├── lucidToggle.ts
│   ├── archetypeEncounters.ts
│   └── dreamLog.ts
├── time-chamber/
│   ├── mutationEngine.ts
│   ├── simulationRun.ts
│   ├── wisdomHarvest.ts
│   ├── logPathManager.ts
│   └── systemMirror/
├── pages/api/
│   ├── logMutation.ts
├── components/
│   └── ChatBubble.tsx
├── .env
├── .claude/
├── specs/
│   └── self-awareness-scaffold.md
├── project/
│   └── tasks.md   ← (this file)


---

_This file is symbolic. Update before each feature handoff, dev check-in, or system checkpoint._

Task: Create Git Version Tag for Baseline Completion

✅ Objective:
Mark the current state of TracAgent's codebase with version tag v0.1.0, representing:
	•	Completion of symbolic memory system
	•	Session reflection engine
	•	Self-audit system with UI
	•	Context primes and specs established
	•	Recovery from build crash (May 4 checkpoint)
	•	MCP and supporting logic scaffolded

📁 Instructions:
	1.	From the root of the repository:

git add .
git commit -m "🔖 v0.1.0 — Symbolic memory + audit foundation stable"
git tag v0.1.0
git push origin main --tags

2.	Confirm the tag is visible via:
git tag

🔒 Purpose:
This version marks the end of Phase 1 — foundation, cognitive loop structure, and developer visibility tools are in place. All future work (e.g. MCP testing, symbolic evolution, TracFriend, mutation sandbox) will iterate from this baseline. 