# Sistema de Atendimento - Customer Service Management System

## Overview

This is a full-stack web application built for managing customer service operations. The system allows tracking of customers, executives, and service metrics through an intuitive dashboard interface. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS for styling
- **Component Library**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon PostgreSQL (serverless)
- **Session Management**: Built-in Express session handling
- **File Upload**: Multer for handling file uploads
- **API Design**: RESTful API with structured error handling

### Database Design
The system uses a simple but effective schema with two main entities:
- **Executives**: Service representatives with unique colors for visual identification
- **Clients**: Customers assigned to executives with proposal tracking capabilities

## Key Components

### Data Models
- **Executives Table**: Stores executive information (id, name, color, timestamps)
- **Clients Table**: Stores client information with foreign key relationship to executives
- **Shared Schema**: TypeScript types and Zod validation schemas shared between client and server

### Core Features
1. **Executive Management**: Add, remove, and track service executives
2. **Client Assignment**: Automatic round-robin assignment of clients to executives
3. **Proposal Tracking**: Track which clients have received proposals
4. **Dashboard Analytics**: Visual representation of service metrics and conversion rates
5. **Bulk Operations**: File upload support for adding multiple clients
6. **Search and Filter**: Real-time search and filtering capabilities

### UI Components
- Responsive design with mobile-first approach
- Comprehensive component library from Radix UI
- Data visualization with interactive charts
- Toast notifications for user feedback
- Modal dialogs for confirmations and forms

## Data Flow

1. **Client Assignment Flow**: New clients → Round-robin assignment → Executive association → Database persistence
2. **Dashboard Data Flow**: Database aggregation → API endpoints → React Query → Chart components
3. **File Upload Flow**: File selection → Multer processing → Validation → Bulk database operations
4. **Real-time Updates**: Database changes → API responses → React Query invalidation → UI re-render

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Modern TypeScript ORM
- **@tanstack/react-query**: Server state management
- **recharts**: Chart library for data visualization
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: CSS class variance utilities

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development Environment
- **Development Server**: tsx with hot reload for backend changes
- **Frontend Dev Server**: Vite with HMR for instant feedback
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundle targeting Node.js with ESM format
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Build Commands
- `npm run dev`: Start development servers
- `npm run build`: Create production builds
- `npm run start`: Run production server
- `npm run db:push`: Apply database schema changes

## Changelog
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.