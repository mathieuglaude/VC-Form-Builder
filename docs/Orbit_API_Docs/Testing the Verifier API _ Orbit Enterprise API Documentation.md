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

- Pre-Requisites:

- Test Scenario 1: Use the details below to test defining a proof request

- Test Scenario 2: Use the details below to test sending an Out of Band Proof Request

- Test Scenario 3: Use the details below to test the generation of a Proof Request URL

- Test Scenario 4: Use the details below to test sending a proof request to a contact

- Test Scenario 5: Use the details below to test retrieving all proof requests

- Test Scenario 6: Use the details below to test retrieving a specific proof request using a Proof ID

- Test Scenario 7: Use the details below to test deleting a specific proof request using a Proof ID

- Test Scenario 8: Use the details below to retrieve all defined proof requests

- Test Scenario 9: Use the details below to verify the proof presentation received

- Objective: Verify the proof  presentation received

# Testing the Verifier API

### Pre-Requisites:

1. The NB Orbit Enterprise Verifier API has been downloaded in your system.

1. POSTMAN has been installed in your system

The NB Orbit Enterprise Verifier API has been downloaded in your system.

POSTMAN has been installed in your system

Environment Setup in Postman:

1. Create a Global Environment:Go toEnvironmentson the top right corner of Postman.Click onAdd.Name the environment (e.g., "Verifier API Environment").Add the following variables:baseUrl:https://testapi-verifier.nborbit.caapiKey: iLBFuTxf_FQcA2N4II8CjbgTQHhDPKwalobId: 40f2d2dd-3398-4ebc-b3a1-f250eb0f9b47

Create a Global Environment:

- Go toEnvironmentson the top right corner of Postman.

- Click onAdd.

- Name the environment (e.g., "Verifier API Environment").

- Add the following variables:baseUrl:https://testapi-verifier.nborbit.caapiKey: iLBFuTxf_FQcA2N4II8CjbgTQHhDPKwalobId: 40f2d2dd-3398-4ebc-b3a1-f250eb0f9b47

Go toEnvironmentson the top right corner of Postman.

Click onAdd.

Name the environment (e.g., "Verifier API Environment").

Add the following variables:

- baseUrl:https://testapi-verifier.nborbit.ca

- apiKey: iLBFuTxf_FQcA2N4II8CjbgTQHhDPKwa

- lobId: 40f2d2dd-3398-4ebc-b3a1-f250eb0f9b47

baseUrl:https://testapi-verifier.nborbit.ca

apiKey: iLBFuTxf_FQcA2N4II8CjbgTQHhDPKwa

lobId: 40f2d2dd-3398-4ebc-b3a1-f250eb0f9b47

### Test Scenario 1:Use the details below to test defining a proof request

Objective: Verify that proof requests can be defined

Testing Steps:

1. Create Request:

Create Request:

- Open Postman and create a new request.

- Name the request "Define Proof Request".

- Set the request type to POST.

- Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/define-proof-request.

Open Postman and create a new request.

Name the request "Define Proof Request".

Set the request type to POST.

Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/define-proof-request.

1. Add Authorization:

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

1. Add Request Body:
a.AnonCred

Add Request Body:
a.AnonCred

```

 {
        "requestedAttributes": [
            {
                "attributes": [
                    "first_name",
                    "last_name"
                    ],
                "restrictions": [
                 {
                 "schemaId": 70,
                 "credentialId": 55
                 }
                ]
                }
            ],
            "requestedPredicates": [
                            {
                            "attributeName": "dob",
                            "pType": "<",
                            "pValue": 20101111,
                            "proofValidTill": "2025-05-21T17:54:09.706Z",
                            "proofValidFrom": "2025-05-18T17:54:09.706Z",
                            "restrictions": [
                            {
                               "credentialId": 55,
                                "schemaId":70
                            }
                            ]
                            }
                            ],
            "proofName": "student name Pan verification",

            "proofPurpose": "for verify pan of a person",
            "proofCredFormat": "ANONCREDS"
    }

```

Detailed Breakdown:

- "ANONCREDS"

- Specifies that the proof must be generated using theAnonCredsformat (based on CL-signatures, Sovrin-based).

- This limits acceptable credentials to AnonCreds-based ones (not JSON-LD or other types).

"ANONCREDS"

Specifies that the proof must be generated using theAnonCredsformat (based on CL-signatures, Sovrin-based).

This limits acceptable credentials to AnonCreds-based ones (not JSON-LD or other types).

#### Predicates:

- requestedPredicatesThis section defines the predicates, which are conditions that apply to the attributes being requested. In this case, it requests theageattribute to satisfy the following condition:attributeName: "age"`: The attribute being used in the predicate is "age."**pType: "<": This defines the predicate type, which in this case is less than (<`), meaning that the holder needs to provide a value for age that is less than the specified threshold.pValue: 0: The condition is that the age value should be less than0(likely for testing or a specific use case).proofValidTillandproofValidFrom: Similar to the requested attributes, these fields define the validity period for the proof that must be met for the predicate condition.restrictions: Restrictions for the predicate are similar to those for attributes and are bound to the same schema and credential definitions.

requestedPredicatesThis section defines the predicates, which are conditions that apply to the attributes being requested. In this case, it requests theageattribute to satisfy the following condition:

- attributeName: "age"`: The attribute being used in the predicate is "age."

- **pType: "<": This defines the predicate type, which in this case is less than (<`), meaning that the holder needs to provide a value for age that is less than the specified threshold.

- pValue: 0: The condition is that the age value should be less than0(likely for testing or a specific use case).

- proofValidTillandproofValidFrom: Similar to the requested attributes, these fields define the validity period for the proof that must be met for the predicate condition.

- restrictions: Restrictions for the predicate are similar to those for attributes and are bound to the same schema and credential definitions.

attributeName: "age"`: The attribute being used in the predicate is "age."

**pType: "<": This defines the predicate type, which in this case is less than (<`), meaning that the holder needs to provide a value for age that is less than the specified threshold.

pValue: 0: The condition is that the age value should be less than0(likely for testing or a specific use case).

proofValidTillandproofValidFrom: Similar to the requested attributes, these fields define the validity period for the proof that must be met for the predicate condition.

restrictions: Restrictions for the predicate are similar to those for attributes and are bound to the same schema and credential definitions.

#### Proof Metadata:

- proofName:
This field defines the name of the proof request. The proof is named"bcovrin proof define", which likely corresponds to a specific framework or project (e.g., BCOVRIN).

- proofPurpose:
This field explains the purpose of the proof. In this case, it is"for verify anoncreds credential", indicating that the proof is used for verifying an anonymized credential.

- proofCredFormat:
This field specifies the format of the credential used for the proof. Here, it is"ANONCREDS", indicating that the proof will involve credentials issued in the ANONCREDS format, a widely used privacy-preserving credential format.

proofName:
This field defines the name of the proof request. The proof is named"bcovrin proof define", which likely corresponds to a specific framework or project (e.g., BCOVRIN).

proofPurpose:
This field explains the purpose of the proof. In this case, it is"for verify anoncreds credential", indicating that the proof is used for verifying an anonymized credential.

proofCredFormat:
This field specifies the format of the credential used for the proof. Here, it is"ANONCREDS", indicating that the proof will involve credentials issued in the ANONCREDS format, a widely used privacy-preserving credential format.

b. JSON-LD

```

{
        "requestedAttributes": [
            {
                "attributes": [
                "familyName",
                "givenName",
                "address.streetAddress",
                "address.postalAddress"
                ],
                "proofValidTill": "2025-05-21T12:33:22.196Z",
                 "proofValidFrom": "2025-05-20T12:33:22.196Z",
                "restrictions": [
                 {
                 "schemaId": 71,
                 "credentialId":56,
                 "type": [
                    "PersonalDetail",
                    "AddressInfo"
                  ]
                 }
                ]
                }
            ],
            "requestedPredicates": [],
            "proofName": "nested json ld proof define",
        "proofPurpose": "for verify jsonld credential proof",
        "proofCredFormat": "JSONLD"
    }
    

```

Detailed Breakdown:

Includes one object with:

- attributes:"familyName"– last name of the person"givenName"– first name of the person"address.streetAddress"– street address (nested underaddress)"address.postalAddress"– postal code (nested underaddress)These fields arenested, indicating the credential structure follows ahierarchical schema.

- proofValidFrom/proofValidTill:Validity period of the proof request:From:May 20, 2025To:May 21, 2025The holder can only present this proof during this window.

- restrictions:Credential must satisfy the following:schemaId:71— The credential must conform to schema ID 71.credentialId:56— Only a specific credential issued under this ID can be used.type:[ "PersonalDetail", "AddressInfo" ]— The credential must be of thesetypes, suggesting it uses a JSON-LD@typefield for semantic modeling. This ensures the right class of credential is being referenced.requestedPredicates:[]Empty list — No predicate (e.g., age checks or greater-than/less-than rules) is being requested.This is apure disclosure proof(revealing the actual values of selected fields), without any ZKP-based conditions.proofName"nested json ld proof define"A descriptive label that tells the verifier and the holder what the proof is for.Here, it’s toverify nested attributesin aJSON-LD credential.proofPurpose"for verify jsonld credential proof"Business or legal rationale for requesting this proof.It helps ensure transparency in what the verifier is trying to achieve — likely aKYC or identity check.proofCredFormat"JSONLD"This explicitly defines that the credential proof must follow theJSON-LD verifiable credentialformat.Unlike AnonCreds, JSON-LD proofs uselinked data signatures(like BBS+), supporting selective disclosure with context-based validation.

attributes:

- "familyName"– last name of the person

- "givenName"– first name of the person

- "address.streetAddress"– street address (nested underaddress)

- "address.postalAddress"– postal code (nested underaddress)

- These fields arenested, indicating the credential structure follows ahierarchical schema.

"familyName"– last name of the person

"givenName"– first name of the person

"address.streetAddress"– street address (nested underaddress)

"address.postalAddress"– postal code (nested underaddress)

These fields arenested, indicating the credential structure follows ahierarchical schema.

proofValidFrom/proofValidTill:

- Validity period of the proof request:From:May 20, 2025To:May 21, 2025

- The holder can only present this proof during this window.

Validity period of the proof request:

- From:May 20, 2025

- To:May 21, 2025

From:May 20, 2025

To:May 21, 2025

The holder can only present this proof during this window.

restrictions:

- Credential must satisfy the following:schemaId:71— The credential must conform to schema ID 71.credentialId:56— Only a specific credential issued under this ID can be used.type:[ "PersonalDetail", "AddressInfo" ]— The credential must be of thesetypes, suggesting it uses a JSON-LD@typefield for semantic modeling. This ensures the right class of credential is being referenced.

- requestedPredicates:[]Empty list — No predicate (e.g., age checks or greater-than/less-than rules) is being requested.This is apure disclosure proof(revealing the actual values of selected fields), without any ZKP-based conditions.

- proofName"nested json ld proof define"A descriptive label that tells the verifier and the holder what the proof is for.Here, it’s toverify nested attributesin aJSON-LD credential.

- proofPurpose"for verify jsonld credential proof"Business or legal rationale for requesting this proof.It helps ensure transparency in what the verifier is trying to achieve — likely aKYC or identity check.

- proofCredFormat"JSONLD"This explicitly defines that the credential proof must follow theJSON-LD verifiable credentialformat.Unlike AnonCreds, JSON-LD proofs uselinked data signatures(like BBS+), supporting selective disclosure with context-based validation.

- 

Credential must satisfy the following:

- schemaId:71— The credential must conform to schema ID 71.

- credentialId:56— Only a specific credential issued under this ID can be used.

- type:[ "PersonalDetail", "AddressInfo" ]— The credential must be of thesetypes, suggesting it uses a JSON-LD@typefield for semantic modeling. This ensures the right class of credential is being referenced.

