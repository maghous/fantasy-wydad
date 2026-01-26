import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Award, Users, MessageSquare } from 'lucide-react';
import { matchAPI, leagueAPI, predictionAPI, messagesAPI } from '../services/api';

export default function Matches() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const [league, setLeague] = useState(null);
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'Botola', 'CAF'
    const [predictions, setPredictions] = useState([]);
    const [leaguePredictions, setLeaguePredictions] = useState([]);
    const [showPredictionsModal, setShowPredictionsModal] = useState(false);
    const [selectedMatchName, setSelectedMatchName] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        if (leagueId) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [leagueId]);

    const loadMessages = async () => {
        try {
            const res = await messagesAPI.getByLeague(leagueId);
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await messagesAPI.post({ leagueId, text: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) { console.error(err); }
    };

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

    const fetchLeaguePredictions = async (matchId, opponent) => {
        try {
            const res = await predictionAPI.getByLeague(leagueId, matchId);
            setLeaguePredictions(res.data);
            setSelectedMatchName(`WYDAD vs ${opponent.toUpperCase()}`);
            setShowPredictionsModal(true);
        } catch (err) {
            console.error(err);
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
        <div className="max-w-4xl mx-auto p-6 text-white pb-20">
            {/* Predictions Modal */}
            {showPredictionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Pronostics de la Ligue</h2>
                                <p className="text-red-500 font-bold text-xs uppercase tracking-widest mt-1">{selectedMatchName}</p>
                            </div>
                            <button onClick={() => setShowPredictionsModal(false)} className="text-white hover:text-red-500 transition-all font-black text-3xl">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {leaguePredictions.map((lp, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-gray-900 uppercase italic text-lg">{lp.user.username}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Membre</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {lp.prediction ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-3xl font-black text-red-600">{lp.prediction.wydadScore}</span>
                                                    <span className="text-gray-300 font-black">-</span>
                                                    <span className="text-3xl font-black text-gray-900">{lp.prediction.opponentScore}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                                                    {lp.prediction.scorers?.map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 font-black italic uppercase text-xs tracking-widest">Aucun pronostic</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Sidebar */}
            {showChat && (
                <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900 border-l border-white/10 shadow-2xl z-50 flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-wydad-600">
                        <div>
                            <h3 className="text-xl font-black italic uppercase">Chat de Ligue</h3>
                            <p className="text-[10px] font-bold text-red-200 uppercase tracking-widest">{league?.name}</p>
                        </div>
                        <button onClick={() => setShowChat(false)} className="text-white hover:text-red-200 transition-all font-black text-2xl">×</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-red-500 uppercase mb-1">{msg.username}</p>
                                <p className="text-sm font-medium text-gray-200">{msg.text}</p>
                                <p className="text-[8px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-black/20">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Tchatte avec la ligue..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <button type="submit" className="bg-red-600 p-2 rounded-xl hover:bg-red-700">
                                <Target className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold flex items-center gap-2 border border-red-500 shadow-lg relative"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="hidden md:inline italic uppercase text-xs font-black">Chat</span>
                    </button>
                    <button
                        onClick={() => {
                            const inviteText = `🏆 Rejoins ma ligue ${league?.name} sur Fantasy Wydad !\nCode: ${league?.joinCode}\n\nInscris-toi ici : ${window.location.origin}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');
                        }}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-bold flex items-center gap-2 border border-green-500 shadow-lg"
                        title="Inviter sur WhatsApp"
                    >
                        <Users className="w-5 h-5" />
                        <span className="hidden md:inline italic uppercase text-xs font-black">Inviter</span>
                    </button>
                    <button
                        onClick={() => navigate('/leagues')}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold flex items-center gap-2 border border-white/10 backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
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

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/predict/${match._id}`)}
                                    className={`flex-1 py-4 rounded-xl font-black shadow-xl transition-all ${prediction ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'premium-btn text-white'}`}
                                >
                                    {prediction ? 'MODIFIER MON PRONOSTIC' : 'FAIRE MON PRONOSTIC'}
                                </button>
                                <button
                                    onClick={() => fetchLeaguePredictions(match._id, match.opponent)}
                                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black shadow-xl transition-all"
                                    title="Voir les pronostics des autres membres"
                                >
                                    <Users className="w-5 h-5" />
                                </button>
                            </div>
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
