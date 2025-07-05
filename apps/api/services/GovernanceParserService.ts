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
    // Look for first H1 heading
    const h1Match = markdown.match(/^#\s+(.+?)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    // Look for title in metadata section
    const titleMatch = markdown.match(/title:\s*["']?([^"'\n]+)["']?/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    return 'Unknown Credential';
  }
  
  private extractIssuerOrganization(markdown: string): string {
    // Look for issuer patterns in the document
    const patterns = [
      /issuer[:\s]+(.+?)(?:\n|$)/i,
      /issued by[:\s]+(.+?)(?:\n|$)/i,
      /organization[:\s]+(.+?)(?:\n|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        return match[1].trim().replace(/[*_`]/g, '');
      }
    }
    
    return 'Unknown Issuer';
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
    // Look for overview or description section
    const overviewMatch = markdown.match(/##\s*(?:overview|description|about)\s*\n\n?(.*?)(?=##|\n\n|$)/i);
    if (overviewMatch) {
      return overviewMatch[1].trim().replace(/[*_`]/g, '').substring(0, 500);
    }
    
    // Fallback to first paragraph
    const firstParagraph = markdown.split('\n\n')[1];
    if (firstParagraph && !firstParagraph.startsWith('#')) {
      return firstParagraph.trim().replace(/[*_`]/g, '').substring(0, 500);
    }
    
    return 'No description available';
  }
  
  private extractSchemaReferences(markdown: string): SchemaReference[] {
    const schemas: SchemaReference[] = [];
    
    // Look for CANdy scan URLs
    const candyUrls = markdown.match(/https:\/\/candyscan\.idlab\.org\/tx\/(CANDY_(?:TEST|PROD))\/domain\/(\d+)/g);
    
    if (candyUrls) {
      candyUrls.forEach((url, index) => {
        const match = url.match(/https:\/\/candyscan\.idlab\.org\/tx\/(CANDY_(?:TEST|PROD))\/domain\/(\d+)/);
        if (match) {
          const environment = match[1].includes('TEST') ? 'test' : 'prod';
          const domainId = match[2];
          
          schemas.push({
            id: `${match[1]}:${domainId}`,
            name: `Schema ${index + 1} (${environment.toUpperCase()})`,
            url: url,
            environment: environment as 'test' | 'prod'
          });
        }
      });
    }
    
    return schemas;
  }
  
  private extractCredDefReferences(markdown: string): CredDefReference[] {
    const credDefs: CredDefReference[] = [];
    
    // Look for credential definition patterns
    const credDefPatterns = [
      /credential definition[:\s]*([A-Za-z0-9:.-]+)/gi,
      /cred def[:\s]*([A-Za-z0-9:.-]+)/gi
    ];
    
    credDefPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(markdown)) !== null) {
        if (match[1] && match[1].includes(':')) {
          credDefs.push({
            id: match[1].trim(),
            name: `Credential Definition ${credDefs.length + 1}`,
            schemaId: '', // Will be determined later
            environment: match[1].includes('TEST') ? 'test' : 'prod'
          });
        }
      }
    });
    
    return credDefs;
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