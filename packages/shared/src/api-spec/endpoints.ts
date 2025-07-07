/**
 * API Endpoint Manifest for React Query Hook Generation
 * Defines all GET/POST routes with their expected response schemas
 */

import { z } from 'zod';

// Response schemas based on existing API contracts
const FormSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  purpose: z.string().optional(),
  logoUrl: z.string().optional(),
  components: z.array(z.any()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const CredentialTemplateSchema = z.object({
  id: z.number(),
  label: z.string(),
  credentialDefinitionId: z.string().optional(),
  schemaId: z.string().optional(),
  issuerName: z.string(),
  attributes: z.array(z.string()),
  ecosystemName: z.string().optional(),
  interopProfile: z.string().optional(),
  governanceFramework: z.string().optional(),
});

const SubmissionSchema = z.object({
  id: z.number(),
  formId: z.number(),
  submissionData: z.record(z.any()),
  verifiedFields: z.record(z.any()).optional(),
  createdAt: z.string(),
});

const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.string().optional(),
});

// API Endpoint Definitions
export const endpoints = {
  // Forms API
  getForms: {
    method: 'GET' as const,
    path: '/api/forms',
    responseSchema: z.array(FormSchema),
    description: 'Get all forms for current user',
  },
  
  getForm: {
    method: 'GET' as const,
    path: '/api/forms/:id',
    responseSchema: FormSchema,
    description: 'Get specific form by ID',
    params: ['id'],
  },

  // Credential Library API  
  getCredentialLibrary: {
    method: 'GET' as const,
    path: '/api/cred-lib',
    responseSchema: z.array(CredentialTemplateSchema),
    description: 'Get all available credential templates',
  },

  getCredential: {
    method: 'GET' as const,
    path: '/api/cred-lib/:id',
    responseSchema: CredentialTemplateSchema,
    description: 'Get specific credential template by ID',
    params: ['id'],
  },

  // Submissions API
  getSubmissions: {
    method: 'GET' as const,
    path: '/api/submissions',
    responseSchema: z.array(SubmissionSchema),
    description: 'Get all submissions with pagination',
    queryParams: ['page', 'pageSize', 'formId'],
  },

  getSubmission: {
    method: 'GET' as const,
    path: '/api/submissions/:id',
    responseSchema: SubmissionSchema,
    description: 'Get specific submission by ID',
    params: ['id'],
  },

  // Auth API
  getAuthUser: {
    method: 'GET' as const,
    path: '/api/auth/user',
    responseSchema: UserSchema,
    description: 'Get current authenticated user',
  },

  // VC Proof API (when VC enabled)
  getProofStatus: {
    method: 'GET' as const,
    path: '/api/proofs/:txId',
    responseSchema: z.object({
      status: z.string(),
      proofId: z.string().optional(),
      verifiedData: z.record(z.any()).optional(),
    }),
    description: 'Get proof verification status',
    params: ['txId'],
  },
} as const;

export type EndpointKey = keyof typeof endpoints;
export type Endpoint = typeof endpoints[EndpointKey];