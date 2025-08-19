### AIQuizHelper

AIQuizHelper is a full‑stack React,Node app that generates multiple‑choice quizzes and study recommendations using Google Gemini. It includes a React frontend (Vite) and an Express backend.

### Quick start

1) Install dependencies
```bash
npm install
```

2) Configure environment variables
- Copy `example.env` to `.env` at the project root
```bash
cp example.env .env
```
- Open `.env` and set `GEMINI_API_KEY` and `MONGODB_URI` -- you can leave everything else as default

3) Run the app (frontend and backend together)
```bash
npm run start
```

- Frontend: Vite dev server 
- Backend: Express API 

### Environment configuration

The backend reads environment variables from a root `.env` file. Use `example.env` as a template.

Required:
- `GEMINI_API_KEY`: Your Google Gemini API key. Get one from the Google AI Studio dashboard: [Get a Gemini API key](https://aistudio.google.com/app/apikey)

Optional (defaults shown in `example.env`):
- `PORT` (default `3001`)
- `NODE_ENV` (default `development`)
- `MONGODB_URI` (default `mongodb://127.0.0.1:27017/ai-quiz-helper`)
- `LLM_PROVIDER` (default `gemini`)
- `GEMINI_MODEL` (default `gemini-2.5-flash-lite`)
- `WIKIPEDIA_FACT_CHECK_ENABLED` (default `false`)
- `WIKIPEDIA_MAX_ARTICLES` (default `3`)
- `WIKIPEDIA_CONTENT_LIMIT` (default `1000`)

### Scripts

The root `package.json` provides:
- `npm run start`: Runs frontend and backend concurrently
- `npm run frontend:dev`: Vite dev server
- `npm run backend:dev`: Backend dev server with tsx watch
- `npm run build`: Builds backend and frontend

### Tech stack

- React + Vite (frontend)
- Express + TypeScript (backend)
- MongoDB via Mongoose
- Google Gemini (`@google/generative-ai`)

### Project structure

```
src/
  backend/   # Express server, services (Gemini, Wikipedia), Mongo models
  frontend/  # React app (Vite), components, pages, services
  shared/    # Shared types, interfaces, utilities
```

