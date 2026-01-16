const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to Database (Compatible with MongoDB Atlas for Production)
const connectDB = async () => {
    try {
        // Only connect if MONGODB_URI starts with mongodb (to avoid local JSON confusion if env var is missing)
        if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb')) {
            const mongoose = require('mongoose');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB Connected (Cloud/Local)');
        } else {
            console.log('Using Local JSON Database (No MongoDB URI provided)');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
    }
};
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/results', require('./routes/results'));
app.use('/api/rankings', require('./routes/rankings'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
