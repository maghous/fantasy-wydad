require('dotenv').config();
const db = require('./dbWrapper');
const mongoose = require('mongoose');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
    console.error('Usage: node src/utils/promoteAdmin.js <email>');
    process.exit(1);
}

const run = async () => {
    try {
        // Connect to Mongo if URI exists
        if (process.env.MONGODB_URI) {
            try {
                await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
                console.log('Connected to MongoDB for promotion...');
            } catch (connErr) {
                console.warn('Could not connect to MongoDB. Using local database fallback...');
            }
        }

        const user = await db.findOne('users', { email: emailToPromote });

        if (!user) {
            console.error(`User with email ${emailToPromote} not found.`);
            process.exit(1);
        }

        await db.update('users', user._id, { isAdmin: true });

        console.log('------------------------------------------');
        console.log(`SUCCESS: User ${user.username} (${emailToPromote}) is now an ADMIN.`);
        console.log('------------------------------------------');

        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    } catch (err) {
        console.error('Error during promotion:', err.message);
    }
};

run();
