import { validateReadmeAndDocs } from '../maintenance/validateReadmeAndDocs';

interface LogEventParams {
  timestamp: string;
  handler: string;
  trace: string[];
  result: {
    summary: string;
    symbolicTag: string;
  };
  metadata: {
    domain: string;
    status: string;
  };
}

export function logEvent(params: LogEventParams): void {
  console.log(`[${params.timestamp}] ${params.handler}: ${params.result.summary}`);
  console.log(`Trace: ${params.trace.join(' → ')}`);
  console.log(`Tag: ${params.result.symbolicTag}`);
  console.log(`Domain: ${params.metadata.domain} (${params.metadata.status})`);
}

export function weeklyTrigger(lastRunISO: string): boolean {
  const last = new Date(lastRunISO);
  const now = new Date();
  const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 7;
}

export async function checkReadmeUpdates(): Promise<void> {
  try {
    // Check if README_TODO.md exists
    const todoPath = 'README_TODO.md';
    const todoExists = await Bun.file(todoPath).exists();
    
    if (!todoExists) {
      console.log('📝 README_TODO.md not found - creating initial version');
      // Create initial README_TODO.md
      const initialContent = `# README Maintenance Tasks

## Documentation Updates
- [ ] Review and update architecture diagrams
- [ ] Update API documentation
- [ ] Check for broken links
- [ ] Verify code examples
- [ ] Update installation instructions if needed

## Content Updates
- [ ] Review feature descriptions
- [ ] Update version numbers
- [ ] Check for outdated information
- [ ] Verify all sections are complete

Last Updated: ${new Date().toISOString()}
`;
      await Bun.write(todoPath, initialContent);
    } else {
      // Read existing TODO file
      const content = await Bun.file(todoPath).text();
      console.log('📝 Found existing README_TODO.md');
      
      // Check for completed items
      const completedItems = content.match(/- \[x\]/g)?.length || 0;
      const totalItems = content.match(/- \[ \]/g)?.length || 0;
      
      if (completedItems > 0) {
        console.log(`✅ Found ${completedItems} completed items`);
        // TODO: Implement cleanup of completed items
      }
      
      if (totalItems === 0) {
        console.log('✨ All tasks completed!');
      }
    }

    // Run README validation
    await validateReadmeAndDocs();
  } catch (error) {
    console.error('❌ Error checking README updates:', error);
  }
} 