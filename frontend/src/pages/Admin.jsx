import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchAPI, resultAPI, notificationAPI, adminAPI, statsAPI, uploadAPI } from '../services/api';
import { BellRing, Loader2, Users, Trophy, ClipboardList, Target, Upload, Image as ImageIcon } from 'lucide-react';

import { PLAYERS } from '../utils/constants';

export default function Admin() {
    const { t } = useTranslation();
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
    const [seasonScorers, setSeasonScorers] = useState([
        { name: PLAYERS[0], goals: 0 },
        { name: PLAYERS[1], goals: 0 },
        { name: PLAYERS[2], goals: 0 },
        { name: PLAYERS[3], goals: 0 },
        { name: PLAYERS[4], goals: 0 }
    ]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadMatches();
        loadStats();
        loadSeasonScorers();
    }, []);

    const loadSeasonScorers = async () => {
        try {
            const res = await statsAPI.getSeasonTop();
            if (res.data.length > 0) {
                // Fill up to 5
                const current = [...res.data];
                while (current.length < 5) current.push({ name: PLAYERS[current.length], goals: 0 });
                setSeasonScorers(current);
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveSeasonTop = async () => {
        // Validation: Check for duplicates
        const names = seasonScorers.map(s => s.name);
        const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);

        if (hasDuplicates) {
            alert(t('admin.duplicate_player_error'));
            return;
        }

        try {
            await statsAPI.saveSeasonTop(seasonScorers);
            alert(t('admin.save_scorers_success'));
        } catch (err) { alert(t('admin.save_error')); }
    };

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
        setFormData({
            wydadScore: '',
            opponentScore: '',
            opponent: match.opponent || '',
            date: match.date ? new Date(match.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            location: match.location || 'Domicile',
            competition: match.competition || 'Botola',
            round: match.round || '',
            opponentLogo: match.opponentLogo || ''
        });
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
            alert(t('admin.reminder_sent'));
        } catch (err) {
            alert(t('admin.reminder_error'));
        } finally {
            setSendingReminder(null);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('logo', file);

        setUploading(true);
        try {
            const res = await uploadAPI.uploadLogo(formDataFile);
            setFormData({ ...formData, opponentLogo: res.data.url });
        } catch (err) {
            console.error('Upload error:', err);
            alert(t('admin.upload_error') || 'Erreur lors du téléversement');
        } finally {
            setUploading(false);
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
            alert(t('admin.publish_success'));
            setSelectedMatch(null);
            loadMatches();
        } catch (err) {
            alert(t('admin.save_error'));
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
                ADMIN <span className="text-red-600">{t('admin.central')}</span>
            </h1>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-600 flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl"><Users className="text-red-600 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.usersCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.users_count')}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-gray-900 flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl"><Trophy className="text-gray-900 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.leaguesCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.leagues_count')}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-600 flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-xl"><ClipboardList className="text-red-600 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.predictionsCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.predictions_count')}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-gray-900 flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl"><Target className="text-gray-900 w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.matchesCount}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.matches_count')}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Match List - Left Column */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 h-fit">
                    <h2 className="text-xl font-black mb-6 text-gray-800 uppercase italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        {t('admin.matches')}
                    </h2>
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Add Match Button */}
                        <button
                            onClick={() => {
                                setSelectedMatch({ _isNew: true });
                                setFormData({
                                    opponent: '',
                                    date: new Date().toISOString().slice(0, 16),
                                    location: 'Domicile',
                                    competition: 'Botola',
                                    round: '',
                                    opponentLogo: ''
                                });
                            }}
                            className="w-full py-4 border-2 border-dashed border-red-200 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:border-red-600 transition-all mb-4"
                        >
                            {t('admin.add_new_match')}
                        </button>

                        {matches.map(match => (
                            <div
                                key={match._id}
                                onClick={() => handleSelect(match)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedMatch?._id === match._id
                                    ? 'bg-red-50 border-red-600 shadow-md transform scale-102'
                                    : 'bg-white border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-black text-gray-900 uppercase text-xs">WAC vs {match.opponent}</div>
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${match.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {match.status}
                                    </div>
                                </div>

                                <div className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                                    {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {match.status === 'upcoming' && (
                                    <div className="mt-4 space-y-2 pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-gray-400">Pronos :</span>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await matchAPI.update(match._id, { ...match, isLocked: !match.isLocked });
                                                        loadMatches();
                                                    } catch (err) { alert('Erreur'); }
                                                }}
                                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${match.isLocked
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-green-100 text-green-700 border border-green-200'}`}
                                            >
                                                {match.isLocked ? '🔒 Fermés' : '🔓 Ouverts'}
                                            </button>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSendReminder(match._id);
                                            }}
                                            disabled={sendingReminder === match._id}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            {sendingReminder === match._id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <BellRing className="w-3 h-3" />
                                            )}
                                            {t('matches.chat_league')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Entry Form - Middle Column */}
                {selectedMatch ? (
                    <div className="lg:col-span-5 space-y-8">
                        {selectedMatch._isNew ? (
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-blue-600">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase italic">{t('admin.create_match')}</h2>
                                        <p className="text-blue-600 font-bold uppercase text-xs">{t('admin.match_config')}</p>
                                    </div>
                                    <button onClick={() => setSelectedMatch(null)} className="text-gray-300 hover:text-red-600 transition-all font-black text-2xl">×</button>
                                </div>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await matchAPI.create(formData);
                                        alert('Match créé avec succès !');
                                        setSelectedMatch(null);
                                        loadMatches();
                                    } catch (err) { alert('Erreur lors de la création'); }
                                }} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.opponent')}</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-blue-600 outline-none"
                                                value={formData.opponent}
                                                onChange={e => setFormData({ ...formData, opponent: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.match_date')}</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-blue-600 outline-none"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.location')}</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-blue-600 outline-none"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                >
                                                    <option value="Domicile">{t('admin.home')}</option>
                                                    <option value="Extérieur">{t('admin.away')}</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.competition')}</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-blue-600 outline-none"
                                                    value={formData.competition}
                                                    onChange={e => setFormData({ ...formData, competition: e.target.value })}
                                                >
                                                    <option value="Botola">{t('matches.botola')}</option>
                                                    <option value="CAF">{t('matches.caf')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('admin.opponent_logo') || 'Logo Adversaire'}</label>

                                            <div className="flex items-center gap-4">
                                                <div className="relative group flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="logo-upload"
                                                    />
                                                    <label
                                                        htmlFor="logo-upload"
                                                        className={`w-full flex items-center justify-center gap-3 p-4 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-blue-600 hover:bg-blue-50 border-gray-200'}`}
                                                    >
                                                        {uploading ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                                        ) : (
                                                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                                        )}
                                                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">
                                                            {formData.opponentLogo ? (t('admin.change_logo') || 'Changer le logo') : (t('admin.upload_logo') || 'Téléverser un logo')}
                                                        </span>
                                                    </label>
                                                </div>

                                                {formData.opponentLogo && (
                                                    <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shadow-inner">
                                                        <img src={formData.opponentLogo} alt="Preview" className="w-full h-full object-contain p-2" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <p className="text-[9px] text-gray-400 font-medium">Ou coller une URL directe :</p>
                                                <input
                                                    type="url"
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium focus:border-blue-600 outline-none"
                                                    value={formData.opponentLogo}
                                                    onChange={e => setFormData({ ...formData, opponentLogo: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl">
                                        {t('admin.create_match')}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-red-600 relative">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase italic">{t('admin.official_result')}</h2>
                                        <p className="text-red-600 font-bold uppercase text-xs">W.A.C vs {selectedMatch.opponent}</p>
                                    </div>
                                    <button onClick={() => setSelectedMatch(null)} className="text-gray-300 hover:text-red-600 transition-all font-black text-2xl">×</button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8 text-gray-900">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('admin.wydad_score').toUpperCase()}</label>
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
                                                <option value="goal" className="bg-gray-800">{t('admin.goal')}</option>
                                                <option value="penalty" className="bg-gray-800">{t('admin.penalty')}</option>
                                                <option value="csc" className="bg-gray-800">{t('admin.csc')}</option>
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
                                            {t('admin.add_event')}
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
                                        {t('admin.publish_results')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="lg:col-span-5 h-[500px] bg-gray-50 rounded-2xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                        <p className="font-black uppercase italic tracking-widest">{t('admin.waiting_selection')}</p>
                    </div>
                )}

                {/* Validation Dashboard & Season Top 5 - Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Season Top 5 Management */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border-t-8 border-yellow-500">
                        <h2 className="text-xl font-black mb-6 text-white uppercase italic flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 text-black flex items-center justify-center rounded text-[10px] italic">🏆</div>
                            {t('admin.season_top_5')}
                        </h2>
                        <div className="space-y-4">
                            {seasonScorers.map((s, i) => (
                                <div key={i} className="flex gap-2">
                                    <select
                                        value={s.name}
                                        onChange={(e) => {
                                            const newScorers = [...seasonScorers];
                                            newScorers[i].name = e.target.value;
                                            setSeasonScorers(newScorers);
                                        }}
                                        className="flex-1 p-2 bg-white/10 rounded text-xs font-bold text-white outline-none"
                                    >
                                        {PLAYERS.map(p => <option key={p} value={p} className="bg-gray-800">{p.toUpperCase()}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        value={s.goals}
                                        onChange={(e) => {
                                            const newScorers = [...seasonScorers];
                                            newScorers[i].goals = parseInt(e.target.value) || 0;
                                            setSeasonScorers(newScorers);
                                        }}
                                        className="w-16 p-2 bg-white/10 rounded text-xs font-black text-white text-center outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={handleSaveSeasonTop}
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all mt-4"
                            >
                                {t('admin.save_top_5')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-xl font-black mb-6 text-gray-900 uppercase italic flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-900 text-white flex items-center justify-center rounded text-[10px] italic">📊</div>
                            {t('admin.validation_dashboard')}
                        </h2>
                        {/* Validation elements same as before */}

                        <div className="space-y-4">
                            {/* Group 1: Core */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">1. {t('admin.fundamentals')}</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">{t('leagues.exact_score')}</span>
                                        <span className="bg-red-100 text-red-700 font-black text-[10px] px-3 py-1 rounded-full uppercase italic">
                                            {wydadScoreNum} - {opponentScoreNum}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600">{t('leagues.correct_result')}</span>
                                        <span className="bg-gray-900 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase italic">
                                            {matchResult === 'win' ? t('admin.wac_wins') : matchResult === 'draw' ? t('admin.wac_draw') : t('admin.wac_lose')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Group 2: Scorers */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">2. {t('predictions.scorers')} (Anytime)</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(playerGoalCounts).length > 0 ? Object.keys(playerGoalCounts).map(p => (
                                        <span key={p} className="bg-white border border-gray-200 text-gray-900 font-black text-[9px] px-2 py-1 rounded shadow-sm">
                                            {p.toUpperCase()} ({playerGoalCounts[p]})
                                        </span>
                                    )) : <span className="text-gray-300 text-[10px] italic">{t('admin.no_scorers')}</span>}
                                </div>
                            </div>

                            {/* Group 3: Intervals */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">3. {t('predictions.intervals_tab')} ({t('leagues.goal_interval')})</p>
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
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">4. {t('admin.high_value_scenarios')}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🥇 {t('leagues.first_scorer')}</span>
                                        <span className="font-black text-gray-900 italic uppercase underline decoration-red-500 decoration-2">{firstScorer === 'Aucun' ? t('common.none') : firstScorer}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🏁 {t('leagues.last_scorer')}</span>
                                        <span className="font-black text-gray-900 italic uppercase underline decoration-gray-900 decoration-2">{lastScorer === 'Aucun' ? t('common.none') : lastScorer}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">🔥 {t('leagues.brace')}</span>
                                        <span className="font-black text-gray-900">{braces.join(' & ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">👑 {t('leagues.hat_trick')}</span>
                                        <span className="font-black text-gray-900">{hattricks.join(' & ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">⚽ {t('leagues.penalty_scorer')}</span>
                                        <span className="font-black text-gray-900">{penaltyScorers.join(', ') || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500">⚡ {t('leagues.anytime_winner')}</span>
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
