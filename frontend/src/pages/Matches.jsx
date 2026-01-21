import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Award } from 'lucide-react';
import { matchAPI, leagueAPI, predictionAPI } from '../services/api';

export default function Matches() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const [league, setLeague] = useState(null);
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'Botola', 'CAF'
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [leagueId]);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredMatches(matches);
        } else {
            setFilteredMatches(matches.filter(m => m.competition === filter));
        }
    }, [filter, matches]);

    const loadData = async () => {
        try {
            const [leagueRes, matchesRes, predictionsRes] = await Promise.all([
                leagueAPI.getById(leagueId),
                matchAPI.getAll(),
                predictionAPI.getAll(),
            ]);
            setLeague(leagueRes.data);
            setMatches(matchesRes.data);
            setFilteredMatches(matchesRes.data);
            setPredictions(predictionsRes.data);
        } catch (error) {
            console.error('Erreur de chargement:', error);
        } finally {
            setLoading(false);
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
        <div className="max-w-4xl mx-auto p-6 text-white">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white mb-2">
                        {league?.name}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
                            <p className="text-xs text-red-300 font-bold uppercase tracking-widest">
                                Barème Officiel
                            </p>
                            <p className="text-sm text-white font-medium">
                                {league?.scoring.exactScore} pts | {league?.scoring.perScorer} pts/Buteur | {league?.scoring.correctResult} pts
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/leagues')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold flex items-center gap-2 border border-white/10 backdrop-blur-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
            </div>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => navigate(`/my-predictions/${leagueId}`)}
                    className="flex-1 py-4 premium-btn text-white rounded-xl font-black shadow-xl flex items-center justify-center gap-2"
                >
                    <Award className="w-6 h-6" />
                    MES PRONOSTICS & SCORES
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-4 py-3 rounded-xl font-black transition-all ${filter === 'all' ? 'bg-white text-red-700 shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    TOUS
                </button>
                <button
                    onClick={() => setFilter('Botola')}
                    className={`flex-1 px-4 py-3 rounded-xl font-black transition-all ${filter === 'Botola' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    BOTOLA PRO
                </button>
                <button
                    onClick={() => setFilter('CAF')}
                    className={`flex-1 px-4 py-3 rounded-xl font-black transition-all ${filter === 'CAF' ? 'bg-yellow-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    COUPE CAF
                </button>
            </div>

            <div className="space-y-6">
                {filteredMatches.map((match) => {
                    const prediction = predictions.find((p) => p.matchId === match._id);
                    return (
                        <div key={match._id} className="glass-card rounded-2xl p-8 hover:translate-y-[-4px] transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${match.competition === 'CAF' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>
                                            {match.competition || 'Match'}
                                        </span>
                                        {match.round && (
                                            <span className="text-[10px] font-black text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase">
                                                {match.round}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2 italic">
                                        WYDAD <span className="text-red-500">vs</span> {match.opponent.toUpperCase()}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                                        <p className="flex items-center gap-2 font-medium">
                                            <Calendar className="w-4 h-4 text-red-500" />
                                            {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                        <p className="font-medium">{match.location}</p>
                                    </div>
                                </div>
                                {prediction && (
                                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        Pronotic Prêt
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate(`/predict/${match._id}`)}
                                className={`w-full py-4 rounded-xl font-black shadow-xl transition-all ${prediction ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'premium-btn text-white'}`}
                            >
                                {prediction ? 'MODIFIER MON PRONOSTIC' : 'FAIRE MON PRONOSTIC'}
                            </button>
                        </div>
                    );
                })}

                {matches.length === 0 && (
                    <div className="glass-card rounded-2xl p-20 text-center">
                        <Calendar className="w-20 h-20 text-white/5 mx-auto mb-6" />
                        <p className="text-gray-400 text-xl font-bold italic uppercase tracking-widest">Le calendrier est vide pour le moment</p>
                    </div>
                )}
            </div>
        </div>
    );
}
