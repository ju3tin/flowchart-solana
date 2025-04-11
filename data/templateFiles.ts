export const readMeMd = `# Hello World
This is a placeholder README for the user project.
`;

export function serverPackageJson(projectName: string) {
  return {
    name: `${projectName}-server`,
    version: '1.0.0',
    main: 'dist/index.js',
    scripts: {
      build: 'tsc -p tsconfig.json',
      start: 'node dist/index.js'
    },
    dependencies: {
      express: '^4.18.2'
    }
  };
}

export function rootPackageJson(projectName: string) {
  return {
    name: projectName.replace(/[^\w-]/g, ''),
    version: '1.0.0',
    scripts: {
    }
  };
}

export const serverIndexContent = `import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
`;

export const serverEnvContent = `# .env
PORT=3001
`;

export const serverGitignoreContent = `node_modules
dist
build
`;

export const tsConfig = {
  compilerOptions: {
    target: 'es2020',
    module: 'commonjs',
    esModuleInterop: true,
    outDir: 'dist',
  },
  include: ['src']
};

export const apiHelperContent = `import axios from 'axios';

export async function fetchData() {
  const res = await axios.get('/api');
  return res.data;
}
`;

export const rollupConfigContent = `
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: ['react', 'react-dom'], // treat these as peer deps
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './tsconfig.json' })
  ]
});
`;
