import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, ArrowLeft } from 'lucide-react';
import { predictionAPI } from '../services/api';

export default function MyPredictions() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPredictions();
    }, [leagueId]);

    const loadPredictions = async () => {
        try {
            const response = await predictionAPI.getAll();
            setPredictions(response.data);
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
                <h1 className="text-3xl font-bold text-gray-800">Mes Pronostics</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
            </div>

            {predictions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun pronostic pour le moment</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {predictions.map((pred) => (
                        <div key={pred._id} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Wydad vs {pred.matchId?.opponent || 'Adversaire'}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {pred.matchId?.date ? new Date(pred.matchId.date).toLocaleDateString('fr-FR') : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Score prédit:</span>
                                    <span className="text-2xl font-bold text-wydad-600">
                                        {pred.wydadScore} - {pred.opponentScore}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Résultat:</span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${pred.result === 'win'
                                                ? 'bg-green-100 text-green-700'
                                                : pred.result === 'draw'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {pred.result === 'win' ? 'Victoire' : pred.result === 'draw' ? 'Match nul' : 'Défaite'}
                                    </span>
                                </div>

                                {pred.scorers && pred.scorers.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-2">Buteurs prédits:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pred.scorers.map((scorer) => (
                                                <span key={scorer} className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                                                    {scorer}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
