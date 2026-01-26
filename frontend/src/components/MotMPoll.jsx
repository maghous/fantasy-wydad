import { useState, useEffect } from 'react';
import { motmAPI } from '../services/api';
import { Trophy, Loader2, CheckCircle2, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MotMPoll({ match, players }) {
    const { t, i18n } = useTranslation();
    const [results, setResults] = useState(null);
    const [myVote, setMyVote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const isRtl = i18n.dir() === 'rtl';

    useEffect(() => {
        loadData();
    }, [match._id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [res, myRes] = await Promise.all([
                motmAPI.getResults(match._id),
                motmAPI.checkMyVote(match._id)
            ]);
            setResults(res.data);
            if (myRes.data.voted) setMyVote(myRes.data.playerName);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (playerName) => {
        setVoting(true);
        try {
            await motmAPI.vote({ matchId: match._id, playerName });
            setMyVote(playerName);
            await loadData();
        } catch (err) {
            alert(err.response?.data?.message || t('common.error'));
        } finally {
            setVoting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
    );

    const isClosed = results?.isClosed;
    const canVote = !myVote && !isClosed;

    return (
        <div className="bg-gray-900 rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10 mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Award className="text-red-600" />
                    {isClosed ? t('motm.results_title') : t('motm.vote_title')}
                </h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {isClosed ? t('motm.poll_closed') : t('motm.poll_open')} • {results?.totalVotes || 0} {t('stats.votes')}
                </p>
            </div>

            <div className="space-y-3">
                {results?.results?.length > 0 && !canVote ? (
                    // Results View
                    <div className="space-y-4">
                        {results.results.map((r, idx) => {
                            const percent = Math.round((r.count / results.totalVotes) * 100);
                            const isWinner = idx === 0;
                            return (
                                <div key={r.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-black uppercase">
                                        <span className={isWinner ? 'text-red-500' : 'text-gray-400'}>
                                            {r.name} {r.name === myVote && <span className="text-[8px] bg-white/10 px-1 rounded ml-1">{t('motm.my_choice')}</span>}
                                        </span>
                                        <span>{percent}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-gray-700'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Vote Selection (Compact Scrollable Bar List)
                    <div className="relative group/scroll">
                        <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar transition-all font-sans">
                            {players.map((player) => (
                                <button
                                    key={player}
                                    onClick={() => handleVote(player)}
                                    disabled={voting || !canVote}
                                    className={`w-full group relative overflow-hidden p-3 rounded-xl border transition-all duration-200 flex items-center justify-between
                                        ${voting ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-600 hover:bg-red-600/[0.03] active:scale-[0.99]'}
                                        ${myVote === player ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/5 text-gray-400'}
                                    `}
                                >
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shadow-inner
                                            ${myVote === player ? 'bg-white text-red-600' : 'bg-white/5 text-gray-500 group-hover:bg-red-600 group-hover:text-white transition-all'}
                                        `}>
                                            {player.charAt(0)}
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-tight">{player}</span>
                                    </div>

                                    <div className="relative z-10">
                                        {voting && player === myVote ? (
                                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                                        ) : (
                                            <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border-b-2
                                                ${myVote === player ? 'text-white border-white/30' : 'text-gray-600 border-transparent group-hover:text-red-500 group-hover:border-red-500/30 transition-all'}
                                            `}>
                                                {t('common.view')}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {/* Dynamic fade indicator */}
                        <div className="absolute bottom-0 left-0 right-2 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none group-hover/scroll:opacity-0 transition-opacity duration-500"></div>
                    </div>
                )}
            </div>

            {myVote && !isClosed && (
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-green-500 italic">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('motm.vote_registered')}
                </div>
            )}
        </div>
    );
}
