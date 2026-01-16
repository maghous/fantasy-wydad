import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Award } from 'lucide-react';
import { matchAPI, leagueAPI, predictionAPI } from '../services/api';

export default function Matches() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const [league, setLeague] = useState(null);
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'Botola', 'CAF'
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{league?.name}</h1>
                    <p className="text-gray-600">
                        Barème: {league?.scoring.exactScore}pts score exact | {league?.scoring.perScorer}pts/buteur | {league?.scoring.correctResult}pts résultat
                    </p>
                </div>
                <button
                    onClick={() => navigate('/leagues')}
                    className="px-4 py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => navigate(`/my-predictions/${leagueId}`)}
                    className="flex-1 py-3 bg-white border-2 border-wydad-600 text-wydad-600 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-wydad-50 transition"
                >
                    <Award className="w-5 h-5" />
                    Mes Pronostics
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Tous
                </button>
                <button
                    onClick={() => setFilter('Botola')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'Botola' ? 'bg-wydad-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Botola Pro
                </button>
                <button
                    onClick={() => setFilter('CAF')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filter === 'CAF' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Coupe CAF
                </button>
            </div>

            <div className="space-y-4">
                {filteredMatches.map((match) => {
                    const prediction = predictions.find((p) => p.matchId === match._id);
                    return (
                        <div key={match._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${match.competition === 'CAF' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {match.competition || 'Match'}
                                        </span>
                                        {match.round && (
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                {match.round}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                                        Wydad vs {match.opponent}
                                    </h3>
                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(match.date).toLocaleDateString('fr-FR')} • {match.location}
                                    </p>
                                </div>
                                {prediction && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                        Pronostic fait
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => navigate(`/predict/${match._id}`)}
                                className="w-full py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition font-semibold"
                            >
                                {prediction ? 'Modifier le pronostic' : 'Faire mon pronostic'}
                            </button>
                        </div>
                    );
                })}

                {matches.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun match disponible pour le moment</p>
                    </div>
                )}
            </div>
        </div>
    );
}
