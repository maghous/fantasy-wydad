import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Target, ArrowLeft } from 'lucide-react';
import { matchAPI, predictionAPI } from '../services/api';

const PLAYERS = [
    "Ayoub El Amloud", "Yahia Attiyat Allah", "Arslan Azouni",
    "Reda Jaadi", "Bouly Sambou", "Muaid Ellafi",
    "Hicham Boussefiane", "Amine Farhane", "Jamal Harkass"
];

export default function Predictions() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [wydadScore, setWydadScore] = useState('');
    const [opponentScore, setOpponentScore] = useState('');
    const [result, setResult] = useState('');
    const [selectedScorers, setSelectedScorers] = useState([]);
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
        setSelectedScorers((prev) =>
            prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]
        );
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
                <div className="text-xl text-gray-600">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Wydad vs {match?.opponent}</h1>
                    <p className="text-gray-600">{new Date(match?.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-wydad-600" />
                        Score prédit
                    </h2>

                    <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                Wydad
                            </label>
                            <input
                                type="number"
                                value={wydadScore}
                                onChange={(e) => setWydadScore(e.target.value)}
                                min="0"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-wydad-500"
                                placeholder="0"
                            />
                        </div>

                        <div className="text-center text-3xl font-bold text-gray-400">-</div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                {match?.opponent}
                            </label>
                            <input
                                type="number"
                                value={opponentScore}
                                onChange={(e) => setOpponentScore(e.target.value)}
                                min="0"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-wydad-500"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-wydad-600" />
                        Résultat du match
                    </h2>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setResult('win')}
                            className={`py-4 rounded-lg font-semibold transition ${result === 'win'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Victoire
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('draw')}
                            className={`py-4 rounded-lg font-semibold transition ${result === 'draw'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Match nul
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('lose')}
                            className={`py-4 rounded-lg font-semibold transition ${result === 'lose'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Défaite
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-wydad-600" />
                        Buteurs (optionnel)
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PLAYERS.map((player) => (
                            <button
                                key={player}
                                type="button"
                                onClick={() => toggleScorer(player)}
                                className={`p-3 rounded-lg text-left transition ${selectedScorers.includes(player)
                                        ? 'bg-wydad-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {player}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-wydad-600 text-white rounded-lg font-bold text-lg hover:bg-wydad-700 transition shadow-lg"
                >
                    Enregistrer le pronostic
                </button>
            </form>
        </div>
    );
}
