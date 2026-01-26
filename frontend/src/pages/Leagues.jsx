import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Plus, BarChart3, Timer, Calendar, MapPin, LogOut } from 'lucide-react';
import { leagueAPI, matchAPI } from '../services/api';
import { useAuthStore } from '../context/useAuthStore';

const Leagues = () => {
    const { t, i18n } = useTranslation();
    const [leagues, setLeagues] = useState([]);
    const [nextMatch, setNextMatch] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newLeague, setNewLeague] = useState({
        name: '',
        exactScore: 5,
        perScorer: 3,
        correctResult: 1,
        firstScorer: 5,
        lastScorer: 5,
        brace: 8,
        hatTrick: 15,
        anytimeWinner: 5,
        goalInterval: 3,
        penaltyScorer: 4
    });
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');

    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        loadLeagues();
        fetchNextMatch();
    }, []);

    const fetchNextMatch = async () => {
        try {
            const res = await matchAPI.getNextMatch();
            setNextMatch(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadLeagues = async () => {
        try {
            const response = await leagueAPI.getAll();
            setLeagues(response.data);
        } catch (error) {
            console.error('Erreur de chargement des ligues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveLeague = async (leagueId, leagueName) => {
        if (!window.confirm(t('leagues.leave_confirm', { name: leagueName }))) return;

        try {
            await leagueAPI.leave(leagueId);
            alert(t('leagues.leave_success_alert'));
            loadLeagues();
        } catch (error) {
            const message = error.response?.data?.message || t('leagues.leave_error');
            alert(message);
        }
    };

    const handleCreateLeague = async (e) => {
        e.preventDefault();
        try {
            await leagueAPI.create({
                name: newLeague.name,
                scoring: {
                    exactScore: parseInt(newLeague.exactScore),
                    perScorer: parseInt(newLeague.perScorer),
                    correctResult: parseInt(newLeague.correctResult),
                    firstScorer: parseInt(newLeague.firstScorer),
                    lastScorer: parseInt(newLeague.lastScorer),
                    brace: parseInt(newLeague.brace),
                    hatTrick: parseInt(newLeague.hatTrick),
                    anytimeWinner: parseInt(newLeague.anytimeWinner),
                    goalInterval: parseInt(newLeague.goalInterval),
                    penaltyScorer: parseInt(newLeague.penaltyScorer),
                },
            });
            setNewLeague({
                name: '', exactScore: 5, perScorer: 3, correctResult: 1,
                firstScorer: 5, lastScorer: 5, brace: 8, hatTrick: 15,
                anytimeWinner: 5, goalInterval: 3, penaltyScorer: 4
            });
            setShowCreateForm(false);
            loadLeagues();
        } catch (error) {
            const message = error.response?.data?.error || error.response?.data?.message || t('leagues.create_error_msg');
            alert(message);
        }
    };

    const handleJoinLeague = async (e) => {
        e.preventDefault();
        try {
            await leagueAPI.join(joinCode);
            setJoinCode('');
            loadLeagues();
            alert(t('leagues.join_success_alert'));
        } catch (error) {
            const message = error.response?.data?.message || t('leagues.join_invalid_code');
            alert(message);
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
        <div className="max-w-4xl mx-auto p-6 text-white">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white mb-2">
                    {t('leagues.title')}
                </h1>
                <p className="text-gray-300 text-lg">{t('common.welcome')}, {user?.username} ! 🔴⚪</p>
            </div>

            {nextMatch && (
                <div className="mb-6 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/20">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Timer className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white">{t('leagues.next_challenge')}</span>
                            {nextMatch.competition && (
                                <span className="px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-red-100">{nextMatch.competition}</span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
                                    Wydad <span className="text-red-200">{t('stats.vs')}</span> {nextMatch.opponent}
                                </h2>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-red-100">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(nextMatch.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {nextMatch.location}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(leagues[0] ? `/matches/${leagues[0]._id}` : '/matches')}
                                className="px-6 py-3 bg-white text-red-700 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition shadow-xl transform hover:scale-105 text-sm"
                            >
                                {t('leagues.predict_button')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="py-4 premium-btn text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {t('leagues.create')}
                </button>
                <form onSubmit={handleJoinLeague} className="flex gap-2">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder={t('leagues.code')}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
                        required
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-white text-red-700 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
                    >
                        {t('leagues.join')}
                    </button>
                </form>
            </div>

            {showCreateForm && (
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">{t('leagues.new_league')}</h2>
                    <form onSubmit={handleCreateLeague} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                                {t('leagues.league_name')}
                            </label>
                            <input
                                type="text"
                                value={newLeague.name}
                                onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 text-gray-900 font-medium placeholder-gray-400"
                                placeholder={t('leagues.league_name_placeholder')}
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wider">{t('leagues.scoring_rules')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                        {t('leagues.exact_score')}
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.exactScore}
                                        onChange={(e) => setNewLeague({ ...newLeague, exactScore: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                        {t('leagues.per_scorer')}
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.perScorer}
                                        onChange={(e) => setNewLeague({ ...newLeague, perScorer: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                        {t('leagues.correct_result')}
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.correctResult}
                                        onChange={(e) => setNewLeague({ ...newLeague, correctResult: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Advanced scoring */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 uppercase italic tracking-[0.1em]">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                                {t('leagues.advanced_scoring')}
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.goal_interval')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.goalInterval}
                                        onChange={(e) => setNewLeague({ ...newLeague, goalInterval: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all placeholder-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.first_scorer')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.firstScorer}
                                        onChange={(e) => setNewLeague({ ...newLeague, firstScorer: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.last_scorer')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.lastScorer}
                                        onChange={(e) => setNewLeague({ ...newLeague, lastScorer: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.brace')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.brace}
                                        onChange={(e) => setNewLeague({ ...newLeague, brace: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.hat_trick')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.hatTrick}
                                        onChange={(e) => setNewLeague({ ...newLeague, hatTrick: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.anytime_winner')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.anytimeWinner}
                                        onChange={(e) => setNewLeague({ ...newLeague, anytimeWinner: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('leagues.penalty_scorer')}</label>
                                    <input
                                        type="number"
                                        value={newLeague.penaltyScorer}
                                        onChange={(e) => setNewLeague({ ...newLeague, penaltyScorer: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 font-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-wydad-600 text-white rounded-lg font-semibold hover:bg-wydad-700 transition"
                            >
                                {t('common.confirm')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {leagues.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center">
                    <Users className="w-20 h-20 text-white/20 mx-auto mb-6" />
                    <p className="text-white text-xl">{t('leagues.no_leagues')}</p>
                    <p className="text-gray-400 mt-2">{t('leagues.legend_prompt')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {leagues.map((league) => (
                        <div key={league._id} className="glass-card rounded-2xl p-4 hover:translate-y-[-4px] transition-all duration-300">
                            <h3 className="text-xl font-black text-white mb-3">{league.name}</h3>
                            <div className="text-xs text-gray-300 space-y-2 mb-4">
                                <p className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {t('leagues.created_by')}: <span className="text-white font-bold">{league.createdBy?.username || t('leagues.unknown')}</span>
                                </p>
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                    <p className="font-bold text-red-400 mb-2 text-xs uppercase tracking-widest">{t('leagues.scoring_rules')}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between items-center">
                                            <span>{t('leagues.exact_score')}</span>
                                            <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-white">{league.scoring.exactScore} pts</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>{t('predictions.scorers')}</span>
                                            <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-white">{league.scoring.perScorer} pts</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>{t('predictions.result')}</span>
                                            <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-white">{league.scoring.correctResult} pts</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.goal_interval')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.goalInterval || 3} pts</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.first_scorer')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.firstScorer || 5} pts</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.last_scorer')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.lastScorer || 5} pts</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.brace')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.brace || 8} pts</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.hat_trick')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.hatTrick || 15} pts</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-50">{t('leagues.anytime_winner')}</span>
                                                <span className="font-bold text-red-400">{league.scoring.anytimeWinner || 5} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {league.joinCode && (
                                    <div className="p-4 bg-red-600/20 rounded-xl border border-red-500/30 text-center">
                                        <p className="text-[10px] text-red-300 uppercase font-black tracking-widest mb-1">{t('leagues.invitation_code')}</p>
                                        <p className="text-2xl font-mono font-black text-white tracking-[0.2em]">{league.joinCode}</p>
                                    </div>
                                )}

                                {/* Participants List */}
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        {t('leagues.participants')} ({league.members?.length || 0})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {league.members?.map((member, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-2 py-1 rounded text-[10px] font-bold ${member.username === user?.username
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-white/10 text-gray-300'
                                                    }`}
                                            >
                                                {member.username}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate(`/matches/${league._id}`)}
                                    className="w-full py-3 premium-btn text-white rounded-xl font-bold shadow-lg"
                                >
                                    {t('leagues.access_championship')}
                                </button>
                                <button
                                    onClick={() => navigate(`/rankings/${league._id}`)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold flex items-center justify-center gap-2 border border-white/10"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    {t('leagues.general_ranking')}
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/league/join/${league.joinCode}`;
                                        navigator.clipboard.writeText(url);
                                        alert(t('leagues.invite_link_copied'));
                                    }}
                                    className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition font-black flex items-center justify-center gap-2 border border-red-500/20 uppercase text-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('leagues.invite')}
                                </button>
                                {league.createdBy?.username !== user?.username && (
                                    <button
                                        onClick={() => handleLeaveLeague(league._id, league.name)}
                                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition font-bold flex items-center justify-center gap-2 border border-gray-200 uppercase text-xs"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        {t('leagues.leave')}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leagues;
