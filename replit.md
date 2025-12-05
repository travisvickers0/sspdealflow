# SSP Deal Flow - Real Estate Investment Platform

## Overview

SSP Deal Flow is a full-stack real estate investment platform built for accredited investors to discover, analyze, and commit capital to vetted property opportunities. The application features a modern, Apple/Airbnb-inspired design with comprehensive property management, investment tracking, and administrative tools.

The platform enables investors to browse curated real estate deals, review detailed financial metrics, analyze comparable properties with interactive maps, and commit investment capital through a streamlined workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing without heavy dependencies
- React Query (@tanstack/react-query) for server state management, caching, and automatic refetching

**UI Component System**
- shadcn/ui component library (New York style) providing pre-built, accessible React components
- Radix UI primitives for unstyled, accessible component foundations
- Tailwind CSS v4 (using @tailwind directives) for utility-first styling with CSS variables for theming
- Custom design system inspired by Apple and Airbnb with generous whitespace, rounded cards, and subtle shadows
- Lucide icons for consistent iconography throughout the application

**State Management Pattern**
- Server state managed through React Query with queries and mutations
- Local UI state handled with React hooks (useState, useEffect)
- Form state managed by react-hook-form with Zod validation resolvers
- No global client-side state management library (Redux/Zustand) - leveraging React Query's caching

**Key Frontend Features**
- Property gallery with lightbox using yet-another-react-lightbox
- Google Maps integration via @react-google-maps/api for property and comparable location visualization
- Drag-and-drop functionality using @dnd-kit for sortable property images
- Responsive design with mobile-first approach
- Real-time property data updates with configurable refetch intervals

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for the HTTP server
- TypeScript with ES modules (type: "module" in package.json)
- Production build uses esbuild for fast bundling with selective dependency bundling

**API Design**
- RESTful API endpoints under `/api` prefix
- Public endpoints: GET /api/properties, GET /api/properties/:id
- Admin endpoints: POST/PUT/DELETE /api/admin/properties for CRUD operations
- File upload endpoints for property photos and documents (BPOs, contracts)
- Multipart form data handling via multer middleware

**Request/Response Flow**
- Express middleware for JSON parsing with raw body capture for webhooks
- Custom logging middleware that tracks request duration and response status
- API routes excluded from Vite middleware in development
- Static file serving from dist/public in production

**Development vs Production**
- Development: Vite dev server middleware integrated with Express for HMR
- Production: Pre-built static assets served from dist/public
- Environment-specific plugin loading (Replit cartographer and dev banner only in development)

### Data Storage Solutions

**Database**
- PostgreSQL via Neon serverless with WebSocket connections
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with shared TypeScript types between client and server
- Database migrations in `./migrations` directory managed by drizzle-kit

**Database Schema**
- `users` table: Admin-only authentication (username, hashed password, role)
- `properties` table: Core property data including address, financials, images, status, coordinates
- `activityLogs` table: Audit trail for property and commitment actions
- Property status workflow: needs_funding → committed → funded → archived

**File Storage**
- Local file system storage in `/uploads` directory
- Organized subdirectories: `/uploads/photos` and `/uploads/documents`
- Multer disk storage with unique filename generation (timestamp + random suffix)
- File type validation: images (JPEG, PNG, WebP) and PDFs only
- 10MB file size limit enforced at middleware level

**Data Validation**
- Zod schemas generated from Drizzle schema using drizzle-zod
- Runtime validation for API inputs with detailed error messages
- Type safety enforced across client-server boundary via shared schema exports

### Authentication and Authorization

**Current Implementation**
- Admin-only system with no public user authentication currently implemented
- User table exists with password field for future authentication
- No session management or JWT implementation in current codebase
- Protected admin routes rely on frontend routing without backend enforcement

**Design for Future Enhancement**
- Schema supports role-based access (admin role field in users table)
- Foundation for implementing passport.js or similar authentication middleware
- Session storage could be added using connect-pg-simple or memorystore

### External Dependencies

**Google Services**
- Google Maps JavaScript API for interactive property and comparable sale maps
- Geocoding API for converting addresses to latitude/longitude coordinates
- API key required via GOOGLE_MAPS_API_KEY environment variable

**OpenAI Integration**
- OpenAI GPT models for BPO (Broker Price Opinion) document extraction
- PDF parsing to extract property details, comparable sales, and repair estimates
- Structured data extraction from unstructured documents
- API key required via OPENAI_API_KEY environment variable

**Database Provider**
- Neon serverless PostgreSQL (via @neondatabase/serverless package)
- WebSocket-based connection pooling for serverless compatibility
- Connection string required via DATABASE_URL environment variable

**Build and Development Tools**
- Replit-specific plugins: vite-plugin-cartographer, vite-plugin-dev-banner, vite-plugin-runtime-error-modal
- Custom vite-plugin-meta-images for OpenGraph image URL updates in Replit deployments
- ESBuild for production bundling with selective dependency externalization

**UI and Component Libraries**
- Complete Radix UI suite for headless components (dialog, select, dropdown, etc.)
- Recharts for data visualization (if analytics features are added)
- react-hook-form with @hookform/resolvers for form validation integration

**Development Dependencies**
- tsx for running TypeScript directly in development
- drizzle-kit for database schema management and migrations
- Tailwind CSS with autoprefixer via PostCSS