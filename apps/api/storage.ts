import { 
  users, 
  formConfigs, 
  formSubmissions, 
  credentialDefinitions,
  credentialTemplates,
  type User, 
  type InsertUser,
  type FormConfig,
  type InsertFormConfig,
  type FormSubmission,
  type InsertFormSubmission,
  type CredentialDefinition,
  type InsertCredentialDefinition,
  type CredentialTemplate,
  type InsertCredentialTemplate,
  type AttributeDef
} from "../../packages/shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Form config methods
  createFormConfig(formConfig: InsertFormConfig): Promise<FormConfig>;
  getFormConfig(id: number): Promise<FormConfig | undefined>;
  getFormConfigBySlug(slug: string): Promise<FormConfig | undefined>;
  getFormConfigByPublicSlug(publicSlug: string): Promise<FormConfig | undefined>;
  checkPublicSlugAvailability(publicSlug: string): Promise<boolean>;
  updateFormConfig(id: number, formConfig: Partial<InsertFormConfig>): Promise<FormConfig | undefined>;
  publishFormConfig(id: number, transport: 'connection' | 'oob'): Promise<FormConfig | undefined>;
  publishFormConfigWithSlug(id: number, slug: string): Promise<FormConfig | undefined>;
  deleteFormConfig(id: number): Promise<boolean>;
  listFormConfigs(): Promise<FormConfig[]>;
  listPublicFormConfigs(): Promise<FormConfig[]>;
  cloneFormConfig(id: number, authorId: string, authorName: string): Promise<FormConfig>;

  // Form submission methods
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getFormSubmissions(formConfigId: number): Promise<FormSubmission[]>;

  // Credential definition methods
  createCredentialDefinition(credDef: InsertCredentialDefinition): Promise<CredentialDefinition>;
  listCredentialDefinitions(): Promise<CredentialDefinition[]>;
  getCredentialDefinition(id: number): Promise<CredentialDefinition | undefined>;

  // Credential template methods
  createCredentialTemplate(template: InsertCredentialTemplate): Promise<CredentialTemplate>;
  listCredentialTemplates(): Promise<CredentialTemplate[]>;
  getCredentialTemplate(id: number): Promise<CredentialTemplate | undefined>;
  updateCredentialTemplate(id: number, template: Partial<InsertCredentialTemplate>): Promise<CredentialTemplate | undefined>;
  deleteCredentialTemplate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private formConfigs: Map<number, FormConfig>;
  private formSubmissions: Map<number, FormSubmission>;
  private credentialDefinitions: Map<number, CredentialDefinition>;
  private credentialTemplates: Map<number, CredentialTemplate>;
  private currentUserId: number;
  private currentFormConfigId: number;
  private currentSubmissionId: number;
  private currentCredDefId: number;
  private currentTemplateId: number;

  constructor() {
    this.users = new Map();
    this.formConfigs = new Map();
    this.formSubmissions = new Map();
    this.credentialDefinitions = new Map();
    this.credentialTemplates = new Map();
    this.currentUserId = 1;
    this.currentFormConfigId = 1;
    this.currentSubmissionId = 1;
    this.currentCredDefId = 1;
    this.currentTemplateId = 1;

    // Seed credential definitions and templates
    this.seedCredentialDefinitions();
    this.seedCredentialTemplates();
  }

  private seedCredentialDefinitions() {
    // Only include the two credentials you have in your catalogue
    const bcDigitalBusinessCard: CredentialDefinition = {
      id: this.currentCredDefId++,
      credentialType: "BC Digital Business Card",
      issuerDid: "MTYqmTBoLTzVqWaD7gVoeK",
      attributes: [
        { name: "business_type", type: "string", description: "Type of business" },
        { name: "given_names", type: "string", description: "Given names" },
        { name: "registered_on_dateint", type: "string", description: "Registration date" },
        { name: "family_name", type: "string", description: "Family name" },
        { name: "credential_id", type: "string", description: "Credential ID" },
        { name: "company_status", type: "string", description: "Company status" },
        { name: "business_name", type: "string", description: "Business name" },
        { name: "role", type: "string", description: "Role in business" },
        { name: "cra_business_number", type: "string", description: "CRA business number" },
        { name: "identifier", type: "string", description: "Business identifier" }
      ],
      createdAt: new Date()
    };

    const bcPersonCredential: CredentialDefinition = {
      id: this.currentCredDefId++,
      credentialType: "BC Person Credential",
      issuerDid: "RGjWbW1eycP7FrMf4QJvX8",
      attributes: [
        { name: "given_names", type: "string", description: "Given names" },
        { name: "family_name", type: "string", description: "Family name" },
        { name: "birthdate_dateint", type: "string", description: "Birth date" },
        { name: "street_address", type: "string", description: "Street address" },
        { name: "locality", type: "string", description: "City" },
        { name: "region", type: "string", description: "Province/State" },
        { name: "postal_code", type: "string", description: "Postal code" },
        { name: "country", type: "string", description: "Country" },
        { name: "picture", type: "string", description: "Photo" },
        { name: "expiry_date_dateint", type: "string", description: "Expiry date" }
      ],
      createdAt: new Date()
    };

    this.credentialDefinitions.set(bcDigitalBusinessCard.id, bcDigitalBusinessCard);
    this.credentialDefinitions.set(bcPersonCredential.id, bcPersonCredential);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Form config methods
  async createFormConfig(formConfig: InsertFormConfig): Promise<FormConfig> {
    const id = this.currentFormConfigId++;
    const now = new Date();
    const config: FormConfig = {
      id,
      name: formConfig.name,
      slug: formConfig.slug,
      purpose: formConfig.purpose,
      logoUrl: formConfig.logoUrl || null,
      title: formConfig.title,
      description: formConfig.description || null,
      formSchema: formConfig.formSchema,
      metadata: formConfig.metadata,
      proofDef: formConfig.proofDef || null,
      proofDefId: formConfig.proofDefId || null,
      proofRequests: formConfig.proofRequests || [],
      revocationPolicies: formConfig.revocationPolicies || {},
      isPublic: formConfig.isPublic || false,
      isTemplate: formConfig.isTemplate ?? true,
      isPublished: formConfig.isPublished ?? false,
      publicSlug: formConfig.publicSlug || null,
      proofTransport: formConfig.proofTransport || null,
      authorId: formConfig.authorId || "demo",
      authorName: formConfig.authorName || "Demo User",
      authorOrg: formConfig.authorOrg || null,
      clonedFrom: formConfig.clonedFrom || null,
      createdAt: now,
      updatedAt: now
    };
    this.formConfigs.set(id, config);
    return config;
  }

  async getFormConfig(id: number): Promise<FormConfig | undefined> {
    return this.formConfigs.get(id);
  }

  async getFormConfigBySlug(slug: string): Promise<FormConfig | undefined> {
    return Array.from(this.formConfigs.values()).find(
      (form) => form.slug === slug,
    );
  }

  async getFormConfigByPublicSlug(publicSlug: string): Promise<FormConfig | undefined> {
    return Array.from(this.formConfigs.values()).find(
      (form) => form.publicSlug === publicSlug && form.isPublished,
    );
  }

  async checkPublicSlugAvailability(publicSlug: string): Promise<boolean> {
    const existing = Array.from(this.formConfigs.values()).find(
      (form) => form.publicSlug === publicSlug
    );
    return !existing;
  }

  async updateFormConfig(id: number, formConfig: Partial<InsertFormConfig>): Promise<FormConfig | undefined> {
    const existing = this.formConfigs.get(id);
    if (!existing) return undefined;

    const updated: FormConfig = {
      ...existing,
      ...formConfig,
      updatedAt: new Date()
    };
    this.formConfigs.set(id, updated);
    return updated;
  }

  async publishFormConfig(id: number, transport: 'connection' | 'oob'): Promise<FormConfig | undefined> {
    const existing = this.formConfigs.get(id);
    if (!existing || existing.isPublished) return undefined;

    // Generate public slug using nanoid
    const publicSlug = `${existing.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;

    const updated: FormConfig = {
      ...existing,
      isTemplate: false,
      isPublished: true,
      publicSlug,
      proofTransport: transport,
      updatedAt: new Date()
    };
    this.formConfigs.set(id, updated);
    return updated;
  }

  async publishFormConfigWithSlug(id: number, slug: string): Promise<FormConfig | undefined> {
    const existing = this.formConfigs.get(id);
    if (!existing) return undefined;

    const updated: FormConfig = {
      ...existing,
      isTemplate: false,
      isPublished: true,
      publicSlug: slug,
      publishedAt: new Date(),
      updatedAt: new Date()
    };
    this.formConfigs.set(id, updated);
    return updated;
  }

  async listFormConfigs(): Promise<FormConfig[]> {
    return Array.from(this.formConfigs.values());
  }

  async listPublicFormConfigs(): Promise<FormConfig[]> {
    return Array.from(this.formConfigs.values()).filter(form => form.isPublic);
  }

  async deleteFormConfig(id: number): Promise<boolean> {
    const exists = this.formConfigs.has(id);
    if (exists) {
      this.formConfigs.delete(id);
      // Also delete related form submissions
      const submissionsToDelete = Array.from(this.formSubmissions.entries())
        .filter(([_, submission]) => submission.formConfigId === id)
        .map(([submissionId, _]) => submissionId);
      
      submissionsToDelete.forEach(submissionId => {
        this.formSubmissions.delete(submissionId);
      });
    }
    return exists;
  }

  async cloneFormConfig(id: number, authorId: string, authorName: string): Promise<FormConfig> {
    const original = this.formConfigs.get(id);
    if (!original) {
      throw new Error('Form not found');
    }

    const newId = this.currentFormConfigId++;
    const now = new Date();
    const generateSlug = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const cloned: FormConfig = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      slug: `${generateSlug(original.name)}-copy-${newId}`,
      isPublic: false,
      authorId,
      authorName,
      authorOrg: null,
      clonedFrom: original.id,
      createdAt: now,
      updatedAt: now
    };

    this.formConfigs.set(newId, cloned);
    return cloned;
  }

  // Form submission methods
  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const id = this.currentSubmissionId++;
    const formSubmission: FormSubmission = {
      id,
      formConfigId: submission.formConfigId,
      submissionData: submission.submissionData,
      verifiedFields: submission.verifiedFields || null,
      createdAt: new Date()
    };
    this.formSubmissions.set(id, formSubmission);
    return formSubmission;
  }

  async getFormSubmissions(formConfigId: number): Promise<FormSubmission[]> {
    return Array.from(this.formSubmissions.values()).filter(
      sub => sub.formConfigId === formConfigId
    );
  }

  // Credential definition methods
  async createCredentialDefinition(credDef: InsertCredentialDefinition): Promise<CredentialDefinition> {
    const id = this.currentCredDefId++;
    const definition: CredentialDefinition = {
      id,
      credentialType: credDef.credentialType,
      issuerDid: credDef.issuerDid || null,
      attributes: credDef.attributes,
      createdAt: new Date()
    };
    this.credentialDefinitions.set(id, definition);
    return definition;
  }

  async listCredentialDefinitions(): Promise<CredentialDefinition[]> {
    return Array.from(this.credentialDefinitions.values());
  }

  async getCredentialDefinition(id: number): Promise<CredentialDefinition | undefined> {
    return this.credentialDefinitions.get(id);
  }

  // Credential template methods
  private seedCredentialTemplates() {
    const bcBusinessCard: CredentialTemplate = {
      id: this.currentTemplateId++,
      label: 'BC Digital Business Card v1',
      version: '1.0.0',
      schemaId: 'AcZpBDz3oxmKrpcuPcdKai:2:Digital Business Card:1.0.0',
      credDefId: 'AcZpBDz3oxmKrpcuPcdKai:3:CL:350:default',
      issuerDid: 'AcZpBDz3oxmKrpcuPcdKai',
      schemaUrl: 'https://candyscan.idlab.org/tx/CANDY_PROD/domain/351',
      attributes: [
        { name: 'business_type', description: 'Type of business' },
        { name: 'given_names', description: 'Given names of the business contact' },
        { name: 'registered_on_dateint', description: 'Date business was registered (dateint format)' },
        { name: 'family_name', description: 'Family name of the business contact' },
        { name: 'credential_id', description: 'Unique credential identifier' },
        { name: 'company_status', description: 'Current status of the company' },
        { name: 'business_name', description: 'Legal name of the business' },
        { name: 'role', description: 'Role of the person in the business' },
        { name: 'cra_business_number', description: 'Canada Revenue Agency business number' },
        { name: 'identifier', description: 'Business identifier' }
      ],
      isPredefined: true,
      ecosystem: 'BC Ecosystem',
      interopProfile: 'AIP 2.0',
      compatibleWallets: ['BC Wallet'],
      walletRestricted: true,
      createdAt: new Date('2023-11-10'),
      updatedAt: new Date('2023-11-10'),
    };

    const bcPersonCred: CredentialTemplate = {
      id: this.currentTemplateId++,
      label: 'BC Person Credential v1',
      version: '1.0',
      schemaId: 'RGjWbW1eycP7FrMf4QJvX8:2:Person:1.0',
      credDefId: 'RGjWbW1eycP7FrMf4QJvX8:3:CL:13:Person',
      issuerDid: 'RGjWbW1eycP7FrMf4QJvX8',
      schemaUrl: 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/person/person-cred-doc/',
      attributes: [
        { name: 'given_names', description: 'Given names of the person' },
        { name: 'family_name', description: 'Family name of the person' },
        { name: 'birthdate_dateint', description: 'Date of birth in dateint format' },
        { name: 'street_address', description: 'Street address' },
        { name: 'locality', description: 'City or locality' },
        { name: 'region', description: 'Province or region' },
        { name: 'postal_code', description: 'Postal code' },
        { name: 'country', description: 'Country' },
        { name: 'picture', description: 'Base64 encoded photo' },
        { name: 'expiry_date_dateint', description: 'Credential expiry date in dateint format' }
      ],
      isPredefined: true,
      ecosystem: 'BC Ecosystem',
      interopProfile: 'AIP 2.0',
      compatibleWallets: ['BC Wallet'],
      walletRestricted: true,
      createdAt: new Date('2023-10-25'),
      updatedAt: new Date('2023-10-25'),
    };

    const bcLawyerCred: CredentialTemplate = {
      id: this.currentTemplateId++,
      label: 'BC Lawyer Credential v1',
      version: '1.0',
      schemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0',
      credDefId: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer',
      issuerDid: 'did:indy:QzLYGuAebsy3MXQ6b1sFiT',
      schemaUrl: 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/justice/legal-professional/governance',
      attributes: [
        { name: 'given_name', description: 'Legal given name(s)' },
        { name: 'surname', description: 'Legal surname' },
        { name: 'public_person_id', description: 'Unique LSBC Public Person ID (PPID)' },
        { name: 'member_status', description: 'Current membership status (e.g., PRAC)' },
        { name: 'member_status_code', description: 'Code for membership status' },
        { name: 'credential_type', description: 'Credential type (Lawyer)' }
      ],
      isPredefined: true,
      ecosystem: 'BC Ecosystem',
      interopProfile: 'AIP 2.0',
      compatibleWallets: ['BC Wallet'],
      walletRestricted: true,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2023-12-01'),
    };

    this.credentialTemplates.set(bcBusinessCard.id, bcBusinessCard);
    this.credentialTemplates.set(bcPersonCred.id, bcPersonCred);
    this.credentialTemplates.set(bcLawyerCred.id, bcLawyerCred);
  }

  async createCredentialTemplate(template: InsertCredentialTemplate): Promise<CredentialTemplate> {
    const id = this.currentTemplateId++;
    const now = new Date();
    const credentialTemplate: CredentialTemplate = {
      id,
      ...template,
      ecosystem: template.ecosystem || null,
      interopProfile: template.interopProfile || null,
      schemaUrl: template.schemaUrl || null,
      isPredefined: template.isPredefined || false,
      compatibleWallets: template.compatibleWallets ? [...template.compatibleWallets] : [],
      walletRestricted: template.walletRestricted || false,
      createdAt: now,
      updatedAt: now,
    };
    this.credentialTemplates.set(id, credentialTemplate);
    return credentialTemplate;
  }

  async listCredentialTemplates(): Promise<CredentialTemplate[]> {
    return Array.from(this.credentialTemplates.values());
  }

  async getCredentialTemplate(id: number): Promise<CredentialTemplate | undefined> {
    return this.credentialTemplates.get(id);
  }

  async updateCredentialTemplate(id: number, template: Partial<InsertCredentialTemplate>): Promise<CredentialTemplate | undefined> {
    const existing = this.credentialTemplates.get(id);
    if (!existing) return undefined;
    
    // Prevent editing of predefined credentials
    if (existing.isPredefined) {
      throw new Error('Cannot edit predefined credential templates');
    }

    const updated: CredentialTemplate = {
      ...existing,
      ...template,
      compatibleWallets: template.compatibleWallets || existing.compatibleWallets,
      walletRestricted: template.walletRestricted !== undefined ? template.walletRestricted : existing.walletRestricted,
      updatedAt: new Date(),
    };
    this.credentialTemplates.set(id, updated);
    return updated;
  }

  async deleteCredentialTemplate(id: number): Promise<boolean> {
    return this.credentialTemplates.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // Helper function to calculate if a form has verifiable credentials
  private calculateHasVerifiableCredentials(formConfig: any): boolean {
    try {
      const formSchema = formConfig.formSchema;
      const metadata = formConfig.metadata;
      
      // Check form schema components for verified data sources
      if (formSchema?.components) {
        const hasVerifiedInComponents = formSchema.components.some((comp: any) => 
          comp.properties?.dataSource === 'verified'
        );
        if (hasVerifiedInComponents) return true;
      }
      
      // Check metadata fields for verified types
      if (metadata?.fields) {
        const hasVerifiedInMetadata = Object.values(metadata.fields).some((field: any) => 
          field?.type === 'verified' || field?.dataSource === 'verified'
        );
        if (hasVerifiedInMetadata) return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error calculating hasVerifiableCredentials:', error);
      return false;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createFormConfig(formConfig: InsertFormConfig): Promise<FormConfig> {
    const [config] = await db
      .insert(formConfigs)
      .values(formConfig)
      .returning();
    return config;
  }

  async getFormConfig(id: number): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfigs).where(eq(formConfigs.id, id));
    if (!config) return undefined;
    
    // Build proofDef dynamically from metadata
    const metadata = config.metadata as any;
    const proofDef: Record<string, string[]> = {};
    
    if (metadata?.fields) {
      Object.entries(metadata.fields).forEach(([fieldKey, fieldMeta]: [string, any]) => {
        if (fieldMeta.type === 'verified' && fieldMeta.vcMapping?.credDefId) {
          const credDefId = fieldMeta.vcMapping.credDefId;
          const attributeName = fieldMeta.vcMapping.attributeName || fieldKey;
          
          if (!proofDef[credDefId]) {
            proofDef[credDefId] = [];
          }
          proofDef[credDefId].push(attributeName);
        }
      });
    }
    
    // Calculate hasVerifiableCredentials
    const hasVerifiableCredentials = this.calculateHasVerifiableCredentials(config);
    
    // Add proofDef and hasVerifiableCredentials to the config
    return { 
      ...config, 
      proofDef: Object.keys(proofDef).length > 0 ? proofDef : null,
      proofDefId: null,
      hasVerifiableCredentials
    } as FormConfig;
  }

  async getFormConfigBySlug(slug: string): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfigs).where(eq(formConfigs.slug, slug));
    return config || undefined;
  }

  async getFormConfigByPublicSlug(publicSlug: string): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfigs).where(
      and(eq(formConfigs.publicSlug, publicSlug), eq(formConfigs.isPublished, true))
    );
    return config || undefined;
  }

  async checkPublicSlugAvailability(publicSlug: string): Promise<boolean> {
    const [existing] = await db.select().from(formConfigs).where(eq(formConfigs.publicSlug, publicSlug));
    return !existing;
  }

  async updateFormConfig(id: number, formConfig: Partial<InsertFormConfig>): Promise<FormConfig | undefined> {
    const [updated] = await db
      .update(formConfigs)
      .set({
        ...formConfig,
        updatedAt: new Date()
      })
      .where(eq(formConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  async publishFormConfig(id: number, transport: 'connection' | 'oob'): Promise<FormConfig | undefined> {
    try {
      const [existing] = await db.select().from(formConfigs).where(eq(formConfigs.id, id));
      if (!existing || existing.isPublished) return undefined;

      // Generate public slug
      const publicSlug = `${existing.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;

      const [updated] = await db
        .update(formConfigs)
        .set({
          isTemplate: false,
          isPublished: true,
          publicSlug,
          proofTransport: transport,
          updatedAt: new Date()
        })
        .where(eq(formConfigs.id, id))
        .returning();
      
      return updated || undefined;
    } catch (error) {
      console.error('Database error in publishFormConfig:', error);
      return undefined;
    }
  }

  async publishFormConfigWithSlug(id: number, slug: string): Promise<FormConfig | undefined> {
    try {
      const [existing] = await db.select().from(formConfigs).where(eq(formConfigs.id, id));
      if (!existing) return undefined;

      const [updated] = await db
        .update(formConfigs)
        .set({
          isTemplate: false,
          isPublished: true,
          publicSlug: slug,
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(formConfigs.id, id))
        .returning();
      
      return updated || undefined;
    } catch (error) {
      console.error('Database error in publishFormConfigWithSlug:', error);
      return undefined;
    }
  }

  async deleteFormConfig(id: number): Promise<boolean> {
    try {
      // First delete related form submissions
      await db.delete(formSubmissions).where(eq(formSubmissions.formConfigId, id));
      
      // Then delete the form config
      const result = await db.delete(formConfigs).where(eq(formConfigs.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteFormConfig:', error);
      return false;
    }
  }

  async listFormConfigs(): Promise<FormConfig[]> {
    try {
      const results = await db.select().from(formConfigs).orderBy(desc(formConfigs.updatedAt));
      
      // Add hasVerifiableCredentials to each form
      return results.map(config => ({
        ...config,
        hasVerifiableCredentials: this.calculateHasVerifiableCredentials(config)
      }));
    } catch (error) {
      console.error('Database error in listFormConfigs:', error);
      throw error;
    }
  }

  async listPublicFormConfigs(): Promise<FormConfig[]> {
    try {
      // Get all forms and filter for public ones to avoid database query issues
      const allForms = await db.select().from(formConfigs);
      return allForms.filter(form => form.isPublic === true);
    } catch (error) {
      console.error('Database error in listPublicFormConfigs:', error);
      throw error;
    }
  }

  async cloneFormConfig(id: number, authorId: string, authorName: string): Promise<FormConfig> {
    const [original] = await db.select().from(formConfigs).where(eq(formConfigs.id, id));
    if (!original) {
      throw new Error('Form not found');
    }

    const generateSlug = (name: string, suffix: string) => {
      return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${suffix}`;
    };

    const clonedForm = {
      name: `${original.name} (Copy)`,
      slug: generateSlug(original.name, `copy-${Date.now()}`),
      purpose: original.purpose,
      logoUrl: original.logoUrl,
      title: `${original.title} (Copy)`,
      description: original.description,
      formSchema: original.formSchema,
      metadata: original.metadata,
      proofRequests: original.proofRequests,
      revocationPolicies: original.revocationPolicies,
      isPublic: false,
      authorId,
      authorName,
      authorOrg: null,
      clonedFrom: original.id
    };

    const [cloned] = await db
      .insert(formConfigs)
      .values(clonedForm)
      .returning();
    return cloned;
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [formSubmission] = await db
      .insert(formSubmissions)
      .values(submission)
      .returning();
    return formSubmission;
  }

  async getFormSubmissions(formConfigId: number): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.formConfigId, formConfigId));
  }

  async createCredentialDefinition(credDef: InsertCredentialDefinition): Promise<CredentialDefinition> {
    const [definition] = await db
      .insert(credentialDefinitions)
      .values(credDef)
      .returning();
    return definition;
  }

  async listCredentialDefinitions(): Promise<CredentialDefinition[]> {
    return await db.select().from(credentialDefinitions);
  }

  async getCredentialDefinition(id: number): Promise<CredentialDefinition | undefined> {
    const [definition] = await db.select().from(credentialDefinitions).where(eq(credentialDefinitions.id, id));
    return definition || undefined;
  }

  async createCredentialTemplate(template: InsertCredentialTemplate): Promise<CredentialTemplate> {
    const [credentialTemplate] = await db
      .insert(credentialTemplates)
      .values(template)
      .returning();
    return credentialTemplate;
  }

  async listCredentialTemplates(): Promise<CredentialTemplate[]> {
    return await db.select().from(credentialTemplates);
  }

  async getCredentialTemplate(id: number): Promise<CredentialTemplate | undefined> {
    const [template] = await db.select().from(credentialTemplates).where(eq(credentialTemplates.id, id));
    return template || undefined;
  }

  async updateCredentialTemplate(id: number, template: Partial<InsertCredentialTemplate>): Promise<CredentialTemplate | undefined> {
    const [updated] = await db
      .update(credentialTemplates)
      .set(template)
      .where(eq(credentialTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCredentialTemplate(id: number): Promise<boolean> {
    const result = await db.delete(credentialTemplates).where(eq(credentialTemplates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();

// Initialize and seed credentials on first run
(async () => {
  try {
    const existingTemplates = await storage.listCredentialTemplates();
    
    // Check if BC Lawyer Credential already exists
    const hasLawyerCred = existingTemplates.some(t => t.label === "BC Lawyer Credential v1");
    
    if (existingTemplates.length === 0) {
      // Seed BC Government credentials
      await storage.createCredentialTemplate({
        label: "BC Digital Business Card v1",
        version: "1.0",
        schemaId: "L6ASjmDDbDH7yPL1t2yFj9:2:business_card:1.0",
        credDefId: "L6ASjmDDbDH7yPL1t2yFj9:3:CL:728:business_card",
        issuerDid: "did:indy:candy:L6ASjmDDbDH7yPL1t2yFj9",
        schemaUrl: "https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-digital-business-card/1.0/governance.md",
        attributes: [
          { name: "business_name", description: "Legal business name" },
          { name: "business_number", description: "CRA business number" },
          { name: "business_type", description: "Type of business entity" },
          { name: "registration_date", description: "Business registration date" },
          { name: "business_address", description: "Registered business address" },
          { name: "business_email", description: "Primary business email" },
          { name: "business_phone", description: "Primary business phone" },
          { name: "business_website", description: "Official business website" },
          { name: "registration_jurisdiction", description: "Registration jurisdiction" },
          { name: "permit_number", description: "Business permit number" },
          { name: "permit_type", description: "Type of business permit" },
          { name: "permit_issued_date", description: "Permit issue date" },
          { name: "permit_expiry_date", description: "Permit expiry date" }
        ] as AttributeDef[],
        isPredefined: true,
        ecosystem: "BC Ecosystem",
        interopProfile: "AIP 2.0",
        compatibleWallets: ["BC Wallet"],
        walletRestricted: true
      });

      await storage.createCredentialTemplate({
        label: "BC Person Credential",
        version: "1.0", 
        schemaId: "RGjWbW1eycP7FrMf4QJvX8:2:Person:1.0",
        credDefId: "RGjWbW1eycP7FrMf4QJvX8:3:CL:13:Person",
        issuerDid: "did:indy:candy:RGjWbW1eycP7FrMf4QJvX8",
        schemaUrl: "https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-person-credential/1.0/governance.md",
        attributes: [
          { name: "given_names", description: "Person's given name(s)" },
          { name: "family_name", description: "Person's family name" },
          { name: "birthdate", description: "Date of birth (YYYY-MM-DD)" },
          { name: "street_address", description: "Street address" },
          { name: "locality", description: "City or locality" },
          { name: "region", description: "Province or region" },
          { name: "postal_code", description: "Postal or ZIP code" },
          { name: "country", description: "Country" },
          { name: "issued_date", description: "Credential issue date" },
          { name: "expiry_date", description: "Credential expiry date" }
        ] as AttributeDef[],
        isPredefined: true,
        ecosystem: "BC Ecosystem", 
        interopProfile: "AIP 2.0",
        compatibleWallets: ["BC Wallet"],
        walletRestricted: true
      });

      await storage.createCredentialTemplate({
        label: "BC Lawyer Credential v1",
        version: "1.0",
        schemaId: "QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0",
        credDefId: "QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer",
        issuerDid: "did:indy:QzLYGuAebsy3MXQ6b1sFiT",
        schemaUrl: "https://bcgov.github.io/digital-trust-toolkit/docs/governance/justice/legal-professional/governance",
        attributes: [
          { name: "given_name", description: "Legal given name(s)" },
          { name: "surname", description: "Legal surname" },
          { name: "public_person_id", description: "Unique LSBC Public Person ID (PPID)" },
          { name: "member_status", description: "Current membership status (e.g., PRAC)" },
          { name: "member_status_code", description: "Code for membership status" },
          { name: "credential_type", description: "Credential type (Lawyer)" }
        ] as AttributeDef[],
        isPredefined: true,
        ecosystem: "BC Ecosystem",
        interopProfile: "AIP 2.0", 
        compatibleWallets: ["BC Wallet"],
        walletRestricted: true
      });
    }
    
    // Add BC Lawyer Credential if it doesn't exist
    if (!hasLawyerCred) {
      console.log('Fetching OCA bundle for BC Lawyer Credential...');
      
      try {
        // Fetch OCA bundle data
        const ocaUrl = 'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test/OCABundle.json';
        const response = await fetch(ocaUrl);
        const ocaData = await response.json();
        const bundle = Array.isArray(ocaData) ? ocaData[0] : ocaData;
        
        // Extract branding and meta overlays
        const brandingOverlay = bundle.overlays?.find((o: any) => o.type === 'aries/overlays/branding/1.0');
        const metaOverlay = bundle.overlays?.find((o: any) => o.type === 'spec/overlays/meta/1.0');
        
        await storage.createCredentialTemplate({
          label: "BC Lawyer Credential v1",
          version: "1.0",
          schemaId: "QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0",
          credDefId: "QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer",
          issuerDid: "did:indy:QzLYGuAebsy3MXQ6b1sFiT",
          schemaUrl: "https://bcgov.github.io/digital-trust-toolkit/docs/governance/justice/legal-professional/governance",
          attributes: [
            { name: "given_name", description: "Legal given name(s)" },
            { name: "surname", description: "Legal surname" },
            { name: "public_person_id", description: "Unique LSBC Public Person ID (PPID)" },
            { name: "member_status", description: "Current membership status (e.g., PRAC)" },
            { name: "member_status_code", description: "Code for membership status" },
            { name: "credential_type", description: "Credential type (Lawyer)" }
          ] as AttributeDef[],
          isPredefined: true,
          ecosystem: "BC Ecosystem",
          interopProfile: "AIP 2.0", 
          compatibleWallets: ["BC Wallet"],
          walletRestricted: true,
          branding: brandingOverlay ? {
            logoUrl: brandingOverlay.logo,
            backgroundImage: brandingOverlay.background_image,
            primaryColor: brandingOverlay.primary_background_color,
            secondaryColor: brandingOverlay.secondary_background_color
          } : null,
          metaOverlay: metaOverlay ? {
            issuer: metaOverlay.issuer,
            issuerUrl: metaOverlay.issuer_url,
            description: metaOverlay.description
          } : null
        });
        console.log('BC Lawyer Credential v1 added with OCA branding');
      } catch (error) {
        console.error('Error fetching OCA bundle, adding credential without branding:', error);
        // Fallback to credential without branding
        await storage.createCredentialTemplate({
          label: "BC Lawyer Credential v1",
          version: "1.0",
          schemaId: "QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0",
          credDefId: "QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer",
          issuerDid: "did:indy:QzLYGuAebsy3MXQ6b1sFiT",
          schemaUrl: "https://bcgov.github.io/digital-trust-toolkit/docs/governance/justice/legal-professional/governance",
          attributes: [
            { name: "given_name", description: "Legal given name(s)" },
            { name: "surname", description: "Legal surname" },
            { name: "public_person_id", description: "Unique LSBC Public Person ID (PPID)" },
            { name: "member_status", description: "Current membership status (e.g., PRAC)" },
            { name: "member_status_code", description: "Code for membership status" },
            { name: "credential_type", description: "Credential type (Lawyer)" }
          ] as AttributeDef[],
          isPredefined: true,
          ecosystem: "BC Ecosystem",
          interopProfile: "AIP 2.0", 
          compatibleWallets: ["BC Wallet"],
          walletRestricted: true
        });
        console.log('BC Lawyer Credential v1 added without branding');
      }
    }
    
  } catch (error) {
    console.error('Error seeding credential templates:', error);
  }
})();
