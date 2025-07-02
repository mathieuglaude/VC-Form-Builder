#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface ExportedSymbol {
  file: string;
  symbol: string;
  type: 'function' | 'class' | 'const' | 'interface' | 'route';
  alreadyTested: boolean;
}

const inventory: ExportedSymbol[] = [];

function scanDirectory(dir: string, excludeDirs = ['node_modules', 'dist', '.git']): void {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !excludeDirs.includes(item)) {
        scanDirectory(fullPath, excludeDirs);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        analyzeFile(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Could not scan ${dir}:`, error);
  }
}

function analyzeFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(process.cwd(), filePath);
    
    // Skip test files and config files
    if (relativePath.includes('/tests/') || 
        relativePath.includes('.test.') || 
        relativePath.includes('.spec.') ||
        relativePath.includes('vitest.config') ||
        relativePath.includes('vite.config')) {
      return;
    }

    // Find exported functions, classes, constants
    const exportPatterns = [
      /export\s+(?:async\s+)?function\s+(\w+)/g,
      /export\s+class\s+(\w+)/g,
      /export\s+const\s+(\w+)/g,
      /export\s+interface\s+(\w+)/g,
      /export\s+type\s+(\w+)/g,
      /export\s+enum\s+(\w+)/g,
      /export\s+default\s+(?:function\s+)?(\w+)/g,
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const symbol = match[1];
        if (symbol && symbol !== 'default') {
          inventory.push({
            file: relativePath,
            symbol,
            type: getSymbolType(pattern, content, symbol),
            alreadyTested: isAlreadyTested(relativePath, symbol)
          });
        }
      }
    }

    // Find Express routes
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const method = match[1];
        const route = match[2];
        const routeName = `${method.toUpperCase()} ${route}`;
        
        inventory.push({
          file: relativePath,
          symbol: routeName,
          type: 'route',
          alreadyTested: isRouteAlreadyTested(method, route)
        });
      }
    }

  } catch (error) {
    console.warn(`Could not analyze ${filePath}:`, error);
  }
}

function getSymbolType(pattern: RegExp, content: string, symbol: string): 'function' | 'class' | 'const' | 'interface' {
  const patternStr = pattern.toString();
  if (patternStr.includes('function')) return 'function';
  if (patternStr.includes('class')) return 'class';
  if (patternStr.includes('interface') || patternStr.includes('type')) return 'interface';
  return 'const';
}

function isAlreadyTested(filePath: string, symbol: string): boolean {
  const testPaths = [
    `tests/unit/${symbol}.test.ts`,
    `tests/unit/${symbol.toLowerCase()}.test.ts`,
    `tests/${symbol}.test.ts`,
    `tests/unit/mappingExtractor.test.ts`,
    `tests/mapping-imports.test.ts`,
  ];
  
  for (const testPath of testPaths) {
    try {
      const testContent = readFileSync(testPath, 'utf-8');
      if (testContent.includes(symbol)) {
        return true;
      }
    } catch {
      continue;
    }
  }
  
  return false;
}

function isRouteAlreadyTested(method: string, route: string): boolean {
  try {
    const proofFlowTest = readFileSync('tests/e2e/proofFlow.e2e.ts', 'utf-8');
    const routePattern = new RegExp(`(${method}|${method.toLowerCase()}).*${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    return routePattern.test(proofFlowTest);
  } catch {
    return false;
  }
}

function printInventoryTable(): void {
  console.log('\n📊 TEST INVENTORY & GAP ANALYSIS');
  console.log('═'.repeat(80));
  
  const header = '| File | Symbol | Type | Tested? |';
  const separator = '|' + '─'.repeat(78) + '|';
  
  console.log(header);
  console.log(separator);
  
  inventory.forEach(item => {
    const file = item.file.length > 25 ? '...' + item.file.slice(-22) : item.file;
    const symbol = item.symbol.length > 20 ? item.symbol.slice(0,17) + '...' : item.symbol;
    const tested = item.alreadyTested ? '✅ YES' : '❌ NO';
    
    console.log(`| ${file.padEnd(25)} | ${symbol.padEnd(20)} | ${item.type.padEnd(8)} | ${tested.padEnd(7)} |`);
  });
  
  console.log(separator);
  
  const total = inventory.length;
  const tested = inventory.filter(i => i.alreadyTested).length;
  const untested = total - tested;
  const coverage = total > 0 ? ((tested / total) * 100).toFixed(1) : '0.0';
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total symbols: ${total}`);
  console.log(`   Already tested: ${tested}`);
  console.log(`   Missing tests: ${untested}`);
  console.log(`   Current coverage: ${coverage}%`);
  console.log(`   Target coverage: 80%`);
  
  if (parseFloat(coverage) < 80) {
    console.log(`   ⚠️  Need ${Math.ceil((0.8 * total) - tested)} more tests to reach 80%`);
  } else {
    console.log(`   ✅ Coverage target already met!`);
  }
}

console.log('🔍 Scanning apps/ and packages/ directories...');
scanDirectory('apps');
scanDirectory('packages');

printInventoryTable();

export { inventory };