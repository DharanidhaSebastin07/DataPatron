# Bronze Ingestion Platform

## Overview
AI-powered data ingestion pipeline frontend for Databricks Delta Lake. The platform visualizes 8 sequential AI agents that automate bronze layer data movement, with animated processing flows and interactive steps.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express.js with in-memory session management
- **State Management**: TanStack React Query with 1-second polling during pipeline execution
- **Styling**: Shadcn/ui components, dark mode by default, Space Grotesk + Inter + JetBrains Mono fonts

## Key Files
- `client/src/pages/home.tsx` - Main page with welcome view + pipeline execution view
- `client/src/components/pipeline-flow.tsx` - Pipeline visualization strip + agent detail panel
- `client/src/components/chat-panel.tsx` - Chat interface with inline forms (credentials, table approval)
- `server/routes.ts` - REST API endpoints for session management
- `server/storage.ts` - In-memory session storage + pipeline simulation engine
- `shared/schema.ts` - TypeScript types for pipeline, agents, messages

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

## Supported Sources
Azure SQL, AWS S3, PostgreSQL, REST API
