```javascript
const http = require('http');
const url = require('url');

// Definir rutas
const routes = {
  '/': {
    method: 'GET',
    handler: () => ({
      status: 200,
      contentType: 'text/html',
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mini Servidor HTTP</title>
          <style>
            body { font-family: Arial; margin: 40px; background: #f5f5f5; }
            h1 { color: #333; }
            a { display: block; margin: 10px 0; color: #0066cc; }
            .endpoint { background: white; padding: 10px; margin: 10px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>🚀 Mini Servidor HTTP</h1>
          <p>Bienvenido al servidor</p>
          <h2>Rutas disponibles:</h2>
          <div class="endpoint">
            <strong>GET /</strong> - Esta página
          </div>
          <div class="endpoint">
            <strong>GET /api/usuarios</strong> - Lista de usuarios
          </div>
          <div class="endpoint">
            <strong>GET /api/usuarios/:id</strong> - Usuario específico
          </div>
          <div class="endpoint">
            <strong>POST /api/usuarios</strong> - Crear usuario
          </div>
          <div class="endpoint">
            <strong>GET /api/estado</strong> - Estado del servidor
          </div>
          <div class="endpoint">
            <strong>GET /404</strong> - Página no encontrada
          </div>
        </body>
        </html>
      `
    })
  },
  
  '/api/usuarios': {
    method: 'GET',
    handler: () => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { id: 1, nombre: 'Juan', email: 'juan@example.com' },
          { id: 2, nombre: 'María', email: 'maria@example.com' },
          { id: 3, nombre: 'Pedro', email: 'pedro@example.com' }
        ]
      })
    })
  },

  '/api/estado': {
    method: 'GET',
    handler: () => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        servidor: 'activo',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoria: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      })
    })
  }
};

// Usuarios simulados en memoria
let usuarios = [
  { id: 1, nombre: 'Juan', email: 'juan@example.com' },
  { id: 2, nombre: 'María', email: 'maria@example.com' },
  { id: 3, nombre: 'Pedro', email: 'pedro@example.com' }
];

let proximoId = 4;

// Crear servidor
const servidor = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`${req.method} ${pathname}`);

  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/usuarios/:id
  if (pathname.match(/^\/api\/usuarios\/\d+$/) && req.method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const usuario = usuarios.find(u => u.id === id);
    
    if (usuario) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: usuario }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Usuario no encontrado' }));
    }
    return;
  }

  // POST /api/usuarios
  if (pathname === '/api/usuarios' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const nuevoUsuario = JSON.parse(body);
        const usuario = {
          id: proximoId++,
          nombre: nuevoUsuario.nombre || 'Sin nombre',
          email: nuevoUsuario.email || 'sin@email.com'
        };
        usuarios.push(usuario);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: usuario, mensaje: 'Usuario creado' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'JSON inválido' }));
      }
    });
    return;
  }

  // Rutas estáticas
  if (routes[pathname]) {
    const ruta = routes