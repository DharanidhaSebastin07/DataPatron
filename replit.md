# DataPatron - Data Pipeline Platform

## Overview
AI-powered data ingestion pipeline frontend for Databricks Delta Lake. The platform visualizes 8 sequential AI agents that automate bronze layer data movement, with animated processing flows and interactive steps.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express.js with in-memory pipeline sessions + PostgreSQL for auth
- **Auth**: Replit OIDC (OpenID Connect) via passport + connect-pg-simple sessions
- **State Management**: TanStack React Query with 1-second polling during pipeline execution
- **Styling**: Shadcn/ui components, dark mode by default, Space Grotesk + Inter + JetBrains Mono fonts
- **Brand Colors**: Primary = purple/violet (hue 262)

## Key Files
- `client/src/pages/home.tsx` - Main page with welcome view + pipeline execution view
- `client/src/components/pipeline-flow.tsx` - Pipeline visualization strip + agent detail panel
- `client/src/components/chat-panel.tsx` - Chat interface with inline forms (credentials, table approval)
- `client/src/hooks/use-auth.ts` - Auth hook (useAuth) for login state, user info, logout
- `client/src/components/theme-provider.tsx` - Dark/light theme toggle with localStorage
- `server/routes.ts` - REST API endpoints for session management
- `server/storage.ts` - In-memory session storage + pipeline simulation engine
- `server/replit_integrations/auth/` - Replit Auth integration (OIDC, passport, sessions)
- `shared/schema.ts` - TypeScript types for pipeline, agents, messages
- `shared/models/auth.ts` - Users table (Drizzle) + auth types

## Database Tables
- `users` - Replit auth users (id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt)
- `sessions` - connect-pg-simple session store (auto-created)

## Pipeline Flow (8 Agents)
1. **MCA** - Parses natural language intent into pipeline plan (automated)
2. **CRED** - Collects source credentials (interactive - form in chat)
3. **VALI** - Validates source connections (automated)
4. **META** - Extracts schema and sample data (automated)
5. **STRAT** - Determines ingestion strategy (automated)
6. **SCHEMA** - Generates DDL statements (automated)
7. **TABLE** - Creates Delta tables (interactive - approval in chat)
8. **MIGRATE** - Produces final migration plan (automated)

## API Endpoints
- `POST /api/sessions` - Create new pipeline session
- `GET /api/sessions/:id` - Get session state (polled every 1s)
- `POST /api/sessions/:id/start` - Start pipeline with intent text
- `POST /api/sessions/:id/credentials` - Submit source credentials
- `POST /api/sessions/:id/table-approval` - Submit table approvals
- `GET /api/login` - Initiate Replit OIDC login
- `GET /api/callback` - OIDC callback
- `GET /api/logout` - Logout + end session
- `GET /api/auth/user` - Get current authenticated user
