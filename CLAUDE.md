# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Quiz Helper is a TypeScript-based web application that generates personalized quizzes using AI/LLM technology. Users input topics to receive customized 5-question multiple-choice quizzes (A-D format), track progress over time, and receive AI-powered study recommendations.

## Development Commands

- `npm install` - Installs all dependencies for both frontend and backend
- `npm start` - Concurrently starts Express server and React frontend with Vite
- `npm run lint` - Run linting (when available)
- `npm run typecheck` - Run TypeScript type checking (when available)

## Architecture Overview

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: MongoDB
- **AI Integration**: LLM for quiz generation and study recommendations

### Project Structure
```
src/
├── shared/           # Shared TypeScript types and interfaces
│   ├── types/        # Common data structures
│   ├── interfaces/   # API contracts and service interfaces
│   └── enums/        # Shared enumerations
├── frontend/         # React application
│   ├── components/   # React components (single responsibility)
│   ├── services/     # API communication
│   └── utils/        # Utility functions
└── backend/          # Express server
    ├── controllers/  # Request handlers (single responsibility)
    ├── services/     # Business logic
    ├── models/       # Database models
    ├── routes/       # API routes
    └── utils/        # Utility functions
```

### Key Architectural Principles

**SOLID Principles**: Strictly enforced with extreme focus on single responsibility
- Each class, method, and file serves one specific purpose
- No method should exceed 20 lines of code
- No class should handle more than one concern

**Shared Type System**: 
- All common data structures defined in `src/shared/`
- API contracts use shared interface definitions
- Frontend and backend import types from shared directory
- Prevents data structure drift between layers

**Data Flow**:
1. User inputs topic → Backend processes with history → LLM generates quiz → Frontend displays
2. User answers → Backend scores → Database storage → Results to frontend  
3. Quiz results + history → LLM analysis → Personalized recommendations
4. Historical data → Analytics processing → Progress visualizations

### Single User Environment
- No authentication or user management required
- Designed for single local user operation
- User data stored without user identification

### Development Focus
- Optimized for local development, not production deployment
- Simple unified npm project structure
- Hot reload with Vite for fast development cycles
- Concurrent frontend and backend execution