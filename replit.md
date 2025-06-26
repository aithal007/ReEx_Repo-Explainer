# ReEx - AI-Powered GitHub Repository Explainer

## Overview

ReEx is a full-stack web application that makes GitHub repositories easy to understand by providing AI-generated explanations. Users can paste any GitHub repository URL and receive a comprehensive, developer-friendly explanation of what the project does, how it works, and its key components. The application uses Google's Gemini AI to analyze repository content and provide conversational explanations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui for consistent design
- **Styling**: Tailwind CSS with custom dark theme and neon color scheme
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints for repository explanation and chat functionality
- **Development**: tsx for TypeScript execution in development

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in shared directory for type safety across frontend and backend
- **Storage**: In-memory storage implementation with interface for future database integration

## Key Components

### Core Entities
1. **Users**: Basic user management with username/password authentication
2. **Conversations**: Chat sessions for repository discussions
3. **Messages**: Individual messages within conversations (user and AI responses)

### API Endpoints
- `POST /api/explain`: Analyzes GitHub repository and returns AI explanation
- `POST /api/chat`: Handles follow-up questions about repositories
- `GET /api/conversations`: Retrieves user's conversation history
- `GET /api/conversations/:id/messages`: Fetches messages for specific conversation

### Frontend Components
- **Landing Page**: Hero section, features showcase, and embedded chat interface
- **Chat Interface**: Real-time messaging with repository analysis
- **Sidebar Navigation**: Conversation history and new chat creation
- **Responsive Design**: Mobile-first approach with glassmorphism effects

## Data Flow

1. **Repository Analysis Flow**:
   - User submits GitHub repository URL
   - Backend validates and parses GitHub URL
   - System fetches README.md content from GitHub's raw content API
   - README content is sent to Google Gemini API for analysis
   - AI generates comprehensive explanation
   - Response is stored as conversation and returned to frontend

2. **Chat Flow**:
   - User asks follow-up questions about repository
   - Backend maintains context from previous repository analysis
   - Gemini API provides contextual responses
   - All messages are stored and displayed in real-time

3. **State Management**:
   - TanStack Query handles API calls and caching
   - React hooks manage local UI state
   - Shared TypeScript types ensure consistency

## External Dependencies

### Core Services
- **Google Gemini API**: AI-powered repository analysis and chat responses
- **GitHub API**: Repository validation and README content fetching
- **PostgreSQL**: Database for persistent storage (configured but using in-memory for development)

### Key Libraries
- **Frontend**: React, Vite, TanStack Query, Radix UI, Tailwind CSS, Wouter
- **Backend**: Express, Drizzle ORM, Google GenAI SDK, CORS
- **Development**: TypeScript, tsx, Replit development tools

### Authentication & Security
- Session-based authentication (configured but not fully implemented)
- CORS enabled for cross-origin requests
- Environment variable management for API keys

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module enabled
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Hot Reload**: Vite development server with middleware integration

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Bundled with esbuild to `dist/index.js`
- **Deployment**: Autoscale deployment target on port 80
- **Environment**: Production environment variables required

### Configuration
- Drizzle migrations configured for PostgreSQL
- Static file serving from Express in production
- Vite middleware in development for seamless full-stack development

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```