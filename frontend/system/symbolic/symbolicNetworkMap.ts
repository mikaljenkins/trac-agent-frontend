import * as fs from 'fs/promises';
import * as path from 'path';

interface SymbolLink {
  source: string;
  target: string;
  weight: number;
}

interface SymbolNode {
  id: string;
  frequency: number;
  modules: string[];
}

interface SymbolNetwork {
  nodes: SymbolNode[];
  links: SymbolLink[];
  generatedAt: string;
}

/**
 * Builds a network graph of symbolic relationships from weekly reflection logs
 * @returns A SymbolNetwork object containing nodes and weighted links
 */
export async function buildSymbolicNetwork(): Promise<SymbolNetwork> {
  const filePath = path.join(process.cwd(), 'logs/weekly-reflections.jsonl');

  const data = await fs.readFile(filePath, 'utf-8');
  const lines = data.trim().split('\n').map(line => JSON.parse(line));

  const nodeMap = new Map<string, SymbolNode>();
  const linkMap = new Map<string, SymbolLink>();

  for (const entry of lines) {
    const issues = entry.reflection?.map((r: any) => r.issue).filter(Boolean);
    const modules = entry.reflection?.map((r: any) => r.sourceModule).filter(Boolean);

    // Build nodes
    for (const issue of issues) {
      if (!nodeMap.has(issue)) {
        nodeMap.set(issue, {
          id: issue,
          frequency: 1,
          modules: [],
        });
      } else {
        nodeMap.get(issue)!.frequency += 1;
      }
    }

    // Build links between all issues co-occurring in the same reflection
    for (let i = 0; i < issues.length; i++) {
      for (let j = i + 1; j < issues.length; j++) {
        const key = `${issues[i]}|${issues[j]}`;
        if (!linkMap.has(key)) {
          linkMap.set(key, {
            source: issues[i],
            target: issues[j],
            weight: 1,
          });
        } else {
          linkMap.get(key)!.weight += 1;
        }
      }
    }

    // Update modules per issue
    for (let i = 0; i < issues.length; i++) {
      const node = nodeMap.get(issues[i]);
      const mod = modules[i];
      if (node && mod && !node.modules.includes(mod)) {
        node.modules.push(mod);
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links: Array.from(linkMap.values()),
    generatedAt: new Date().toISOString()
  };
} 