schemaId:71— The credential must conform to schema ID 71.

credentialId:56— Only a specific credential issued under this ID can be used.

type:[ "PersonalDetail", "AddressInfo" ]— The credential must be of thesetypes, suggesting it uses a JSON-LD@typefield for semantic modeling. This ensures the right class of credential is being referenced.

requestedPredicates:[]

- Empty list — No predicate (e.g., age checks or greater-than/less-than rules) is being requested.

- This is apure disclosure proof(revealing the actual values of selected fields), without any ZKP-based conditions.

Empty list — No predicate (e.g., age checks or greater-than/less-than rules) is being requested.

This is apure disclosure proof(revealing the actual values of selected fields), without any ZKP-based conditions.

proofName

- "nested json ld proof define"

- A descriptive label that tells the verifier and the holder what the proof is for.

- Here, it’s toverify nested attributesin aJSON-LD credential.

"nested json ld proof define"

A descriptive label that tells the verifier and the holder what the proof is for.

Here, it’s toverify nested attributesin aJSON-LD credential.

proofPurpose

- "for verify jsonld credential proof"

- Business or legal rationale for requesting this proof.

- It helps ensure transparency in what the verifier is trying to achieve — likely aKYC or identity check.

"for verify jsonld credential proof"

Business or legal rationale for requesting this proof.

It helps ensure transparency in what the verifier is trying to achieve — likely aKYC or identity check.

proofCredFormat

- "JSONLD"

- This explicitly defines that the credential proof must follow theJSON-LD verifiable credentialformat.

- Unlike AnonCreds, JSON-LD proofs uselinked data signatures(like BBS+), supporting selective disclosure with context-based validation.

"JSONLD"

This explicitly defines that the credential proof must follow theJSON-LD verifiable credentialformat.

Unlike AnonCreds, JSON-LD proofs uselinked data signatures(like BBS+), supporting selective disclosure with context-based validation.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully{ "success": true, "message": "ANONCREDS proof has been defined successfully.", "data": { "proofDefineId": 11 } }

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

- { "success": true, "message": "ANONCREDS proof has been defined successfully.", "data": { "proofDefineId": 11 } }

ClickSend.

Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

{ "success": true, "message": "ANONCREDS proof has been defined successfully.", "data": { "proofDefineId": 11 } }

Response Body:

```

{"success":true,"message":"ANONCREDS proof has been defined successfully.","data":{"proofDefineId":14}}

```

Detailed Breakdown :

success: true:

Thesuccess: truestatus indicates that the operation was executed successfully without any errors or exceptions.

"ANONCREDS proof has been defined successfully."):

This message provides a clear confirmation to the user or client that the specific action of defining an ANONCREDS proof has been successfully carried out.

"proofDefineId": 11):

The proofDefineId is a unique identifier assigned to the newly defined ANONCREDS proof.

### Test Scenario 2:Use the details below to test sending an Out of Band Proof Request

Objective: Verify that proof requests can be sent to an Out of Band Holder

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Send OOB Proof Request".Set the request type to POST.Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/send-oob.

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Add Request Body:

Create Request:

- Open Postman and create a new request.

- Name the request "Send OOB Proof Request".

- Set the request type to POST.

- Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/send-oob.

Open Postman and create a new request.

Name the request "Send OOB Proof Request".

Set the request type to POST.

Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/send-oob.

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Add Request Body:

```

{
                     "proofDefineId": 13,
                     "credProofId": "",
                     "recipientEmail": "verifier@getnada.com",
                     "proofAutoVerify": false,
                     "recipientName": "john"
                   }

```

- Detailed Breakdown
IproofDefineId:This is the identifier for the proof definition, which uniquely represents a specific proof request. In this case, theproofDefineIdis13. This ID is used to track and reference this particular proof request in the system.credProofId:This field is meant to store the ID of the credential proof, but in this case, it is empty (""). This might indicate that the proof has not yet been generated or linked to a credential, or it could simply be a placeholder for when the credential proof is created.recipientEmail:The email address of the recipient (the person who will receive the proof request). In this case, the recipient’s email is"verifier@getnada.com", which is where the proof request will be sent. This is an essential part of the communication process, ensuring that the correct person or entity receives the proof request.proofAutoVerify:This field indicates whether the proof will be automatically verified once the recipient provides it. It is set tofalse, meaning the proof will not be automatically verified. Instead, it may require manual verification or further processing before acceptance. This provides more control over the verification process, allowing for review or additional steps before finalizing the validation.recipientName:This represents the name of the recipient who is to receive the proof request. Here, the recipient's name is"john". This is typically used for personalization in the request or to identify the individual associated with the provided email.

Detailed Breakdown
I

- proofDefineId:This is the identifier for the proof definition, which uniquely represents a specific proof request. In this case, theproofDefineIdis13. This ID is used to track and reference this particular proof request in the system.

- credProofId:This field is meant to store the ID of the credential proof, but in this case, it is empty (""). This might indicate that the proof has not yet been generated or linked to a credential, or it could simply be a placeholder for when the credential proof is created.

- recipientEmail:The email address of the recipient (the person who will receive the proof request). In this case, the recipient’s email is"verifier@getnada.com", which is where the proof request will be sent. This is an essential part of the communication process, ensuring that the correct person or entity receives the proof request.

- proofAutoVerify:This field indicates whether the proof will be automatically verified once the recipient provides it. It is set tofalse, meaning the proof will not be automatically verified. Instead, it may require manual verification or further processing before acceptance. This provides more control over the verification process, allowing for review or additional steps before finalizing the validation.

- recipientName:This represents the name of the recipient who is to receive the proof request. Here, the recipient's name is"john". This is typically used for personalization in the request or to identify the individual associated with the provided email.

proofDefineId:

- This is the identifier for the proof definition, which uniquely represents a specific proof request. In this case, theproofDefineIdis13. This ID is used to track and reference this particular proof request in the system.

This is the identifier for the proof definition, which uniquely represents a specific proof request. In this case, theproofDefineIdis13. This ID is used to track and reference this particular proof request in the system.

credProofId:

- This field is meant to store the ID of the credential proof, but in this case, it is empty (""). This might indicate that the proof has not yet been generated or linked to a credential, or it could simply be a placeholder for when the credential proof is created.

This field is meant to store the ID of the credential proof, but in this case, it is empty (""). This might indicate that the proof has not yet been generated or linked to a credential, or it could simply be a placeholder for when the credential proof is created.

recipientEmail:

- The email address of the recipient (the person who will receive the proof request). In this case, the recipient’s email is"verifier@getnada.com", which is where the proof request will be sent. This is an essential part of the communication process, ensuring that the correct person or entity receives the proof request.

The email address of the recipient (the person who will receive the proof request). In this case, the recipient’s email is"verifier@getnada.com", which is where the proof request will be sent. This is an essential part of the communication process, ensuring that the correct person or entity receives the proof request.

proofAutoVerify:

- This field indicates whether the proof will be automatically verified once the recipient provides it. It is set tofalse, meaning the proof will not be automatically verified. Instead, it may require manual verification or further processing before acceptance. This provides more control over the verification process, allowing for review or additional steps before finalizing the validation.

This field indicates whether the proof will be automatically verified once the recipient provides it. It is set tofalse, meaning the proof will not be automatically verified. Instead, it may require manual verification or further processing before acceptance. This provides more control over the verification process, allowing for review or additional steps before finalizing the validation.

recipientName:

- This represents the name of the recipient who is to receive the proof request. Here, the recipient's name is"john". This is typically used for personalization in the request or to identify the individual associated with the provided email.

This represents the name of the recipient who is to receive the proof request. Here, the recipient's name is"john". This is typically used for personalization in the request or to identify the individual associated with the provided email.

1. Send Request:

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

ClickSend.

Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

Response Body

```

{
  "success": true,
  "message": "out-of-band proof request send successfully.",
  "data": {
    "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
    "proofDefineId": 1,
    "proofStatus": "request-sent"
  }
}

```

Detailed Breakdown

- success:This field indicates the success status of the operation. The valuetrueconfirms that the out-of-band proof request was sent successfully.

- message:This is a message providing more context about the operation. In this case, the message"out-of-band proof request send successfully."confirms that the proof request was successfully initiated and sent.

- data:Thedatafield contains additional details about the proof request that was sent. It includes:credProofId:This is the unique identifier for the credential proof associated with the request. In this case, thecredProofIdis"58e02d58-a762-469e-84ba-882a47345775". This ID will be used to reference the specific credential proof within the system.proofDefineId:This represents the ID of the proof definition associated with the proof request. In this case, theproofDefineIdis1, which uniquely identifies the type or template of proof request that has been sent.proofStatus:This field indicates the current status of the proof request. The value"request-sent"confirms that the proof request has been successfully sent, but the process is ongoing, and the request may still await further actions, such as receiving or verifying the proof.

success:

- This field indicates the success status of the operation. The valuetrueconfirms that the out-of-band proof request was sent successfully.

This field indicates the success status of the operation. The valuetrueconfirms that the out-of-band proof request was sent successfully.

message:

- This is a message providing more context about the operation. In this case, the message"out-of-band proof request send successfully."confirms that the proof request was successfully initiated and sent.

This is a message providing more context about the operation. In this case, the message"out-of-band proof request send successfully."confirms that the proof request was successfully initiated and sent.

data:

- Thedatafield contains additional details about the proof request that was sent. It includes:

- credProofId:This is the unique identifier for the credential proof associated with the request. In this case, thecredProofIdis"58e02d58-a762-469e-84ba-882a47345775". This ID will be used to reference the specific credential proof within the system.

- proofDefineId:This represents the ID of the proof definition associated with the proof request. In this case, theproofDefineIdis1, which uniquely identifies the type or template of proof request that has been sent.

- proofStatus:This field indicates the current status of the proof request. The value"request-sent"confirms that the proof request has been successfully sent, but the process is ongoing, and the request may still await further actions, such as receiving or verifying the proof.

Thedatafield contains additional details about the proof request that was sent. It includes:

credProofId:

- This is the unique identifier for the credential proof associated with the request. In this case, thecredProofIdis"58e02d58-a762-469e-84ba-882a47345775". This ID will be used to reference the specific credential proof within the system.

This is the unique identifier for the credential proof associated with the request. In this case, thecredProofIdis"58e02d58-a762-469e-84ba-882a47345775". This ID will be used to reference the specific credential proof within the system.

proofDefineId:

- This represents the ID of the proof definition associated with the proof request. In this case, theproofDefineIdis1, which uniquely identifies the type or template of proof request that has been sent.

This represents the ID of the proof definition associated with the proof request. In this case, theproofDefineIdis1, which uniquely identifies the type or template of proof request that has been sent.

proofStatus:

- This field indicates the current status of the proof request. The value"request-sent"confirms that the proof request has been successfully sent, but the process is ongoing, and the request may still await further actions, such as receiving or verifying the proof.

This field indicates the current status of the proof request. The value"request-sent"confirms that the proof request has been successfully sent, but the process is ongoing, and the request may still await further actions, such as receiving or verifying the proof.

### Test Scenario 3:Use the details below to test the generation of a Proof Request URL

Objective: Verify that proof request URL codes can be generated

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Prepare Proof Request URL".Set the request type to POST.Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/url

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Add Request Body:

Create Request:

- Open Postman and create a new request.

- Name the request "Prepare Proof Request URL".

- Set the request type to POST.

- Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/url

Open Postman and create a new request.

Name the request "Prepare Proof Request URL".

Set the request type to POST.

Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/url

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Add Request Body:

```

{
                     "proofDefineId": 13,
                     "credProofId": "",
                     "messageProtocol": "AIP2_0",
                     "proofAutoVerify": false     
                   }

```

Detailed Breakdown

