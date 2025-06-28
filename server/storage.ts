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
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

    this.credentialTemplates.set(bcBusinessCard.id, bcBusinessCard);
    this.credentialTemplates.set(bcPersonCred.id, bcPersonCred);
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
    return config || undefined;
  }

  async getFormConfigBySlug(slug: string): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfigs).where(eq(formConfigs.slug, slug));
    return config || undefined;
  }

  async updateFormConfig(id: number, formConfig: Partial<InsertFormConfig>): Promise<FormConfig | undefined> {
    const [updated] = await db
      .update(formConfigs)
      .set(formConfig)
      .where(eq(formConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  async listFormConfigs(): Promise<FormConfig[]> {
    return await db.select().from(formConfigs);
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
    }
  } catch (error) {
    console.error('Error seeding credential templates:', error);
  }
})();
