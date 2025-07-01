import { RestClient } from '../rest-client';

export class OrbitClient extends RestClient {
  // Verifier API - for credential verification and proof requests
  verifier = {
    prepareUrl: (defId: string) =>
      this.sdk
        .post(`api/proof-request/prepare-url/${defId}`)
        .json<{ proofRequestId: string; qrCodePng: string }>(),

    status: (reqId: string) =>
      this.sdk
        .get(`api/proof-request/${reqId}`)
        .json<{ status: string; attributes?: any }>(),

    // Presentation-proof API methods
    sendProposal: (payload: any) =>
      this.sdk
        .post('api/present-proof/aip2/send-proposal', { json: payload })
        .json<{ presentationExchangeId: string; qrCodePng: string }>(),

    getRecord: (txId: string) =>
      this.sdk
        .get(`api/present-proof/aip2/records/${txId}`)
        .json<{ state: string; [key: string]: any }>()
  };

  // Issuer API - for credential creation and issuance
  issuer = {
    // Schema management
    createSchema: (payload: {
      name: string;
      version: string;
      attributes: string[];
    }) =>
      this.sdk
        .post('api/schemas', { json: payload })
        .json<{ schemaId: string; schema: any }>(),

    getSchema: (schemaId: string) =>
      this.sdk
        .get(`api/schemas/${schemaId}`)
        .json<{ schema: any }>(),

    // Credential definition management
    createCredDef: (payload: {
      schemaId: string;
      tag?: string;
      supportRevocation?: boolean;
    }) =>
      this.sdk
        .post('api/credential-definitions', { json: payload })
        .json<{ credentialDefinitionId: string; credentialDefinition: any }>(),

    getCredDef: (credDefId: string) =>
      this.sdk
        .get(`api/credential-definitions/${credDefId}`)
        .json<{ credentialDefinition: any }>(),

    // Credential issuance
    issueCredential: (payload: {
      credentialDefinitionId: string;
      attributes: Record<string, string>;
      connectionId?: string;
    }) =>
      this.sdk
        .post('api/issue-credential/send', { json: payload })
        .json<{ credentialExchangeId: string; state: string }>(),

    getIssuanceStatus: (credExId: string) =>
      this.sdk
        .get(`api/issue-credential/records/${credExId}`)
        .json<{ state: string; credentialExchange: any }>(),

    // Revocation (if supported)
    revokeCredential: (payload: {
      credentialExchangeId: string;
      revocationRegistryId: string;
      credentialRevocationId: string;
    }) =>
      this.sdk
        .post('api/revocation/revoke', { json: payload })
        .json<{ revoked: boolean }>()
  };

  // Connection management
  connections = {
    createInvitation: (payload?: { alias?: string; multiUse?: boolean }) =>
      this.sdk
        .post('api/connections/create-invitation', { json: payload || {} })
        .json<{ invitationUrl: string; invitation: any; connectionId: string }>(),

    getConnection: (connectionId: string) =>
      this.sdk
        .get(`api/connections/${connectionId}`)
        .json<{ state: string; connection: any }>(),

    listConnections: () =>
      this.sdk
        .get('api/connections')
        .json<{ results: any[] }>(),

    acceptInvitation: (invitationUrl: string) =>
      this.sdk
        .post('api/connections/receive-invitation', { 
          json: { invitationUrl } 
        })
        .json<{ connectionId: string; state: string }>()
  };

  // Wallet and agent management
  wallet = {
    getDid: () =>
      this.sdk
        .get('api/wallet/did/public')
        .json<{ did: string; verkey: string }>(),

    createDid: (payload?: { method?: string; seed?: string }) =>
      this.sdk
        .post('api/wallet/did/create', { json: payload || {} })
        .json<{ did: string; verkey: string }>(),

    assignPublicDid: (did: string) =>
      this.sdk
        .post(`api/wallet/did/public`, { json: { did } })
        .json<{ did: string; verkey: string }>()
  };
}