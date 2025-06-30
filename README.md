# Form Builder Pro - VC Integration

A professional form builder with Verifiable Credentials (VC) integration using Orbit Enterprise APIs for real-time credential verification and automatic credential issuance.

## Features

- **Dynamic Form Builder**: Drag-and-drop interface for creating forms with VC integration
- **Real-time Credential Verification**: WebSocket-based proof verification using Orbit Enterprise
- **Automatic Field Population**: Verified credential data automatically fills form fields
- **Credential Issuance**: Forms can trigger automatic credential issuance upon submission
- **Wallet Compatibility**: Support for BC Wallet and other AIP 2.0 compatible wallets
- **Community Forms**: Public form sharing and cloning capabilities

## How Proof Verification Works

The application implements a complete proof verification lifecycle using Orbit Enterprise's AIP2 present-proof endpoints:

### 1. Proof Request Initialization
When a user accesses a form with verified credential fields:
- System detects VC requirements from form metadata
- Creates proof request via `POST /api/present-proof/aip2/create`
- Generates QR code and deep links for wallet interaction

### 2. Real-time Verification Flow
```
User scans QR → Wallet presents credentials → Orbit Enterprise validates proof → 
WebSocket notification → Form fields auto-populate → Fields marked read-only
```

### 3. WebSocket Integration
- Frontend establishes WebSocket connection on form load
- Backend receives Orbit webhook notifications
- Real-time broadcast of verification results to connected clients
- Automatic form field population upon successful verification

### 4. API Endpoints

**Proof Management:**
- `POST /api/proofs/init` - Initialize proof request for form
- `GET /api/proofs/:txId` - Poll proof verification status
- `POST /webhook/orbit` - Receive Orbit Enterprise webhooks

**Credential Issuance:**
- `POST /api/credentials/schema` - Create credential schemas
- `POST /api/credentials/definition` - Setup credential definitions
- `POST /api/credentials/issue` - Issue credentials to holders

## Environment Configuration

Required environment variables for Orbit Enterprise integration:

```env
# Orbit Enterprise Configuration
ORBIT_BASE=https://your-orbit-instance.com
ORBIT_API_KEY=your-orbit-api-key

# Organization Details (for LOB registration)
LOB_DISPLAY_NAME=Your Organization
LOB_EMAIL=contact@yourorg.com
LOB_ORG_NAME=Your Organization Ltd
LOB_ROLE=Credential Issuer,Verifier
LOB_TENANCY=your-tenancy
LOB_DID_METHOD=indy
```

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env` and configure Orbit Enterprise credentials

3. **Register LOB (One-time setup):**
   ```bash
   npm run register-lob
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   Navigate to `http://localhost:5000`

## Architecture

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Real-time:** WebSocket server for proof notifications
- **VC Integration:** Orbit Enterprise APIs for credential lifecycle management

## Credential Library

The application includes pre-configured government credentials:
- **BC Digital Business Card v1**: Business registration verification
- **BC Person Credential v1**: Identity verification
- **BC Lawyer Credential v1**: Professional licensing verification

All credentials use authentic schemas from the CANdy ledger and support AIP 2.0 protocol compatibility.