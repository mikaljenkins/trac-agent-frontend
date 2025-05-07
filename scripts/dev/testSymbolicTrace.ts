import { v4 as uuidv4 } from 'uuid';
import { processThoughts } from '../../src/internalLogbook/thoughtStream';
import { dreamDigestor } from '../../src/trac-dreamspace/dreamDigestor';
import { reflect } from '../../src/system/reflect';
import { perform, Performance } from '../../src/theatre/perform';
import fs from 'fs';
import path from 'path';

interface SymbolicTrace {
  traceId: string;
  input: string;
  timestamp: string;
  stages: {
    step: string;
    output: any;
    insights?: string[];
  }[];
}

async function runSymbolicTrace(input: string = "mirror fragmentation"): Promise<SymbolicTrace> {
  const traceId = uuidv4();
  const timestamp = new Date().toISOString();
  const stages: SymbolicTrace['stages'] = [];

  console.log(`\n🔍 Starting symbolic trace ${traceId}`);
  console.log(`📥 Input: "${input}"\n`);

  try {
    // Step 1: Process through thoughtStream
    console.log('🔄 Processing through thoughtStream...');
    const thoughtOutput = await processThoughts(input);
    stages.push({
      step: 'thoughtStream',
      output: thoughtOutput,
      insights: thoughtOutput.thoughts
    });
    console.log('✅ Thought processing complete\n');

    // Step 2: Digest through dreamDigestor
    console.log('🔄 Processing through dreamDigestor...');
    const dreamOutput = await dreamDigestor(thoughtOutput);
    stages.push({
      step: 'dreamDigestor',
      output: dreamOutput,
      insights: dreamOutput.symbols
    });
    console.log('✅ Dream digestion complete\n');

    // Step 3: Reflect on the processed input
    console.log('🔄 Processing through reflect...');
    const reflectionOutput = await reflect(dreamOutput);
    stages.push({
      step: 'reflect',
      output: reflectionOutput,
      insights: reflectionOutput.insights
    });
    console.log('✅ Reflection complete\n');

    // Step 4: Perform the final symbolic output
    console.log('🔄 Processing through perform...');
    const performanceOutput = await perform(
      reflectionOutput.insights.join('\n'),
      'symbolic',
      0.5,
      reflectionOutput.insights
    );
    stages.push({
      step: 'perform',
      output: performanceOutput,
      insights: performanceOutput.symbols
    });
    console.log('✅ Performance complete\n');

    // Compile the full trace
    const trace: SymbolicTrace = {
      traceId,
      input,
      timestamp,
      stages
    };

    // Ensure debug-traces directory exists
    const debugTracesDir = path.join(process.cwd(), 'debug-traces');
    if (!fs.existsSync(debugTracesDir)) {
      fs.mkdirSync(debugTracesDir, { recursive: true });
    }

    // Save trace to file
    const tracePath = path.join(debugTracesDir, `trace-${traceId}.json`);
    fs.writeFileSync(tracePath, JSON.stringify(trace, null, 2));

    // Print summary
    console.log('📊 Trace Summary:');
    console.log(`🔖 Trace ID: ${traceId}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`🔄 Stages Processed: ${stages.length}`);
    
    const totalInsights = stages.reduce((count, stage) => 
      count + (stage.insights?.length || 0), 0);
    console.log(`💡 Insights Generated: ${totalInsights}`);
    
    if (totalInsights > 0) {
      console.log('\n🔍 Key Insights:');
      stages.forEach(stage => {
        if (stage.insights?.length) {
          console.log(`\n${stage.step}:`);
          stage.insights.forEach(insight => console.log(`  • ${insight}`));
        }
      });
    }
    
    console.log(`\n📝 Trace saved to: ${tracePath}\n`);

    return trace;
  } catch (error) {
    console.error('❌ Error in symbolic trace:', error);
    throw error;
  }
}

// Run the trace if this file is executed directly
if (require.main === module) {
  runSymbolicTrace()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error running symbolic trace:', error);
      process.exit(1);
    });
}

export { runSymbolicTrace };
export type { SymbolicTrace }; 