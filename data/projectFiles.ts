export const readMeMd = `
## Structure
- \`app/\`: Frontend application (React)
- \`server/\`: Backend server (Express)
`;

export const rootPackageJson = (rootPath: string) => {
    return {
        "name": rootPath,
        "version": "0.1.0",
        "private": true,
        "workspaces": [
      "app",
      "server"
    ],
    "scripts": {
      "start": "concurrently \"npm run start:app\" \"npm run start:server\"",
      "start:app": "npm start --workspace=app",
      "start:server": "npm start --workspace=server",
      "build": "npm run build --workspace=app && npm run build --workspace=server",
      "build:app": "npm run build --workspace=app",
      "build:server": "npm run build --workspace=server"
    },
        "devDependencies": {
            "concurrently": "^7.6.0"
        }
    }
}

export const serverPackageJson = (rootPath: string) => {
    return {
        "name": `${rootPath}-server`,
        "version": "0.1.0",
        "description": "Backend server for Solana project",
        "main": "dist/index.js",
        "scripts": {
        "start": "node dist/index.js",
        "dev": "nodemon src/index.ts",
        "build": "tsc",
        "test": "jest"
        },
        "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.0.3",
        "@solana/web3.js": "^1.73.0"
        },
        "devDependencies": {
            "@types/express": "^4.17.17",
            "@types/cors": "^2.8.13",
            "@types/node": "^18.11.18",
            "typescript": "^4.9.4",
            "nodemon": "^2.0.20",
            "ts-node": "^10.9.1"
        }
    }
}

export const tsConfig = {
    "compilerOptions": {
      "target": "es2020",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.spec.ts"]
  };

  export const serverIndexContent = `import express from 'express';
        import cors from 'cors';
        import dotenv from 'dotenv';

        dotenv.config();

        const app = express();
        const PORT = process.env.PORT || 3001;

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Routes
        app.get('/', (req, res) => {
          res.json({ message: 'Solana Project API is running' });
        });

        // Start server
        app.listen(PORT, () => {
          console.log(\`Server running on port \${PORT}\`);
        });
    `;

export const serverEnvContent = `PORT=3001
    SOLANA_NETWORK=devnet
    `;

export const serverGitignoreContent = `# dependencies
    node_modules
    .pnp
    .pnp.js

    # testing
    coverage

    # production
    build
    dist

    # misc
    .DS_Store
    .env
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local

    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    `;

export const apiHelperContent = `import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (e.g., redirect to login)
          localStorage.removeItem('token');
          break;
        case 403:
          // Handle forbidden
          break;
        case 500:
          // Handle server errors
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
`;

export const createSampleFunctionTemplate = (functionName: string): string => `import * as fs from 'fs';

/**
 * Sample function template that shows how to read parameters from a JSON file
 * and return a result that will be passed back to the frontend.
 * 
 * Parameters are passed via a temp JSON file path in process.argv[2]
 */
async function ${functionName}() {
  try {
    // Read parameters from the JSON file passed as the first argument
    const paramsPath = process.argv[2];
    const params = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));
    
    // Your function logic goes here
    // This is just a sample that returns the params with a timestamp
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      params: params,
      message: "Function executed successfully"
    };
    
    // Print the result as JSON to stdout
    // This will be captured by the backend and returned to the frontend
    console.log(JSON.stringify(result));
    
    return result;
  } catch (error) {
    // Handle errors and print error message to stdout
    const errorResult = {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
    console.log(JSON.stringify(errorResult));
    return errorResult;
  }
}

// Execute the function immediately
${functionName}();
`;

      