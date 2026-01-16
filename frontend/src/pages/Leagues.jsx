import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, BarChart3 } from 'lucide-react';
import { leagueAPI } from '../services/api';
import { useAuthStore } from '../context/useAuthStore';

export default function Leagues() {
    const [leagues, setLeagues] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newLeague, setNewLeague] = useState({
        name: '',
        exactScore: 5,
        perScorer: 3,
        correctResult: 1,
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        try {
            const response = await leagueAPI.getAll();
            setLeagues(response.data);
        } catch (error) {
            console.error('Erreur de chargement des ligues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLeague = async (e) => {
        e.preventDefault();
        try {
            await leagueAPI.create({
                name: newLeague.name,
                scoring: {
                    exactScore: parseInt(newLeague.exactScore),
                    perScorer: parseInt(newLeague.perScorer),
                    correctResult: parseInt(newLeague.correctResult),
                },
            });
            setNewLeague({ name: '', exactScore: 5, perScorer: 3, correctResult: 1 });
            setShowCreateForm(false);
            loadLeagues();
        } catch (error) {
            alert('Erreur lors de la création de la ligue');
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Ligues</h1>
                <p className="text-gray-600">Bienvenue, {user?.username} !</p>
            </div>

            <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full mb-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Créer une nouvelle ligue
            </button>

            {showCreateForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Nouvelle Ligue</h2>
                    <form onSubmit={handleCreateLeague} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de la ligue
                            </label>
                            <input
                                type="text"
                                value={newLeague.name}
                                onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500"
                                placeholder="Ex: Ligue des amis"
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Barème de points</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points pour score exact
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.exactScore}
                                        onChange={(e) => setNewLeague({ ...newLeague, exactScore: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points par buteur correct
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.perScorer}
                                        onChange={(e) => setNewLeague({ ...newLeague, perScorer: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points pour résultat correct
                                    </label>
                                    <input
                                        type="number"
                                        value={newLeague.correctResult}
                                        onChange={(e) => setNewLeague({ ...newLeague, correctResult: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wydad-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-wydad-600 text-white rounded-lg font-semibold hover:bg-wydad-700 transition"
                            >
                                Créer
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {leagues.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune ligue pour le moment</p>
                    <p className="text-gray-500 text-sm mt-2">Créez votre première ligue !</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leagues.map((league) => (
                        <div key={league._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{league.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1 mb-4">
                                <p>Créée par: {league.createdBy?.username || 'Inconnu'}</p>
                                <p className="font-semibold text-gray-700">Barème de points:</p>
                                <div className="pl-4">
                                    <p>• Score exact: {league.scoring.exactScore} pts</p>
                                    <p>• Par buteur: {league.scoring.perScorer} pts</p>
                                    <p>• Résultat correct: {league.scoring.correctResult} pts</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/matches/${league._id}`)}
                                    className="flex-1 py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition font-semibold"
                                >
                                    Accéder à la ligue
                                </button>
                                <button
                                    onClick={() => navigate(`/rankings/${league._id}`)}
                                    className="py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold flex items-center gap-2"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Classement
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
