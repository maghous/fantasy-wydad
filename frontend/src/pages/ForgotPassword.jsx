import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la demande');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a]">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] shadow-2xl">
                {!success ? (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 text-sm font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la connexion
                        </button>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                            MOT DE PASSE <span className="text-red-600">OUBLIÉ ?</span>
                        </h2>
                        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 premium-btn text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase italic mb-4">Email Envoyé !</h2>
                        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                            Si un compte existe pour <strong>{email}</strong>, vous recevrez un email sous peu.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
