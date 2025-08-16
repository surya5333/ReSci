# RESAI - Research Planning Assistant

## Overview

RESAI is a full-stack web application that serves as an AI-powered research planning assistant for scientists. The application helps researchers generate evidence-linked hypotheses, recommend research methods, calculate sample sizes, verify citations against published literature, and export research protocols to lab-friendly formats. The system follows a modern full-stack architecture with a React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and integrates with external AI and research APIs to provide comprehensive research planning assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints with structured error handling and logging middleware
- **Validation**: Zod schemas for request/response validation shared between client and server
- **Development**: Hot reloading with Vite integration for seamless development experience

### Database & ORM
- **Database**: PostgreSQL for reliable relational data storage
- **ORM**: Drizzle ORM with TypeScript-first approach for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Storage Strategy**: Hybrid approach with in-memory storage for development and PostgreSQL for production

### Data Models
- **Users**: Basic authentication with username/password
- **Hypotheses**: Research hypotheses with domain, questions, variables, constraints, and generated content
- **Methods**: Research method recommendations with confidence scores and alternatives
- **Sample Size Calculations**: Statistical power analysis results with formulas and assumptions
- **Citation Verifications**: Literature verification results with supporting evidence
- **Protocols**: Exportable research protocols with customizable formats

### Authentication & Security
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **Password Security**: Planned implementation for password hashing and secure authentication
- **API Security**: CORS configuration and request validation middleware

## External Dependencies

### AI & Machine Learning
- **Google Gemini AI**: Primary AI service for generating research methods, hypotheses, and analyzing literature using the @google/genai SDK
- **AI Capabilities**: Natural language processing, research method recommendation, literature analysis, and citation verification

### Research Data Sources
- **PubMed API**: Integration with NCBI's PubMed database for accessing biomedical literature
- **Literature Search**: Automated retrieval of research papers, abstracts, and metadata
- **Citation Verification**: Cross-referencing claims against published scientific literature

### Cloud Services
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **Database Features**: Automatic scaling, connection pooling, and integrated backups

### Development & Build Tools
- **Vite**: Frontend build tool and development server with hot module replacement
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database migration and schema management tools
- **PostCSS & Autoprefixer**: CSS processing and browser compatibility

### UI & Styling
- **Radix UI Primitives**: Accessible, unstyled UI components for dialogs, forms, navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Comprehensive icon library for consistent visual elements
- **Custom Fonts**: Google Fonts integration (DM Sans, Fira Code) for typography
