import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authAPI.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a]">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] shadow-2xl">
                {!success ? (
                    <>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                            NOUVEAU <span className="text-red-600">MOT DE PASSE</span>
                        </h2>
                        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                            Choisissez votre nouveau mot de passe sécurisé.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nouveau mot de passe"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmer le mot de passe"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm font-bold justify-center">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 premium-btn text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Réinitialiser"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase italic mb-4">Succès !</h2>
                        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                            Votre mot de passe a été mis à jour. Redirection vers la page de connexion...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
