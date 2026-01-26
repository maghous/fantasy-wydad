import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft, Award, Users, MessageSquare, Target, ClipboardList, Loader2, CheckCircle2, X } from 'lucide-react';
import { matchAPI, leagueAPI, predictionAPI, messagesAPI, resultAPI } from '../services/api';
import MotMPoll from '../components/MotMPoll';
import TeamLogo from '../components/TeamLogo';
import { PLAYERS, WYDAD_LOGO } from '../utils/constants';

export default function Matches() {
    const { t } = useTranslation();
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
    const [breakdown, setBreakdown] = useState(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const [showBreakdownModal, setShowBreakdownModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [leagueId]);

    const handleViewBreakdown = async (matchId) => {
        setLoadingBreakdown(true);
        setShowBreakdownModal(true);
        try {
            const res = await predictionAPI.getBreakdown(matchId, leagueId);
            setBreakdown(res.data);
        } catch (err) {
            console.error(err);
            setBreakdown(null);
        } finally {
            setLoadingBreakdown(false);
        }
    };

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
        if (leagueId) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
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

            // Fetch results for finished matches
            const finishedMatches = matchesRes.data.filter(m => m.status === 'finished');
            const resultsData = await Promise.all(
                finishedMatches.map(m => resultAPI.getByMatch(m._id).catch(() => ({ data: null })))
            );

            const resultsMap = {};
            resultsData.forEach((r, i) => {
                if (r && r.data) {
                    resultsMap[finishedMatches[i]._id] = r.data;
                }
            });

            const enrichedMatches = matchesRes.data.map(m => ({
                ...m,
                wydadScore: resultsMap[m._id]?.wydadScore,
                opponentScore: resultsMap[m._id]?.opponentScore,
                resultScorers: resultsMap[m._id]?.scorers
            })).sort((a, b) => new Date(a.date) - new Date(b.date));

            setLeague(leagueRes.data);
            setMatches(enrichedMatches);
            setFilteredMatches(enrichedMatches);
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
            setSelectedMatchName(`WYDAD vs ${opponent.toUpperCase()} `);
            setShowPredictionsModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 text-white pb-20">
            {/* Point Breakdown Modal */}
            {showBreakdownModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-8 bg-gray-900 border-b border-white/5 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t('matches.points_breakdown')}</h2>
                                <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest mt-1">{t('matches.breakdown_subtitle')}</p>
                            </div>
                            <button onClick={() => setShowBreakdownModal(false)} className="text-white hover:text-red-500 transition-all font-black text-3xl">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50 custom-scrollbar max-h-[60vh]">
                            {loadingBreakdown ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                                    <p className="text-gray-400 font-black uppercase text-xs animate-pulse">{t('matches.calculating')}</p>
                                </div>
                            ) : breakdown ? (
                                <>
                                    <div className="bg-red-600 rounded-3xl p-6 text-center text-white shadow-xl shadow-red-500/20 mb-6">
                                        <p className="text-[10px] font-black uppercase text-red-100 opacity-60 mb-1">{t('matches.total_earned')}</p>
                                        <div className="text-6xl font-black italic tracking-tighter">
                                            {breakdown.total} <span className="text-xl not-italic">PTS</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {breakdown.items.map((item, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${item.reached
                                                ? 'bg-green-50 border-green-100'
                                                : 'bg-white border-gray-100 grayscale'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${item.reached ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {item.reached ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </div>
                                                    <span className={`font-bold text-sm uppercase ${item.reached ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className={`font-black text-sm ${item.reached ? 'text-green-600' : 'text-gray-300'}`}>
                                                    +{item.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 font-bold uppercase text-sm">{t('matches.prediction_unavailable')}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 text-center">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {t('matches.based_on_scoring')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Predictions Modal */}
            {showPredictionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t('matches.compare_predictions')}</h2>
                                <p className="text-red-500 font-bold text-xs uppercase tracking-widest mt-1">{selectedMatchName}</p>
                            </div>
                            <button onClick={() => setShowPredictionsModal(false)} className="text-white hover:text-red-200 transition-all font-black text-3xl">×</button>
                        </div>

                        {/* Final Result Header in Modal */}
                        <div className="bg-red-600 p-4 text-center">
                            <span className="text-[10px] font-black uppercase text-red-200 mb-1 block">{t('matches.official_result')}</span>
                            <div className="flex items-center justify-center gap-6">
                                <span className="text-3xl font-black text-white">
                                    {matches.find(m => `WYDAD vs ${m.opponent.toUpperCase()} ` === selectedMatchName)?.wydadScore}
                                </span>
                                <span className="text-xl text-white/50 font-black">-</span>
                                <span className="text-3xl font-black text-white">
                                    {matches.find(m => `WYDAD vs ${m.opponent.toUpperCase()} ` === selectedMatchName)?.opponentScore}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {leaguePredictions.map((lp, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-gray-900 uppercase italic text-lg">{lp.user.username}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('matches.member')}</p>
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
                                            <span className="text-gray-300 font-black italic uppercase text-xs tracking-widest">{t('matches.no_prediction')}</span>
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
                            <h3 className="text-xl font-black italic uppercase">{t('matches.chat_league')}</h3>
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
                                placeholder={t('matches.chat_placeholder')}
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
                                {t('leagues.official_scoring')}
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
                        <span className="hidden md:inline italic uppercase text-xs font-black">{t('leagues.chat')}</span>
                    </button>
                    <button
                        onClick={() => {
                            const inviteText = `🏆 Rejoins ma ligue ${league?.name} sur Fantasy Wydad!\nCode: ${league?.joinCode} \n\nInscris - toi ici: ${window.location.origin} `;
                            window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');
                        }}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-bold flex items-center gap-2 border border-green-500 shadow-lg"
                        title={t('matches.invite_whatsapp')}
                    >
                        <Users className="w-5 h-5" />
                        <span className="hidden md:inline italic uppercase text-xs font-black">{t('leagues.invite')}</span>
                    </button >
                    <button
                        onClick={() => navigate('/leagues')}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold flex items-center gap-2 border border-white/10 backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div >
            </div >

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => navigate(`/my-predictions/${leagueId}`)}
                    className="flex-1 py-4 premium-btn text-white rounded-xl font-black shadow-xl flex items-center justify-center gap-2"
                >
                    <Award className="w-6 h-6" />
                    {t('matches.my_predictions_scores')}
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-3 py-2 rounded-lg font-black text-[10px] transition-all ${filter === 'all' ? 'bg-white text-red-700 shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {t('matches.all')}
                </button>
                <button
                    onClick={() => setFilter('Botola')}
                    className={`flex-1 px-3 py-2 rounded-lg font-black text-[10px] transition-all ${filter === 'Botola' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {t('matches.botola')}
                </button>
                <button
                    onClick={() => setFilter('CAF')}
                    className={`flex-1 px-3 py-2 rounded-lg font-black text-[10px] transition-all ${filter === 'CAF' ? 'bg-yellow-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    {t('matches.caf')}
                </button>
            </div>

            <div className="space-y-6">
                {filteredMatches.map((match) => {
                    const prediction = predictions.find((p) => p.matchId === match._id);
                    return (
                        <div key={match._id} className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] transition-all duration-300">
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="flex items-center justify-center gap-8 md:gap-16 relative">
                                    <div className="flex flex-col items-center gap-3">
                                        <TeamLogo teamName="Wydad" logoUrl={WYDAD_LOGO} size="w-16 h-16 md:w-20 md:h-20" className="shadow-[0_0_30px_rgba(220,38,38,0.2)] border-2 border-red-600/20" />
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">WYDAD AC</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl md:text-4xl font-black text-red-600 italic opacity-20">VS</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-3">
                                        <TeamLogo teamName={match.opponent} logoUrl={match.opponentLogo} size="w-16 h-16 md:w-20 md:h-20" className="shadow-[0_0_30px_rgba(255,255,255,0.05)] border-2 border-white/10" />
                                        <span className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[100px] text-center">{match.opponent}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${match.competition === 'CAF' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'}`}>
                                            {match.competition || 'Match'}
                                        </span>
                                        {match.round && (
                                            <span className="text-[9px] font-black text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                                {match.round}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-500 text-[10px]">
                                        <p className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 text-red-600" />
                                            {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </p>
                                        <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                                        <p className="font-bold uppercase tracking-widest">{match.location}</p>
                                    </div>
                                </div>
                            </div>
                            {prediction && (
                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {t('matches.prediction_ready') || 'Prêt'}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {match.status === 'finished' ? (
                                    <>
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 flex items-center justify-between mb-2">
                                            <div className="flex flex-col items-center flex-1">
                                                <span className="text-[10px] font-black uppercase text-gray-500 mb-1">{t('matches.final_result')}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl font-black text-red-600">
                                                        {match.wydadScore ?? '?'}
                                                    </span>
                                                    <span className="text-2xl text-white/20 font-black">-</span>
                                                    <span className="text-4xl font-black text-white">
                                                        {match.opponentScore ?? '?'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {prediction && (
                                            <button
                                                onClick={() => handleViewBreakdown(match._id)}
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all flex items-center justify-center gap-2 mb-2"
                                            >
                                                <ClipboardList className="w-4 h-4 text-red-500" />
                                                {t('matches.my_points_details')}
                                            </button>
                                        )}
                                        {match.wydadScore !== undefined && (
                                            <div className="mb-4">
                                                <MotMPoll match={match} players={PLAYERS} />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => fetchLeaguePredictions(match._id, match.opponent)}
                                            className="w-full py-4 bg-wydad-600 hover:bg-wydad-700 text-white rounded-xl font-black shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Users className="w-5 h-5" />
                                            {t('matches.view_members_predictions')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => !match.isLocked && navigate(`/predict/${match._id}`)}
                                        disabled={match.isLocked}
                                        className={`w-full py-4 rounded-xl font-black shadow-xl transition-all ${match.isLocked
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                            : prediction
                                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                                : 'premium-btn text-white'}`}
                                    >
                                        {match.isLocked ? (
                                            <span className="flex items-center justify-center gap-2 italic uppercase">
                                                🔒 {t('matches.predictions_closed')}
                                            </span>
                                        ) : (
                                            prediction ? t('matches.modify_prediction') : t('matches.make_prediction')
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {matches.length === 0 && (
                    <div className="glass-card rounded-2xl p-20 text-center">
                        <Calendar className="w-20 h-20 text-white/5 mx-auto mb-6" />
                        <p className="text-gray-400 text-xl font-bold italic uppercase tracking-widest">{t('matches.empty_calendar')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
