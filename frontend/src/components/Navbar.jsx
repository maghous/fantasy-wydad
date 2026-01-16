import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

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
                            <button
                                onClick={() => navigate('/admin')}
                                className="hover:text-white transition font-semibold mr-4"
                            >
                                Admin
                            </button>
                            <User className="w-5 h-5" />
                            <span className="font-medium">{user?.username}</span>
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
