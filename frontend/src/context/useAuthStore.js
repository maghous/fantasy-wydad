import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur de connexion';
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur d\'inscription';
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ loading: true });
        try {
            const response = await authAPI.getProfile();
            set({ user: response.data, isAuthenticated: true, loading: false });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    },
}));