- proofDefineId:This is the identifier for the proof definition. In this case, theproofDefineIdis13, indicating the specific template or configuration of the proof request.

- credProofId:This field is intended to hold the unique identifier for the credential proof associated with the request. However, in this case, thecredProofIdis an empty string (""), which suggests that no proof has been generated or linked yet.

- messageProtocol:This field specifies the message protocol used for the proof request. In this case, the value"AIP2_0"refers to a specific version of the protocol (AIP 2.0). AIP (Aries Interoperability Protocol) defines how credentials and proofs are exchanged between agents in a secure and standardized manner.

- proofAutoVerify:This boolean field indicates whether the proof should be automatically verified upon submission. The valuefalsesuggests that the proof will not be automatically verified, and manual verification will likely be required.

proofDefineId:

- This is the identifier for the proof definition. In this case, theproofDefineIdis13, indicating the specific template or configuration of the proof request.

This is the identifier for the proof definition. In this case, theproofDefineIdis13, indicating the specific template or configuration of the proof request.

credProofId:

- This field is intended to hold the unique identifier for the credential proof associated with the request. However, in this case, thecredProofIdis an empty string (""), which suggests that no proof has been generated or linked yet.

This field is intended to hold the unique identifier for the credential proof associated with the request. However, in this case, thecredProofIdis an empty string (""), which suggests that no proof has been generated or linked yet.

messageProtocol:

- This field specifies the message protocol used for the proof request. In this case, the value"AIP2_0"refers to a specific version of the protocol (AIP 2.0). AIP (Aries Interoperability Protocol) defines how credentials and proofs are exchanged between agents in a secure and standardized manner.

This field specifies the message protocol used for the proof request. In this case, the value"AIP2_0"refers to a specific version of the protocol (AIP 2.0). AIP (Aries Interoperability Protocol) defines how credentials and proofs are exchanged between agents in a secure and standardized manner.

proofAutoVerify:

- This boolean field indicates whether the proof should be automatically verified upon submission. The valuefalsesuggests that the proof will not be automatically verified, and manual verification will likely be required.

This boolean field indicates whether the proof should be automatically verified upon submission. The valuefalsesuggests that the proof will not be automatically verified, and manual verification will likely be required.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully{ "success": true, "message": "prepare qr proof request proceed successfully.", "data": { "proofDefineId": 13, "longUrl": "http://100.28.204.79:9007?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJhYjYxN2Y1ZS1kOGE1LTRkMTgtYTA5YS0xNWFkOGNiOGZkYTkiLCAibGFiZWwiOiAiTmV3VGVzdDcgQWdlbnQiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFtdLCAicmVxdWVzdHN-YXR0YWNoIjogW3siQGlkIjogInJlcXVlc3QtMCIsICJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsICJkYXRhIjogeyJqc29uIjogeyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwgIkBpZCI6ICI4NDA0YmNjYy03MDQzLTQ0NzYtYWY3OS00NGI3OGRjM2YxZTMiLCAifnRocmVhZCI6IHsicHRoaWQiOiAiYWI2MTdmNWUtZDhhNS00ZDE4LWEwOWEtMTVhZDhjYjhmZGE5In0sICJjb21tZW50IjogImZvciB2ZXJpZnkgYW5vbmNyZWQgY3JlZGVudGlhbCIsICJ3aWxsX2NvbmZpcm0iOiB0cnVlLCAiZm9ybWF0cyI6IFt7ImF0dGFjaF9pZCI6ICJpbmR5IiwgImZvcm1hdCI6ICJobGluZHkvcHJvb2YtcmVxQHYyLjAifV0sICJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjogW3siQGlkIjogImluZHkiLCAibWltZS10eXBlIjogImFwcGxpY2F0aW9uL2pzb24iLCAiZGF0YSI6IHsiYmFzZTY0IjogImV5SnVZVzFsSWpvZ0ltSmpiM1p5YVc0Z2NISnZiMllnWkdWbWFXNWxJaXdnSW01dmJtTmxJam9nSWpFaUxDQWljbVZ4ZFdWemRHVmtYMkYwZEhKcFluVjBaWE1pT2lCN0ltRmtaR2wwYVc5dVlXeFFjbTl3TVNJNklIc2ljbVZ6ZEhKcFkzUnBiMjV6SWpvZ1czc2lZM0psWkY5a1pXWmZhV1FpT2lBaVRqaEVSbkZyTjNkMlUyUmtObGhIUm1GeVIzQTFXRG96T2tOTU9qRTNORFUxTlRjNlJISnBkbWx1WjE5TWFXTmxibk5sWHpFaUxDQWlhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjlwWkNJNklDSk9PRVJHY1dzM2QzWlRaR1EyV0VkR1lYSkhjRFZZT2pJNlJISnBkbWx1WjE5c2FXTmxibk5sT2pJdU1DSXNJQ0p6WTJobGJXRmZhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjl1WVcxbElqb2dJa1J5YVhacGJtZGZiR2xqWlc1elpTSXNJQ0p6WTJobGJXRmZkbVZ5YzJsdmJpSTZJQ0l5TGpBaWZWMHNJQ0p1YjI1ZmNtVjJiMnRsWkNJNklIc2lkRzhpT2lBeE56STFNREk1TWprMmZTd2dJbTVoYldWeklqb2dXeUptZFd4c1gyNWhiV1VpWFgxOUxDQWljbVZ4ZFdWemRHVmtYM0J5WldScFkyRjBaWE1pT2lCN2ZTd2dJblpsY25OcGIyNGlPaUFpTVM0d0luMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa25idTZjTHBqZDhvaVFEaE5hblNVdXdFc3JrZUw5NjRUeXFBS1JYYzJIbVEyI3o2TWtuYnU2Y0xwamQ4b2lRRGhOYW5TVXV3RXNya2VMOTY0VHlxQUtSWGMySG1RMiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMDAuMjguMjA0Ljc5OjkwMDcifV19", "shortUrl": "https://devapi-verifier.nborbit.ca/url/7c204a3f-28ed-4656-8eda-7be899c26b56" } }Detailed Breakdown :success: true:Thesuccess: truestatus indicates that the operation was executed successfully without any errors or exceptions."prepare qr proof request proceed successfully.":
This message confirms to the user or client that the specific action of preparing a QR proof request has been successfully completed."proofDefineId": 13:
The proofDefineId is a unique identifier assigned to the newly created QR proof request. This ID can be used to reference the specific proof request in future operations, such as querying or validating the proof."longUrl": "http://100.28.204.79:9007?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJhYjYxN2Y1ZS1kOGE1LTRkMTgtYTA5YS0xNWFkOGNiOGZkYTkiLCAibGFiZWwiOiAiTmV3VGVzdDcgQWdlbnQiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFtdLCAicmVxdWVzdHN-YXR0YWNoIjogW3siQGlkIjogInJlcXVlc3QtMCIsICJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsICJkYXRhIjogeyJqc29uIjogeyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwgIkBpZCI6ICI4NDA0YmNjYy03MDQzLTQ0NzYtYWY3OS00NGI3OGRjM2YxZTMiLCAifnRocmVhZCI6IHsicHRoaWQiOiAiYWI2MTdmNWUtZDhhNS00ZDE4LWEwOWEtMTVhZDhjYjhmZGE5In0sICJjb21tZW50IjogImZvciB2ZXJpZnkgYW5vbmNyZWQgY3JlZGVudGlhbCIsICJ3aWxsX2NvbmZpcm0iOiB0cnVlLCAiZm9ybWF0cyI6IFt7ImF0dGFjaF9pZCI6ICJpbmR5IiwgImZvcm1hdCI6ICJobGluZHkvcHJvb2YtcmVxQHYyLjAifV0sICJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjogW3siQGlkIjogImluZHkiLCAibWltZS10eXBlIjogImFwcGxpY2F0aW9uL2pzb24iLCAiZGF0YSI6IHsiYmFzZTY0IjogImV5SnVZVzFsSWpvZ0ltSmpiM1p5YVc0Z2NISnZiMllnWkdWbWFXNWxJaXdnSW01dmJtTmxJam9nSWpFaUxDQWljbVZ4ZFdWemRHVmtYMkYwZEhKcFluVjBaWE1pT2lCN0ltRmtaR2wwYVc5dVlXeFFjbTl3TVNJNklIc2ljbVZ6ZEhKcFkzUnBiMjV6SWpvZ1czc2lZM0psWkY5a1pXWmZhV1FpT2lBaVRqaEVSbkZyTjNkMlUyUmtObGhIUm1GeVIzQTFXRG96T2tOTU9qRTNORFUxTlRjNlJISnBkbWx1WjE5TWFXTmxibk5sWHpFaUxDQWlhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjlwWkNJNklDSk9PRVJHY1dzM2QzWlRaR1EyV0VkR1lYSkhjRFZZT2pJNlJISnBkbWx1WjE5c2FXTmxibk5sT2pJdU1DSXNJQ0p6WTJobGJXRmZhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjl1WVcxbElqb2dJa1J5YVhacGJtZGZiR2xqWlc1elpTSXNJQ0p6WTJobGJXRmZkbVZ5YzJsdmJpSTZJQ0l5TGpBaWZWMHNJQ0p1YjI1ZmNtVjJiMnRsWkNJNklIc2lkRzhpT2lBeE56STFNREk1TWprMmZTd2dJbTVoYldWeklqb2dXeUptZFd4c1gyNWhiV1VpWFgxOUxDQWljbVZ4ZFdWemRHVmtYM0J5WldScFkyRjBaWE1pT2lCN2ZTd2dJblpsY25OcGIyNGlPaUFpTVM0d0luMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa25idTZjTHBqZDhvaVFEaE5hblNVdXdFc3JrZUw5NjRUeXFBS1JYYzJIbVEyI3o2TWtuYnU2Y0xwamQ4b2lRRGhOYW5TVXV3RXNya2VMOTY0VHlxQUtSWGMySG1RMiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMDAuMjguMjA0Ljc5OjkwMDcifV19":ThelongUrlis a complete and detailed URL generated for the QR proof request. This URL is used to represent the proof request in a way that can be scanned via QR code or accessed directly by a client. It includes encoded data (oobparameter) necessary for the request to be processed. This URL may be useful for direct sharing or embedding in a QR code."shortUrl": "https://devapi-verifier.nborbit.ca/url/7c204a3f-28ed-4656-8eda-7be899c26b56":TheshortUrlis a condensed version of thelongUrl, making it easier to share or use in contexts where a shorter URL is preferable. This shortened URL redirects to the same resource as thelongUrl, simplifying its use in digital communication or QR code generation.

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

