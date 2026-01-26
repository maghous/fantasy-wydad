// Entry point for Vercel serverless functions
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Database connection (ensure db.js is required before routes)
const { connect } = require('./db');
// Initialize DB connection (cached across invocations)
connect().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Import routes (adjust paths as needed)
// Example route – replace with actual routes from your backend
const matchesRouter = require('../backend/src/routes/matches');
app.use('/matches', matchesRouter);

// Export handler for Vercel
module.exports = (req, res) => app(req, res);
