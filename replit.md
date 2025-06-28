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
- **Environment Variables**: DATABASE_URL, VC_API_KEY, VC_API_BASE_URL
- **WebSocket Support**: Server must support WebSocket connections
- **File Storage**: Optional logo upload functionality

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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```