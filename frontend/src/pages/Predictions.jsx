import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Target, ArrowLeft, Calendar, Info } from 'lucide-react';
import { matchAPI, predictionAPI } from '../services/api';

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

export default function Predictions() {
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

    useEffect(() => {
        loadData();
    }, [matchId]);

    const loadData = async () => {
        try {
            const matchRes = await matchAPI.getById(matchId);
            setMatch(matchRes.data);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!result || wydadScore === '' || opponentScore === '') {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            await predictionAPI.create({
                matchId,
                wydadScore: parseInt(wydadScore),
                opponentScore: parseInt(opponentScore),
                result,
                scorers: selectedScorers,
                advancedEvents
            });
            alert('Pronostic enregistré avec succès !');
            navigate(-1);
        } catch (error) {
            alert('Erreur lors de l\'enregistrement du pronostic');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-white font-black animate-pulse uppercase tracking-widest">Chargement...</div>
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
        { id: 'first_scorer', label: 'Premier Buteur' },
        { id: 'last_scorer', label: 'Dernier Buteur' },
        { id: 'brace', label: 'Doublé (2+ buts)' },
        { id: 'hat_trick', label: 'Triplé (3+ buts)' },
        { id: 'anytime_winner', label: 'Buteur & Victoire' },
        { id: 'penalty_scorer', label: 'Buteur Penalty' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 text-white pb-32">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white mb-2 italic">
                        WYDAD <span className="text-red-500">vs</span> {match?.opponent?.toUpperCase()}
                    </h1>
                    <p className="text-gray-400 font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-red-500" />
                        {new Date(match?.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-bold flex items-center gap-2 border border-white/10 backdrop-blur-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
            </div>

            {/* Scoring Guide Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 p-6 rounded-r-2xl backdrop-blur-md flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-wider">Comment gagner des points ?</h4>
                        <p className="text-blue-100/60 text-[11px] font-bold">Découvrez les détails du barème et les bonus.</p>
                    </div>
                </div>
                <Link
                    to="/scoring"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                    Voir le règlement
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Score Section */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-red-600" />
                        SCORE PRÉDIT
                    </h2>

                    <div className="grid grid-cols-3 gap-8 items-center max-w-md mx-auto">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                                WYDAD
                            </label>
                            <input
                                type="number"
                                value={wydadScore}
                                onChange={(e) => setWydadScore(e.target.value)}
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
                        RÉSULTAT FINAL
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
                            Victoire
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('draw')}
                            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${result === 'draw'
                                ? 'bg-yellow-500 text-white scale-105 shadow-yellow-500/20'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            Nul
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('lose')}
                            className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${result === 'lose'
                                ? 'bg-black text-white scale-105 shadow-black/20'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            Défaite
                        </button>
                    </div>
                </div>

                {/* Advanced Predictions Section */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                            NOUVEAU : SUSPENSE+
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase italic">
                        <Target className="w-8 h-8 text-red-600" />
                        SUSPENSE & MARCHÉS
                    </h2>

                    {/* Simple Guide for Users */}
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-red-500 rounded-full p-1">
                                <Trophy className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <h4 className="text-red-900 font-black text-xs uppercase mb-1">Guide de Pronostic</h4>
                                <p className="text-red-700 text-[11px] font-bold leading-relaxed">
                                    1. Choisissez vos <span className="underline">Buteurs</span> ci-dessous.<br />
                                    2. Définissez leur <span className="underline">Scénario</span> spécifique (ex: Premier Buteur) dans l'onglet correspondant.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-xl">
                        {[
                            { id: 'anytime', label: 'Buteurs' },
                            { id: 'intervals', label: 'Quand ?' },
                            { id: 'specials', label: 'Scénarios' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-red-600 shadow-md transform scale-105' : 'text-gray-400'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Anytime Scorers */}
                    {activeTab === 'anytime' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PLAYERS.map((player) => (
                                <button
                                    key={player}
                                    type="button"
                                    onClick={() => toggleScorer(player)}
                                    className={`p-4 rounded-xl text-left font-bold transition-all flex items-center justify-between ${selectedScorers.includes(player)
                                        ? 'bg-red-600 text-white shadow-xl scale-[1.02] shadow-red-500/20'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {player.toUpperCase()}
                                    {selectedScorers.includes(player) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded">MARQUE</span>
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
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
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-50">UN BUT MARQUÉ</p>
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
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-red-600 ml-2 mt-4">{spec.label}</p>
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
                                                        ⚠️ Sélectionnez d'abord des buteurs dans l'onglet "Buteurs"
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
                        Valider mon Pronostic
                    </button>
                </div>
            </form>
        </div>
    );
}
