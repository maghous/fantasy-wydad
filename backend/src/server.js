const express = require('express');
const cors = require('cors');
require('dotenv').config();
const autoSeed = require('./utils/autoSeed');

const app = express();

// Connect to Database (Compatible with MongoDB Atlas for Production)
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (uri && uri.startsWith('mongodb')) {
            const mongoose = require('mongoose');

            // Mask password for safety in logs
            const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
            console.log('Attempting to connect to:', maskedUri);

            await mongoose.connect(uri);
            console.log('MongoDB Connected (Cloud/Local)');

            // Auto-seed if needed
            await autoSeed();
        } else {
            console.log('Using Local JSON Database (No MongoDB URI provided)');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        if (err.message.includes('authentication failed')) {
            console.log('TIP: Check your MONGODB_URI on Render dashboard for typos or extra spaces.');
        }
    }
};
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// CORS configuration (Restrict in production)
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'https://fantasy-wydad.vercel.app',
            'https://fantasy-football-wydad.vercel.app'
        ];

        // Allow if origin is in list, or if it's a vercel sub-domain, or if no origin (local requests)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Root route for verification
app.get('/', (req, res) => res.send('API Wydad Pronostics is running...'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/results', require('./routes/results'));
app.use('/api/rankings', require('./routes/rankings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

// Export the app for Vercel (Serverless)
module.exports = app;

// Only start the server if we are running locally (direct execution)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('UNHANDLED ERROR:', err.stack);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Une erreur serveur est survenue'
        : err.message;

    res.status(status).json({
        message,
        error: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
