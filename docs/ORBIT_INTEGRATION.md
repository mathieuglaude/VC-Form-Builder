# Orbit Enterprise Integration

This document explains how to set up credential issuance capabilities using Northern Block's Orbit Enterprise platform.

## Overview

The Orbit Enterprise integration enables your Form Builder application to:
- Register as a Line of Business (LOB) with Northern Block
- Issue verifiable credentials directly from your forms
- Connect to the BCovrin ledger for credential verification
- Support AnonCreds format with AIP 2.0 protocol

## Setup Process

### 1. Environment Configuration

Copy the environment variables from `.env.example` and update with your organization details:

```bash
# Required Orbit Configuration
ORBIT_BASE=https://api.nborbit.io          # Production endpoint
LOB_DISPLAY_NAME=Your Organization Name     # Display name for your LOB
LOB_EMAIL=admin@yourcompany.com             # Admin contact email
LOB_ORG_NAME=Your Company Inc.              # Legal organization name
LOB_ROLE=ISSUER                             # Role (ISSUER, VERIFIER, or both)
LOB_TENANCY=SINGLE                          # Tenancy model
LOB_DID_METHOD=did:sov                      # DID method for Sovrin
LOB_PROTOCOL=AIP2_0                         # Aries Interop Profile 2.0
WRITE_LEDGER_ID=1                           # BCovrin ledger ID
CRED_FORMAT=ANONCREDS                       # Credential format
```

### 2. LOB Registration

Run the registration script to submit your organization details:

```bash
tsx server/scripts/registerLOB.ts
```

Expected output:
```json
{
  "message": "LOB registered successfully",
  "transactionId": "tx_abc123def456",
  "status": "pending_approval"
}
```

### 3. Approval Process

After registration:
1. **Northern Block Review**: Your application will be reviewed by Northern Block administrators
2. **Email Notification**: You'll receive an email with:
   - Transaction ID confirmation
   - API key for authenticated requests
   - Next steps for credential schema registration

### 4. API Key Configuration

Once approved, add your API key to the environment:

```bash
ORBIT_API_KEY=your_api_key_here
```

## Optional Configuration

### Trust Framework
For organizations using trust frameworks:

```bash
LOB_TRUST_URL=https://your-trust-framework.com
LOB_TRUST_API_KEY=your_trust_api_key
```

### External Endorser
For custom endorser configuration:

```bash
LOB_EXTERNAL_ENDORSER=true
ENDORSER_DID=did:sov:your_endorser_did
ENDORSER_NAME=Your Endorser Name
```

## Next Steps

After successful LOB registration:

1. **Schema Registration**: Register your credential schemas
2. **Credential Definition**: Create credential definitions for issuance
3. **Form Integration**: Connect forms to credential issuance workflows
4. **Testing**: Test credential issuance with compatible wallets

## Troubleshooting

### Registration Failed
- Verify all required environment variables are set
- Check organization email domain is valid
- Ensure ORBIT_BASE URL is accessible

### API Key Issues
- Confirm registration approval email was received
- Verify API key is correctly set in environment
- Check key hasn't expired or been revoked

### Connection Problems
- Test network connectivity to `api.nborbit.io`
- Verify firewall allows HTTPS outbound connections
- Check for proxy configuration if behind corporate firewall

## Support

For technical support with Orbit Enterprise integration:
- **Documentation**: [Northern Block Gitbook](https://northern-block.gitbook.io/orbit-enterprise-api-documentation/)
- **API Reference**: LOB API endpoints and examples
- **Contact**: Northern Block technical support team