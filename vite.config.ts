import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
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
        (req as any).query = query;

        // Read request body if present
        let bodyBuffer = Buffer.alloc(0);
        await new Promise<void>((resolve) => {
          req.on('data', (chunk) => {
            bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
          });
          req.on('end', () => {
            resolve();
          });
        });

        if (bodyBuffer.length > 0) {
          const bodyStr = bodyBuffer.toString('utf-8');
          try {
            (req as any).body = JSON.parse(bodyStr);
          } catch {
            (req as any).body = bodyStr;
          }
        } else {
          (req as any).body = {};
        }

        // Enhance res with Vercel/Express helper functions
        (res as any).status = function (code: number) {
          res.statusCode = code;
          return res;
        };
        (res as any).json = function (data: any) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
        (res as any).send = function (data: any) {
          if (typeof data === 'object') {
            return (res as any).json(data);
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
    }
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
  };
})
