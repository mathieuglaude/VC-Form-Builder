#!/usr/bin/env tsx

import { db } from '../db.js';

async function checkTableStructure() {
  try {
    console.log('Checking current credential_templates table structure...');
    
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'credential_templates' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    for (const row of result.rows) {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    }
    
    // Also check existing data
    const dataResult = await db.execute('SELECT label, version FROM credential_templates');
    console.log('\nExisting credentials:');
    for (const row of dataResult.rows) {
      console.log(`- ${row.label} v${row.version}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTableStructure();