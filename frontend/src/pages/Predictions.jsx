import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Target, ArrowLeft, Calendar, Info } from 'lucide-react';
import { matchAPI, predictionAPI, statsAPI } from '../services/api';
import TeamLogo from '../components/TeamLogo';
import { WYDAD_LOGO } from '../utils/constants';

const PLAYERS = [
    "El Mehdi Benabid", "Abdelali Mhamdi", "Aymen El Jaafary",
    "Ayman El Wafi", "Bart Meijers", "Amine Aboulfath",
    "Guilherme Ferreira", "Sallah Moussaddaq", "Mohammed El Jadidi",
    "Ayoub Boucheta", "Nabil Khali", "Brahim Laafouri",
    "Mohamed Moufid", "Mohamed Bouchouari", "Abdelghafour Lamirat",
    "Rayane Mahtou", "Naïm Byar", "Walid Sabbar",
    "Joseph Bakasu", "Hamza Sakhi", "Arthur Wenderroscky",
    "Pedrinho", "Stephane Aziz Ki", "Mouad Enzo",
    "Moises Paniagua", "Mohamed Rayhi", "Thembinkosi Lorch",
    "Hamza Elowasti", "Zouhair El Moutaraji", "Mohamed El Ouardi",
    "Hakim Ziyech", "Walid Nassi", "Nordin Amrabat",
    "Wissam Ben Yedder", "Hamza Hannouri", "Tumisang Orebonye",
    "Chamss Eddine El Allaly", "Salman Rihani"
];

const InfoTooltip = ({ text }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block ml-2 group">
            <button
                type="button"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={() => setShow(!show)}
                className="p-1 rounded-full bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
                <Info className="w-3.5 h-3.5" />
            </button>
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-bold rounded-xl shadow-2xl z-[100] animate-fade-in border border-white/10">
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    {text}
                </div>
            )}
        </div>
    );
};

