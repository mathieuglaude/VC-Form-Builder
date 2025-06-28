import { 
  users, 
  formConfigs, 
  formSubmissions, 
  credentialDefinitions,
  type User, 
  type InsertUser,
  type FormConfig,
  type InsertFormConfig,
  type FormSubmission,
  type InsertFormSubmission,
  type CredentialDefinition,
  type InsertCredentialDefinition,
  type CredentialTemplate,
  type InsertCredentialTemplate
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Form config methods
  createFormConfig(formConfig: InsertFormConfig): Promise<FormConfig>;
  getFormConfig(id: number): Promise<FormConfig | undefined>;
  getFormConfigBySlug(slug: string): Promise<FormConfig | undefined>;
  updateFormConfig(id: number, formConfig: Partial<InsertFormConfig>): Promise<FormConfig | undefined>;
  listFormConfigs(): Promise<FormConfig[]>;

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
    const employmentCred: CredentialDefinition = {
      id: this.currentCredDefId++,
      credentialType: "Employment Credential",
      issuerDid: "did:example:company123",
      attributes: [
        { name: "employeeId", type: "string", description: "Employee ID" },
        { name: "companyEmail", type: "string", description: "Company Email" },
        { name: "jobTitle", type: "string", description: "Job Title" },
        { name: "department", type: "string", description: "Department" },
        { name: "startDate", type: "date", description: "Start Date" }
      ],
      createdAt: new Date()
    };

    const identityCred: CredentialDefinition = {
      id: this.currentCredDefId++,
      credentialType: "Identity Credential",
      issuerDid: "did:example:government",
      attributes: [
        { name: "fullName", type: "string", description: "Full Name" },
        { name: "dateOfBirth", type: "date", description: "Date of Birth" },
        { name: "nationalId", type: "string", description: "National ID" },
        { name: "address", type: "string", description: "Address" }
      ],
      createdAt: new Date()
    };

    this.credentialDefinitions.set(employmentCred.id, employmentCred);
    this.credentialDefinitions.set(identityCred.id, identityCred);
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
      proofRequests: formConfig.proofRequests || [],
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

  async listFormConfigs(): Promise<FormConfig[]> {
    return Array.from(this.formConfigs.values());
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
      version: '1.0',
      schemaId: 'M6M4n:2:DigitalBusinessCard:1.0', // TODO: Replace with actual schema ID
      credDefId: 'M6M4n:3:CL:12345:tag', // TODO: Replace with actual cred def ID
      issuerDid: 'did:sov:M6M4n', // TODO: Replace with actual issuer DID
      schemaUrl: 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/business/digital-business-card-v1/',
      attributes: [
        { name: 'business_legal_name', description: 'Legal name of the business' },
        { name: 'business_number', description: 'Business registration number' },
        { name: 'incorporation_number', description: 'Incorporation number' },
        { name: 'jurisdiction', description: 'Jurisdiction of incorporation' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bcPersonCred: CredentialTemplate = {
      id: this.currentTemplateId++,
      label: 'BC Person Credential v1',
      version: '1.0',
      schemaId: 'M6M4n:2:PersonCredential:1.0', // TODO: Replace with actual schema ID
      credDefId: 'M6M4n:3:CL:67890:tag', // TODO: Replace with actual cred def ID
      issuerDid: 'did:sov:M6M4n', // TODO: Replace with actual issuer DID
      schemaUrl: 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/person/person-cred-doc/',
      attributes: [
        { name: 'given_names', description: 'Given names of the person' },
        { name: 'family_name', description: 'Family name of the person' },
        { name: 'birth_date', description: 'Date of birth' },
        { name: 'person_identifier', description: 'Unique person identifier' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.credentialTemplates.set(bcBusinessCard.id, bcBusinessCard);
    this.credentialTemplates.set(bcPersonCred.id, bcPersonCred);
  }

  async createCredentialTemplate(template: InsertCredentialTemplate): Promise<CredentialTemplate> {
    const id = this.currentTemplateId++;
    const now = new Date();
    const credentialTemplate: CredentialTemplate = {
      id,
      ...template,
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

    const updated: CredentialTemplate = {
      ...existing,
      ...template,
      updatedAt: new Date(),
    };
    this.credentialTemplates.set(id, updated);
    return updated;
  }

  async deleteCredentialTemplate(id: number): Promise<boolean> {
    return this.credentialTemplates.delete(id);
  }
}

export const storage = new MemStorage();
