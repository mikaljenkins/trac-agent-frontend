#!/usr/bin/env ts-node

import chalk from 'chalk';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/mutate';

async function main() {
  const traceId = process.argv[2];
  if (!traceId) {
    console.error(chalk.red('❌ Please provide a traceId as an argument.'));
    process.exit(1);
  }

  const url = `${API_URL}/${traceId}`;
  try {
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    const data = await res.json();
    const { mutationsApplied, rejected, rationaleSnippets } = data;

    console.log(chalk.bold(`\n🧠 Symbolic Mutation Cycle for Trace: ${chalk.cyan(traceId)}`));
    console.log(
      `${chalk.green('✅ Applied:')} ${mutationsApplied.length}  ` +
      `${chalk.red('❌ Rejected:')} ${rejected.length}`
    );
    if (mutationsApplied.length > 0) {
      console.log(chalk.green('\nApplied Mutations:'));
      mutationsApplied.forEach((m: any) => {
        console.log(
          `  ${chalk.bold(m.type)} ${chalk.cyan(m.targetSymbol)} - ${chalk.gray(m.rationale.slice(0, 60))}${m.rationale.length > 60 ? '…' : ''}`
        );
      });
    }
    if (rejected.length > 0) {
      console.log(chalk.red('\nRejected Mutations:'));
      rejected.forEach((m: any) => {
        console.log(
          `  ${chalk.bold(m.type)} ${chalk.cyan(m.targetSymbol)} - ${chalk.gray(m.rationale.slice(0, 60))}${m.rationale.length > 60 ? '…' : ''}`
        );
      });
    }
    if (rationaleSnippets && rationaleSnippets.length > 0) {
      console.log(chalk.yellow('\nRationale Snippets:'));
      rationaleSnippets.slice(0, 3).forEach((r: string, i: number) => {
        console.log(`  ${chalk.yellowBright('•')} ${r.slice(0, 100)}${r.length > 100 ? '…' : ''}`);
      });
    }
    console.log();
  } catch (err: any) {
    console.error(chalk.red(`\n❌ Error running mutation cycle: ${err.message || err}`));
    process.exit(1);
  }
}

main(); 