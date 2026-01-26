// Database connection for Vercel serverless functions
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // Set this in Vercel environment variables
if (!uri) {
    console.error('MONGODB_URI environment variable not set');
    // In serverless functions, we should throw to avoid silent failures
    throw new Error('MONGODB_URI not defined');
}

// Use a global to cache the connection across function invocations
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = { connect };
