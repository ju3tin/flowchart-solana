# Solana FlowCode

A monorepo containing a **Next.js** front-end (`client`) and a **TypeScript**-based Express server (`server`). The client is served on **localhost:3000** (by default) while the server listens on **localhost:9999** (by default). This repository also includes some additional directories and tooling.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Getting Started](#getting-started)
   1. [Prerequisites](#prerequisites)
   2. [Installation](#installation)
   3. [Environment Variables](#environment-variables)
   4. [Running the Client](#running-the-client)
   5. [Running the Server](#running-the-server)
4. [Scripts](#scripts)
5. [Contributing](#contributing)
6. [License](#license)

---

## Overview

- **Front-end**: A Next.js application built with TypeScript, Tailwind CSS, and various other libraries.  
- **Back-end**: A Node/Express application (written in TypeScript) that handles API requests, authentication, and various endpoints (e.g., `/auth`, `/projects`, `/files`, `/org`, `/tasks`, `/ai`, `/container`).  

This project uses a [PNPM workspace](https://pnpm.io/workspaces) for managing dependencies. Each package (`client` and `server`) has its own `package.json`, while some dependencies and configurations might be shared across the monorepo.

---

## Directory Structure

```
FLOWCODE (root)
├─ .github/              # GitHub Actions / Workflows
├─ client/               # Next.js (frontend)
│  ├─ .next/             # Build artifacts
│  ├─ node_modules/
│  ├─ public/            # Static assets
│  ├─ src/
│  │  ├─ api/            # API utilities for client-side
│  │  └─ app/            
│  │     ├─ (auth)/      # Auth routes
│  │     ├─ (protected)/ # Protected routes
│  │     ├─ layout.tsx
│  │     └─ page.tsx
│  ├─ middleware.ts
│  ├─ .env*              # Environment variables (dev, production, etc.)
│  ├─ package.json
│  └─ ... other config files
├─ docker-base-image/    # Docker base image for the generated user project
├─ node_modules/         
├─ projects/             # (No longer used since user project is now dockerized)
├─ server/               # Express (backend)
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ config/         # Configurations (DB, etc.)
│  │  ├─ controllers/    # Express controllers
│  │  ├─ data/
│  │  ├─ middleware/     # Express/Custom middleware
│  │  ├─ routes/         # Route definitions
│  │  ├─ types/          # TypeScript type definitions
│  │  ├─ utils/
│  │  ├─ app.ts          # Express app entry
│  │  └─ server.ts       # Another possible server entry or runner
│  ├─ .env               # Environment variables for server
│  ├─ package.json
│  └─ tsconfig.json
├─ .gitignore
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
└─ README.md             
```

---

## Getting Started

### Prerequisites

- **Node.js** (Recommended ≥ 20.18.3)
- **PNPM** (Recommended ≥ 10.6.5)  
  If you do not have PNPM installed globally, you can install it with:
  ```bash
  npm install -g pnpm
  ```
- **TypeScript** (installed locally in each package)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ChainLabs-Technologies/solana-flowcode.git
   ```

2. **Install dependencies** (at the monorepo root):
   ```bash
   pnpm install
   ```
   This will install dependencies for both `client` and `server`.

---

### Environment Variables

- **Client**:
  - The Next.js client expects environment files (e.g., `.env.local`, `.env.development`, `.env.production`).
  - Create a `.env.local` file under the `client` folder (ignored by Git) and add required variables:
    ```ini
    OPEN_AI_API_KEY=sk_proj_xxxxxx
    ```
  - Remember that any variables without `NEXT_PUBLIC_` stay server-side in Next.js, and variables with `NEXT_PUBLIC_` are exposed to the browser.

- **Server**:
  - **Required variables**:
    ```ini
    PORT=9999
    JWT_SECRET=YOUR_JWT_SECRET
    ROOT_FOLDER=/path/to/projects
    WALLETS_FOLDER=/path/to/wallets
    DB_USER=YOUR_DB_USER
    DB_HOST=YOUR_DB_HOST
    DB_PORT=5432
    DB_NAME=YOUR_DB_NAME
    DB_PASSWORD=YOUR_DB_PASSWORD
    OPENAI_API_KEY=sk-xxxxxxx
    ```
  - Ensure `.env` is added to `.gitignore` to keep sensitive info private.

---

### Running the Client

Inside the **root** directory (or inside `client` directly):

```bash
pnpm dev --filter client
```

- **Default port**: http://localhost:3000
- This runs the Next.js development server with hot reloading.

### Running the Server

Inside the **root** directory (or inside `server` directly):

```bash
pnpm dev --filter server
```

- **Default port**: http://localhost:9999
- This starts the Express server in development mode using `ts-node`.

---

## Scripts

**From the root** (using [pnpm filters](https://pnpm.io/cli/filter)):

- `pnpm dev --filter client`: Run the client in development mode.  
- `pnpm dev --filter server`: Run the server in development mode.  
- `pnpm build --filter client`: Build the Next.js client for production.  
- `pnpm build --filter server`: Compile TypeScript server code.  
- `pnpm start --filter client`: Start the client in production mode.  
- `pnpm start --filter server`: Start the server from compiled output.  
- `pnpm lint --filter client`: Lint the client.  
- `pnpm test --filter client`: Run the client's placeholder test script.
- `pnpm test --filter server`: Run the server's placeholder test script.

(See each `package.json` for more scripts.)

---

## Testing

Both the client and server currently have placeholder test scripts.  
You can run:

```bash
pnpm test --filter client
pnpm test --filter server
```

---

## Contributing

1. **Fork** the repository.  
2. **Create** a feature branch.  
3. **Commit** your changes.  
4. **Push** to your branch.  
5. Open a **Pull Request**.

---

## License

*Licensing will be added in the future.*


