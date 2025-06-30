import { storage } from '../storage';
import { defineProof } from './verifier';
import type { FormConfig } from '../../shared/schema';

export async function ensureProofDef(form: FormConfig): Promise<string> {
  // Check for cached proofDefId in metadata
  const metadata = form.metadata as any;
  if (metadata?.proofDefId) {
    return metadata.proofDefId;
  }
  
  if (!form.proofDef || Object.keys(form.proofDef).length === 0) {
    throw new Error('No proof definition found for form');
  }
  
  const defId = await defineProof(form.title, form.proofDef);
  
  // Cache the proof definition ID in metadata
  const updatedMetadata = { ...(metadata || {}), proofDefId: defId };
  await storage.updateFormConfig(form.id, { metadata: updatedMetadata } as any);
  
  return defId;
}