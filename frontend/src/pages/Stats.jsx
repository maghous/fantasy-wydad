import { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';
import { TrendingUp, Users, Target, Activity, Flame } from 'lucide-react';

export default function Stats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await statsAPI.getGlobal();
            setStats(res.data);
        } catch (err) {
            console.error('Erreur stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 text-white pb-20">
            <div className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                    La Voix des <span className="text-red-500 underline decoration-white decoration-4">FANS</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-3">
                    <Activity className="text-red-600 animate-pulse" />
                    Tendances en temps réel de la communauté
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Total Users Card */}
                <div className="glass-card rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-32 h-32" />
                    </div>
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">Communauté Active</p>
                    <div className="text-6xl font-black text-white flex items-center gap-4">
                        {stats?.usersCount}
                        <span className="text-sm bg-red-600 text-white px-3 py-1 rounded-full uppercase italic tracking-tighter">Membres</span>
                    </div>
                </div>

                {/* Engagement Card */}
                <div className="glass-card rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame className="w-32 h-32" />
                    </div>
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">Pronostics Totaux (Prochain Match)</p>
                    <div className="text-6xl font-black text-white">
                        {stats?.nextMatch?.stats?.totalPredictions || 0}
                    </div>
                </div>

                {/* Hot Topic Card */}
                <div className="glass-card rounded-[32px] p-8 border-2 border-red-600/30">
                    <p className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2">Buteur le plus attendu</p>
                    <div className="text-3xl font-black text-white uppercase italic">
                        {stats?.nextMatch?.stats?.topPredictedScorer?.name || '---'}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-bold uppercase">
                        {stats?.nextMatch?.stats?.topPredictedScorer?.count || 0} supporters y croient
                    </p>
                </div>
            </div>

            {stats?.nextMatch && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3 italic">
                        <TrendingUp className="text-red-600" />
                        Que disent les experts ?
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-black not-italic text-gray-400">
                            vs {stats.nextMatch.opponent.toUpperCase()}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            {/* Win Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between font-black uppercase text-xs">
                                    <span>Victoire Wydad</span>
                                    <span className="text-red-500">{stats.nextMatch.stats?.winPercentage || 0}%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                        style={{ width: `${stats.nextMatch.stats?.winPercentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Draw Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between font-black uppercase text-xs">
                                    <span>Match Nul</span>
                                    <span>{stats.nextMatch.stats?.drawPercentage || 0}%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gray-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.nextMatch.stats?.drawPercentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Loss Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between font-black uppercase text-xs">
                                    <span>Victoire Adverse</span>
                                    <span className="text-gray-500">{stats.nextMatch.stats?.lossPercentage || 0}%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/10 transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.nextMatch.stats?.lossPercentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-[32px] p-10 text-center relative overflow-hidden border border-white/5">
                            <div className="relative z-10">
                                <Target className="w-16 h-16 text-red-600 mx-auto mb-6 animate-bounce" />
                                <h3 className="text-3xl font-bold italic mb-4">Le Consensus</h3>
                                <p className="text-gray-400 leading-relaxed font-medium">
                                    La majorité des supporters ({stats.nextMatch.stats?.winPercentage}%)
                                    prévoient une <span className="text-white font-black">Victoire</span> face à {stats.nextMatch.opponent}.
                                    <br />
                                    <span className="text-red-500 font-bold uppercase mt-4 block tracking-tighter">Préparez vos pronostics !</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
