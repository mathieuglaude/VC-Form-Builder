import ky from 'ky';

export interface ParsedMetadata {
  credentialName: string;
  issuerOrganization: string;
  issuerWebsite: string;
  description: string;
  schemas: SchemaReference[];
  credentialDefinitions: CredDefReference[];
  ocaBundleUrls: string[];
}

export interface SchemaReference {
  id: string;
  name: string;
  url: string;
  environment: 'test' | 'prod';
}

export interface CredDefReference {
  id: string;
  name: string;
  schemaId: string;
  environment: 'test' | 'prod';
}

export interface CANdySchemaData {
  schemaId: string;
  name: string;
  version: string;
  attributes: Array<{
    name: string;
    type: string;
    restrictions?: any;
  }>;
  issuerDid: string;
}

export interface CredentialDefinitionData {
  credDefId: string;
  schemaId: string;
  tag: string;
  issuerDid: string;
  isValid: boolean;
}

export class GovernanceParserService {
  private static readonly CANDY_TEST_API = 'https://candyscan.idlab.org/api/tx/CANDY_TEST';
  private static readonly CANDY_PROD_API = 'https://candyscan.idlab.org/api/tx/CANDY_PROD';
  
  async parseGovernanceDocument(url: string): Promise<ParsedMetadata> {
    try {
      console.log(`[GovernanceParser] Fetching governance document from: ${url}`);
      
      // Fetch the markdown content
      const response = await ky.get(url);
      const markdown = await response.text();
      
      console.log(`[GovernanceParser] Document fetched, length: ${markdown.length} chars`);
      
      // Parse the markdown content
      const metadata = this.extractMetadataFromMarkdown(markdown);
      
      console.log(`[GovernanceParser] Extracted metadata:`, {
        credentialName: metadata.credentialName,
        issuerOrganization: metadata.issuerOrganization,
        schemasFound: metadata.schemas.length,
        credDefsFound: metadata.credentialDefinitions.length
      });
      
      return metadata;
    } catch (error) {
      console.error('[GovernanceParser] Error parsing governance document:', error);
      throw new Error(`Failed to parse governance document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private extractMetadataFromMarkdown(markdown: string): ParsedMetadata {
    // Extract credential name (typically from first heading)
    const credentialName = this.extractCredentialName(markdown);
    
    // Extract issuer information
    const issuerOrganization = this.extractIssuerOrganization(markdown);
    const issuerWebsite = this.extractIssuerWebsite(markdown);
    
    // Extract description/overview
    const description = this.extractDescription(markdown);
    
    // Extract schema references
    const schemas = this.extractSchemaReferences(markdown);
    
    // Extract credential definition references
    const credentialDefinitions = this.extractCredDefReferences(markdown);
    
    // Extract OCA bundle URLs
    const ocaBundleUrls = this.extractOCABundleUrls(markdown);
    
    return {
      credentialName,
      issuerOrganization,
      issuerWebsite,
      description,
      schemas,
      credentialDefinitions,
      ocaBundleUrls
    };
  }
  
  private extractCredentialName(markdown: string): string {
    // Look for BC Government specific credential name patterns
    // Pattern 1: Table with "Credential:" row
    const credentialTableMatch = markdown.match(/\|\s*\*\*Credential:\*\*\s*\|\s*([^|]+)\s*\|/);
    if (credentialTableMatch) {
      return credentialTableMatch[1].trim();
    }
    
    // Pattern 2: Look for BC credential pattern in text
    const bcCredentialMatch = markdown.match(/BC\s+(\w+(?:\s+\w+)*)\s+Credential\s+v?\d+/i);
    if (bcCredentialMatch) {
      return `BC ${bcCredentialMatch[1]} Credential v1`;
    }
    
    // Pattern 3: Look for "Lawyer Credential" or similar in document
    const credentialMatch = markdown.match(/(\w+(?:\s+\w+)*)\s+Credential(?:\s+v?\d+)?/i);
    if (credentialMatch && credentialMatch[1]) {
      return credentialMatch[1].includes('BC') ? credentialMatch[0] : `BC ${credentialMatch[1]} Credential v1`;
    }
    
    // Pattern 4: Look for first H1 heading as fallback
    const h1Match = markdown.match(/^#\s+(.+?)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    return 'Unknown Credential';
  }
  
  private extractIssuerOrganization(markdown: string): string {
    // Look for BC Government specific issuer patterns
    // Pattern 1: Table with "Issuer:" row
    const issuerTableMatch = markdown.match(/\|\s*\*\*Issuer:\*\*\s*\|\s*([^|]+)\s*\|/);
    if (issuerTableMatch) {
      let issuer = issuerTableMatch[1].trim();
      // Remove HTML tags and markdown formatting
      issuer = issuer.replace(/<[^>]*>/g, '').replace(/\*\*?/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      return issuer;
    }
    
    // Pattern 2: Look for "Law Society of British Columbia" or similar
    const lsbcMatch = markdown.match(/Law Society of British Columbia[^<\n]*/i);
    if (lsbcMatch) {
      return lsbcMatch[0].trim();
    }
    
    // Pattern 3: Look for standard issuer patterns
    const patterns = [
      /issuer[:\s]+(.+?)(?:\n|<br>|$)/i,
      /issued by[:\s]+(.+?)(?:\n|<br>|$)/i,
      /organization[:\s]+(.+?)(?:\n|<br>|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        return match[1].trim().replace(/[*_`<>]/g, '');
      }
    }
    
    return '';
  }
  
  private extractIssuerWebsite(markdown: string): string {
    // Look for website links
    const websiteMatch = markdown.match(/website[:\s]*\[.*?\]\((https?:\/\/[^\)]+)\)/i) ||
                         markdown.match(/(https?:\/\/[^\s\)]+\.(?:gov|org|com)[^\s\)]*)/);
    
    if (websiteMatch) {
      return websiteMatch[1] || websiteMatch[0];
    }
    
    return '';
  }
  
  private extractDescription(markdown: string): string {
    // Look for first meaningful paragraph after title/headers
    const lines = markdown.split('\n');
    let description = '';
    let foundContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, headers, and HTML tags
      if (!line || line.startsWith('#') || line.startsWith('<') || line.startsWith('<!--')) {
        continue;
      }
      
      // Found meaningful content
      if (!foundContent && line.length > 50) {
        foundContent = true;
        description = line;
        
        // Try to get the complete paragraph
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (!nextLine || nextLine.startsWith('#') || nextLine.startsWith('<')) {
            break;
          }
          description += ' ' + nextLine;
        }
        break;
      }
    }
    
    if (description) {
      // Clean up markdown formatting and HTML
      description = description
        .replace(/\*\*?([^*]+)\*\*?/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      
      return description.substring(0, 500);
    }
    
    return 'No description available';
  }
  
  private extractSchemaReferences(markdown: string): SchemaReference[] {
    const schemas: SchemaReference[] = [];
    
    // Look specifically for section 5.3 Schema Implementation
    const schemaSection = this.extractSection(markdown, '5.3', 'Schema Implementation');
    
    if (schemaSection) {
      // Look for CANdy scan URLs in the schema section only
      const candyUrls = schemaSection.match(/https:\/\/candyscan\.idlab\.org\/tx\/(CANDY_(?:TEST|PROD))\/domain\/(\d+)/g);
      
      if (candyUrls) {
        candyUrls.forEach((url, index) => {
          const match = url.match(/https:\/\/candyscan\.idlab\.org\/tx\/(CANDY_(?:TEST|PROD))\/domain\/(\d+)/);
          if (match) {
            const environment = match[1].includes('TEST') ? 'test' : 'prod';
            const domainId = match[2];
            
            // Try to extract schema name from context
            const lines = schemaSection.split('\n');
            let schemaName = `Legal Professional Schema (${environment.toUpperCase()})`;
            
            // Look for schema name in the same context as the URL
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(url)) {
                // Check previous and next lines for schema name
                for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 4); j++) {
                  const line = lines[j].trim();
                  if (line.includes('Schema') && !line.includes('http') && line.length < 100) {
                    const nameMatch = line.match(/([^|]*Schema[^|]*)/i);
                    if (nameMatch) {
                      schemaName = nameMatch[1].trim().replace(/\*\*/g, '');
                      break;
                    }
                  }
                }
                break;
              }
            }
            
            schemas.push({
              id: `${match[1]}:${domainId}`,
              name: schemaName,
              url: url,
              environment: environment as 'test' | 'prod'
            });
          }
        });
      }
    }
    
    return schemas;
  }
  
  private extractCredDefReferences(markdown: string): CredDefReference[] {
    const credDefs: CredDefReference[] = [];
    
    // Look specifically for section 5.4 Credential Implementation
    const credDefSection = this.extractSection(markdown, '5.4', 'Credential Implementation');
    
    if (credDefSection) {
      // Look for AnonCreds credential definition patterns in section 5.4
      const credDefIdPattern = /([A-Za-z0-9]+:[A-Za-z0-9]+:[A-Za-z0-9]+:[A-Za-z0-9\-_.]+:[A-Za-z0-9\-_.]+)/g;
      const matches = credDefSection.match(credDefIdPattern);
      
      if (matches) {
        matches.forEach((credDefId, index) => {
          // Skip if it looks like a schema ID (has 'legal-professional' or similar)
          if (credDefId.includes('legal-professional') && credDefId.split(':').length === 5) {
            return; // This is likely a schema ID, not a credential definition
          }
          
          // Determine environment from the credential definition ID
          const environment = credDefId.includes('test') || credDefId.includes('TEST') ? 'test' : 'prod';
          
          // Try to extract credential definition name from context
          const lines = credDefSection.split('\n');
          let credDefName = `Legal Professional Credential Definition (${environment.toUpperCase()})`;
          
          // Look for credential definition name in the same context
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(credDefId)) {
              // Check previous and next lines for credential definition name
              for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 4); j++) {
                const line = lines[j].trim();
                if ((line.includes('Credential Definition') || line.includes('Cred Def')) && !line.includes(credDefId) && line.length < 100) {
                  const nameMatch = line.match(/([^|]*Credential Definition[^|]*)/i) || line.match(/([^|]*Cred Def[^|]*)/i);
                  if (nameMatch) {
                    credDefName = nameMatch[1].trim().replace(/\*\*/g, '');
                    break;
                  }
                }
              }
              break;
            }
          }
          
          credDefs.push({
            id: credDefId.trim(),
            name: credDefName,
            schemaId: '', // Will be determined by looking up related schema
            environment: environment as 'test' | 'prod'
          });
        });
      }
    }
    
    return credDefs;
  }
  
  private extractSection(markdown: string, sectionNumber: string, sectionTitle: string): string | null {
    // Create flexible patterns to match section headers
    const patterns = [
      new RegExp(`###\\s*${sectionNumber}\\s+${sectionTitle}\\s*\\n([\\s\\S]*?)(?=###|##|$)`, 'i'),
      new RegExp(`##\\s*${sectionNumber}\\s+${sectionTitle}\\s*\\n([\\s\\S]*?)(?=###|##|$)`, 'i'),
      new RegExp(`#\\s*${sectionNumber}\\s+${sectionTitle}\\s*\\n([\\s\\S]*?)(?=###|##|#|$)`, 'i'),
      new RegExp(`${sectionNumber}\\s+${sectionTitle}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n\\d+\\.\\d+|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Fallback: look for the section title without strict formatting
    const titlePattern = new RegExp(`${sectionTitle}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n[A-Za-z0-9]+\\.|$)`, 'i');
    const titleMatch = markdown.match(titlePattern);
    if (titleMatch && titleMatch[1] && titleMatch[1].length > 100) {
      return titleMatch[1].trim();
    }
    
    return null;
  }
  
  private extractOCABundleUrls(markdown: string): string[] {
    const urls: string[] = [];
    
    // Look for OCA bundle GitHub URLs
    const ocaUrls = markdown.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/tree\/[^\/]+\/OCABundles\/[^\s\)]+/g);
    
    if (ocaUrls) {
      urls.push(...ocaUrls);
    }
    
    // Remove duplicates
    const uniqueUrls: string[] = [];
    urls.forEach(url => {
      if (uniqueUrls.indexOf(url) === -1) {
        uniqueUrls.push(url);
      }
    });
    
    return uniqueUrls;
  }
  
  async fetchCANdySchemaData(schemaId: string): Promise<CANdySchemaData> {
    try {
      const isTest = schemaId.includes('CANDY_TEST');
      const apiBase = isTest ? GovernanceParserService.CANDY_TEST_API : GovernanceParserService.CANDY_PROD_API;
      
      // Extract domain ID from schema ID
      const domainMatch = schemaId.match(/(\d+)$/);
      if (!domainMatch) {
        throw new Error('Invalid schema ID format');
      }
      
      const domainId = domainMatch[1];
      const url = `${apiBase}/domain/${domainId}`;
      
      console.log(`[GovernanceParser] Fetching schema data from: ${url}`);
      
      const response = await ky.get(url);
      const data = await response.json() as any;
      
      // Extract schema information from CANdy response
      const schemaData: CANdySchemaData = {
        schemaId: schemaId,
        name: data.txn?.data?.data?.name || 'Unknown Schema',
        version: data.txn?.data?.data?.version || '1.0',
        attributes: this.parseSchemaAttributes(data.txn?.data?.data?.attr_names || []),
        issuerDid: data.txn?.metadata?.from || 'Unknown DID'
      };
      
      console.log(`[GovernanceParser] Schema data retrieved:`, {
        name: schemaData.name,
        version: schemaData.version,
        attributeCount: schemaData.attributes.length
      });
      
      return schemaData;
    } catch (error) {
      console.error('[GovernanceParser] Error fetching CANdy schema data:', error);
      throw new Error(`Failed to fetch schema data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private parseSchemaAttributes(attrNames: string[]): Array<{name: string, type: string}> {
    return attrNames.map(name => ({
      name: name,
      type: 'string' // CANdy schemas typically use string types
    }));
  }
  
  async validateCredentialDefinition(credDefId: string, schemaId: string): Promise<CredentialDefinitionData> {
    try {
      console.log(`[GovernanceParser] Validating credential definition: ${credDefId} against schema: ${schemaId}`);
      
      // For now, return a mock validation
      // In a real implementation, this would query the blockchain
      const isValid = credDefId.includes(schemaId.split(':')[0]); // Basic validation
      
      return {
        credDefId,
        schemaId,
        tag: 'default',
        issuerDid: 'did:example:issuer',
        isValid
      };
    } catch (error) {
      console.error('[GovernanceParser] Error validating credential definition:', error);
      throw new Error(`Failed to validate credential definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const governanceParserService = new GovernanceParserService();