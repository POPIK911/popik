import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const DB_PATH = resolve(__dirname, '../../db.json');

function readDb() {
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { apps: {} };
  }
}

function writeDb(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
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

          // POST /api/apps — создать товар
          if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            let body = '';
            req.on('data', chunk => (body += chunk));
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const db = readDb();
                const id = Date.now();
                const app = {
                  ...payload,
                  id,
                  createdAt: new Date().toISOString(),
                };
                db.apps[id] = app;
                writeDb(db);
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, app }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }

          next();
        });
      },
    },
  ],
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@mini-store/api': resolve(__dirname, '../../packages/api/src/index.js'),
    },
  },
});
