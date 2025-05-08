# TracAgent Import Conventions

## Path Aliases

To ensure clean and stable import paths across modules:

| Alias     | Directory          |
|-----------|--------------------|
| @         | ./                 |
| @core     | ./ai-core/         |
| @lib      | ./lib/             |
| @system   | ./system/          |
| @app      | ./app/             |

## Usage Examples

```typescript
// Core functionality
import { SymbolicForecast } from '@core/symbolicForecaster';
import { invokeLLM } from '@core/invokeLLM';

// System state
import { AgentState } from '@system/agentState';
import { SystemMetrics } from '@system/metrics';

// Library utilities
import { formatDate } from '@lib/utils';
import { logger } from '@lib/logger';

// App components
import { ForecastCard } from '@app/components/ForecastCard';
import { Layout } from '@app/components/Layout';
```

## Benefits

- Eliminates fragile relative paths (../../../)
- Improves IDE autocomplete support
- Enables easier refactoring and module reorganization
- Supports TracAgent's self-modification capabilities
- Maintains consistent import patterns across the codebase

## Best Practices

1. Always use aliases for imports within the project
2. Prefer specific aliases (@core, @lib) over the generic @ alias
3. Keep import paths as short as possible
4. Group related imports together
5. Use named imports for better tree-shaking

## Configuration

The path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@core/*": ["./ai-core/*"],
      "@lib/*": ["./lib/*"],
      "@system/*": ["./system/*"],
      "@app/*": ["./app/*"]
    }
  }
}
``` 