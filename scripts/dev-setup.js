#!/usr/bin/env node

/**
 * Development setup script
 * Ensures all workspace dependencies are properly linked and configured
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up development environment...');

try {
  // Install all workspace dependencies
  console.log('📦 Installing workspace dependencies...');
  execSync('pnpm install', { stdio: 'inherit' });
  
  // Generate types for shared packages
  console.log('🔨 Building shared packages...');
  execSync('pnpm --filter shared build', { stdio: 'inherit' });
  
  // Run type checking across all packages
  console.log('🔍 Running type checks...');
  execSync('pnpm --filter "*" tsc --noEmit', { stdio: 'inherit' });
  
  console.log('✅ Development environment ready!');
  console.log('Run `pnpm dev` to start the application.');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}