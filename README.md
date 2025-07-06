# VC Form Builder

A comprehensive form builder application with optional Verifiable Credentials (VC) integration. The system provides both plain form functionality and advanced credential verification workflows behind a feature flag.

## Architecture

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query

### Monorepo Structure
```
/apps
  /web          - React frontend application
  /api          - Express.js backend API
/packages
  /shared       - Shared TypeScript types and utilities
  /external     - External service client libraries
/tests
  /unit         - Unit tests for utilities and services
  /e2e          - End-to-end browser tests
  /fixtures     - Test data and mock responses
```

## Features

### Plain Form Mode (Default)
- Drag-and-drop form builder with 6 component types
- Form submission with database persistence
- Public form sharing via URLs
- Preview mode for testing
- Form management dashboard

### VC Mode (Optional)
- Verifiable credential verification workflows
- QR code generation for wallet integration
- Real-time WebSocket verification notifications
- Automatic form field population from verified credentials
- Orbit Enterprise integration for proof requests

## Feature Flag System

The application uses environment variables to toggle VC functionality:

### Environment Variables

#### Backend (.env)
```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/database

# Verifiable Credentials Feature Flag
ENABLE_VC=false          # Set to "true" to enable VC endpoints

# Orbit Enterprise Configuration (only needed when ENABLE_VC=true)
ORBIT_API_KEY=your_api_key
ORBIT_LOB_ID=your_lob_id
```

#### Frontend (VITE_* prefixed for browser access)
```bash
# Verifiable Credentials Feature Flag
VITE_ENABLE_VC=false     # Set to "true" to enable VC UI components
```

### Flag Behavior

| ENABLE_VC | VITE_ENABLE_VC | Backend Routes | Frontend UI | Use Case |
|-----------|----------------|----------------|-------------|----------|
| false     | false          | Plain only     | Plain only  | Production plain forms |
| true      | false          | VC enabled     | Plain only  | Backend VC testing |
| false     | true           | Plain only     | VC UI       | Frontend VC development |
| true      | true           | VC enabled     | VC enabled  | Full VC functionality |

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Configure your database URL in .env
DATABASE_URL=postgresql://...

# Start development servers
pnpm dev
```

The `pnpm dev` command starts both frontend (port 5173) and backend (port 5000) in watch mode.

### Database Setup
```bash
# Push schema changes to database
pnpm db:push

# View database in browser
pnpm db:studio
```

## Testing

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run specific test file
npx vitest tests/unit/featureFlag.test.ts

# Run tests in watch mode
pnpm test:watch
```

### E2E Tests
```bash
# Run E2E tests (requires running dev server)
npx vitest tests/e2e/

# Run specific E2E test
npx vitest tests/e2e/formSubmission.e2e.test.ts
```

### Test Coverage
- **Unit Tests**: Utilities, mapping extraction, API services
- **E2E Tests**: Form submission workflows, feature flag behavior
- **Integration Tests**: Database operations, external API integration

## VC Integration

### Enabling VC Mode
1. Set environment variables:
   ```bash
   ENABLE_VC=true
   VITE_ENABLE_VC=true
   ```

2. Configure Orbit Enterprise credentials:
   ```bash
   ORBIT_API_KEY=your_api_key
   ORBIT_LOB_ID=your_lob_id
   ```

3. Restart the development server

### VC Form Schema
When VC mode is enabled, form components support additional `vcConfig` properties:

```json
{
  "key": "fullName",
  "type": "textfield",
  "vcConfig": {
    "credentialType": "BC Person Credential",
    "attributeName": "given_name",
    "mode": "required"
  }
}
```

### VC Workflow
1. Form detects VC requirements
2. Proof request generated via Orbit Enterprise API
3. QR code displayed for wallet scanning
4. WebSocket connection for real-time verification
5. Verified data auto-populates form fields
6. User completes remaining fields and submits

## API Endpoints

### Plain Form API (Always Available)
- `GET /api/forms` - List user forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get form by ID
- `POST /api/forms/:id/submit` - Submit form data
- `GET /api/pub-forms/:slug` - Get public form by slug

### VC API (Only when ENABLE_VC=true)
- `POST /api/proofs/init` - Initialize proof request
- `GET /api/proofs/:id/qr` - Get QR code for proof
- `POST /api/define-proof/:formId` - Define proof requirements
- `GET /api/oca/*` - OCA bundle assets

## Deployment

### Environment Configuration
1. Set production environment variables
2. Configure database connection
3. Set ENABLE_VC based on feature requirements

### Build Process
```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

### Feature Flag in Production
- **Plain Forms Only**: Set `ENABLE_VC=false` for lightweight deployment
- **Full VC Integration**: Set `ENABLE_VC=true` with proper Orbit Enterprise credentials

## Security Considerations

- Database credentials secured via environment variables
- VC API keys never exposed to frontend
- WebSocket connections authenticated for real-time verification
- Form submissions validated on both frontend and backend

## Contributing

### Code Quality
- ESLint + Prettier for code formatting
- Husky pre-commit hooks for quality gates
- TypeScript strict mode enabled
- 100% type coverage for API interfaces

### Testing Standards
- All new features require unit tests
- E2E tests for critical user workflows
- Feature flag tests for toggle behavior
- No mock data in production code paths

## License

[License information here]