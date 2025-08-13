# EventSphere - Event & Movie Booking Platform

## Overview

EventSphere is a full-stack web application for discovering and booking tickets to various entertainment events including concerts, movies, sports, theater shows, and festivals. The platform provides a comprehensive event discovery experience with seat selection, booking management, and user authentication through Replit's OpenID Connect system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

The frontend follows a component-based architecture with separate pages for landing, home, event details, movie details, checkout, and user dashboard. Custom hooks handle authentication state and toast notifications.

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Passport.js with OpenID Connect strategy (Replit Auth)

The backend implements a RESTful API structure with route handlers for events, movies, theaters, bookings, and user management. Middleware handles authentication, logging, and error handling.

### Database Design
- **Primary Database**: PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Connection**: Neon serverless PostgreSQL with connection pooling

The database schema includes tables for users, venues, events, movies, theaters, showtimes, seats, bookings, and booking relationships. The schema supports complex relationships between events and venues, movies and theaters, and booking seat assignments.

### Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC)
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Strategy**: Passport.js with custom OIDC strategy implementation
- **Security**: HTTP-only cookies with secure flags and CSRF protection

Authentication is handled through Replit's OIDC provider, allowing seamless integration with the Replit platform while maintaining secure session management.

### UI Component System
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Theme**: Custom color palette with CSS variables for theming
- **Typography**: Inter font family for consistent text rendering
- **Icons**: Lucide React icon library

The UI system provides a cohesive design language with reusable components for cards, buttons, forms, dialogs, and data display elements.

### Development Workflow
- **Development Server**: Vite with HMR and Express middleware integration
- **Type Checking**: TypeScript with strict mode enabled
- **Code Quality**: ESLint and Prettier for code formatting
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## External Dependencies

### Database Services
- **Neon Serverless PostgreSQL**: Primary database hosting with serverless architecture
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

### Authentication Services
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware with OIDC strategy support

### UI & Styling Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Frontend build tool with development server
- **TypeScript**: Static type checking for enhanced developer experience
- **Drizzle Kit**: Database schema management and migration tools
- **TanStack Query**: Server state management and caching

### Runtime & Server Dependencies
- **Express.js**: Web application framework for Node.js
- **Express Session**: Session management middleware
- **CORS**: Cross-origin resource sharing configuration
- **Date-fns**: Date manipulation and formatting utilities

The application is designed to run in the Replit environment with specific integrations for Replit's authentication system and development tools.