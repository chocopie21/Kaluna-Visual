import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'portfolio-api-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Check if request is an API request
          if (!req.url.startsWith('/api/')) {
            return next();
          }

          // Enable CORS
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          // Helper to parse JSON body
          const getRequestBody = () => {
            return new Promise((resolve, reject) => {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  resolve(body ? JSON.parse(body) : {});
                } catch (e) {
                  reject(e);
                }
              });
              req.on('error', err => reject(err));
            });
          };

          // API Endpoints
          if (req.url === '/api/upload' && req.method === 'POST') {
            getRequestBody()
              .then(body => {
                const { name, type, data } = body;
                if (!name || !data) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing name or data' }));
                  return;
                }

                // Extract base64 data
                // Format: data:image/jpeg;base64,/9j/...
                const base64Data = data.split(';base64,').pop();
                const buffer = Buffer.from(base64Data, 'base64');

                // Create public/uploads directory if it doesn't exist
                const uploadDir = path.resolve(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Generate unique filename
                const safeName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filename = `${Date.now()}_${safeName}`;
                const filepath = path.join(uploadDir, filename);

                fs.writeFileSync(filepath, buffer);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ url: `/uploads/${filename}` }));
              })
              .catch(err => {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              });
            return;
          }

          if (req.url === '/api/projects' && req.method === 'POST') {
            getRequestBody()
              .then(body => {
                const dataPath = path.resolve(process.cwd(), 'public/data.json');
                let projects = [];

                if (fs.existsSync(dataPath)) {
                  const fileContent = fs.readFileSync(dataPath, 'utf8');
                  projects = JSON.parse(fileContent);
                }

                // Handle edit vs create
                const projectIndex = projects.findIndex(p => p.id === body.id);
                if (projectIndex > -1) {
                  // Edit existing project
                  projects[projectIndex] = { ...projects[projectIndex], ...body };
                } else {
                  // Create new project
                  const newProject = {
                    id: Date.now().toString(),
                    ...body
                  };
                  projects.unshift(newProject); // Prepend to show at the top
                }

                fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2), 'utf8');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, project: body }));
              })
              .catch(err => {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              });
            return;
          }

          if (req.url === '/api/projects/delete' && req.method === 'POST') {
            getRequestBody()
              .then(body => {
                const { id } = body;
                if (!id) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing project id' }));
                  return;
                }

                const dataPath = path.resolve(process.cwd(), 'public/data.json');
                if (fs.existsSync(dataPath)) {
                  const fileContent = fs.readFileSync(dataPath, 'utf8');
                  let projects = JSON.parse(fileContent);

                  // Find project to check if we need to delete local upload file
                  const projectToDelete = projects.find(p => p.id === id);
                  if (projectToDelete && projectToDelete.mediaUrl && projectToDelete.mediaUrl.startsWith('/uploads/')) {
                    const localPath = path.resolve(process.cwd(), 'public', projectToDelete.mediaUrl.substring(1));
                    if (fs.existsSync(localPath)) {
                      try {
                        fs.unlinkSync(localPath);
                      } catch (e) {
                        console.error('Failed to delete media file', e);
                      }
                    }
                  }

                  // Filter projects
                  projects = projects.filter(p => p.id !== id);
                  fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2), 'utf8');
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              })
              .catch(err => {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              });
            return;
          }

          // Default fallback
          res.statusCode = 404;
          res.end('Not Found');
        });
      }
    }
  ],
  assetsInclude: ['**/*.glb']
});