export default function Predictions() {
    const { t } = useTranslation();
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [wydadScore, setWydadScore] = useState('');
    const [opponentScore, setOpponentScore] = useState('');
    const [result, setResult] = useState('');
    const [selectedScorers, setSelectedScorers] = useState([]);
    const [advancedEvents, setAdvancedEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('anytime'); // 'anytime', 'intervals', 'specials'
    const [loading, setLoading] = useState(true);
    const [lastScorers, setLastScorers] = useState([]);

    useEffect(() => {
        loadData();
    }, [matchId]);

    const loadData = async () => {
        try {
            const [matchRes, globalRes] = await Promise.all([
                matchAPI.getById(matchId),
                statsAPI.getGlobal()
            ]);
            setMatch(matchRes.data);
            setLastScorers(globalRes.data?.lastMatch?.scorers || []);

            // Try to load existing prediction
            try {
                const predRes = await predictionAPI.getByMatch(matchId);
                if (predRes.data) {
                    setWydadScore(predRes.data.wydadScore.toString());
                    setOpponentScore(predRes.data.opponentScore.toString());
                    setResult(predRes.data.result);
                    setSelectedScorers(predRes.data.scorers || []);
                    setAdvancedEvents(predRes.data.advancedEvents || []);
                }
            } catch (err) {
                // No existing prediction
            }
        } catch (error) {
            console.error('Erreur de chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleScorer = (player) => {
        setSelectedScorers((prev) => {
            const isRemoving = prev.includes(player);
            if (isRemoving) {
                // Also remove any advanced events related to this player
                setAdvancedEvents(events => events.filter(e => e.player !== player));
                return prev.filter((p) => p !== player);
            }

            // Limit check
            const limit = parseInt(wydadScore) || 0;
            if (prev.length >= limit) {
                alert(t('predictions.too_many_scorers_alert', { limit }));
                return prev;
            }

            return [...prev, player];
        });
    };

    const toggleAdvancedEvent = (type, player = null) => {
        setAdvancedEvents(prev => {
            const exists = prev.find(e => e.type === type && e.player === player);
            if (exists) {
                return prev.filter(e => !(e.type === type && e.player === player));
            }
            return [...prev, { category: getCategory(type), type, player }];
        });
    };

    const getCategory = (type) => {
        if (type.startsWith('interval')) return 'time';
        if (['first_scorer', 'last_scorer', 'brace', 'hat_trick', 'anytime_winner'].includes(type)) return 'buteur';
        return 'combination';
    };

    const handleWydadScoreChange = (val) => {
        const score = parseInt(val) || 0;
        setWydadScore(val);
        // If new score is less than selected scorers, truncate list
        if (selectedScorers.length > score) {
            const truncated = selectedScorers.slice(0, score);
            setSelectedScorers(truncated);
            // Also clean up advanced events for removed players
            setAdvancedEvents(events => events.filter(e => truncated.includes(e.player) || !e.player));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!result || wydadScore === '' || opponentScore === '') {
            alert(t('predictions.required_fields_alert'));
            return;
        }

        const score = parseInt(wydadScore);
        if (selectedScorers.length > score) {
            alert(t('predictions.too_many_scorers_submit_alert', { count: selectedScorers.length, score }));
            return;
        }

        if (match?.isLocked) {
            alert(t('predictions.match_locked_alert'));
            return;
        }

        try {
            await predictionAPI.create({
                matchId,
                wydadScore: score,
                opponentScore: parseInt(opponentScore),
                result,
                scorers: selectedScorers,
                advancedEvents
            });
            alert(t('predictions.success'));
            navigate(-1);
        } catch (error) {
            alert(t('predictions.error'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-white font-black animate-pulse uppercase tracking-widest">{t('common.loading')}</div>
            </div>
        );
    }

    if (match?.isLocked) {
        return (
            <div className="max-w-md mx-auto p-12 text-center">
                <div className="bg-red-600/20 p-8 rounded-[32px] border border-red-500/30 backdrop-blur-xl">
                    <Target className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-black italic uppercase text-white mb-4">{t('predictions.locked')}</h2>
                    <p className="text-gray-400 font-bold mb-8 uppercase text-xs tracking-widest leading-relaxed">
                        {t('predictions.match_locked_admin_hint')}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 bg-white text-red-600 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
                    >
                        {t('predictions.back_to_matches')}
                    </button>
                </div>
            </div>
        );
    }

    const INTERVALS = [
        { id: 'interval_0_15', label: '0\' - 15\'' },
        { id: 'interval_16_30', label: '16\' - 30\'' },
        { id: 'interval_31_45', label: '31\' - 45+\'' },
        { id: 'interval_46_60', label: '46\' - 60\'' },
        { id: 'interval_61_75', label: '61\' - 75\'' },
        { id: 'interval_76_90', label: '76\' - 90+\'' },
    ];

    const SPECIALS = [
        { id: 'first_scorer', label: t('leagues.first_scorer') },
        { id: 'last_scorer', label: t('leagues.last_scorer') },
        { id: 'brace', label: t('leagues.brace') },
        { id: 'hat_trick', label: t('leagues.hat_trick') },
        { id: 'anytime_winner', label: t('leagues.anytime_winner') },
        { id: 'penalty_scorer', label: t('leagues.penalty_scorer') },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 text-white pb-32">
            <div className="mb-12 flex flex-col items-center gap-8">
                <div className="flex items-center justify-center gap-12 md:gap-24 relative">
                    <div className="flex flex-col items-center gap-4">
                        <TeamLogo teamName="Wydad" logoUrl={WYDAD_LOGO} size="w-20 h-20 md:w-24 md:h-24" className="shadow-[0_0_40px_rgba(220,38,38,0.3)] border-2 border-red-600/20" />
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">WYDAD AC</span>
                    </div>

                    <div className="text-4xl md:text-6xl font-black text-red-600 italic opacity-20 select-none">VS</div>

                    <div className="flex flex-col items-center gap-4">
                        <TeamLogo teamName={match?.opponent} logoUrl={match?.opponentLogo} size="w-20 h-20 md:w-24 md:h-24" className="shadow-[0_0_40px_rgba(255,255,255,0.05)] border-2 border-white/10" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">{match?.opponent}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
                        <Calendar className="w-5 h-5 text-red-600" />
                        {new Date(match?.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[0.3em]"
                    >
                        ← {t('predictions.back_to_matches')}
                    </button>
                </div>
            </div>

            {/* Scoring Guide Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 p-6 rounded-r-2xl backdrop-blur-md flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-wider">{t('predictions.comment_win_points')}</h4>
                        <p className="text-blue-100/60 text-[11px] font-bold">{t('predictions.how_it_works_hint')}</p>
                    </div>
                </div>
                <Link
                    to="/scoring"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    {t('predictions.view_rules')}
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Score Section */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-red-600" />
                        {t('predictions.predicted_score').toUpperCase()}
                        <InfoTooltip text={t('scoring_guide.score.desc')} />
                    </h2>

                    <div className="grid grid-cols-3 gap-8 items-center max-w-md mx-auto">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                                WYDAD
                            </label>
                            <input
                                type="number"
                                value={wydadScore}
                                onChange={(e) => handleWydadScoreChange(e.target.value)}
                                min="0"
                                required
                                className="w-full px-4 py-5 border-2 border-gray-100 bg-gray-50 rounded-2xl text-center text-4xl font-black text-gray-900 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-inner"
                                placeholder="0"
                            />
                        </div>

                        <div className="text-center text-4xl font-black text-gray-200 mt-6">-</div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                                {match?.opponent?.toUpperCase()}
                            </label>
                            <input
                                type="number"
                                value={opponentScore}
                                onChange={(e) => setOpponentScore(e.target.value)}
                                min="0"
                                required
                                className="w-full px-4 py-5 border-2 border-gray-100 bg-gray-50 rounded-2xl text-center text-4xl font-black text-gray-900 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-inner"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-red-600" />
                        {t('predictions.result').toUpperCase()}
                        <InfoTooltip text={t('scoring_guide.result.desc')} />
                    </h2>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setResult('win')}
                            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${result === 'win'
                                ? 'bg-green-600 text-white scale-105 shadow-green-500/20'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            {t('predictions.win')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('draw')}
                            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${result === 'draw'
                                ? 'bg-yellow-500 text-white scale-105 shadow-yellow-500/20'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            {t('predictions.draw')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('lose')}
                            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${result === 'lose'
                                ? 'bg-black text-white scale-105 shadow-black/20'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            {t('predictions.lose')}
                        </button>
                    </div>
                </div>

                {/* Advanced Predictions Section */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                            {t('predictions.new_suspense')}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase italic">
                        <Target className="w-8 h-8 text-red-600" />
                        {t('predictions.suspense_markets')}
                    </h2>

                    {/* Simple Guide for Users */}
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-red-500 rounded-full p-1">
                                <Trophy className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <h4 className="text-red-900 font-black text-xs uppercase mb-1">{t('predictions.guide_pronostic')}</h4>
                                <p className="text-red-700 text-[11px] font-bold leading-relaxed">
                                    {t('predictions.guide_step1')}<br />
                                    {t('predictions.guide_step2')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-xl">
                        {[
                            { id: 'anytime', label: t('predictions.anytime_tab') },
                            { id: 'intervals', label: t('predictions.intervals_tab') },
                            { id: 'specials', label: t('predictions.specials_tab') }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-red-600 shadow-md transform scale-105' : 'text-gray-400'}`}
                            >
                                {tab.label}
                                {tab.id === 'anytime' && <InfoTooltip text={t('scoring_guide.scorer.desc')} />}
                                {tab.id === 'intervals' && <InfoTooltip text={t('scoring_guide.interval.desc')} />}
                                {tab.id === 'specials' && <InfoTooltip text={t('scoring_guide.indicators_hint')} />}
                            </button>
                        ))}
                    </div>

                    {/* Anytime Scorers */}
                    {activeTab === 'anytime' && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">
                                {t('predictions.max_scorers_hint', { count: parseInt(wydadScore) || 0 })}
                            </p>
                            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PLAYERS.map((player) => (
                                        <button
                                            key={player}
                                            type="button"
                                            onClick={() => toggleScorer(player)}
                                            className={`p-3 rounded-xl text-left font-bold transition-all flex items-center justify-between group ${selectedScorers.includes(player)
                                                ? 'bg-red-600 text-white shadow-xl scale-[1.01] shadow-red-500/20'
                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="uppercase text-[11px] font-black">{player}</span>
                                                {lastScorers.includes(player) && (
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${selectedScorers.includes(player) ? 'text-red-200' : 'text-red-500'}`}>
                                                        {t('predictions.last_match_scorer')}
                                                    </span>
                                                )}
                                            </div>
                                            {selectedScorers.includes(player) && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded">{t('predictions.ready_badge')}</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Goal Intervals */}
                    {activeTab === 'intervals' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {INTERVALS.map((interval) => (
                                <button
                                    key={interval.id}
                                    type="button"
                                    onClick={() => toggleAdvancedEvent(interval.id)}
                                    className={`p-6 rounded-2xl text-center font-black transition-all ${advancedEvents.find(e => e.type === interval.id)
                                        ? 'bg-gray-900 text-white shadow-2xl scale-105 ring-4 ring-gray-900 border-none'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                >
                                    <p className="text-xl italic mb-1">{interval.label}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-50">{t('predictions.one_goal_scored')}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Special Scenarios */}
                    {activeTab === 'specials' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-2">
                                {SPECIALS.map((spec) => (
                                    <div key={spec.id} className="space-y-3">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-red-600 ml-2 mt-4 flex items-center gap-2">
                                            {spec.label}
                                            <InfoTooltip text={t(`scoring_guide.${spec.id === 'hat_trick' ? 'hattrick' : spec.id === 'anytime_winner' ? 'scorer_win' : spec.id}.desc`)} />
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                            {selectedScorers.length > 0 ? (
                                                selectedScorers.map(player => (
                                                    <button
                                                        key={`${spec.id}-${player}`}
                                                        type="button"
                                                        onClick={() => toggleAdvancedEvent(spec.id, player)}
                                                        className={`p-3 rounded-xl text-[10px] font-bold transition-all text-left truncate ${advancedEvents.find(e => e.type === spec.id && e.player === player)
                                                            ? 'bg-red-600 text-white shadow-lg'
                                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {player.toUpperCase()}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-4 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">
                                                        {t('predictions.select_scorers_first')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm z-50">
                    <button
                        type="submit"
                        className="max-w-4xl mx-auto w-full py-5 premium-btn text-white rounded-2xl font-black text-xl shadow-2xl uppercase tracking-[0.2em] transform active:scale-95 transition-all"
                    >
                        {t('predictions.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
