- Orbit Enterprise API

- OverviewWhat are Rest APIs?What are GET & POST Methods?What is a Socket?What is a Line of Business?How do I integrate Orbit Enterprise APIs into my project?

- API ModulesLOB APIRegister LOBCreate LOBUpdate Trust Registry DetailsEndpointsTesting the LOB APIRegisterSocket APIRegister SocketSetup Sockets In PostmanEmit Socket EventTerminate SocketEndpointsTesting Register Socket APICredential Management APICreate Schema DraftRegister Draft SchemaCreate Credential DefinitionRetrieve A SchemaRetrieve All SchemasRetrieve A Credential DefinitionRetrieve All Credential DefinitionsImport An External SchemaImport An External Credential DefinitionEndpointsTesting the Credential Management APIConnection APIPrepare URL for Connection InvitationSend Out-of-Band Connection InvitationSend DID-Exchange Connection InvitationRetrieve All Pending Connection InvitationsDelete A Pending Connection InvitationRetrieve Out-of-Band Connection Invitation DetailsAccept Connection InvitationRetrieve A ContactRetrieve All ContactsDelete A ContactEndpointsTesting the Connection APIHolder APIRetrieve Out-of-Band Message DetailsRetrieve All Credential OffersAccept or Decline Credential OfferDelete A Credential OfferStore A CredentialRetrieve All Stored CredentialsDelete A Stored CredentialRetrieve All Proof RequestsDecline A Proof RequestRetrieve Matching Credentials for A Proof RequestSend Credential PresentationDelete A Proof RequestEndpointsTesting the Holder APIVerifier APIDefine Proof RequestRetrieve All Defined ProofsSend Out-of-Band Proof RequestPrepare URL for Proof RequestSend Proof Request to A ContactSend Out-of-Band Proof Request (Without A Proof Definition ID)Prepare URL for Proof Request (Without A Proof Definition ID)Send Proof Request To A Contact (Without A Proof Definition ID)Retrieve Status of A Proof RequestRetrieve Status of All Proof RequestsVerify A Credential PresentationDelete Proof RequestEndpointsTesting the Verifier APIIssuer APISend Credential Offer To ContactSend Out-of-Band Credential OfferPrepare URL for Credential OfferRetrieve All Pending Credential OffersIssue A CredentialRetrieve Status of Offered CredentialRevoke An Issued CredentialEndpointsTesting the Issuer API

- Chat APISend A MessageGet All Messages From A ContactMark A Message As ReadGet All Messages From All ContactsEndpointsTesting The Chat API

- Additional InformationHTTP CodesSupported LedgersTaxonomyMigrating from Test to ProdDeployment and Security

- Use Case EXAMPLESVerifier Web Application Interacts With Mobile WalletVerifier Mobile Application Interacts With Mobile Wallet

- What are Rest APIs?

- What are GET & POST Methods?

- What is a Socket?

- What is a Line of Business?

- How do I integrate Orbit Enterprise APIs into my project?

- LOB APIRegister LOBCreate LOBUpdate Trust Registry DetailsEndpointsTesting the LOB API

- RegisterSocket APIRegister SocketSetup Sockets In PostmanEmit Socket EventTerminate SocketEndpointsTesting Register Socket API

- Credential Management APICreate Schema DraftRegister Draft SchemaCreate Credential DefinitionRetrieve A SchemaRetrieve All SchemasRetrieve A Credential DefinitionRetrieve All Credential DefinitionsImport An External SchemaImport An External Credential DefinitionEndpointsTesting the Credential Management API

- Connection APIPrepare URL for Connection InvitationSend Out-of-Band Connection InvitationSend DID-Exchange Connection InvitationRetrieve All Pending Connection InvitationsDelete A Pending Connection InvitationRetrieve Out-of-Band Connection Invitation DetailsAccept Connection InvitationRetrieve A ContactRetrieve All ContactsDelete A ContactEndpointsTesting the Connection API

- Holder APIRetrieve Out-of-Band Message DetailsRetrieve All Credential OffersAccept or Decline Credential OfferDelete A Credential OfferStore A CredentialRetrieve All Stored CredentialsDelete A Stored CredentialRetrieve All Proof RequestsDecline A Proof RequestRetrieve Matching Credentials for A Proof RequestSend Credential PresentationDelete A Proof RequestEndpointsTesting the Holder API