- { "success": true, "message": "prepare qr proof request proceed successfully.", "data": { "proofDefineId": 13, "longUrl": "http://100.28.204.79:9007?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJhYjYxN2Y1ZS1kOGE1LTRkMTgtYTA5YS0xNWFkOGNiOGZkYTkiLCAibGFiZWwiOiAiTmV3VGVzdDcgQWdlbnQiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFtdLCAicmVxdWVzdHN-YXR0YWNoIjogW3siQGlkIjogInJlcXVlc3QtMCIsICJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsICJkYXRhIjogeyJqc29uIjogeyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwgIkBpZCI6ICI4NDA0YmNjYy03MDQzLTQ0NzYtYWY3OS00NGI3OGRjM2YxZTMiLCAifnRocmVhZCI6IHsicHRoaWQiOiAiYWI2MTdmNWUtZDhhNS00ZDE4LWEwOWEtMTVhZDhjYjhmZGE5In0sICJjb21tZW50IjogImZvciB2ZXJpZnkgYW5vbmNyZWQgY3JlZGVudGlhbCIsICJ3aWxsX2NvbmZpcm0iOiB0cnVlLCAiZm9ybWF0cyI6IFt7ImF0dGFjaF9pZCI6ICJpbmR5IiwgImZvcm1hdCI6ICJobGluZHkvcHJvb2YtcmVxQHYyLjAifV0sICJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjogW3siQGlkIjogImluZHkiLCAibWltZS10eXBlIjogImFwcGxpY2F0aW9uL2pzb24iLCAiZGF0YSI6IHsiYmFzZTY0IjogImV5SnVZVzFsSWpvZ0ltSmpiM1p5YVc0Z2NISnZiMllnWkdWbWFXNWxJaXdnSW01dmJtTmxJam9nSWpFaUxDQWljbVZ4ZFdWemRHVmtYMkYwZEhKcFluVjBaWE1pT2lCN0ltRmtaR2wwYVc5dVlXeFFjbTl3TVNJNklIc2ljbVZ6ZEhKcFkzUnBiMjV6SWpvZ1czc2lZM0psWkY5a1pXWmZhV1FpT2lBaVRqaEVSbkZyTjNkMlUyUmtObGhIUm1GeVIzQTFXRG96T2tOTU9qRTNORFUxTlRjNlJISnBkbWx1WjE5TWFXTmxibk5sWHpFaUxDQWlhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjlwWkNJNklDSk9PRVJHY1dzM2QzWlRaR1EyV0VkR1lYSkhjRFZZT2pJNlJISnBkbWx1WjE5c2FXTmxibk5sT2pJdU1DSXNJQ0p6WTJobGJXRmZhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjl1WVcxbElqb2dJa1J5YVhacGJtZGZiR2xqWlc1elpTSXNJQ0p6WTJobGJXRmZkbVZ5YzJsdmJpSTZJQ0l5TGpBaWZWMHNJQ0p1YjI1ZmNtVjJiMnRsWkNJNklIc2lkRzhpT2lBeE56STFNREk1TWprMmZTd2dJbTVoYldWeklqb2dXeUptZFd4c1gyNWhiV1VpWFgxOUxDQWljbVZ4ZFdWemRHVmtYM0J5WldScFkyRjBaWE1pT2lCN2ZTd2dJblpsY25OcGIyNGlPaUFpTVM0d0luMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa25idTZjTHBqZDhvaVFEaE5hblNVdXdFc3JrZUw5NjRUeXFBS1JYYzJIbVEyI3o2TWtuYnU2Y0xwamQ4b2lRRGhOYW5TVXV3RXNya2VMOTY0VHlxQUtSWGMySG1RMiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMDAuMjguMjA0Ljc5OjkwMDcifV19", "shortUrl": "https://devapi-verifier.nborbit.ca/url/7c204a3f-28ed-4656-8eda-7be899c26b56" } }

ClickSend.

Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

{ "success": true, "message": "prepare qr proof request proceed successfully.", "data": { "proofDefineId": 13, "longUrl": "http://100.28.204.79:9007?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJhYjYxN2Y1ZS1kOGE1LTRkMTgtYTA5YS0xNWFkOGNiOGZkYTkiLCAibGFiZWwiOiAiTmV3VGVzdDcgQWdlbnQiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFtdLCAicmVxdWVzdHN-YXR0YWNoIjogW3siQGlkIjogInJlcXVlc3QtMCIsICJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsICJkYXRhIjogeyJqc29uIjogeyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwgIkBpZCI6ICI4NDA0YmNjYy03MDQzLTQ0NzYtYWY3OS00NGI3OGRjM2YxZTMiLCAifnRocmVhZCI6IHsicHRoaWQiOiAiYWI2MTdmNWUtZDhhNS00ZDE4LWEwOWEtMTVhZDhjYjhmZGE5In0sICJjb21tZW50IjogImZvciB2ZXJpZnkgYW5vbmNyZWQgY3JlZGVudGlhbCIsICJ3aWxsX2NvbmZpcm0iOiB0cnVlLCAiZm9ybWF0cyI6IFt7ImF0dGFjaF9pZCI6ICJpbmR5IiwgImZvcm1hdCI6ICJobGluZHkvcHJvb2YtcmVxQHYyLjAifV0sICJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjogW3siQGlkIjogImluZHkiLCAibWltZS10eXBlIjogImFwcGxpY2F0aW9uL2pzb24iLCAiZGF0YSI6IHsiYmFzZTY0IjogImV5SnVZVzFsSWpvZ0ltSmpiM1p5YVc0Z2NISnZiMllnWkdWbWFXNWxJaXdnSW01dmJtTmxJam9nSWpFaUxDQWljbVZ4ZFdWemRHVmtYMkYwZEhKcFluVjBaWE1pT2lCN0ltRmtaR2wwYVc5dVlXeFFjbTl3TVNJNklIc2ljbVZ6ZEhKcFkzUnBiMjV6SWpvZ1czc2lZM0psWkY5a1pXWmZhV1FpT2lBaVRqaEVSbkZyTjNkMlUyUmtObGhIUm1GeVIzQTFXRG96T2tOTU9qRTNORFUxTlRjNlJISnBkbWx1WjE5TWFXTmxibk5sWHpFaUxDQWlhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjlwWkNJNklDSk9PRVJHY1dzM2QzWlRaR1EyV0VkR1lYSkhjRFZZT2pJNlJISnBkbWx1WjE5c2FXTmxibk5sT2pJdU1DSXNJQ0p6WTJobGJXRmZhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjl1WVcxbElqb2dJa1J5YVhacGJtZGZiR2xqWlc1elpTSXNJQ0p6WTJobGJXRmZkbVZ5YzJsdmJpSTZJQ0l5TGpBaWZWMHNJQ0p1YjI1ZmNtVjJiMnRsWkNJNklIc2lkRzhpT2lBeE56STFNREk1TWprMmZTd2dJbTVoYldWeklqb2dXeUptZFd4c1gyNWhiV1VpWFgxOUxDQWljbVZ4ZFdWemRHVmtYM0J5WldScFkyRjBaWE1pT2lCN2ZTd2dJblpsY25OcGIyNGlPaUFpTVM0d0luMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa25idTZjTHBqZDhvaVFEaE5hblNVdXdFc3JrZUw5NjRUeXFBS1JYYzJIbVEyI3o2TWtuYnU2Y0xwamQ4b2lRRGhOYW5TVXV3RXNya2VMOTY0VHlxQUtSWGMySG1RMiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMDAuMjguMjA0Ljc5OjkwMDcifV19", "shortUrl": "https://devapi-verifier.nborbit.ca/url/7c204a3f-28ed-4656-8eda-7be899c26b56" } }

Detailed Breakdown :

success: true:Thesuccess: truestatus indicates that the operation was executed successfully without any errors or exceptions.

"prepare qr proof request proceed successfully.":
This message confirms to the user or client that the specific action of preparing a QR proof request has been successfully completed.

"proofDefineId": 13:
The proofDefineId is a unique identifier assigned to the newly created QR proof request. This ID can be used to reference the specific proof request in future operations, such as querying or validating the proof.

"longUrl": "http://100.28.204.79:9007?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJhYjYxN2Y1ZS1kOGE1LTRkMTgtYTA5YS0xNWFkOGNiOGZkYTkiLCAibGFiZWwiOiAiTmV3VGVzdDcgQWdlbnQiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFtdLCAicmVxdWVzdHN-YXR0YWNoIjogW3siQGlkIjogInJlcXVlc3QtMCIsICJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsICJkYXRhIjogeyJqc29uIjogeyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwgIkBpZCI6ICI4NDA0YmNjYy03MDQzLTQ0NzYtYWY3OS00NGI3OGRjM2YxZTMiLCAifnRocmVhZCI6IHsicHRoaWQiOiAiYWI2MTdmNWUtZDhhNS00ZDE4LWEwOWEtMTVhZDhjYjhmZGE5In0sICJjb21tZW50IjogImZvciB2ZXJpZnkgYW5vbmNyZWQgY3JlZGVudGlhbCIsICJ3aWxsX2NvbmZpcm0iOiB0cnVlLCAiZm9ybWF0cyI6IFt7ImF0dGFjaF9pZCI6ICJpbmR5IiwgImZvcm1hdCI6ICJobGluZHkvcHJvb2YtcmVxQHYyLjAifV0sICJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjogW3siQGlkIjogImluZHkiLCAibWltZS10eXBlIjogImFwcGxpY2F0aW9uL2pzb24iLCAiZGF0YSI6IHsiYmFzZTY0IjogImV5SnVZVzFsSWpvZ0ltSmpiM1p5YVc0Z2NISnZiMllnWkdWbWFXNWxJaXdnSW01dmJtTmxJam9nSWpFaUxDQWljbVZ4ZFdWemRHVmtYMkYwZEhKcFluVjBaWE1pT2lCN0ltRmtaR2wwYVc5dVlXeFFjbTl3TVNJNklIc2ljbVZ6ZEhKcFkzUnBiMjV6SWpvZ1czc2lZM0psWkY5a1pXWmZhV1FpT2lBaVRqaEVSbkZyTjNkMlUyUmtObGhIUm1GeVIzQTFXRG96T2tOTU9qRTNORFUxTlRjNlJISnBkbWx1WjE5TWFXTmxibk5sWHpFaUxDQWlhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjlwWkNJNklDSk9PRVJHY1dzM2QzWlRaR1EyV0VkR1lYSkhjRFZZT2pJNlJISnBkbWx1WjE5c2FXTmxibk5sT2pJdU1DSXNJQ0p6WTJobGJXRmZhWE56ZFdWeVgyUnBaQ0k2SUNKT09FUkdjV3MzZDNaVFpHUTJXRWRHWVhKSGNEVllJaXdnSW5OamFHVnRZVjl1WVcxbElqb2dJa1J5YVhacGJtZGZiR2xqWlc1elpTSXNJQ0p6WTJobGJXRmZkbVZ5YzJsdmJpSTZJQ0l5TGpBaWZWMHNJQ0p1YjI1ZmNtVjJiMnRsWkNJNklIc2lkRzhpT2lBeE56STFNREk1TWprMmZTd2dJbTVoYldWeklqb2dXeUptZFd4c1gyNWhiV1VpWFgxOUxDQWljbVZ4ZFdWemRHVmtYM0J5WldScFkyRjBaWE1pT2lCN2ZTd2dJblpsY25OcGIyNGlPaUFpTVM0d0luMD0ifX1dfX19XSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa25idTZjTHBqZDhvaVFEaE5hblNVdXdFc3JrZUw5NjRUeXFBS1JYYzJIbVEyI3o2TWtuYnU2Y0xwamQ4b2lRRGhOYW5TVXV3RXNya2VMOTY0VHlxQUtSWGMySG1RMiJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMDAuMjguMjA0Ljc5OjkwMDcifV19":

ThelongUrlis a complete and detailed URL generated for the QR proof request. This URL is used to represent the proof request in a way that can be scanned via QR code or accessed directly by a client. It includes encoded data (oobparameter) necessary for the request to be processed. This URL may be useful for direct sharing or embedding in a QR code.

"shortUrl": "https://devapi-verifier.nborbit.ca/url/7c204a3f-28ed-4656-8eda-7be899c26b56":

TheshortUrlis a condensed version of thelongUrl, making it easier to share or use in contexts where a shorter URL is preferable. This shortened URL redirects to the same resource as thelongUrl, simplifying its use in digital communication or QR code generation.

### Test Scenario 4:Use the details below to test sending a proof request to a contact

Objective: Verify that proof requests can be sent to a Holder that is a contact

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Send Proof Request to Contact".Set the request type to POST.Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/send-contact

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Add Request Body:

Create Request:

- Open Postman and create a new request.

- Name the request "Send Proof Request to Contact".

- Set the request type to POST.

- Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/send-contact

Open Postman and create a new request.

Name the request "Send Proof Request to Contact".

Set the request type to POST.

Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof/send-contact

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Add Request Body:

