const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
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
app.use(cors({
  origin: true, // Allow all origins in Cloud Functions
  credentials: true
}));
app.use(express.json());

// API Routes - No /api prefix needed (already in Cloud Function URL)
app.use('/auth', signupRoutes);
app.use('/auth', loginRoutes);
app.use('/auth', approvalRoutes);
app.use('/auth', userRoutes);
app.use('/master', masterRoutes);
app.use('/archive', archiveRoutes);
app.use('/stock', stockEntryRoutes);

// Root Route (for testing)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Magizh Industries API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
