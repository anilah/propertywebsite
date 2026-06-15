# PropertyReach Web Frontend

React frontend application for PropertyReach real estate platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with API URL
```

3. Start development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3001/api)
- `VITE_ENV` - Environment (development/production)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API service layer
├── store/          # State management (Zustand)
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Building

```bash
npm run build
```

Output will be in `dist/` directory.

## Deployment

See main [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment instructions.