```

{
                    "comment": "send proof request to holder",
                     "proofDefineId": 12,
                     "contactId": "bdcbf5ec-79f5-43b2-a49f-d98ea8f35b7a",
                     "credProofId": "",
                     "proofAutoVerify": false
                   }

```

Detailed Breakdown

- comment:This field provides additional context or information about the proof request. The value"send proof request to holder"indicates the purpose of this request is to send a proof to the holder, likely part of a larger verification process.

- proofDefineId:This is the identifier of the proof definition template. The value12signifies the specific proof template that is being used in this case.

- contactId:This is a unique identifier (bdcbf5ec-79f5-43b2-a49f-d98ea8f35b7a) that links the proof request to a specific contact. This ID helps identify the recipient (in this case, the holder) within the system.

- credProofId:This field is intended to hold the unique identifier for the credential proof. It is currently an empty string (""), indicating that no proof has been generated or associated with this request yet.

- proofAutoVerify:This boolean flag determines if the proof will be automatically verified upon submission. The valuefalsemeans that the proof will not be automatically verified, and manual verification is likely required.

comment:

- This field provides additional context or information about the proof request. The value"send proof request to holder"indicates the purpose of this request is to send a proof to the holder, likely part of a larger verification process.

This field provides additional context or information about the proof request. The value"send proof request to holder"indicates the purpose of this request is to send a proof to the holder, likely part of a larger verification process.

proofDefineId:

- This is the identifier of the proof definition template. The value12signifies the specific proof template that is being used in this case.

This is the identifier of the proof definition template. The value12signifies the specific proof template that is being used in this case.

contactId:

- This is a unique identifier (bdcbf5ec-79f5-43b2-a49f-d98ea8f35b7a) that links the proof request to a specific contact. This ID helps identify the recipient (in this case, the holder) within the system.

This is a unique identifier (bdcbf5ec-79f5-43b2-a49f-d98ea8f35b7a) that links the proof request to a specific contact. This ID helps identify the recipient (in this case, the holder) within the system.

credProofId:

- This field is intended to hold the unique identifier for the credential proof. It is currently an empty string (""), indicating that no proof has been generated or associated with this request yet.

This field is intended to hold the unique identifier for the credential proof. It is currently an empty string (""), indicating that no proof has been generated or associated with this request yet.

proofAutoVerify:

- This boolean flag determines if the proof will be automatically verified upon submission. The valuefalsemeans that the proof will not be automatically verified, and manual verification is likely required.

This boolean flag determines if the proof will be automatically verified upon submission. The valuefalsemeans that the proof will not be automatically verified, and manual verification is likely required.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfullyResponse Body

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

ClickSend.

Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

Response Body

```

{"success":true,"message":"proof request sended successfully.","data":{"proofDefineId":1019,"credProofId":"8b63b96d-5de1-4b72-aed6-13d749740443","proofStatus":"request-sent"}}

```

Detailed Breakdown

- success:The valuetrueindicates that the operation was successful. The proof request has been sent successfully.

- message:This field provides a descriptive message about the operation. The value"proof request sended successfully."confirms that the proof request has been sent without issues.

- data:This object contains the actual data related to the proof request.proofDefineId:This field contains the identifier (1019) for the proof definition used to create this proof request. It links the request to a specific proof template.credProofId:ThecredProofId(8b63b96d-5de1-4b72-aed6-13d749740443) is the unique identifier for the credential proof that is being requested. This ID can be used to track and manage the proof request throughout its lifecycle.proofStatus:TheproofStatusfield (request-sent) indicates the current status of the proof request. In this case, it shows that the proof request has been sent and is awaiting further processing (such as verification or response).

success:

- The valuetrueindicates that the operation was successful. The proof request has been sent successfully.

The valuetrueindicates that the operation was successful. The proof request has been sent successfully.

message:

- This field provides a descriptive message about the operation. The value"proof request sended successfully."confirms that the proof request has been sent without issues.

This field provides a descriptive message about the operation. The value"proof request sended successfully."confirms that the proof request has been sent without issues.

data:

- This object contains the actual data related to the proof request.

- proofDefineId:This field contains the identifier (1019) for the proof definition used to create this proof request. It links the request to a specific proof template.

- credProofId:ThecredProofId(8b63b96d-5de1-4b72-aed6-13d749740443) is the unique identifier for the credential proof that is being requested. This ID can be used to track and manage the proof request throughout its lifecycle.

- proofStatus:TheproofStatusfield (request-sent) indicates the current status of the proof request. In this case, it shows that the proof request has been sent and is awaiting further processing (such as verification or response).

This object contains the actual data related to the proof request.

proofDefineId:

- This field contains the identifier (1019) for the proof definition used to create this proof request. It links the request to a specific proof template.

This field contains the identifier (1019) for the proof definition used to create this proof request. It links the request to a specific proof template.

credProofId:

- ThecredProofId(8b63b96d-5de1-4b72-aed6-13d749740443) is the unique identifier for the credential proof that is being requested. This ID can be used to track and manage the proof request throughout its lifecycle.

ThecredProofId(8b63b96d-5de1-4b72-aed6-13d749740443) is the unique identifier for the credential proof that is being requested. This ID can be used to track and manage the proof request throughout its lifecycle.

proofStatus:

- TheproofStatusfield (request-sent) indicates the current status of the proof request. In this case, it shows that the proof request has been sent and is awaiting further processing (such as verification or response).

TheproofStatusfield (request-sent) indicates the current status of the proof request. In this case, it shows that the proof request has been sent and is awaiting further processing (such as verification or response).

### Test Scenario 5:Use the details below to test retrieving all proof requests

Objective: Verify that all proof requests can be retrieved

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Get All Proof Requests".Set the request type to GET.Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-requests

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfullyResponse Body:

Create Request:

- Open Postman and create a new request.

- Name the request "Get All Proof Requests".

- Set the request type to GET.

- Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-requests

Open Postman and create a new request.

Name the request "Get All Proof Requests".

Set the request type to GET.

Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-requests

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

ClickSend.

Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

Response Body:

```

{"success":true,"message":"proof request fetch successfully.","data":{"items":[{"credProofId":"8b63b96d-5de1-4b72-aed6-13d749740443","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"5a5516a5-371b-456d-b3af-52114cbf0fa8","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"3dc2338a-0f6d-46a5-82fe-78e7036552d1","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"38b0eb95-5608-4046-a648-a1831ed7bb93","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"06268611-8f76-4e8e-b45a-cfb241f6ba96","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"d76d3bda-6f77-4a76-b42d-2f2350be3c4d","proofStatus":"abandoned","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"6d674528-70ac-4a72-93e4-468c2fb73852","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"cd4bd563-9078-4989-9134-cf90d47dea71","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"8f48580d-4f48-4d48-ab6c-06d7dbad99d0","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"a2db6164-4c63-4b49-b2a2-350d4f52ae0f","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null}],"meta":{"totalItems":35,"itemCount":10,"itemsPerPage":10,"totalPages":4,"currentPage":1}}}

```

Detailed Breakdown

- success:The valuetrueindicates that the operation was successful. The proof requests were fetched without any issues.

- message:This field provides a descriptive message about the operation. The value"proof request fetch successfully."confirms that the proof requests were retrieved successfully.

- data:This object contains the actual data related to the fetched proof requests.items:This array contains the list of proof requests fetched. Each item in the array represents a specific proof request with the following fields:credProofId:This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.proofStatus:This field indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has occurred."done": The proof request has been completed (usually after the proof was verified)."abandoned": The proof request was abandoned and is no longer in progress.proofAutoVerify:This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.authorityStatement:This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.verified:This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.meta:This object contains metadata about the pagination of the fetched proof requests.totalItems: The total number of proof requests available (in this case,35).itemCount: The number of proof requests returned in this response (here,10).itemsPerPage: The number of items that can be displayed per page (here,10).totalPages: The total number of pages available (here,4).currentPage: The current page number (here,1).

success:

- The valuetrueindicates that the operation was successful. The proof requests were fetched without any issues.

The valuetrueindicates that the operation was successful. The proof requests were fetched without any issues.

message:

- This field provides a descriptive message about the operation. The value"proof request fetch successfully."confirms that the proof requests were retrieved successfully.

This field provides a descriptive message about the operation. The value"proof request fetch successfully."confirms that the proof requests were retrieved successfully.

data:

- This object contains the actual data related to the fetched proof requests.

- items:This array contains the list of proof requests fetched. Each item in the array represents a specific proof request with the following fields:credProofId:This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.proofStatus:This field indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has occurred."done": The proof request has been completed (usually after the proof was verified)."abandoned": The proof request was abandoned and is no longer in progress.proofAutoVerify:This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.authorityStatement:This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.verified:This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.

- meta:This object contains metadata about the pagination of the fetched proof requests.totalItems: The total number of proof requests available (in this case,35).itemCount: The number of proof requests returned in this response (here,10).itemsPerPage: The number of items that can be displayed per page (here,10).totalPages: The total number of pages available (here,4).currentPage: The current page number (here,1).

This object contains the actual data related to the fetched proof requests.

items:

- This array contains the list of proof requests fetched. Each item in the array represents a specific proof request with the following fields:credProofId:This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.proofStatus:This field indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has occurred."done": The proof request has been completed (usually after the proof was verified)."abandoned": The proof request was abandoned and is no longer in progress.proofAutoVerify:This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.authorityStatement:This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.verified:This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.

This array contains the list of proof requests fetched. Each item in the array represents a specific proof request with the following fields:

- credProofId:This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.

- proofStatus:This field indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has occurred."done": The proof request has been completed (usually after the proof was verified)."abandoned": The proof request was abandoned and is no longer in progress.

- proofAutoVerify:This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.

- authorityStatement:This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.

- verified:This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.

credProofId:

- This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.

This field contains the unique identifier for the credential proof request. EachcredProofIdcorresponds to a specific proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"is one such ID.

proofStatus:

- This field indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has occurred."done": The proof request has been completed (usually after the proof was verified)."abandoned": The proof request was abandoned and is no longer in progress.

This field indicates the current status of the proof request. The possible statuses include:

- "request-sent": The proof request has been sent, but no further action has occurred.

- "done": The proof request has been completed (usually after the proof was verified).

- "abandoned": The proof request was abandoned and is no longer in progress.

"request-sent": The proof request has been sent, but no further action has occurred.

"done": The proof request has been completed (usually after the proof was verified).

"abandoned": The proof request was abandoned and is no longer in progress.

proofAutoVerify:

- This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.

This field indicates whether the proof request is set for automatic verification. In this case, it is set tofalsefor all requests, meaning the verification process will not be automatic.

authorityStatement:

- This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.

This field contains any authority statement associated with the proof request. All the values arenull, indicating no authority statements are provided for these requests.

verified:

- This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.

This field indicates whether the proof request was successfully verified. For example, some requests have"verified": true, indicating the proof for those requests has been validated, while others don't have this field, implying the verification process has not yet occurred.

meta:

- This object contains metadata about the pagination of the fetched proof requests.totalItems: The total number of proof requests available (in this case,35).itemCount: The number of proof requests returned in this response (here,10).itemsPerPage: The number of items that can be displayed per page (here,10).totalPages: The total number of pages available (here,4).currentPage: The current page number (here,1).

This object contains metadata about the pagination of the fetched proof requests.

- totalItems: The total number of proof requests available (in this case,35).

- itemCount: The number of proof requests returned in this response (here,10).

- itemsPerPage: The number of items that can be displayed per page (here,10).

- totalPages: The total number of pages available (here,4).

- currentPage: The current page number (here,1).

totalItems: The total number of proof requests available (in this case,35).

itemCount: The number of proof requests returned in this response (here,10).

itemsPerPage: The number of items that can be displayed per page (here,10).

