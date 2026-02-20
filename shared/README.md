# Shared Library

This package contains shared code used by both the public frontend and admin frontend applications.

## Structure

```
shared/
├── src/
│   ├── components/     # Shared React components
│   ├── contexts/       # Shared React contexts (Auth)
│   ├── services/       # Shared services (API client)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Main entry point
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

## Usage

Import shared modules in your application:

```typescript
// Import from main entry point
import { useAuth, api, FileUploader } from 'shared';

// Or import specific modules
import { AuthProvider } from 'shared/contexts/AuthContext';
import api from 'shared/services/api';
```

## Development

This library is part of the npm workspace and is automatically linked to frontend and admin-frontend applications.

To lint the code:
```bash
npm run lint --workspace=shared
```
