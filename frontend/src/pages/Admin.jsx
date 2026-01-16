import { useState, useEffect } from 'react';
import { matchAPI, resultAPI } from '../services/api';

export default function Admin() {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [formData, setFormData] = useState({
        wydadScore: '',
        opponentScore: '',
        scorers: ''
    });

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        const res = await matchAPI.getAll();
        setMatches(res.data);
    };

    const handleSelect = (match) => {
        setSelectedMatch(match);
        setFormData({ wydadScore: '', opponentScore: '', scorers: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resultAPI.create({
                matchId: selectedMatch._id,
                wydadScore: parseInt(formData.wydadScore),
                opponentScore: parseInt(formData.opponentScore),
                scorers: formData.scorers.split(',').map(s => s.trim()).filter(s => s)
            });
            alert('Résultat enregistré ! Les classements sont à jour.');
            setSelectedMatch(null);
            loadMatches();
        } catch (err) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Administration - Résultats</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Matchs</h2>
                    <div className="space-y-2">
                        {matches.map(match => (
                            <button
                                key={match._id}
                                onClick={() => handleSelect(match)}
                                className={`w-full text-left p-3 rounded-lg border transition ${selectedMatch?._id === match._id ? 'bg-wydad-50 border-wydad-600' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-bold">Wydad vs {match.opponent}</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(match.date).toLocaleDateString()} -
                                    <span className={match.status === 'finished' ? 'text-green-600 ml-2' : 'text-orange-600 ml-2'}>
                                        {match.status === 'finished' ? 'Terminé' : 'À venir'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedMatch && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Entrer le résultat</h2>
                        <h3 className="mb-4 text-gray-600">Wydad vs {selectedMatch.opponent}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Score Wydad</label>
                                    <input
                                        type="number"
                                        value={formData.wydadScore}
                                        onChange={e => setFormData({ ...formData, wydadScore: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Score {selectedMatch.opponent}</label>
                                    <input
                                        type="number"
                                        value={formData.opponentScore}
                                        onChange={e => setFormData({ ...formData, opponentScore: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Automatic Result Display */}
                            {formData.wydadScore !== '' && formData.opponentScore !== '' && (
                                <div className={`p-3 rounded text-center font-bold ${parseInt(formData.wydadScore) > parseInt(formData.opponentScore)
                                        ? 'bg-green-100 text-green-700'
                                        : parseInt(formData.wydadScore) < parseInt(formData.opponentScore)
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    Résultat : {
                                        parseInt(formData.wydadScore) > parseInt(formData.opponentScore)
                                            ? 'VICTOIRE'
                                            : parseInt(formData.wydadScore) < parseInt(formData.opponentScore)
                                                ? 'DÉFAITE'
                                                : 'MATCH NUL'
                                    }
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Buteurs (séparés par des virgules)</label>
                                <input
                                    type="text"
                                    value={formData.scorers}
                                    onChange={e => setFormData({ ...formData, scorers: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Ex: Sambou, El Amloud"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                            >
                                Valider le résultat
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
