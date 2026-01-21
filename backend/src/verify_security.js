const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('--- Security Verification Script ---');

    // 1. Test Match Creation without Auth
    try {
        await axios.post(`${BASE_URL}/matches`, { opponent: 'Hacker FC' });
        console.log('FAIL: Match created without authentication');
    } catch (err) {
        if (err.response?.status === 401) {
            console.log('PASS: Unauthenticated match creation blocked (401)');
        } else {
            console.log(`WARN: Unexpected status for unauth match creation: ${err.response?.status}`);
        }
    }

    // 2. Test Seeding with wrong secret
    try {
        await axios.post(`${BASE_URL}/matches/seed-matches`, { secret: 'wrong' });
        console.log('FAIL: Seeding worked with wrong secret');
    } catch (err) {
        if (err.response?.status === 403) {
            console.log('PASS: Seeding with wrong secret blocked (403)');
        } else {
            console.log(`WARN: Unexpected status for seeding: ${err.response?.status}`);
        }
    }

    // 3. Test Register with weak password
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            username: 'hacker',
            email: 'hacker@test.com',
            password: '123'
        });
        console.log('FAIL: Registered with weak password');
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('PASS: Weak password rejected (400)');
        } else {
            console.log(`WARN: Unexpected status for registration: ${err.response?.status}`);
        }
    }

    console.log('\n--- Manual Verification Needed ---');
    console.log('1. Verify JWT_SECRET is set in .env');
    console.log('2. Verify that your email is NOT hardcoded as admin in auth.js anymore');
    console.log('3. Test admin routes with a non-admin account');
}

// In a real scenario, this would be run against a live local server
console.log('Note: This script assumes the server is running on ' + BASE_URL);
// runTests(); 