totalPages: The total number of pages available (here,4).

currentPage: The current page number (here,1).

### Test Scenario 6:Use the details below to test retrieving a specific proof request using a Proof ID

Objective: Verify that a specific proof request, based on Proof ID, can be retrieved

Variables:

- proofId: Set this to a valid proof request ID.

proofId: Set this to a valid proof request ID.

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Get Proof Request by ID".Set the request type to GET.Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-request/{cred_proof_id}.

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

Create Request:

- Open Postman and create a new request.

- Name the request "Get Proof Request by ID".

- Set the request type to GET.

- Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-request/{cred_proof_id}.

Open Postman and create a new request.

Name the request "Get Proof Request by ID".

Set the request type to GET.

Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof-request/{cred_proof_id}.

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Send Request:

ClickSend.

Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

Response Body

```

{"success":true,"message":"proof request fetch successfully.","data":{"items":[{"credProofId":"8b63b96d-5de1-4b72-aed6-13d749740443","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"5a5516a5-371b-456d-b3af-52114cbf0fa8","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"3dc2338a-0f6d-46a5-82fe-78e7036552d1","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"38b0eb95-5608-4046-a648-a1831ed7bb93","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"06268611-8f76-4e8e-b45a-cfb241f6ba96","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"d76d3bda-6f77-4a76-b42d-2f2350be3c4d","proofStatus":"abandoned","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"6d674528-70ac-4a72-93e4-468c2fb73852","proofStatus":"done","proofAutoVerify":false,"authorityStatement":null,"verified":true},{"credProofId":"cd4bd563-9078-4989-9134-cf90d47dea71","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"8f48580d-4f48-4d48-ab6c-06d7dbad99d0","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null},{"credProofId":"a2db6164-4c63-4b49-b2a2-350d4f52ae0f","proofStatus":"request-sent","proofAutoVerify":false,"authorityStatement":null}],"meta":{"totalItems":35,"itemCount":10,"itemsPerPage":10,"totalPages":4,"currentPage":1}}}

```

Detailed Breakdown:

- success:The valuetrueindicates the operation was successful, meaning the proof requests were successfully fetched.

- message:The message"proof request fetch successfully."confirms that the operation completed successfully, indicating that the proof requests were retrieved without any issues.

- data:This object contains the data related to the fetched proof requests.items:This array holds a list of proof requests. Each object in this array represents a unique proof request with the following details:credProofId:This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.proofStatus:Indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has taken place."done": The proof request has been completed (usually after the proof has been verified)."abandoned": The proof request was abandoned and is no longer being processed.proofAutoVerify:Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.authorityStatement:This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.verified:This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.meta:This object contains metadata related to the pagination of the proof requests:totalItems: The total number of proof requests available in the system (here,35).itemCount: The number of proof requests returned in this response (in this case,10).itemsPerPage: The number of items to be displayed per page (here,10).totalPages: The total number of pages available based on the current pagination configuration (here,4).currentPage: The current page number being displayed (here,1).

success:

- The valuetrueindicates the operation was successful, meaning the proof requests were successfully fetched.

The valuetrueindicates the operation was successful, meaning the proof requests were successfully fetched.

message:

- The message"proof request fetch successfully."confirms that the operation completed successfully, indicating that the proof requests were retrieved without any issues.

The message"proof request fetch successfully."confirms that the operation completed successfully, indicating that the proof requests were retrieved without any issues.

data:

- This object contains the data related to the fetched proof requests.

- items:This array holds a list of proof requests. Each object in this array represents a unique proof request with the following details:credProofId:This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.proofStatus:Indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has taken place."done": The proof request has been completed (usually after the proof has been verified)."abandoned": The proof request was abandoned and is no longer being processed.proofAutoVerify:Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.authorityStatement:This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.verified:This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.

- meta:This object contains metadata related to the pagination of the proof requests:totalItems: The total number of proof requests available in the system (here,35).itemCount: The number of proof requests returned in this response (in this case,10).itemsPerPage: The number of items to be displayed per page (here,10).totalPages: The total number of pages available based on the current pagination configuration (here,4).currentPage: The current page number being displayed (here,1).

This object contains the data related to the fetched proof requests.

items:

- This array holds a list of proof requests. Each object in this array represents a unique proof request with the following details:credProofId:This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.proofStatus:Indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has taken place."done": The proof request has been completed (usually after the proof has been verified)."abandoned": The proof request was abandoned and is no longer being processed.proofAutoVerify:Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.authorityStatement:This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.verified:This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.

This array holds a list of proof requests. Each object in this array represents a unique proof request with the following details:

- credProofId:This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.

- proofStatus:Indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has taken place."done": The proof request has been completed (usually after the proof has been verified)."abandoned": The proof request was abandoned and is no longer being processed.

- proofAutoVerify:Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.

- authorityStatement:This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.

- verified:This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.

credProofId:

- This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.

This is the unique identifier for the proof request. For example,"8b63b96d-5de1-4b72-aed6-13d749740443"represents one such ID.

proofStatus:

- Indicates the current status of the proof request. The possible statuses include:"request-sent": The proof request has been sent, but no further action has taken place."done": The proof request has been completed (usually after the proof has been verified)."abandoned": The proof request was abandoned and is no longer being processed.

Indicates the current status of the proof request. The possible statuses include:

- "request-sent": The proof request has been sent, but no further action has taken place.

- "done": The proof request has been completed (usually after the proof has been verified).

- "abandoned": The proof request was abandoned and is no longer being processed.

"request-sent": The proof request has been sent, but no further action has taken place.

"done": The proof request has been completed (usually after the proof has been verified).

"abandoned": The proof request was abandoned and is no longer being processed.

proofAutoVerify:

- Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.

Indicates whether the proof request is set for automatic verification. For all the items, it is set tofalse, meaning that the verification process will not be automatic and must be manually handled.

authorityStatement:

- This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.

This field holds any authority statement associated with the proof request. In this case, the value isnullfor all requests, indicating no authority statement is provided.

verified:

- This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.

This field is only present for some requests. It indicates whether the proof has been successfully verified. For example,"verified": truefor the proof request withcredProofId"38b0eb95-5608-4046-a648-a1831ed7bb93", which means that this proof has been verified.

meta:

- This object contains metadata related to the pagination of the proof requests:totalItems: The total number of proof requests available in the system (here,35).itemCount: The number of proof requests returned in this response (in this case,10).itemsPerPage: The number of items to be displayed per page (here,10).totalPages: The total number of pages available based on the current pagination configuration (here,4).currentPage: The current page number being displayed (here,1).

This object contains metadata related to the pagination of the proof requests:

- totalItems: The total number of proof requests available in the system (here,35).

- itemCount: The number of proof requests returned in this response (in this case,10).

- itemsPerPage: The number of items to be displayed per page (here,10).

- totalPages: The total number of pages available based on the current pagination configuration (here,4).

- currentPage: The current page number being displayed (here,1).

totalItems: The total number of proof requests available in the system (here,35).

itemCount: The number of proof requests returned in this response (in this case,10).

itemsPerPage: The number of items to be displayed per page (here,10).

totalPages: The total number of pages available based on the current pagination configuration (here,4).

currentPage: The current page number being displayed (here,1).

### Test Scenario 7:Use the details below to test deleting a specific proof request using a Proof ID

Objective: Verify that a specific proof request, based on Proof ID, can be deleted

Variables:

credProofId:Set this to a valid proof request ID.

- Testing Steps:

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Delete Proof Request by ID".Set the request type to DELETE.Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof-request.

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Add Request Body:

Create Request:

- Open Postman and create a new request.

- Name the request "Delete Proof Request by ID".

- Set the request type to DELETE.

- Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof-request.

Open Postman and create a new request.

Name the request "Delete Proof Request by ID".

Set the request type to DELETE.

Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/proof-request.

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Add Request Body:

```

{
  "credProofId": "58e02d58-a762-469e-84ba-882a47345775"
}


```

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully{ "success": true, "message": "Proof request proceed successfully.", "data": { "responseDetails": "Proof request with id '5' has been deleted successfully." } }

1. Response Body

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

- { "success": true, "message": "Proof request proceed successfully.", "data": { "responseDetails": "Proof request with id '5' has been deleted successfully." } }

ClickSend.

Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

{ "success": true, "message": "Proof request proceed successfully.", "data": { "responseDetails": "Proof request with id '5' has been deleted successfully." } }

Response Body

```

{"success":true,"message":"Proof request proceed successfully.","data":{"responseDetails":"Proof request with id '8b63b96d-5de1-4b72-aed6-13d749740443' has been deleted successfully.","proofDefineId":1019,"credProofId":"8b63b96d-5de1-4b72-aed6-13d749740443","proofStatus":"deleted"}}

```

1. Detailed Breakdown :

Detailed Breakdown :

- success:The valuetrueindicates the operation was successful, meaning the proof request has been processed and deleted without any issues.

- message:The message"Proof request proceed successfully."confirms that the proof request was handled successfully, including the deletion.

- data:This object contains the data related to the proof request that was deleted.responseDetails:This provides a detailed message about the operation. The message"Proof request with id '8b63b96d-5de1-4b72-aed6-13d749740443' has been deleted successfully."indicates that the proof request with the specifiedcredProofIdwas deleted successfully.proofDefineId:This is the unique identifier for the proof definition associated with the proof request. The value is1019, which corresponds to the proof definition under which the proof request was created.credProofId:This is the unique identifier for the proof request. The value"8b63b96d-5de1-4b72-aed6-13d749740443"corresponds to the proof request that has been deleted.proofStatus:The value"deleted"indicates that the proof request has been deleted successfully and is no longer available for processing.

success:

- The valuetrueindicates the operation was successful, meaning the proof request has been processed and deleted without any issues.

The valuetrueindicates the operation was successful, meaning the proof request has been processed and deleted without any issues.

message:

- The message"Proof request proceed successfully."confirms that the proof request was handled successfully, including the deletion.

The message"Proof request proceed successfully."confirms that the proof request was handled successfully, including the deletion.

data:

- This object contains the data related to the proof request that was deleted.

- responseDetails:This provides a detailed message about the operation. The message"Proof request with id '8b63b96d-5de1-4b72-aed6-13d749740443' has been deleted successfully."indicates that the proof request with the specifiedcredProofIdwas deleted successfully.

- proofDefineId:This is the unique identifier for the proof definition associated with the proof request. The value is1019, which corresponds to the proof definition under which the proof request was created.

- credProofId:This is the unique identifier for the proof request. The value"8b63b96d-5de1-4b72-aed6-13d749740443"corresponds to the proof request that has been deleted.

- proofStatus:The value"deleted"indicates that the proof request has been deleted successfully and is no longer available for processing.

This object contains the data related to the proof request that was deleted.

responseDetails:

- This provides a detailed message about the operation. The message"Proof request with id '8b63b96d-5de1-4b72-aed6-13d749740443' has been deleted successfully."indicates that the proof request with the specifiedcredProofIdwas deleted successfully.

This provides a detailed message about the operation. The message"Proof request with id '8b63b96d-5de1-4b72-aed6-13d749740443' has been deleted successfully."indicates that the proof request with the specifiedcredProofIdwas deleted successfully.

proofDefineId:

- This is the unique identifier for the proof definition associated with the proof request. The value is1019, which corresponds to the proof definition under which the proof request was created.

This is the unique identifier for the proof definition associated with the proof request. The value is1019, which corresponds to the proof definition under which the proof request was created.

credProofId:

- This is the unique identifier for the proof request. The value"8b63b96d-5de1-4b72-aed6-13d749740443"corresponds to the proof request that has been deleted.

This is the unique identifier for the proof request. The value"8b63b96d-5de1-4b72-aed6-13d749740443"corresponds to the proof request that has been deleted.

proofStatus:

