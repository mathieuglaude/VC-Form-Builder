import { Request } from 'express';

// Extend Express Request with user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'user' | 'admin' | 'super_admin';
      };
    }
  }
}

// Generic route parameter interfaces
export interface RouteParams {
  id?: string;
  slug?: string;
  formId?: string;
}

// Request body types
export interface FormPublishBody {
  slug: string;
}

export interface FormCloneBody {
  authorId?: string;
  authorName?: string;
}

export interface FormSubmissionBody {
  submissionData: Record<string, unknown>;
  verifiedFields?: Record<string, boolean>;
  holderDid?: string;
}

// Credential issuance action types
export interface IssuanceAction {
  credDefId: string;
  attributeMapping: Record<string, string>;
}

export interface FormMetadata {
  issuanceActions?: IssuanceAction[];
  [key: string]: unknown;
}