- Verifier APIDefine Proof RequestRetrieve All Defined ProofsSend Out-of-Band Proof RequestPrepare URL for Proof RequestSend Proof Request to A ContactSend Out-of-Band Proof Request (Without A Proof Definition ID)Prepare URL for Proof Request (Without A Proof Definition ID)Send Proof Request To A Contact (Without A Proof Definition ID)Retrieve Status of A Proof RequestRetrieve Status of All Proof RequestsVerify A Credential PresentationDelete Proof RequestEndpointsTesting the Verifier API

- Issuer APISend Credential Offer To ContactSend Out-of-Band Credential OfferPrepare URL for Credential OfferRetrieve All Pending Credential OffersIssue A CredentialRetrieve Status of Offered CredentialRevoke An Issued CredentialEndpointsTesting the Issuer API

- Register LOB

- Create LOB

- Update Trust Registry Details

- Endpoints

- Testing the LOB API

- Register Socket

- Setup Sockets In Postman

- Emit Socket Event

- Terminate Socket

- Endpoints

- Testing Register Socket API

- Create Schema Draft

- Register Draft Schema

- Create Credential Definition

- Retrieve A Schema

- Retrieve All Schemas

- Retrieve A Credential Definition

- Retrieve All Credential Definitions

- Import An External Schema

- Import An External Credential Definition

- Endpoints

- Testing the Credential Management API

- Prepare URL for Connection Invitation

- Send Out-of-Band Connection Invitation

- Send DID-Exchange Connection Invitation

- Retrieve All Pending Connection Invitations

- Delete A Pending Connection Invitation

- Retrieve Out-of-Band Connection Invitation Details

- Accept Connection Invitation

- Retrieve A Contact

- Retrieve All Contacts

- Delete A Contact

- Endpoints

- Testing the Connection API

- Retrieve Out-of-Band Message Details

- Retrieve All Credential Offers

- Accept or Decline Credential Offer

- Delete A Credential Offer

- Store A Credential

- Retrieve All Stored Credentials

- Delete A Stored Credential

- Retrieve All Proof Requests

- Decline A Proof Request

- Retrieve Matching Credentials for A Proof Request

- Send Credential Presentation

- Delete A Proof Request

- Endpoints

- Testing the Holder API

- Define Proof Request

- Retrieve All Defined Proofs

- Send Out-of-Band Proof Request

- Prepare URL for Proof Request

- Send Proof Request to A Contact

- Send Out-of-Band Proof Request (Without A Proof Definition ID)

- Prepare URL for Proof Request (Without A Proof Definition ID)

- Send Proof Request To A Contact (Without A Proof Definition ID)

- Retrieve Status of A Proof Request

- Retrieve Status of All Proof Requests

- Verify A Credential Presentation

- Delete Proof Request

- Endpoints

- Testing the Verifier API

- Send Credential Offer To Contact

- Send Out-of-Band Credential Offer

- Prepare URL for Credential Offer

- Retrieve All Pending Credential Offers

- Issue A Credential

- Retrieve Status of Offered Credential

- Revoke An Issued Credential

- Endpoints

- Testing the Issuer API

- Send A Message

- Get All Messages From A Contact

- Mark A Message As Read

- Get All Messages From All Contacts

- Endpoints

- Testing The Chat API

- HTTP Codes

- Supported Ledgers

- Taxonomy

- Migrating from Test to Prod

- Deployment and Security

- Verifier Web Application Interacts With Mobile Wallet

- Verifier Mobile Application Interacts With Mobile Wallet

# Delete Proof Request

TheDelete Proof Request APIenables the LOB to delete a stored proof request. All details associated with the proof request will be deleted, including all related states.

### The Delete Proof Request API is called to delete a stored proof request

UUID received upon LOB registration

The unique identifier of the proof request to be deleted.

```

DELETE /api/lob/{lob_id}/proof-request HTTP/1.1
Host: 
api-key: YOUR_API_KEY
Content-Type: application/json
Accept: */*
Content-Length: 54

{
  "credProofId": "58e02d58-a762-469e-84ba-882a47345775"
}

```

API request processed successfully

```

{
  "success": true,
  "message": "Proof request proceed successfully.",
  "data": {
    "responseDetails": "Proof request with id '1' has been deleted successfully.",
    "proofDefineId": 1,
    "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
    "proofStatus": "done"
  }
}

```