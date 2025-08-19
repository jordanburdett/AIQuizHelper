# AI Quiz Helper - Feature Plan

## Project Overview

AI Quiz Helper is a web application that generates personalized quizzes using AI/LLM technology. The application allows users to input topics of interest and receive customized multiple-choice quizzes, track their progress over time, and receive targeted study recommendations.

## Core Architecture

### Frontend
- **Technology Stack**: TypeScript, React
- **Design Philosophy**: Modern, elegant UI with clean user experience
- **Key Components**:
  - Topic input interface
  - Quiz taking interface  
  - Results dashboard
  - Progress tracking views

### Backend
- **Technology Stack**: TypeScript, Node.js, Express
- **Database**: MongoDB for user data and quiz history
- **AI Integration**: LLM for quiz generation and study recommendations
- **Design Philosophy**: SOLID principles with extreme focus on single responsibility

## Project Structure & Development Setup

### Root Directory Configuration
- Root folder initialized as npm project with single package.json
- All dependencies managed from root level for simplified setup
- Single `npm install` command installs all required modules

### Development Commands
- **`npm install`**: Installs all frontend and backend dependencies
- **`npm start`**: Concurrently starts Express server and React frontend with Vite
- **Frontend**: React + Vite for fast development and hot reload
- **Backend**: Express server with TypeScript compilation

### Directory Structure
```
AIQuizHelper/
├── package.json (root npm project)
├── src/
│   ├── shared/            # Shared TypeScript types and interfaces
│   │   ├── types/         # Common data structures
│   │   ├── interfaces/    # API contracts and service interfaces
│   │   └── enums/         # Shared enumerations
│   ├── frontend/          # React + TypeScript + Vite
│   │   ├── components/    # React components (single responsibility)
│   │   ├── services/      # API communication
│   │   └── utils/         # Utility functions
│   └── backend/           # Express + TypeScript
│       ├── controllers/   # Request handlers (single responsibility)
│       ├── services/      # Business logic
│       ├── models/        # Database models
│       ├── routes/        # API routes
│       └── utils/         # Utility functions
├── dist/                  # Compiled output
└── docs/                  # Documentation
```

### Shared Type System
- **Type Safety**: Shared TypeScript definitions ensure consistent data structures
- **API Contracts**: Interface definitions guarantee frontend-backend compatibility
- **Single Source of Truth**: Common types prevent drift between frontend and backend
- **Development Efficiency**: Shared types enable better IDE support and refactoring
- **Error Prevention**: Compile-time type checking across the entire application stack

### Development Philosophy
- **Local Development Focus**: Optimized for easy local setup and testing
- **Simple Commands**: One-step installation and startup process
- **Hot Reload**: Fast development cycle with automatic recompilation
- **Clean Separation**: Frontend and backend logically separated but managed together

## Core Features

### 1. Quiz Generation
- User enters a specific topic via text input
- LLM generates multiple-choice quiz (A-D format, 5 questions)
- Questions tailored to user's historical performance and knowledge gaps

### 2. Quiz Taking Experience
- Clean, intuitive interface for answering questions
- Progress indicator during quiz
- Immediate feedback after completion

### 3. Scoring and Results
- Automatic scoring calculation
- Display of correct/incorrect answers
- Performance metrics and insights

### 4. AI-Powered Recommendations
- Post-quiz analysis by LLM
- Personalized study recommendations
- Identification of knowledge gaps and strengths

### 5. User Progress Tracking
- Historical quiz data stored in MongoDB
- Topic-specific performance tracking
- Progress visualization over time
- Subject improvement analytics

### 6. User Profile System
- Personal quiz history
- Performance summaries by topic
- Long-term learning progress insights

## Data Flow

1. **Quiz Creation**:
   - User inputs topic → Backend processes with user history → LLM generates quiz → Quiz served to frontend

2. **Quiz Taking**:
   - User answers questions → Responses sent to backend → Scoring calculated → Results stored in database

3. **Recommendations**:
   - Quiz results + user history → LLM analysis → Personalized study recommendations → Delivered to user

4. **Progress Tracking**:
   - Historical data retrieved from MongoDB → Analytics processed → Progress visualizations generated

## Technical Philosophy

### SOLID Principles Implementation
- **Single Responsibility**: Each class, method, and file serves one specific purpose
- **Open/Closed**: Components designed for extension without modification
- **Liskov Substitution**: Proper inheritance and interface implementation
- **Interface Segregation**: Focused, minimal interfaces
- **Dependency Inversion**: High-level modules independent of low-level details

### Code Organization
- Strict separation of concerns
- One responsibility per file/class/method
- Clear dependency injection patterns
- Modular, testable architecture

## User Experience Goals

- **Simplicity**: Minimal, intuitive interface
- **Speed**: Fast quiz generation and results
- **Personalization**: Adaptive content based on user history
- **Motivation**: Clear progress tracking and achievement feedback
- **Educational Value**: Meaningful study recommendations and insights