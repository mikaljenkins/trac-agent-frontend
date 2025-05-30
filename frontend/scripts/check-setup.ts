import chalk from 'chalk';
import { execSync } from 'child_process';
import { validateModelPaths } from '../config/model-paths';

function checkDependencies() {
  console.log(chalk.blue('🔍 Checking dependencies...'));
  
  try {
    // Check if framer-motion is installed
    const framerMotion = require('framer-motion');
    console.log(chalk.green('✅ framer-motion is installed'));
  } catch (error) {
    console.error(chalk.red('❌ framer-motion is not installed'));
    console.log(chalk.yellow('Run: npm install framer-motion'));
    return false;
  }

  return true;
}

function checkModelFiles() {
  console.log(chalk.blue('\n🔍 Checking model files...'));
  return validateModelPaths();
}

function checkNextJS() {
  console.log(chalk.blue('\n🔍 Checking Next.js setup...'));
  
  try {
    // Check if next is installed
    require('next');
    console.log(chalk.green('✅ Next.js is installed'));
    
    // Check if development server can start
    console.log(chalk.yellow('Attempting to start development server...'));
    execSync('next dev --no-open', { stdio: 'ignore' });
    console.log(chalk.green('✅ Next.js development server works'));
    
    // Kill the server we just started
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
  } catch (error) {
    console.error(chalk.red('❌ Next.js setup issue:'), error);
    return false;
  }

  return true;
}

async function main() {
  console.log(chalk.blue('🚀 Starting TracAgent Chat System Setup Check\n'));

  const depsOk = checkDependencies();
  const modelOk = checkModelFiles();
  const nextOk = checkNextJS();

  console.log(chalk.blue('\n📊 Setup Check Summary:'));
  console.log(chalk.blue('------------------------'));
  console.log(`Dependencies: ${depsOk ? chalk.green('✅ OK') : chalk.red('❌ Issues')}`);
  console.log(`Model Files: ${modelOk ? chalk.green('✅ OK') : chalk.red('❌ Missing')}`);
  console.log(`Next.js Setup: ${nextOk ? chalk.green('✅ OK') : chalk.red('❌ Issues')}`);

  if (depsOk && modelOk && nextOk) {
    console.log(chalk.green('\n✨ All checks passed! You can now use the chat system:'));
    console.log(chalk.yellow('1. Run: npm run dev'));
    console.log(chalk.yellow('2. Visit: http://localhost:3000'));
  } else {
    console.log(chalk.red('\n⚠️ Some checks failed. Please fix the issues above before using the chat system.'));
    process.exit(1);
  }
}

main().catch(console.error); 