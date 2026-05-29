import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const DB_PATH = resolve(__dirname, '../../db.json');

function readDb() {
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { apps: {} };
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api',
      configureServer(server) {
        // GET /api/apps — список всех товаров
        server.middlewares.use('/api/apps', (req, res, next) => {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const db = readDb();
            res.end(JSON.stringify({ items: Object.values(db.apps) }));
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@mini-store/api': resolve(__dirname, '../../packages/api/src/index.js'),
    },
  },
});
