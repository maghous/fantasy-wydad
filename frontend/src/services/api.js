import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// League endpoints
export const leagueAPI = {
    getAll: () => api.get('/leagues'),
    getById: (id) => api.get(`/leagues/${id}`),
    create: (data) => api.post('/leagues', data),
    join: (code) => api.post('/leagues/join', { code }),
};

// Match endpoints
export const matchAPI = {
    getAll: () => api.get('/matches'),
    getById: (id) => api.get(`/matches/${id}`),
    getNextMatch: () => api.get('/matches/next'),
    create: (data) => api.post('/matches', data),
};

// Prediction endpoints
export const predictionAPI = {
    getAll: () => api.get('/predictions'),
    getByMatch: (matchId) => api.get(`/predictions/match/${matchId}`),
    create: (data) => api.post('/predictions', data),
};

// Result endpoints
export const resultAPI = {
    getByMatch: (matchId) => api.get(`/results/${matchId}`),
    create: (data) => api.post('/results', data),
};

// Ranking endpoints
export const rankingAPI = {
    getLeagueRanking: (leagueId) => api.get(`/rankings/league/${leagueId}`),
    getGlobalRanking: () => api.get('/rankings/global'),
};

// User endpoints
export const userAPI = {
    getProfile: () => api.get('/auth/me'),
};

// Notification endpoints
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markAllRead: () => api.put('/notifications/read-all'),
    sendReminder: (matchId) => api.post(`/notifications/remind/${matchId}`),
};

export default api;
