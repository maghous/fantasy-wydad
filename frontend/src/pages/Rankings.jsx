import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Trophy } from 'lucide-react';
import { rankingAPI, leagueAPI } from '../services/api';
import { useAuthStore } from '../context/useAuthStore';

export default function Rankings() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [league, setLeague] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [leagueId]);

    const loadData = async () => {
        try {
            const [leagueRes, rankingsRes] = await Promise.all([
                leagueAPI.getById(leagueId),
                rankingAPI.getLeagueRanking(leagueId),
            ]);
            setLeague(leagueRes.data);
            setRankings(rankingsRes.data);
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Classement - {league?.name}</h1>
                    <p className="text-gray-600">Meilleurs pronostiqueurs</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
            </div>

            {rankings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun classement pour le moment</p>
                    <p className="text-gray-500 text-sm mt-2">Les points seront calculés une fois les résultats entrés</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rankings.map((ranking, index) => (
                        <div
                            key={ranking.userId._id}
                            className={`bg-white rounded-xl shadow-md p-6 flex items-center gap-4 ${ranking.userId._id === user?._id ? 'ring-2 ring-wydad-600' : ''
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0
                                    ? 'bg-yellow-400 text-yellow-900'
                                    : index === 1
                                        ? 'bg-gray-300 text-gray-700'
                                        : index === 2
                                            ? 'bg-orange-400 text-orange-900'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {index + 1}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">{ranking.userId.username}</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {ranking.predictions} pronos
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        🎯 {ranking.exactScores} scores exacts
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        ✅ {ranking.correctResults} résultats
                                    </span>
                                </div>
                            </div>

                            <div className="text-right ml-4">
                                <p className="text-3xl font-bold text-wydad-600">{ranking.points}</p>
                                <p className="text-sm text-gray-600">points</p>
                            </div>

                            {index === 0 && <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
