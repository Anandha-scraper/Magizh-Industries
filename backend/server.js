const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');
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
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

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
    timestamp: new Date().toISOString() 
  });
});

// Serve static files from React build (production only)
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`Serving static files from: ${distPath}`);
} else {
  // Development mode - just API
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Magizh Industries API - Development Mode',
      apiEndpoints: ['/api/auth', '/api/master', '/api/archive', '/api/stock']
    });
  });
}

// Use PORT from environment (Firebase App Hosting injects this)
const PORT = process.env.PORT || 5000;

// Function to kill process on port
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
            console.log(` Killing existing process on port ${port}...`);
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

// Start server with auto-kill
killPort(PORT).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`port ${PORT} is still in use. Retrying...`);
      setTimeout(() => {
        killPort(PORT).then(() => {
          app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Local: http://localhost:${PORT}`);
          });
        });
      }, 2000);
    } else {
      console.error('Server error:', err);
    }
  });
});
