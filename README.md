# AI Quiz Helper

AI-powered quiz generation and personalized study recommendations using TypeScript, React, and Express.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   cd src/frontend && npm install
   cd ../backend && npm install
   cd ../..
   ```

2. **Set up environment**:
   ```bash
   cp src/backend/.env.example src/backend/.env
   # Edit .env file with your MongoDB URI and API keys
   ```

3. **Start development servers**:
   ```bash
   npm start
   ```

This will start both the Express backend (port 3001) and React frontend (port 3000) concurrently.

## Features

- 🧠 **AI-Generated Quizzes**: 5-question multiple-choice quizzes on any topic
- 📊 **Progress Tracking**: Monitor performance across topics over time
- 🎯 **Personalized Recommendations**: AI-powered study suggestions
- ⚡ **Modern Stack**: TypeScript, React 18, Express, MongoDB
- 🔄 **Hot Reload**: Fast development with Vite

## Architecture

### Shared Types System
- Common TypeScript definitions in `src/shared/`
- Prevents data structure drift between frontend and backend
- Compile-time type checking across full stack

### SOLID Principles
- Single responsibility enforced at all levels
- Maximum 20 lines per method
- Dependency injection throughout
- Modular, testable architecture

### Project Structure
```
src/
├── shared/           # Shared TypeScript types
├── frontend/         # React + Vite application
└── backend/          # Express + TypeScript API
```

## Development Commands

- `npm start` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Query, React Router
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Development**: Concurrently, TSX, ESLint

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- LLM API key (OpenAI/Anthropic) for quiz generation

## Getting Started

1. Clone this repository
2. Follow the Quick Start instructions above
3. Access the application at http://localhost:3000
4. Backend API available at http://localhost:3001

The application is designed for local development and single-user operation.