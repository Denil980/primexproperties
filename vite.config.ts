import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

function apiDevPlugin(): Plugin {
  const setupMiddleware = (server: any) => {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (!req.url?.startsWith('/api/')) {
        return next();
      }

      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const routeName = urlObj.pathname.replace(/^\/api\//, '').split('/')[0];
      const apiFilePath = path.resolve(process.cwd(), 'api', `${routeName}.js`);

      if (!fs.existsSync(apiFilePath)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: `API route /api/${routeName} not found` }));
      }

      // Parse query params into req.query
      const query: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      req.query = query;

      // Read request body if present
      let bodyBuffer = Buffer.alloc(0);
      await new Promise<void>((resolve) => {
        req.on('data', (chunk: any) => {
          bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
        });
        req.on('end', () => {
          resolve();
        });
      });

      if (bodyBuffer.length > 0) {
        const bodyStr = bodyBuffer.toString('utf-8');
        try {
          req.body = JSON.parse(bodyStr);
        } catch {
          req.body = bodyStr;
        }
      } else {
        req.body = {};
      }

      // Enhance res with Vercel/Express helper functions
      res.status = function (code: number) {
        res.statusCode = code;
        return res;
      };
      res.json = function (data: any) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      res.send = function (data: any) {
        if (typeof data === 'object') {
          return res.json(data);
        }
        res.end(data);
        return res;
      };

      try {
        const fileUrl = `${pathToFileURL(apiFilePath).href}?v=${Date.now()}`;
        const mod = await import(fileUrl);
        const handler = mod.default || mod;
        await handler(req, res);
      } catch (err: any) {
        console.error(`[API Dev Error] /api/${routeName}:`, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      }
    });
  };

  return {
    name: 'api-dev-plugin',
    configureServer: setupMiddleware,
    configurePreviewServer: setupMiddleware,
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const plugins: any[] = [react(), tailwindcss(), apiDevPlugin()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_') || key.startsWith('NEXT_PUBLIC_')) {
      processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    server: {
      host: '0.0.0.0',
      allowedHosts: ['primexproperties-2.onrender.com', '.onrender.com'],
    },
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4173,
      allowedHosts: ['primexproperties-2.onrender.com', '.onrender.com'],
    },
  };
})
