import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { notificationAPI } from '../services/api';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            try {
                const res = await notificationAPI.getAll();
                const unread = res.data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-wydad-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/leagues')}
                    >
                        <span className="text-2xl font-bold">⚽ Wydad Pronostics</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-wydad-100">
                            {user?.isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="hover:text-white transition font-semibold mr-4"
                                >
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/scoring')}
                                className="hover:text-white transition font-semibold mr-4"
                            >
                                Règles
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative mr-4 text-wydad-100 hover:text-white transition cursor-pointer"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-black px-1 rounded-full border border-wydad-600">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <NotificationCenter
                                    isOpen={isNotifOpen}
                                    onClose={() => setIsNotifOpen(false)}
                                />
                            </div>

                            <div
                                className="flex items-center gap-2 text-wydad-100 cursor-pointer hover:text-white transition"
                                onClick={() => navigate('/profile')}
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">{user?.username}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-wydad-700 hover:bg-wydad-800 rounded-lg transition flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
