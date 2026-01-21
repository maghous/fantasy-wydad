import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leagueAPI } from '../services/api';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const JoinLeague = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');

    useEffect(() => {
        const join = async () => {
            try {
                await leagueAPI.join(code);
                setStatus('success');
                setTimeout(() => navigate('/leagues'), 2000);
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || 'Erreur lors de la tentative de rejoindre la ligue');
            }
        };
        join();
    }, [code, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a]">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] text-center shadow-2xl">
                {status === 'processing' && (
                    <div className="space-y-6">
                        <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Analyse de l'invitation...</h2>
                        <p className="text-gray-400 font-medium">Nous vous ajoutons à la ligue {code}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-bounce">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Bienvenue !</h2>
                        <p className="text-gray-400 font-medium">Vous avez rejoint la ligue avec succès. Redirection...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Oups !</h2>
                        <p className="text-red-400 font-bold">{error}</p>
                        <button
                            onClick={() => navigate('/leagues')}
                            className="w-full py-4 premium-btn text-white rounded-2xl font-black uppercase tracking-widest mt-4"
                        >
                            Retour aux Ligues
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinLeague;
