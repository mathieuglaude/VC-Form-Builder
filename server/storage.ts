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

    const personCred: CredentialDefinition = {
      id: this.currentCredDefId++,
      credentialType: "BC Person Credential",
      issuerDid: "did:bcgov:person-issuer",
      attributes: [
        { name: "given_names", type: "string", description: "Given Names" },
        { name: "family_name", type: "string", description: "Family Name" },
        { name: "birthdate_dateint", type: "string", description: "Birth Date" },
        { name: "street_address", type: "string", description: "Street Address" },
        { name: "locality", type: "string", description: "City" },
        { name: "region", type: "string", description: "Province/State" },
        { name: "postal_code", type: "string", description: "Postal Code" },
        { name: "country", type: "string", description: "Country" },
        { name: "picture", type: "string", description: "Photo" },
        { name: "expiry_date_dateint", type: "string", description: "Expiry Date" }
      ],
      createdAt: new Date()
    };

    this.credentialDefinitions.set(employmentCred.id, employmentCred);
    this.credentialDefinitions.set(identityCred.id, identityCred);
    this.credentialDefinitions.set(personCred.id, personCred);
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
      createdAt: new Date('2023-10-25'),
      updatedAt: new Date('2023-10-25'),
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
      isPredefined: template.isPredefined || false,
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
