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

# Prepare URL for Proof Request (Without A Proof Definition ID)

ThePrepare URL for Proof Request (Without A Proof Definition ID) APIenables the LOB to receive a URL-based proof request, which can then be sent as an out-of-band proof request. This URL will be created based on the protocol specified. The client can determine how the URL is sent to the intended recipient of the proof request.

### The Prepare URL for Proof Request API is called to prepare a URL-based proof request

UUID received upon LOB registration

The protocol in which the message should be sent and is specified by the sender of the message

A unique identifier for the client credential proof. If not provided, a new UUID will be generated automatically.

Specifies whether the proof verification process should be performed automatically upon fetching the proof definition.

Flag indicating whether the claim is being created. Set to true to initiate the claim creation process.

List of credential attributes for which values are requested from the holder’s wallet

List of requested predicates (if applicable)

Provide a name for the proof request

Provide a purpose for the proof request

Proof Request format can be ANONCRED, JSONLD or OID4VC

To create request verification authority

```

POST /api/lob/{lob_id}/proof-request/url?connectionless=true HTTP/1.1
Host: 
api-key: YOUR_API_KEY
Content-Type: application/json
Accept: */*
Content-Length: 786

{
  "messageProtocol": "AIP2_0",
  "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
  "proofAutoVerify": false,
  "createClaim": false,
  "requestedAttributes": [
    {
      "attributes": [
        "name",
        "description",
        "assessorLevel",
        "assessmentLevel"
      ],
      "proofValidTill": "2025-06-18T14:17:46.192Z",
      "proofValidFrom": "2025-06-18T14:17:46.192Z",
      "restrictions": [
        {
          "schemaId": 1,
          "credentialId": 1,
          "type": [
            "ConformityAttestation",
            "Party",
            "IdentifierScheme",
            "BinaryFile"
          ]
        }
      ]
    }
  ],
  "requestedPredicates": [
    {
      "attributeName": "age",
      "pType": "<",
      "pValue": 0,
      "proofValidTill": "2025-06-18T14:17:46.193Z",
      "proofValidFrom": "2025-06-18T14:17:46.193Z",
      "restrictions": [
        {
          "schemaId": 1,
          "credentialId": 1
        }
      ]
    }
  ],
  "proofName": "bcovrin proof define",
  "proofPurpose": "for verify anoncreds credential",
  "proofCredFormat": "ANONCREDS",
  "addVerificationAuthority": false
}

```

```

{
  "success": true,
  "message": "prepare qr proof request proceed successfully.",
  "data": {
    "shortUrl": "http://localhost:5001/url/3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "longUrl": "http://localhost:9001?VRBd056YzJPREkwTkRJd05URTVPVFV3TnpZd09UVTBNelU1TXpVMk5UQTFNRGd4TXpFMk1ESTFPVFkwTlRZd09ETTJOemN6TkRnNE1EUTVOREkwTWpNMk5UYzVPREV4TlRBM01qa3hOelU1TWpFeE5URXdOellpWFYxOUxDQWlibTl1WTJVaU9pQWlPRGt5TlRjNU1UTTVNemMxTWpVeE1qQXpNell5TXpBNEluMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa3R0cXJuQWVxSDl6SENid0RoS0Jab0FucWNKOXczb2tQeXdtOUcyS3l5Sm9iI3o2TWt0dHFybkFlcUg5ekhDYndEaEtCWm9BbnFjSjl3M29rUHl3bTlHMkt5eUpvYiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly91bmRlZmluZWQ6OTAwMSJ9XX0=",
    "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
    "proofStatus": "generated"
  }
}

```