import { useState, useEffect } from 'react';
import { matchAPI, resultAPI, notificationAPI, adminAPI } from '../services/api';
import { BellRing, Loader2, Users, Trophy, ClipboardList, Target } from 'lucide-react';

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

export default function Admin() {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [formData, setFormData] = useState({
        wydadScore: '',
        opponentScore: '',
    });
    const [stats, setStats] = useState({
        usersCount: 0,
        leaguesCount: 0,
        predictionsCount: 0,
        matchesCount: 0
    });
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        type: 'goal',
        player: PLAYERS[0],
        minute: '',
        goalType: 'foot',
        order: 1
    });
    const [sendingReminder, setSendingReminder] = useState(null);

    useEffect(() => {
        loadMatches();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data);
        } catch (err) {
            console.error('Erreur stats:', err);
        }
    };

    const loadMatches = async () => {
        const res = await matchAPI.getAll();
        setMatches(res.data);
    };

    const handleSelect = (match) => {
        setSelectedMatch(match);
        setFormData({ wydadScore: '', opponentScore: '' });
        setEvents([]);
    };

    const addEvent = () => {
        if (!newEvent.player && newEvent.type !== 'csc') return;

        // Auto-fix goalType for special cases
        let finalGoalType = newEvent.goalType;
        if (newEvent.type === 'penalty') finalGoalType = 'penalty_scored';
        if (newEvent.type === 'csc') finalGoalType = 'csc';

        setEvents([...events, {
            ...newEvent,
            goalType: finalGoalType,
            minute: parseInt(newEvent.minute) || 0,
            order: events.length + 1
        }]);
        setNewEvent({ ...newEvent, player: PLAYERS[0], minute: '' });
    };

    const removeEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleSendReminder = async (matchId) => {
        setSendingReminder(matchId);
        try {
            const res = await notificationAPI.sendReminder(matchId);
            alert(res.data.message);
        } catch (err) {
            alert('Erreur lors de l\'envoi du rappel');
        } finally {
            setSendingReminder(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Important: Extract ACTUAL scorers (including penalties, excluding CSC)
        const scorers = events
            .filter(e => e.type === 'goal' || e.type === 'penalty')
            .map(e => e.player);

        try {
            await resultAPI.create({
                matchId: selectedMatch._id,
                wydadScore: parseInt(formData.wydadScore),
                opponentScore: parseInt(formData.opponentScore),
                scorers: scorers,
                events: events
            });
            alert('Résultat et événements enregistrés !');
            setSelectedMatch(null);
            loadMatches();
        } catch (err) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    // --- DETAILED VALIDATION LOGIC for 9 INDICATORS ---
    const goalEvents = events.filter(e => e.type === 'goal' || e.type === 'penalty');
    const firstScorer = goalEvents[0]?.player || 'Aucun';
    const lastScorer = goalEvents[goalEvents.length - 1]?.player || 'Aucun';

    const playerGoalCounts = {};
    goalEvents.forEach(e => playerGoalCounts[e.player] = (playerGoalCounts[e.player] || 0) + 1);

    const braces = Object.keys(playerGoalCounts).filter(p => playerGoalCounts[p] >= 2);
    const hattricks = Object.keys(playerGoalCounts).filter(p => playerGoalCounts[p] >= 3);

    const wydadScoreNum = parseInt(formData.wydadScore) || 0;
    const opponentScoreNum = parseInt(formData.opponentScore) || 0;
    const matchResult = wydadScoreNum > opponentScoreNum ? 'win'
        : wydadScoreNum < opponentScoreNum ? 'lose'
            : 'draw';

    const intervals = [
        { label: '0-15', reached: goalEvents.some(e => e.minute <= 15) },
        { label: '16-30', reached: goalEvents.some(e => e.minute > 15 && e.minute <= 30) },
        { label: '31-45', reached: goalEvents.some(e => e.minute > 30 && e.minute <= 45) },
        { label: '46-60', reached: goalEvents.some(e => e.minute > 45 && e.minute <= 60) },
        { label: '61-75', reached: goalEvents.some(e => e.minute > 60 && e.minute <= 75) },
        { label: '76-90', reached: goalEvents.some(e => e.minute > 75) },
    ];

    const scorerAndWin = matchResult === 'win' ? Object.keys(playerGoalCounts) : [];
    const penaltyScorers = events.filter(e => e.type === 'penalty' && e.goalType === 'penalty_scored').map(e => e.player);

    return (
        <div className="max-w-7xl mx-auto p-6 text-gray-900 pb-20 font-sans">
            <h1 className="text-4xl font-black mb-12 uppercase tracking-widest border-b-4 border-red-600 pb-2 inline-block italic">
                ADMIN <span className="text-red-600">CENTRAL</span>
            </h1>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-600 flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl"><Users className="text-red-600 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.usersCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateurs</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-gray-900 flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl"><Trophy className="text-gray-900 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.leaguesCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ligues</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-600 flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl"><ClipboardList className="text-red-600 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.predictionsCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pronos</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-gray-900 flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl"><Target className="text-gray-900 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.matchesCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matchs</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Match List - Left Column */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 h-fit">
                    <h2 className="text-xl font-black mb-6 text-gray-800 uppercase italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        Matchs
                    </h2>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {matches.map(match => (
                            <button
                                key={match._id}
                                onClick={() => handleSelect(match)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedMatch?._id === match._id
                                    ? 'bg-red-50 border-red-600 shadow-md transform scale-102 font-bold'
                                    : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-black text-gray-900 uppercase text-sm">Wydad vs {match.opponent}</div>
                                <div className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                                    {new Date(match.date).toLocaleDateString('fr-FR')}
                                </div>
                                {match.status === 'upcoming' && (
                                    <div className="mt-3 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="datetime-local"
                                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold"
                                                id={`date-${match._id}`}
                                                defaultValue={new Date(match.date).toISOString().slice(0, 16)}
                                            />
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const newDate = document.getElementById(`date-${match._id}`).value;
                                                    try {
                                                        await matchAPI.update(match._id, { ...match, date: newDate });
                                                        alert('Date mise à jour !');
                                                        loadMatches();
                                                    } catch (err) { alert('Erreur'); }
                                                }}
                                                className="px-2 py-1 bg-green-600 text-white text-[10px] font-black uppercase rounded hover:bg-green-700"
                                            >
                                                OK
                                            </button>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSendReminder(match._id);
                                            }}
                                            disabled={sendingReminder === match._id}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {sendingReminder === match._id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <BellRing className="w-3 h-3" />
                                            )}
                                            Rappel Pronos
                                        </button>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Entry Form - Middle Column */}
                {selectedMatch ? (
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-red-600 relative">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase italic">Résultat Officiel</h2>
                                    <p className="text-red-600 font-bold uppercase text-xs">W.A.C vs {selectedMatch.opponent}</p>
                                </div>
                                <button onClick={() => setSelectedMatch(null)} className="text-gray-300 hover:text-red-600 transition-all font-black text-2xl">×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8 text-gray-900">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">WYDAD</label>
                                        <input
                                            type="number"
                                            value={formData.wydadScore}
                                            onChange={e => setFormData({ ...formData, wydadScore: e.target.value })}
                                            className="w-full py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-4xl font-black text-center focus:border-red-600 transition-all outline-none"
                                            required placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ADVERSAIRE</label>
                                        <input
                                            type="number"
                                            value={formData.opponentScore}
                                            onChange={e => setFormData({ ...formData, opponentScore: e.target.value })}
                                            className="w-full py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-4xl font-black text-center focus:border-red-600 transition-all outline-none"
                                            required placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-900 p-6 rounded-2xl space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={newEvent.type}
                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                            className="p-3 bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white outline-none"
                                        >
                                            <option value="goal" className="bg-gray-800">BUT</option>
                                            <option value="penalty" className="bg-gray-800">PENALTY</option>
                                            <option value="csc" className="bg-gray-800">C.S.C</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={newEvent.minute}
                                            onChange={e => setNewEvent({ ...newEvent, minute: e.target.value })}
                                            className="p-3 bg-white/10 border border-white/10 rounded-xl text-center text-xs font-black text-white outline-none"
                                        />
                                    </div>
                                    <select
                                        value={newEvent.player}
                                        onChange={e => setNewEvent({ ...newEvent, player: e.target.value })}
                                        className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white outline-none"
                                    >
                                        {PLAYERS.map(p => <option key={p} value={p} className="bg-gray-800">{p.toUpperCase()}</option>)}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addEvent}
                                        className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-white"
                                    >
                                        Ajouter Événement
                                    </button>
                                </div>

                                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar text-gray-900">
                                    {events.sort((a, b) => a.minute - b.minute).map((event, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-red-600 text-sm">{event.minute}'</span>
                                                <span className="font-bold text-xs uppercase">{event.player}</span>
                                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full uppercase">{event.type}</span>
                                            </div>
                                            <button type="button" onClick={() => removeEvent(idx)} className="text-gray-300 hover:text-red-600 transition-all font-black text-lg">×</button>
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" className="w-full py-5 premium-btn rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl text-white">
                                    Publier Résultats
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-5 h-[500px] bg-gray-50 rounded-2xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                        <p className="font-black uppercase italic tracking-widest">En attente de sélection...</p>
                    </div>
                )}

                {/* Validation Dashboard - Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-xl font-black mb-6 text-gray-900 uppercase italic flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-900 text-white flex items-center justify-center rounded text-[10px] italic">📊</div>
                            Barème à Valider
                        </h2>

                        <div className="space-y-4">
                            {/* Group 1: Core */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">1. Fondamentaux</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">Score Exact</span>
                                        <span className="bg-red-100 text-red-700 font-black text-[10px] px-3 py-1 rounded-full uppercase italic">
                                            {wydadScoreNum} - {opponentScoreNum}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">Résultat Final</span>
                                        <span className="bg-gray-900 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase italic">
                                            {matchResult === 'win' ? 'WAC Gagne' : matchResult === 'draw' ? 'Match Nul' : 'WAC Défaite'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Group 2: Scorers */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">2. Buteurs (Anytime)</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(playerGoalCounts).length > 0 ? Object.keys(playerGoalCounts).map(p => (
                                        <span key={p} className="bg-white border border-gray-200 text-gray-900 font-black text-[9px] px-2 py-1 rounded shadow-sm">
                                            {p.toUpperCase()} ({playerGoalCounts[p]})
                                        </span>
                                    )) : <span className="text-gray-300 text-[10px] italic">Aucun buteur</span>}
                                </div>
                            </div>

                            {/* Group 3: Intervals */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">3. Intervalles (Quand ?)</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {intervals.map(int => (
                                        <div key={int.label} className={`p-1.5 rounded text-[8px] font-black text-center ${int.reached ? 'bg-red-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-300'}`}>
                                            {int.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Group 4: Special Scenarios */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">4. Scénarios (High Value)</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🥇 Premier Buteur</span>
                                        <span className="font-black text-gray-900 italic uppercase underline decoration-red-500 decoration-2">{firstScorer}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🏁 Dernier Buteur</span>
                                        <span className="font-black text-gray-900 italic uppercase underline decoration-gray-900 decoration-2">{lastScorer}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🔥 Doublé (2+)</span>
                                        <span className="font-black text-gray-900">{braces.join(' & ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">👑 Triplé (3+)</span>
                                        <span className="font-black text-gray-900">{hattricks.join(' & ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">⚽ Buteur Penalty</span>
                                        <span className="font-black text-gray-900">{penaltyScorers.join(', ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">⚡ Buteur & Gagne</span>
                                        <span className="font-black text-red-600">{scorerAndWin.join(', ') || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
