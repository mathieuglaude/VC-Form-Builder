# Form Builder Pro - VC Integration

## Overview

This is a full-stack TypeScript application that provides a professional form builder with Verifiable Credentials (VC) integration. The system allows administrators to create dynamic forms using a drag-and-drop interface, where form fields can be auto-populated with verified data from digital credentials. The application follows a modern web architecture with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Building**: Form.io React components (@formio/react) for drag-and-drop form creation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for VC verification notifications
- **API Design**: RESTful API with JSON responses

### Database Layer
- **ORM**: Drizzle ORM for PostgreSQL with type-safe schema definitions
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Form Builder System
- **Interactive Builder**: Drag-and-drop interface using Form.io components
- **Component Library**: Standard form elements (text, email, select, checkbox, textarea, number, datetime)
- **Enhanced Metadata**: Extended form components with VC integration properties
- **Real-time Preview**: Instant form preview during building

### Verifiable Credentials Integration
- **Data Source Types**: 
  - Free Text (manual entry)
  - Pick List (predefined options)
  - Verified Attribute (auto-filled from VC)
- **Proof Requests**: Configurable credential verification requirements
- **Real-time Verification**: WebSocket-based notification system for instant credential verification
- **Auto-population**: Automatic form field population upon successful VC verification

### User Interface Components
- **Form Builder Page**: Administrative interface for creating and editing forms
- **Form Fill Page**: Public interface for form completion with VC integration
- **VC Modal**: Interactive credential verification interface with QR codes and deep links
- **Verified Badge**: Visual indicator for fields verified through VCs

## Data Flow

### Form Creation Flow
1. Admin accesses builder interface
2. Drags components from library to form canvas
3. Configures component properties including VC mappings
4. Saves form configuration to database with metadata
5. Form becomes available for public access

### Form Completion Flow
1. User accesses public form via unique URL
2. System checks for VC requirements and initiates proof request
3. User scans QR code or follows deep link to wallet
4. Wallet presents credentials to verification service
5. WebSocket notifies frontend of successful verification
6. Form fields auto-populate with verified data
7. User completes remaining fields and submits form

### Real-time Verification Flow
1. Frontend establishes WebSocket connection with unique client ID
2. Proof request sent to VC API service
3. User completes verification in wallet app
4. VC API webhook notifies backend of verification
5. Backend broadcasts verification result via WebSocket
6. Frontend receives notification and updates form state

## External Dependencies

### Core Dependencies
- **@formio/react**: Form building and rendering components
- **@tanstack/react-query**: Server state management and caching
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **ws**: WebSocket server implementation

