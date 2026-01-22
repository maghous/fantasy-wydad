import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    });

    const { login, register, loading, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (isLogin) {
            result = await login({ email: formData.email, password: formData.password });
        } else {
            result = await register(formData);
        }

        if (result?.success) {
            const pendingCode = sessionStorage.getItem('pendingJoinCode');
            if (pendingCode) {
                sessionStorage.removeItem('pendingJoinCode');
                window.location.href = `/league/join/${pendingCode}`;
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-wydad-600 to-wydad-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <Trophy className="w-16 h-16 text-wydad-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Wydad Pronostics</h1>
                    <p className="text-gray-600">Bienvenue cher supporter !</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!isLogin}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500 focus:border-transparent"
                                placeholder="Ahmed123"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500 focus:border-transparent"
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    {isLogin && (
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-wydad-600 hover:text-wydad-800 transition-colors"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-wydad-600 text-white py-3 rounded-lg font-semibold hover:bg-wydad-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Chargement...' : isLogin ? 'Connexion' : 'Inscription'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-wydad-600 hover:text-wydad-700 font-medium"
                    >
                        {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
                    </button>
                </div>
            </div>
        </div>
    );
}
