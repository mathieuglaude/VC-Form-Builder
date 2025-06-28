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
  type InsertCredentialDefinition
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private formConfigs: Map<number, FormConfig>;
  private formSubmissions: Map<number, FormSubmission>;
  private credentialDefinitions: Map<number, CredentialDefinition>;
  private currentUserId: number;
  private currentFormConfigId: number;
  private currentSubmissionId: number;
  private currentCredDefId: number;

  constructor() {
    this.users = new Map();
    this.formConfigs = new Map();
    this.formSubmissions = new Map();
    this.credentialDefinitions = new Map();
    this.currentUserId = 1;
    this.currentFormConfigId = 1;
    this.currentSubmissionId = 1;
    this.currentCredDefId = 1;

    // Seed some credential definitions
    this.seedCredentialDefinitions();
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
}

export const storage = new MemStorage();