- The value"deleted"indicates that the proof request has been deleted successfully and is no longer available for processing.

The value"deleted"indicates that the proof request has been deleted successfully and is no longer available for processing.

#### 

### Test Scenario 8:Use the details below to retrieve all defined proof requests

Objective: Verify that all proof requests can be retrieved

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Get Defined Proof Requests".Set the request type to GET.Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/define-proof-request.

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfullyResponse Body

Create Request:

- Open Postman and create a new request.

- Name the request "Get Defined Proof Requests".

- Set the request type to GET.

- Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/define-proof-request.

Open Postman and create a new request.

Name the request "Get Defined Proof Requests".

Set the request type to GET.

Set the URL to{{baseUrl}}/api/lob/{{lob_id}}/define-proof-request.

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

- Response Body

ClickSend.

Verify the response with sample response below and check the status code to be 200 to ensure the proof request is defined successfully

Response Body

```

{
  "success": true,
  "message": "define proof-request fetch successfully",
  "data": {
    "items": [
      {
        "proofDefineId": 1,
        "name": "bcovrin proof define",
        "attributes": {
          "attributes": [
            "full_name",
            "email_address"
          ],
          "proofValidTill": "2025-04-15T10:57:50.022Z",
          "proofValidFrom": "2025-04-15T10:57:50.026Z",
          "restrictions": [
            {
              "anoncredsSchemaId": "WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0",
              "anoncredsSchemaIssuerDid": "WgWxqztrNooG92RXvxSTWv",
              "anoncredsSchemaName": "schema_name",
              "anoncredsSchemaVersion": "1.0",
              "anoncredsIssuerDid": "WgWxqztrNooG92RXvxSTWv",
              "anoncredsCredDefId": "WgWxqztrNooG92RXvxSTWv:3:CL:20:tag",
              "jsonldContextUrl": "https://w3id.org/citizenship/v1"
            }
          ]
        },
        "predicates": {
          "attributeName": "age",
          "pType": "<",
          "pValue": 0,
          "proofValidTill": "2025-04-15T10:57:50.027Z",
          "proofValidFrom": "2025-04-15T10:57:50.027Z",
          "restrictions": [
            {
              "anoncredsSchemaId": "WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0",
              "anoncredsSchemaIssuerDid": "WgWxqztrNooG92RXvxSTWv",
              "anoncredsSchemaName": "schema_name",
              "anoncredsSchemaVersion": "1.0",
              "anoncredsIssuerDid": "WgWxqztrNooG92RXvxSTWv",
              "anoncredsCredDefId": "WgWxqztrNooG92RXvxSTWv:3:CL:20:tag"
            }
          ]
        },
        "proofType": "ANONCREDS",
        "purpose": "for verify anoncreds credential",
        "createdAt": "2024-07-19T11:55:33.799Z",
        "updatedAt": "2024-07-19T11:55:33.799Z"
      }
    ],
    "meta": {
      "totalItems": 100,
      "itemCount": 10,
      "itemsPerPage": 10,
      "totalPages": 10,
      "currentPage": 1
    }
  }
}

```

1. Detailed Breakdown :

Detailed Breakdown :

- success:The valuetrueindicates that the operation to fetch the proof request definitions was successful.

- message:The message"define proof-request fetch successfully"confirms that the proof request definition data has been successfully retrieved.

- data:This object contains the main data related to the fetched proof request definitions.items:This is an array containing the details of each proof request definition retrieved. In this case, it contains one proof request definition.proofDefineId:The unique identifier for the proof request definition. In this case, the value is1.name:This is the name of the proof request definition. In this case, the name is"bcovrin proof define".attributes:This object contains the attributes required for the proof request.attributes:This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".proofValidTill:The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.proofValidFrom:The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".restrictions:This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.anoncredsSchemaId:The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".anoncredsSchemaIssuerDid:The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".anoncredsSchemaName:The name of the schema, which is"schema_name".anoncredsSchemaVersion:The version of the schema,"1.0".anoncredsIssuerDid:The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".anoncredsCredDefId:The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".jsonldContextUrl:The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".predicates:This object contains predicates associated with the proof request.attributeName:This is the name of the attribute involved in the predicate. Here, the attribute is"age".pType:The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.pValue:The value used for the predicate comparison. Here, it is0.proofValidTill:The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".proofValidFrom:The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".restrictions:The same restrictions are applied to the predicate as the ones for the attributes.proofType:The type of proof being defined. In this case, the value is"ANONCREDS", indicating the proof uses anonymous credentials.purpose:This describes the purpose of the proof request. Here, the purpose is"for verify anoncreds credential", indicating that the proof request is meant to verify anonymous credentials.createdAt:The timestamp of when the proof request definition was created. In this case, it was created on"2024-07-19T11:55:33.799Z".updatedAt:The timestamp of when the proof request definition was last updated. It was last updated on"2024-07-19T11:55:33.799Z".

- meta:This object provides pagination information about the retrieved data.totalItems:The total number of proof request definitions available, which is100.itemCount:The number of items returned in the current page, which is10.itemsPerPage:The number of items displayed per page, which is10.totalPages:The total number of pages available, which is10.currentPage:The current page being viewed, which is1.

success:

- The valuetrueindicates that the operation to fetch the proof request definitions was successful.

The valuetrueindicates that the operation to fetch the proof request definitions was successful.

message:

- The message"define proof-request fetch successfully"confirms that the proof request definition data has been successfully retrieved.

The message"define proof-request fetch successfully"confirms that the proof request definition data has been successfully retrieved.

data:

- This object contains the main data related to the fetched proof request definitions.

- items:This is an array containing the details of each proof request definition retrieved. In this case, it contains one proof request definition.proofDefineId:The unique identifier for the proof request definition. In this case, the value is1.name:This is the name of the proof request definition. In this case, the name is"bcovrin proof define".attributes:This object contains the attributes required for the proof request.attributes:This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".proofValidTill:The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.proofValidFrom:The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".restrictions:This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.anoncredsSchemaId:The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".anoncredsSchemaIssuerDid:The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".anoncredsSchemaName:The name of the schema, which is"schema_name".anoncredsSchemaVersion:The version of the schema,"1.0".anoncredsIssuerDid:The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".anoncredsCredDefId:The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".jsonldContextUrl:The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".predicates:This object contains predicates associated with the proof request.attributeName:This is the name of the attribute involved in the predicate. Here, the attribute is"age".pType:The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.pValue:The value used for the predicate comparison. Here, it is0.proofValidTill:The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".proofValidFrom:The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".restrictions:The same restrictions are applied to the predicate as the ones for the attributes.proofType:The type of proof being defined. In this case, the value is"ANONCREDS", indicating the proof uses anonymous credentials.purpose:This describes the purpose of the proof request. Here, the purpose is"for verify anoncreds credential", indicating that the proof request is meant to verify anonymous credentials.createdAt:The timestamp of when the proof request definition was created. In this case, it was created on"2024-07-19T11:55:33.799Z".updatedAt:The timestamp of when the proof request definition was last updated. It was last updated on"2024-07-19T11:55:33.799Z".

This object contains the main data related to the fetched proof request definitions.

items:

- This is an array containing the details of each proof request definition retrieved. In this case, it contains one proof request definition.

- proofDefineId:The unique identifier for the proof request definition. In this case, the value is1.

- name:This is the name of the proof request definition. In this case, the name is"bcovrin proof define".

- attributes:This object contains the attributes required for the proof request.attributes:This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".proofValidTill:The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.proofValidFrom:The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".restrictions:This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.anoncredsSchemaId:The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".anoncredsSchemaIssuerDid:The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".anoncredsSchemaName:The name of the schema, which is"schema_name".anoncredsSchemaVersion:The version of the schema,"1.0".anoncredsIssuerDid:The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".anoncredsCredDefId:The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".jsonldContextUrl:The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".

- predicates:This object contains predicates associated with the proof request.attributeName:This is the name of the attribute involved in the predicate. Here, the attribute is"age".pType:The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.pValue:The value used for the predicate comparison. Here, it is0.proofValidTill:The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".proofValidFrom:The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".restrictions:The same restrictions are applied to the predicate as the ones for the attributes.

- proofType:The type of proof being defined. In this case, the value is"ANONCREDS", indicating the proof uses anonymous credentials.

- purpose:This describes the purpose of the proof request. Here, the purpose is"for verify anoncreds credential", indicating that the proof request is meant to verify anonymous credentials.

- createdAt:The timestamp of when the proof request definition was created. In this case, it was created on"2024-07-19T11:55:33.799Z".

- updatedAt:The timestamp of when the proof request definition was last updated. It was last updated on"2024-07-19T11:55:33.799Z".

This is an array containing the details of each proof request definition retrieved. In this case, it contains one proof request definition.

proofDefineId:

- The unique identifier for the proof request definition. In this case, the value is1.

The unique identifier for the proof request definition. In this case, the value is1.

name:

- This is the name of the proof request definition. In this case, the name is"bcovrin proof define".

This is the name of the proof request definition. In this case, the name is"bcovrin proof define".

attributes:

- This object contains the attributes required for the proof request.

- attributes:This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".

- proofValidTill:The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.

- proofValidFrom:The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".

- restrictions:This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.anoncredsSchemaId:The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".anoncredsSchemaIssuerDid:The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".anoncredsSchemaName:The name of the schema, which is"schema_name".anoncredsSchemaVersion:The version of the schema,"1.0".anoncredsIssuerDid:The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".anoncredsCredDefId:The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".jsonldContextUrl:The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".

This object contains the attributes required for the proof request.

attributes:

- This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".

This is an array of attributes that are requested in the proof request. Here, the attributes are"full_name"and"email_address".

proofValidTill:

- The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.

The expiration date for the proof request validity, which is"2025-04-15T10:57:50.022Z". This indicates when the proof request becomes invalid.

proofValidFrom:

- The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".

The date from which the proof request is valid, which is"2025-04-15T10:57:50.026Z".

restrictions:

- This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.

- anoncredsSchemaId:The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".

- anoncredsSchemaIssuerDid:The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".

- anoncredsSchemaName:The name of the schema, which is"schema_name".

- anoncredsSchemaVersion:The version of the schema,"1.0".

- anoncredsIssuerDid:The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".

- anoncredsCredDefId:The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".

- jsonldContextUrl:The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".

This is an array of restrictions applied to the proof request. It contains information about the schema and credential definition used.

anoncredsSchemaId:

- The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".

The schema identifier for the credential. In this case,"WgWxqztrNooG92RXvxSTWv:2:schema_name:1.0".

anoncredsSchemaIssuerDid:

- The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".

The issuer's DID (Decentralized Identifier) associated with the schema. Here, it is"WgWxqztrNooG92RXvxSTWv".

anoncredsSchemaName:

- The name of the schema, which is"schema_name".

The name of the schema, which is"schema_name".

anoncredsSchemaVersion:

- The version of the schema,"1.0".

The version of the schema,"1.0".

anoncredsIssuerDid:

- The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".

The DID of the issuer for the credentials,"WgWxqztrNooG92RXvxSTWv".

anoncredsCredDefId:

- The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".

The credential definition ID for the credential,"WgWxqztrNooG92RXvxSTWv:3:CL:20:tag".

jsonldContextUrl:

- The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".

The URL for the JSON-LD context used,"https://w3id.org/citizenship/v1".

predicates:

- This object contains predicates associated with the proof request.

- attributeName:This is the name of the attribute involved in the predicate. Here, the attribute is"age".

- pType:The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.

- pValue:The value used for the predicate comparison. Here, it is0.

- proofValidTill:The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

- proofValidFrom:The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

- restrictions:The same restrictions are applied to the predicate as the ones for the attributes.

This object contains predicates associated with the proof request.

attributeName:

- This is the name of the attribute involved in the predicate. Here, the attribute is"age".

