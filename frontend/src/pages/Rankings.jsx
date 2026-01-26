import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Trophy, Share2 } from 'lucide-react';
import { rankingAPI, leagueAPI } from '../services/api';
import { useAuthStore } from '../context/useAuthStore';

export default function Rankings() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [league, setLeague] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [leagueId]);

    const loadData = async () => {
        try {
            const [leagueRes, rankingsRes] = await Promise.all([
                leagueAPI.getById(leagueId),
                rankingAPI.getLeagueRanking(leagueId),
            ]);
            setLeague(leagueRes.data);
            setRankings(rankingsRes.data);
        } catch (error) {
            console.error('Erreur de chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const shareRanking = () => {
        const top3 = rankings.slice(0, 3).map((r, i) => `${i + 1}. ${r.userId.username} (${r.points} pts)`).join('\n');
        const text = `🏆 Classement ${league?.name} - Fantasy Wydad\n\n${top3}\n\nRejoins-nous sur ${window.location.origin}`;

        if (navigator.share) {
            navigator.share({ title: 'Fantasy Wydad', text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Classement copié !');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 text-white pb-20">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
                        Classement - <span className="text-red-500">{league?.name}</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        Meilleurs pronostiqueurs
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={shareRanking}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-black flex items-center gap-2 border border-red-500 shadow-lg uppercase text-xs"
                    >
                        <Share2 className="w-4 h-4" />
                        Partager
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-black flex items-center gap-2 border border-white/10 backdrop-blur-md uppercase text-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>
                </div>
            </div>

            {rankings.length === 0 ? (
                <div className="glass-card rounded-[32px] p-20 text-center border border-white/10">
                    <BarChart3 className="w-20 h-20 text-white/5 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-bold italic uppercase tracking-widest">Aucun classement pour le moment</p>
                    <p className="text-gray-500 text-sm mt-4 uppercase tracking-widest font-black">Les points seront calculés après les résultats</p>
                </div>
            ) : (
                <div className="glass-card rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rang</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pronostiqueur</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Pronos</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center hidden md:table-cell">Scores Exacts</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center hidden md:table-cell">Résultats</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rankings.map((ranking, index) => (
                                    <tr
                                        key={ranking.userId._id}
                                        className={`transition-colors hover:bg-white/[0.02] ${ranking.userId._id === user?._id ? 'bg-red-600/10' : ''}`}
                                    >
                                        <td className="px-6 py-5">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm italic ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_20px_rgba(250,204,21,0.3)]' :
                                                index === 1 ? 'bg-gray-300 text-gray-700 shadow-[0_0_20px_rgba(209,213,219,0.3)]' :
                                                    index === 2 ? 'bg-orange-400 text-orange-900 shadow-[0_0_20px_rgba(251,146,60,0.3)]' :
                                                        'bg-white/5 text-gray-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-lg uppercase tracking-tight">{ranking.userId.username}</span>
                                                {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />}
                                                {ranking.userId._id === user?._id && (
                                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded tracking-widest">Moi</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-black text-gray-300 border border-white/5">
                                                {ranking.predictions}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center hidden md:table-cell">
                                            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-black border border-green-500/20">
                                                🎯 {ranking.exactScores}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center hidden md:table-cell">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-black border border-blue-500/20">
                                                ✅ {ranking.correctResults}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-2xl font-black text-red-500 italic tabular-nums">
                                            {ranking.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
