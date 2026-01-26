import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { statsAPI, motmAPI, matchAPI, resultAPI } from '../services/api';
import { TrendingUp, Users, Target, Activity, Flame, Trophy as TrophyIcon, Star } from 'lucide-react';
import MotMPoll from '../components/MotMPoll';
import TeamLogo from '../components/TeamLogo';
import { PLAYERS, WYDAD_LOGO } from '../utils/constants';

export default function Stats() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [topScorers, setTopScorers] = useState([]);
    const [motmWinners, setMotmWinners] = useState([]);
    const [finishedMatches, setFinishedMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [globalRes, scorersRes, motmRes, matchesRes] = await Promise.all([
                statsAPI.getGlobal(),
                statsAPI.getSeasonTop(),
                motmAPI.getAllWinners(),
                matchAPI.getAll()
            ]);

            // Get recent finished matches (last 5)
            const finished = matchesRes.data
                .filter(m => m.status === 'finished')
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            // Fetch results for finished matches
            const resultsData = await Promise.all(
                finished.map(m => resultAPI.getByMatch(m._id).catch(() => ({ data: null })))
            );

            const enrichedMatches = finished.map((m, i) => ({
                ...m,
                wydadScore: resultsData[i]?.data?.wydadScore,
                opponentScore: resultsData[i]?.data?.opponentScore,
                resultScorers: resultsData[i]?.data?.scorers
            }));

            setStats(globalRes.data);
            setTopScorers(scorersRes.data);
            setMotmWinners(motmRes.data);
            setFinishedMatches(enrichedMatches);
        } catch (err) {
            console.error('Erreur stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 text-white pb-20 font-sans">
            <div className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                    {t('stats.title').split('FANS')[0]}<span className="text-red-500 underline decoration-white decoration-4">FANS</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-3">
                    <Activity className="text-red-600 animate-pulse" />
                    {t('stats.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Metrics, Experts & Top 5 */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Community Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Total Users Card */}
                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="w-24 h-24" />
                            </div>
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">{t('stats.community')}</p>
                            <div className="text-4xl font-black text-white flex items-center gap-4">
                                {stats?.usersCount}
                                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded uppercase font-black">{t('stats.members')}</span>
                            </div>
                        </div>

                        {/* Engagement Card */}
                        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Flame className="w-24 h-24" />
                            </div>
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">{t('stats.predictions_next')}</p>
                            <div className="text-4xl font-black text-white">
                                {stats?.nextMatch?.stats?.totalPredictions || 0}
                            </div>
                        </div>

                        {/* Hot Topic Card (Fan Favorite) */}
                        <div className="glass-card rounded-2xl p-6 border border-red-600/20">
                            <p className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2">{t('stats.fan_favorite')}</p>
                            <div className="text-xl font-black text-white uppercase italic truncate">
                                {stats?.nextMatch?.stats?.topPredictedScorer?.name || '---'}
                            </div>
                            <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase">
                                {t('stats.cited_by')} {stats?.nextMatch?.stats?.topPredictedScorer?.count || 0} {t('stats.supporters')}
                            </p>
                        </div>

                        {/* Last Match Scorers */}
                        <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-red-600/10 to-transparent">
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">{t('stats.last_scorers')}</p>
                            <div className="flex items-center gap-3 mb-2 min-w-0">
                                <TeamLogo teamName={stats?.lastMatch?.opponent} logoUrl={stats?.lastMatch?.opponentLogo} size="w-6 h-6" />
                                <div className="text-[10px] font-black text-white uppercase italic truncate">
                                    {t('stats.vs')} {stats?.lastMatch?.opponent || '---'}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {stats?.lastMatch?.scorers?.length > 0 ? stats.lastMatch.scorers.map((s, i) => (
                                    <span key={i} className="text-[9px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">
                                        {s}
                                    </span>
                                )) : (
                                    <span className="text-[9px] text-gray-500 font-black italic">{t('stats.no_goals')}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* What do the experts say? */}
                    {stats?.nextMatch && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <TeamLogo teamName="Wydad" logoUrl={WYDAD_LOGO} size="w-10 h-10" />
                                <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3 italic">
                                    <TrendingUp className="text-red-600" />
                                    {t('stats.what_experts_say')}
                                    <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-black not-italic text-gray-400">
                                        {t('stats.vs')} {stats.nextMatch.opponent.toUpperCase()}
                                    </span>
                                </h2>
                                <TeamLogo teamName={stats.nextMatch.opponent} logoUrl={stats.nextMatch.opponentLogo} size="w-10 h-10" />
                            </div>

                            <div className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
                                {/* Win Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between font-black uppercase text-xs">
                                        <span>{t('stats.wydad_win')}</span>
                                        <span className="text-red-500">{stats.nextMatch.stats?.winPercentage || 0}%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                            style={{ width: `${stats.nextMatch.stats?.winPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Draw Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between font-black uppercase text-xs">
                                        <span>{t('stats.draw')}</span>
                                        <span>{stats.nextMatch.stats?.drawPercentage || 0}%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <div
                                            className="h-full bg-gray-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${stats.nextMatch.stats?.drawPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Loss Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between font-black uppercase text-xs">
                                        <span>{t('stats.opponent_win')}</span>
                                        <span className="text-gray-500">{stats.nextMatch.stats?.lossPercentage || 0}%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <div
                                            className="h-full bg-white/10 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${stats.nextMatch.stats?.lossPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-red-600/10 rounded-2xl border border-red-500/20 text-center">
                                    <p className="text-sm font-bold text-gray-300">
                                        {t('stats.fans_confident')} <span className="text-white font-black">{stats.nextMatch.stats?.winPercentage}%</span> {t('stats.for_win')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top 5 Season W.A.C */}
                    <div className="glass-card rounded-[32px] p-8 border border-white/10">
                        <h2 className="text-2xl font-black uppercase tracking-widest italic mb-8 flex items-center gap-3">
                            <Target className="text-red-600 w-8 h-8" />
                            {t('stats.top5_season')} <span className="text-sm text-gray-500">W.A.C</span>
                        </h2>

                        <div className="space-y-6">
                            {topScorers.length > 0 ? topScorers.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-black uppercase text-lg group-hover:text-red-500 transition-colors">{s.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black">{s.goals}</span>
                                        <span className="text-xs font-black text-gray-500 uppercase italic tracking-tighter">{t('stats.goals')}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-gray-500 italic font-bold uppercase text-xs">
                                    {t('stats.no_data')}
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                                {t('stats.official_season')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: MOTM Section */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-[32px] p-8 border border-white/10 sticky top-6">
                        <h2 className="text-xl font-black uppercase tracking-widest italic mb-8 flex items-center gap-3">
                            <Star className="text-yellow-500 w-6 h-6 fill-yellow-500" />
                            {t('stats.motm_title')}
                        </h2>

                        {/* Recent Matches Voting */}
                        {finishedMatches.length > 0 ? (
                            <div className="space-y-6 mb-8">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">
                                    {t('stats.vote_recent')}
                                </p>
                                {finishedMatches.map((match) => (
                                    match.wydadScore !== undefined && (
                                        <div key={match._id} className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">
                                                    {t('stats.vs')} {match.opponent}
                                                </span>
                                                <span className="text-xs font-black text-white">
                                                    {match.wydadScore} - {match.opponentScore}
                                                </span>
                                            </div>
                                            <MotMPoll match={match} players={PLAYERS} />
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 italic font-bold uppercase text-[10px] mb-8">
                                {t('stats.no_recent_match')}
                            </div>
                        )}

                        {/* Historical Winners */}
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                {t('stats.winners_history')}
                            </p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {Array.isArray(motmWinners) && motmWinners.length > 0 ? motmWinners.map((w, idx) => (
                                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-default text-[10px]">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('stats.vs')} {w.opponent}</span>
                                            <span className="font-black uppercase text-white group-hover:text-red-500 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{w.winner}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <TrophyIcon className="w-3 h-3 fill-yellow-500" />
                                                <span className="font-black text-xs">{w.votes}</span>
                                            </div>
                                            <span className="text-[7px] font-black text-gray-400 uppercase">{t('stats.votes')}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 italic font-bold uppercase text-[10px]">
                                        {t('stats.no_trophy')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
