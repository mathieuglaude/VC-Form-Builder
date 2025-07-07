#!/usr/bin/env tsx
/**
 * Hook Code Generator for React Query
 * Reads endpoint manifest and generates typed React Query hooks
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { endpoints, type EndpointKey } from '../packages/shared/src/api-spec/endpoints.js';

// Utility functions
function toPascalCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^[a-z]/, letter => letter.toUpperCase());
}

function toQueryKey(path: string): string {
  return path.replace(/^\/api\//, '').replace(/\/:.*/, '');
}

function generateHookName(endpointKey: string): string {
  // Convert getSubmissions -> useSubmissions, getForms -> useForms
  return endpointKey.replace(/^get/, 'use');
}

function generateQueryKey(endpoint: any): string {
  const baseKey = toQueryKey(endpoint.path);
  if (endpoint.params) {
    const paramPlaceholders = endpoint.params.map((p: string) => `\${${p}}`).join('/');
    return `[\`${baseKey}/\${paramPlaceholders}\`]`;
  }
  return `['${baseKey}']`;
}

function generateHookFile(endpointKey: EndpointKey, endpoint: any): string {
  const hookName = generateHookName(endpointKey);
  const queryKey = generateQueryKey(endpoint);
  const hasParams = endpoint.params && endpoint.params.length > 0;
  const hasQueryParams = endpoint.queryParams && endpoint.queryParams.length > 0;

  // Generate parameter types
  let paramTypes = '';
  let paramArgs = '';
  let urlConstruction = `'${endpoint.path}'`;

  if (hasParams) {
    paramTypes = endpoint.params.map((p: string) => `${p}: string | number`).join(', ');
    paramArgs = endpoint.params.join(', ');
    urlConstruction = `\`${endpoint.path.replace(/:(\w+)/g, '${$1}')}\``;
  }

  if (hasQueryParams) {
    const queryParamType = `{ ${endpoint.queryParams.map((p: string) => `${p}?: string | number`).join(', ')} }`;
    if (hasParams) {
      paramTypes += `, options?: ${queryParamType}`;
    } else {
      paramTypes = `options?: ${queryParamType}`;
    }
  }

  const functionSignature = paramTypes ? `(${paramTypes})` : '()';

  // Import the schema from endpoints file rather than serializing
  return `/**
 * Generated React Query hook for ${endpoint.description}
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';

// Get response schema from endpoints
const responseSchema = endpoints.${endpointKey}.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function ${hookName}${functionSignature}: UseQueryResult<ResponseType> {
  ${hasQueryParams ? `
  const searchParams = options ? new URLSearchParams(
    Object.entries(options).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const url = ${urlConstruction} + (searchParams ? \`?\${searchParams}\` : '');
  ` : `const url = ${urlConstruction};`}

  return useQuery({
    queryKey: ${hasParams ? `[\`${toQueryKey(endpoint.path)}/\${${paramArgs}}\`${hasQueryParams ? ', options' : ''}]` : `['${toQueryKey(endpoint.path)}'${hasQueryParams ? ', options' : ''}]`},
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      const data = await response.json();
      return responseSchema.parse(data);
    },
    ${hasParams ? `enabled: Boolean(${paramArgs}),` : ''}
  });
}

export type { ResponseType as ${toPascalCase(endpointKey)}Response };
`;
}

function generateBarrelFile(endpointKeys: EndpointKey[]): string {
  const exports = endpointKeys.map(key => {
    const hookName = generateHookName(key);
    const typeName = `${toPascalCase(key)}Response`;
    return `export { ${hookName}, type ${typeName} } from './${hookName}.js';`;
  }).join('\n');

  return `/**
 * Auto-generated React Query hooks barrel file
 * Generated from packages/shared/src/api-spec/endpoints.ts
 */

${exports}
`;
}

// Main generator function
async function generateHooks() {
  const outputDir = join(process.cwd(), 'packages/shared/src/react-query/auto');
  
  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const endpointKeys = Object.keys(endpoints) as EndpointKey[];
  
  console.log('🔄 Generating React Query hooks...');
  
  // Generate individual hook files
  for (const endpointKey of endpointKeys) {
    const endpoint = endpoints[endpointKey];
    const hookName = generateHookName(endpointKey);
    const hookContent = generateHookFile(endpointKey, endpoint);
    const filePath = join(outputDir, `${hookName}.ts`);
    
    writeFileSync(filePath, hookContent, 'utf-8');
    console.log(`✅ Generated ${hookName}.ts`);
  }
  
  // Generate barrel file
  const barrelContent = generateBarrelFile(endpointKeys);
  writeFileSync(join(outputDir, 'index.ts'), barrelContent, 'utf-8');
  console.log('✅ Generated index.ts (barrel file)');
  
  console.log(`🎯 Generated ${endpointKeys.length} typed React Query hooks`);
  console.log(`📁 Output: packages/shared/src/react-query/auto/`);
}

// Run generator
generateHooks().catch(console.error);