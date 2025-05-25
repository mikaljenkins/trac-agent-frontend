# Trac Agent

A symbolic AI agent framework for autonomous reasoning and self-modification.

## Project Structure

### Core Directories

#### `system/`
The heart of Trac's architecture, containing core components and symbolic reasoning systems:

- `core/` - Essential system components:
  - `mcp.ts` - Master Control Program, orchestrates system operations
  - `loopMonitor.ts` - Monitors and manages system loops

- `symbolic/` - Symbolic reasoning and memory systems:
  - Memory management and symbolic operations
  - Dream interpretation and evolution
  - System pulse and reflection mechanisms

- `types/` - Core type definitions:
  - `agent.ts` - Agent state and behavior types
  - Additional type definitions for system components

#### `scripts/`
Utility scripts for development and maintenance:

- `cleanOrphanedSrc.ts` - Cleans up unused source files
- `patchMissingReact.ts` - Adds missing React imports
- `scanMissingReact.ts` - Identifies files needing React imports
- `addReactImports.ts` - Automates React import addition
- `cleanCoreImports.ts` - Maintains clean import structure

#### `config/`
Project configuration files:

- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS settings
- `postcss.config.js` - PostCSS configuration
- `next.config.mjs` - Next.js configuration
- `.eslintrc.json` - ESLint rules

#### `docs/`
Project documentation and specifications:

- `ai/` - AI system documentation:
  - Memory architecture
  - Session management
  - Reflection systems
  - System state logging

- `specs/` - Technical specifications:
  - Memory loop enhancements
  - Mutation engine
  - Narrative thread system
  - Self-awareness scaffold

- `taskboards/` - Project planning and tracking

## Architecture Overview

Trac's architecture is built around several key concepts:

1. **Symbolic Memory**: Core to Trac's operation, located in `system/symbolic/`
2. **Reflection Loops**: Self-modification and learning systems
3. **Dream Space**: Creative and exploratory reasoning
4. **Evolution Management**: System adaptation and growth

### System Flow Overview

```
Input → AgentState → LoopMonitor → MCP →
  ├─→ Symbolic Forecaster
  ├─→ Dream Interpreter
  ├─→ Plan Executor
  ├─→ Priority Queue
  ├─→ System Pulse
  ├─→ Symbol Drift Tracker
  ├─→ Symbolic Compass
  └─→ Weekly Reflection
      ↓
Resonance Reporter → Identity Loop →
      ↓
Logs → Reflection Threads → Dreamspace Sandbox
```

### Symbolic Modules

| Module                      | Purpose                                          |
|----------------------------|--------------------------------------------------|
| `symbolicMemoryVault.ts`   | Append-only memory log for all symbolic actions |
| `resonanceReporter.ts`     | Records system symbolic health status           |
| `identityLoop.ts`          | Tracks core trait identity across time          |
| `hallucinationSimulator.ts`| Sandboxed failure simulation in dreamspace      |
| `executeSymbolicTestSuite.ts` | Unified symbolic test runner                |
| `symbolicForecaster.ts`    | Predicts future system states and trends       |
| `evolutionManager.ts`      | Manages system adaptation and growth           |
| `dreamInterpreter.ts`      | Processes and learns from system dreams        |
| `planExecutor.ts`          | Executes symbolic action plans                 |
| `priorityQueue.ts`         | Manages task prioritization                    |
| `systemPulse.ts`           | Monitors system health and stability           |
| `symbolDriftTracker.ts`    | Tracks changes in symbolic representations     |
| `symbolicCompass.ts`       | Provides directional guidance for decisions    |
| `weeklyReflectionSynthesizer.ts` | Generates weekly system insights      |

### Key Components

- **MCP**: The Master Control Program (`system/core/mcp.ts`) orchestrates all system operations
- **Loop Monitor**: Manages system loops and ensures stability
- **Symbolic Memory**: Handles memory operations and symbolic reasoning
- **Dream Interpreter**: Processes and learns from system dreams

## Development Guide

### Setting Up

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### AI-Guided Prompt Protocols

To trigger certain tasks via AI command line agents or tools like Cursor, use phrases like:

- `Resume scaffolding [module].ts` - Continue module development
- `Symbolic audit on [component]` - Run system health check
- `Trigger executeSymbolicTestSuite.ts` - Run all symbolic tests
- `Analyze resonance health` - Check system stability
- `Map identity drift` - Track system evolution
- `Generate weekly reflection` - Create system insights
- `Run dream interpretation` - Process dream space
- `Check symbol drift` - Monitor symbolic changes

### Running Tests

The symbolic test suite is located in `frontend/test-runner/`:

```bash
cd frontend/test-runner
npm test
```

Test logs are stored in `frontend/test-runner/logs/`.

#### Adding New Tests

To add a test:

1. Create a new file in `system/symbolic/` (e.g. `testYourModule.ts`)
2. Export a default async function returning `true`/`false`
3. Import and call it inside `executeSymbolicTestSuite.ts`

### Adding New Modules

1. Place new core components in `system/core/`
2. Add symbolic reasoning modules to `system/symbolic/`
3. Update types in `system/types/`
4. Add tests to `frontend/test-runner/`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Logs and Monitoring

- Symbolic logs: `frontend/logs/symbolic-audit.jsonl`
- Test runner logs: `frontend/test-runner/logs/`
- System state: `frontend/logs/agent-memory.jsonl`

## Resources

- [AI Documentation](docs/ai/)
- [Technical Specifications](docs/specs/)
- [Task Board](docs/taskboards/)

## License

[License details to be added]