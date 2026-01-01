const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const fs = require('fs');
dotenv.config();

// Import Routes
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const approvalRoutes = require('./routes/approval');
const userRoutes = require('./routes/user');
const masterRoutes = require('./routes/master');
const archiveRoutes = require('./routes/archive');
const stockEntryRoutes = require('./routes/stockEntry');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (must be defined BEFORE static file serving)
app.use('/api/auth', signupRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', approvalRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/stock', stockEntryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'not set'
  });
});

// Serve static files from React build (production only)
const isProduction = process.env.NODE_ENV === 'production';
const distPath = path.join(__dirname, 'dist');

if (isProduction) {
  // Check if dist folder exists before serving
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ 
          error: 'Frontend not found',
          message: 'Please ensure the build process completed successfully'
        });
      }
    });
    console.log(`✓ Serving static files from: ${distPath}`);
  } else {
    console.warn(`⚠ Warning: dist folder not found at ${distPath}`);
    console.warn(`⚠ Frontend will not be served. API endpoints are still available.`);
    
    // Fallback route when dist doesn't exist
    app.get('*', (req, res) => {
      res.status(503).json({ 
        error: 'Frontend not available',
        message: 'Build artifacts not found. API is running.',
        apiEndpoints: ['/api/auth', '/api/master', '/api/archive', '/api/stock']
      });
    });
  }
} else {
  // Development mode - just API
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Magizh Industries API - Development Mode',
      apiEndpoints: ['/api/auth', '/api/master', '/api/archive', '/api/stock']
    });
  });
}

// Use PORT from environment (Cloud Run uses PORT=8080)
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Required for Cloud Run
const isCloudRun = process.env.K_SERVICE !== undefined;

// Startup function with error handling
async function startServer() {
  try {
    console.log('========================================');
    console.log('Starting Magizh Industries Server...');
    console.log('========================================');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Port: ${PORT}`);
    console.log(`Host: ${HOST}`);
    console.log(`Cloud Run: ${isCloudRun ? 'Yes' : 'No'}`);
    console.log(`Static files: ${fs.existsSync(distPath) ? distPath : 'Not found'}`);
    console.log('========================================');

    if (isCloudRun) {
      // Cloud Run - Simple startup
      const server = app.listen(PORT, HOST, () => {
        console.log(`✓ Server successfully started`);
        console.log(`✓ Listening on http://${HOST}:${PORT}`);
        console.log(`✓ Health check: http://${HOST}:${PORT}/api/health`);
      });

      // Error handling for server
      server.on('error', (error) => {
        console.error('========================================');
        console.error('SERVER ERROR:');
        console.error('========================================');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        console.error('========================================');
        
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use`);
        } else if (error.code === 'EACCES') {
          console.error(`Permission denied to bind to port ${PORT}`);
        }
        
        process.exit(1);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
          console.log('HTTP server closed');
          process.exit(0);
        });
      });

    } else {
      // Local development - with port killing for convenience
      const killPort = (port) => {
        return new Promise((resolve) => {
          const isWindows = process.platform === 'win32';
          if (isWindows) {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
              if (stdout) {
                const lines = stdout.trim().split('\n');
                const pids = new Set();
                lines.forEach(line => {
                  const parts = line.trim().split(/\s+/);
                  const pid = parts[parts.length - 1];
                  if (pid && pid !== '0' && !isNaN(pid)) {
                    pids.add(pid);
                  }
                });
                if (pids.size > 0) {
                  console.log(`Killing existing process on port ${port}...`);
                  pids.forEach(pid => {
                    exec(`taskkill /PID ${pid} /F`, () => {});
                  });
                  setTimeout(resolve, 1000);
                } else {
                  resolve();
                }
              } else {
                resolve();
              }
            });
          } else {
            exec(`lsof -ti:${port}`, (error, stdout) => {
              if (stdout) {
                console.log(`Killing existing process on port ${port}...`);
                exec(`kill -9 ${stdout.trim()}`, () => {
                  setTimeout(resolve, 1000);
                });
              } else {
                resolve();
              }
            });
          }
        });
      };

      await killPort(PORT);
      
      const server = app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
        console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
      });

      server.on('error', (error) => {
        console.error('Server error:', error.message);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is still in use. Please free up the port and try again.`);
        }
        process.exit(1);
      });
    }

  } catch (error) {
    console.error('========================================');
    console.error('FATAL ERROR DURING STARTUP:');
    console.error('========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('========================================');
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('Unhandled error in startServer:', error);
  process.exit(1);
});

module.exports = app;