This is the name of the attribute involved in the predicate. Here, the attribute is"age".

pType:

- The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.

The predicate type, which is" < "(less than), meaning that the proof must satisfy a condition where the value of the attribute is less than a specific value.

pValue:

- The value used for the predicate comparison. Here, it is0.

The value used for the predicate comparison. Here, it is0.

proofValidTill:

- The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

The expiration date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

proofValidFrom:

- The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

The start date for the predicate validity, which is"2025-04-15T10:57:50.027Z".

restrictions:

- The same restrictions are applied to the predicate as the ones for the attributes.

The same restrictions are applied to the predicate as the ones for the attributes.

proofType:

- The type of proof being defined. In this case, the value is"ANONCREDS", indicating the proof uses anonymous credentials.

The type of proof being defined. In this case, the value is"ANONCREDS", indicating the proof uses anonymous credentials.

purpose:

- This describes the purpose of the proof request. Here, the purpose is"for verify anoncreds credential", indicating that the proof request is meant to verify anonymous credentials.

This describes the purpose of the proof request. Here, the purpose is"for verify anoncreds credential", indicating that the proof request is meant to verify anonymous credentials.

createdAt:

- The timestamp of when the proof request definition was created. In this case, it was created on"2024-07-19T11:55:33.799Z".

The timestamp of when the proof request definition was created. In this case, it was created on"2024-07-19T11:55:33.799Z".

updatedAt:

- The timestamp of when the proof request definition was last updated. It was last updated on"2024-07-19T11:55:33.799Z".

The timestamp of when the proof request definition was last updated. It was last updated on"2024-07-19T11:55:33.799Z".

meta:

- This object provides pagination information about the retrieved data.

- totalItems:The total number of proof request definitions available, which is100.

- itemCount:The number of items returned in the current page, which is10.

- itemsPerPage:The number of items displayed per page, which is10.

- totalPages:The total number of pages available, which is10.

- currentPage:The current page being viewed, which is1.

This object provides pagination information about the retrieved data.

totalItems:

- The total number of proof request definitions available, which is100.

The total number of proof request definitions available, which is100.

itemCount:

- The number of items returned in the current page, which is10.

The number of items returned in the current page, which is10.

itemsPerPage:

- The number of items displayed per page, which is10.

The number of items displayed per page, which is10.

totalPages:

- The total number of pages available, which is10.

The total number of pages available, which is10.

currentPage:

- The current page being viewed, which is1.

The current page being viewed, which is1.

### Test Scenario 9:Use the details below to verify the proof presentation received

### Objective: Verify the proof  presentation received

Testing Steps:

1. Create Request:Open Postman and create a new request.Name the request "Verify Proof presentation".Set the request type to POST.Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/verify.

1. Add Authorization:Click on theAuthorizationtab.SelectAPI Keyfrom the dropdown.Set theKeytoapi-key.Set theValueto{{apiKey}}.

1. Request Body

Create Request:

- Open Postman and create a new request.

- Name the request "Verify Proof presentation".

- Set the request type to POST.

- Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/verify.

Open Postman and create a new request.

Name the request "Verify Proof presentation".

Set the request type to POST.

Set the URL to{{baseUrl}}/api/lob/{lob_id}/proof/verify.

Add Authorization:

- Click on theAuthorizationtab.

- SelectAPI Keyfrom the dropdown.

- Set theKeytoapi-key.

- Set theValueto{{apiKey}}.

Click on theAuthorizationtab.

SelectAPI Keyfrom the dropdown.

Set theKeytoapi-key.

Set theValueto{{apiKey}}.

Request Body

```

{
  "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
  "createClaim": false
}

```

1. Detailed Breakdown

1. credProofId:The unique identifier for the proof request. In this case, it is"58e02d58-a762-469e-84ba-882a47345775". This ID is used to refer to a specific proof request in the system.createClaim:A boolean flag indicating whether a claim should be created for this proof request. Here, the value isfalse, meaning that no claim will be created for this proof request.

1. Send Request:ClickSend.Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

1. Response Body

Detailed Breakdown

- credProofId:The unique identifier for the proof request. In this case, it is"58e02d58-a762-469e-84ba-882a47345775". This ID is used to refer to a specific proof request in the system.

- createClaim:A boolean flag indicating whether a claim should be created for this proof request. Here, the value isfalse, meaning that no claim will be created for this proof request.

credProofId:

- The unique identifier for the proof request. In this case, it is"58e02d58-a762-469e-84ba-882a47345775". This ID is used to refer to a specific proof request in the system.

The unique identifier for the proof request. In this case, it is"58e02d58-a762-469e-84ba-882a47345775". This ID is used to refer to a specific proof request in the system.

createClaim:

- A boolean flag indicating whether a claim should be created for this proof request. Here, the value isfalse, meaning that no claim will be created for this proof request.

A boolean flag indicating whether a claim should be created for this proof request. Here, the value isfalse, meaning that no claim will be created for this proof request.

Send Request:

- ClickSend.

- Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

ClickSend.

Verify the response with sample response below and check the status code to be 201 to ensure the proof request is defined successfully

Response Body

```


{
  "success": true,
  "message": "Proof request verified successfully.",
  "data": {
    "status": "success",
    "data": {
      "credProofId": "58e02d58-a762-469e-84ba-882a47345775",
      "updatedAt": "2024-11-25T12:34:56Z",
      "createdAt": "2024-11-25T12:34:56Z",
      "proofStatus": "done",
      "proofAutoVerify": true,
      "comment": "Proof successfully verified.",
      "contactId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "verified": true,
      "errorMsg": "abandoned"
    },
    "proofAttributes": {
      "HiNg6sdwNYwPRTTP9VkwpT:3:CL:2535708:Aadhar_card": [
        {
          "credentialName": "HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card",
          "attributes": [
            {
              "full_name": "John Doe"
            }
          ]
        }
      ]
    }

```

Detailed Breakdown

- success:Indicates the overall status of the operation. Here, it istrue, meaning the proof request has been successfully processed.

- message:A message that gives additional context about the result. In this case,"Proof request verified successfully."indicates that the proof request has been successfully verified.

success:

- Indicates the overall status of the operation. Here, it istrue, meaning the proof request has been successfully processed.

Indicates the overall status of the operation. Here, it istrue, meaning the proof request has been successfully processed.

message:

- A message that gives additional context about the result. In this case,"Proof request verified successfully."indicates that the proof request has been successfully verified.

A message that gives additional context about the result. In this case,"Proof request verified successfully."indicates that the proof request has been successfully verified.

Data:

- status:Indicates the result of the verification process. Here, it is"success", meaning the verification was successful.

- credProofId:The unique identifier for the proof request, which is"58e02d58-a762-469e-84ba-882a47345775". This ID links the proof request to the specific verification process.

- updatedAtandcreatedAt:Timestamps indicating when the proof request was created and when it was last updated. Both values are"2024-11-25T12:34:56Z", indicating the proof request was created and updated at the same time.

- proofStatus:The current status of the proof request. It is"done", meaning the proof request was successfully completed and verified.

- proofAutoVerify:Indicates whether the proof was automatically verified. It is set totrue, meaning the proof was verified automatically.

- comment:A comment associated with the proof request verification. Here, it is"Proof successfully verified.", indicating the successful completion of the verification.

- contactId:A unique identifier for the contact associated with the proof request,"3fa85f64-5717-4562-b3fc-2c963f66afa6". This ID links the proof to a specific contact.

- verified:A boolean value indicating whether the proof was successfully verified. In this case, it istrue, indicating that the proof has been successfully verified.

- errorMsg:A message indicating any errors encountered during the verification process. Here,"abandoned"could imply that the proof was either not completed or abandoned at some stage.

status:

- Indicates the result of the verification process. Here, it is"success", meaning the verification was successful.

Indicates the result of the verification process. Here, it is"success", meaning the verification was successful.

credProofId:

- The unique identifier for the proof request, which is"58e02d58-a762-469e-84ba-882a47345775". This ID links the proof request to the specific verification process.

The unique identifier for the proof request, which is"58e02d58-a762-469e-84ba-882a47345775". This ID links the proof request to the specific verification process.

updatedAtandcreatedAt:

- Timestamps indicating when the proof request was created and when it was last updated. Both values are"2024-11-25T12:34:56Z", indicating the proof request was created and updated at the same time.

Timestamps indicating when the proof request was created and when it was last updated. Both values are"2024-11-25T12:34:56Z", indicating the proof request was created and updated at the same time.

proofStatus:

- The current status of the proof request. It is"done", meaning the proof request was successfully completed and verified.

The current status of the proof request. It is"done", meaning the proof request was successfully completed and verified.

proofAutoVerify:

- Indicates whether the proof was automatically verified. It is set totrue, meaning the proof was verified automatically.

Indicates whether the proof was automatically verified. It is set totrue, meaning the proof was verified automatically.

comment:

- A comment associated with the proof request verification. Here, it is"Proof successfully verified.", indicating the successful completion of the verification.

A comment associated with the proof request verification. Here, it is"Proof successfully verified.", indicating the successful completion of the verification.

contactId:

- A unique identifier for the contact associated with the proof request,"3fa85f64-5717-4562-b3fc-2c963f66afa6". This ID links the proof to a specific contact.

A unique identifier for the contact associated with the proof request,"3fa85f64-5717-4562-b3fc-2c963f66afa6". This ID links the proof to a specific contact.

verified:

- A boolean value indicating whether the proof was successfully verified. In this case, it istrue, indicating that the proof has been successfully verified.

A boolean value indicating whether the proof was successfully verified. In this case, it istrue, indicating that the proof has been successfully verified.

errorMsg:

- A message indicating any errors encountered during the verification process. Here,"abandoned"could imply that the proof was either not completed or abandoned at some stage.

A message indicating any errors encountered during the verification process. Here,"abandoned"could imply that the proof was either not completed or abandoned at some stage.

Proof Attributes:

- proofAttributes:Contains the attributes of the proof. In this case, the proof includes attributes related to an Aadhar card.HiNg6sdwNYwPRTTP9VkwpT:3:CL:2535708:Aadhar_card:This is the unique identifier for a credential related to the Aadhar card.credentialName:The name of the credential being referenced,"HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card".attributes:An array of attributes associated with this credential. In this case, the attribute"full_name": "John Doe"is provided, indicating the full name of the individual for the Aadhar card credential.

proofAttributes:

- Contains the attributes of the proof. In this case, the proof includes attributes related to an Aadhar card.

- HiNg6sdwNYwPRTTP9VkwpT:3:CL:2535708:Aadhar_card:This is the unique identifier for a credential related to the Aadhar card.credentialName:The name of the credential being referenced,"HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card".attributes:An array of attributes associated with this credential. In this case, the attribute"full_name": "John Doe"is provided, indicating the full name of the individual for the Aadhar card credential.

Contains the attributes of the proof. In this case, the proof includes attributes related to an Aadhar card.

HiNg6sdwNYwPRTTP9VkwpT:3:CL:2535708:Aadhar_card:

- This is the unique identifier for a credential related to the Aadhar card.

- credentialName:The name of the credential being referenced,"HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card".

- attributes:An array of attributes associated with this credential. In this case, the attribute"full_name": "John Doe"is provided, indicating the full name of the individual for the Aadhar card credential.

This is the unique identifier for a credential related to the Aadhar card.

credentialName:

- The name of the credential being referenced,"HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card".

The name of the credential being referenced,"HiNg6sdwNYwPRTTP9VkwpT:3:CL:2545708:Aadhar_card".

attributes:

- An array of attributes associated with this credential. In this case, the attribute"full_name": "John Doe"is provided, indicating the full name of the individual for the Aadhar card credential.

An array of attributes associated with this credential. In this case, the attribute"full_name": "John Doe"is provided, indicating the full name of the individual for the Aadhar card credential.