### UI Dependencies
- **@radix-ui/**: Comprehensive set of unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS-in-JS variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Concurrent Development**: Vite dev server for frontend, tsx for backend hot reload
- **Database**: Development database with Drizzle migrations
- **Environment Variables**: Local .env file for configuration

### Production Build
- **Frontend Build**: Vite builds optimized static assets
- **Backend Build**: esbuild bundles Node.js application
- **Database Migration**: Drizzle Kit handles schema migrations
- **Static Assets**: Frontend serves from dist/public directory

### Infrastructure Requirements
- **Database**: PostgreSQL instance (Neon serverless recommended)
- **Environment Variables**: DATABASE_URL, VC_API_KEY, VC_API_BASE_URL, ORBIT_API_KEY
- **WebSocket Support**: Server must support WebSocket connections
- **File Storage**: Optional logo upload functionality

### Orbit Enterprise Integration
- **LOB Registration**: One-time setup for credential issuance capabilities
- **Service**: `server/services/orbit.ts` for Orbit Enterprise API integration
- **Script**: `server/scripts/registerLOB.ts` for organization registration
- **Configuration**: Environment variables for organization details and API credentials

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
- June 28, 2025. Enhanced form builder with home dashboard and public form preview
  - Added form metadata (name, slug, purpose, logoUrl)
  - Created HomePage dashboard with form management grid
  - Added PreviewPage for public form access via /f/:slug
  - Enhanced form builder with metadata collection
  - Updated database schema and storage layer
- June 28, 2025. Added navigation menu and updated BC Government credentials
  - Created top navigation bar with Form Builder and Credentials menu items
  - Updated BC Digital Business Card v1 with real attributes from CANdy ledger
  - Updated BC Person Credential v1 with official attributes from BC documentation
  - Added isPredefined flag to prevent editing of government credentials
  - Enhanced credential library UI with BC Government badges and disabled editing
- June 28, 2025. Fixed form builder crashes and added flexible credential verification
  - Completely rewrote FormBuilder component with clean React state management
  - Fixed drag-and-drop crashes and edit functionality issues
  - Added flexible credential verification modes:
    * Optional: Users can present credential OR fill manually (auto-populates if credential presented)
    * Required: Users must present valid credential to proceed (no manual entry allowed)
  - Enhanced field configuration modal with credential mode selection
  - Updated component preview to display credential verification requirements
- June 28, 2025. Reverted complex Form.io integration back to simple form builder
  - User found full Form.io integration too complicated
  - Restored clean, working form builder with basic components
  - Maintained VC integration and flexible verification modes
  - Kept simple drag-and-drop interface with 6 core component types
- June 28, 2025. Added ecosystem and interop profile filtering to credential library
  - Extended credential templates with ecosystem and interopProfile fields
  - Added filtering interface with search, ecosystem, and interop profile filters
  - BC Government credentials tagged with "BC Ecosystem" and "AIP 2.0"
  - Users can filter credentials by technical requirements for different wallet providers
  - Enhanced credential creation form with ecosystem and interop profile fields
- June 28, 2025. Implemented detailed credential pages with navigation
  - Created comprehensive credential detail pages with full attribute lists and technical specs
  - Made credential cards clickable to navigate to /credentials/:id detail pages
  - Removed all edit/delete functionality from credential library as requested
  - Added governance information, copy-to-clipboard functionality, and quick actions
  - All credentials are now read-only to provide stable foundation for users
- June 28, 2025. Enhanced navigation and added Wallet Library
  - Renamed "Credentials" menu item to "Credential Library" for clarity
  - Added new "Wallet Library" menu item with comprehensive wallet directory
  - Created wallet comparison page with filtering by platform and protocol support
  - Focused on Canadian government wallets: BC Wallet and NB Orbit Edge Wallet (Northern Block)
  - Both wallets support AIP 2.0 protocol compatibility with government credentials
  - Added download links and feature comparisons for each wallet
- June 28, 2025. Implemented wallet compatibility and form builder integration
  - Added wallet restriction metadata to credential templates (compatibleWallets, walletRestricted fields)
  - BC Government credentials are now marked as restricted to BC Wallet only
  - Created WalletSelector component for form builders to choose compatible wallets
  - Form builders can now specify which wallets to recommend to end users
  - Credential library displays wallet compatibility information and restrictions
  - Form creation process now includes wallet selection for credential-based forms
- June 28, 2025. Migrated to persistent database storage
  - Replaced in-memory storage with PostgreSQL database storage using Drizzle ORM
  - Forms and credentials now persist through application restarts and updates
  - Added automatic seeding of BC Government credentials on first run
  - Updated launch button to open forms in new browser tabs for testing
- June 28, 2025. Added revocation status control for credential verification
  - Form builders can now specify whether to accept revoked credentials on a per-credential basis
  - Added "Accept revoked credentials" checkbox in field configuration modal
  - Different business cases can have different policies (e.g., accept revoked person credentials but not business cards)
  - Visual indicators in form builder show revocation policy (Accepts Revoked vs Rejects Revoked badges)
  - Revocation settings are saved with form metadata and persist through database storage
- June 28, 2025. Completed Community Forms feature with homepage integration
  - Added "Publish to Community" toggle in form builder for sharing forms publicly
  - Created dedicated Community Forms section on homepage below user's personal forms
  - Built comprehensive community browsing page with filtering by purpose and search functionality
  - Implemented form cloning system allowing users to copy and customize public forms
  - Added sample community forms showcasing different credential verification scenarios
  - Community forms display author information and are clearly separated from user's own forms
- June 28, 2025. Implemented comprehensive account management system
  - Added user profile dropdown with initials in top-right navigation
  - Created Account Settings page at /account with full profile management
  - Implemented profile picture upload with camera overlay editing interface
  - Added personal information management: name, email, phone, organization, job title
  - Included professional details: LinkedIn profile, website, bio, location settings
  - Built account activity statistics showing form usage and engagement metrics
  - Added edit mode with proper form validation and success notifications
- June 28, 2025. Added LinkedIn-style image cropping tool and cleaned up credential library
  - Built interactive image cropper with drag-to-position and zoom controls for profile pictures
  - Implemented circular crop preview with real-time positioning feedback
  - Enhanced profile picture upload workflow with two-step process: upload → crop → save
  - Removed "View Documentation" links from credential library cards for cleaner interface
  - Documentation links still accessible on individual credential detail pages
  - Confirmed ExternalLink icon usage throughout homepage for consistent UX
- June 28, 2025. Added BC Lawyer Credential v1 to credential library
  - Seeded new BC Lawyer Credential from Law Society of BC (LSBC) production environment
  - Added real CANdy ledger schema ID: QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0
  - Included official credential definition ID and LSBC issuer DID
  - Added 6 key attributes: given_name, surname, public_person_id, member_status, member_status_code, credential_type
  - Tagged with BC Ecosystem and AIP 2.0 compatibility, restricted to BC Wallet
  - Links to official governance documentation at bcgov.github.io/digital-trust-toolkit
- June 29, 2025. Enhanced BC Lawyer Credential with official OCA branding and accurate governance
  - Fetched authentic Law Society of BC branding from official OCA bundle repository
  - Applied official LSBC logo, colors (#00698c primary, #1a2930 secondary), and background image
  - Updated issuer name to "Law Society of British Columbia (LSBC)" per governance documentation
  - Enhanced credential library to display human-readable issuer names instead of DIDs
  - Created professional credential card view on detail pages with authentic LSBC styling
  - Added issuer website links and accurate credential descriptions from governance document
- June 29, 2025. Completed OCA-branded card system with authentic LSBC assets and precise mockup matching
  - Built robust asset downloading system with proper ES module support and file structure
  - Downloaded authentic LSBC logo (8.8KB) and background image (138KB) from official OCA bundle
  - Created BannerBottomCard component with exact specifications: 420px width, 170px banner height, 56px logo
  - Positioned LSBC logo 20px from top-left corner with proper shadow and white background
  - Applied authentic teal color (#00698c) matching official LSBC brand guidelines
  - Served assets from /oca-assets/lsbc/ endpoint with immutable caching headers
  - Updated credential library grid with consistent 420px card widths and proper centering
  - BC Lawyer Credential now displays with banner-bottom layout showing grey banner with red diagonal stripe
  - Fixed logo positioning to sit beside text in teal strip for better readability
  - Cleaned up grid layout with proper spacing to prevent card overlapping
  - Finalized LSBC card layout with larger 80px logo and proper text positioning
  - "Law Society of BC" appears to the right of logo, "Lawyer Credential" below logo on left
- June 30, 2025. Added Orbit Enterprise integration for credential issuance capabilities
  - Implemented LOB (Line of Business) registration service for connecting to Northern Block's Orbit Enterprise
  - Created reusable Orbit service using native fetch API to avoid dependency conflicts
  - Added executable registration script for one-time organization setup
  - Added comprehensive environment configuration with organization details and API credentials
  - Updated deployment documentation with Orbit Enterprise integration requirements
- June 30, 2025. Implemented Orbit Presentation-Proof API integration for form flow
  - Added proof lifecycle API wrappers: createProofRequest, sendProofRequest, getProofStatus, verifyProofCallback
  - Implemented backend routes: POST /api/proofs/init, GET /api/proofs/:txId, POST /webhook/orbit
  - Updated VCModal component to display QR codes and deep links from Orbit Enterprise
  - Integrated WebSocket notifications for real-time proof verification status updates
  - Form fields now auto-populate from verified credential attributes upon successful verification
- June 30, 2025. Implemented Orbit Credential Issuance API with form submission pipeline
  - Added credential issuance API wrappers: createSchema, createCredentialDefinition, issueCredential, getIssuanceStatus
  - Implemented issuance action pipeline in form submission routes with automatic credential issuance
  - Created IssuanceActionModal component for configuring credential issuance actions in form builder
  - Integrated form field to credential attribute mapping interface for administrators
  - Added webhook handling for credential issuance status updates and WebSocket notifications
  - Form submissions now automatically trigger credential issuance based on configured actions
- June 30, 2025. Completed credential-based filtering system for Your Forms section
  - Fixed routing issue: HomePage component wasn't being used due to incorrect App.tsx routing configuration
  - Implemented working filter button in My Forms section with modal interface for credential selection
  - Added persistent localStorage-based filter preferences that survive page refreshes
  - Created filtering logic that shows forms requiring ALL selected credentials (AND logic)
  - Fixed form navigation to use numeric IDs instead of slugs for proper form editing access
  - Updated timestamps to display "Updated last" with localized formatting throughout dashboard
  - Added automatic cache refresh every 60 seconds to keep form listings current with latest changes
- June 30, 2025. Eliminated duplicate form-list page and streamlined navigation
  - Removed duplicate BuilderLandingPage - /builder now redirects directly to homepage
  - Updated navbar "Form Builder" link to point to dashboard (/) instead of /builder
  - Updated all "Create New Form" buttons to navigate directly to /builder/new
  - Removed dashboard header and stats cards from homepage for cleaner interface
  - Fixed form launch functionality to use correct route (/form/:id instead of /f/:slug)
  - Fixed "Create New Form" card click functionality with proper event handling
  - Streamlined user experience with one-click access to form creation
- June 30, 2025. Fixed responsive design and restored BC Lawyer Credential visibility
  - Implemented robust credential seeding system to safeguard BC Lawyer Credential from disappearing
  - Added automatic credential restoration on server startup with console confirmation
  - Enhanced API endpoint with proper sorting and error handling for consistent credential ordering
  - Fixed card display issues by reverting problematic CSS aspect-ratio to reliable fixed dimensions
  - Replaced rigid grid layout with flexible flexbox for better responsive behavior without overlap
  - Maintained optimal 420px card width while ensuring proper spacing on all screen sizes
  - Added health check endpoint (/api/admin/credentials/health) for manual credential restoration
  - BC Lawyer Credential with full LSBC branding now consistently visible in credential library
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```