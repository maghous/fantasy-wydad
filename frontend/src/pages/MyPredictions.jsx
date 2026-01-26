import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, ArrowLeft, ClipboardList, Loader2, CheckCircle2, X } from 'lucide-react';
import { predictionAPI } from '../services/api';

export default function MyPredictions() {
    const { t } = useTranslation();
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [breakdown, setBreakdown] = useState(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const [showBreakdownModal, setShowBreakdownModal] = useState(false);

    useEffect(() => {
        loadPredictions();
    }, [leagueId]);

    const handleViewBreakdown = async (matchId) => {
        setLoadingBreakdown(true);
        setShowBreakdownModal(true);
        try {
            const res = await predictionAPI.getBreakdown(matchId, leagueId);
            setBreakdown(res.data);
        } catch (err) {
            console.error(err);
            setBreakdown(null);
        } finally {
            setLoadingBreakdown(false);
        }
    };

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
                <div className="text-xl text-gray-600">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">{t('predictions.my_predictions')}</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-wydad-600 text-white rounded-lg hover:bg-wydad-700 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.back')}
                </button>
            </div>

            {predictions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('predictions.no_predictions')}</p>
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
                                {pred.matchId?.status === 'finished' && (
                                    <button
                                        onClick={() => handleViewBreakdown(pred.matchId._id)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition-all flex items-center gap-1 text-[10px] font-black uppercase"
                                        title={t('predictions.points_label')}
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        {t('predictions.points_label')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">{t('predictions.predicted_score')}:</span>
                                    <span className="text-2xl font-bold text-wydad-600">
                                        {pred.wydadScore} - {pred.opponentScore}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">{t('predictions.final_result_label')}:</span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${pred.result === 'win'
                                            ? 'bg-green-100 text-green-700'
                                            : pred.result === 'draw'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {pred.result === 'win' ? t('predictions.win') : pred.result === 'draw' ? t('predictions.draw') : t('predictions.lose')}
                                    </span>
                                </div>

                                {pred.scorers && pred.scorers.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-2">{t('predictions.predicted_scorers')}:</p>
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

            {/* Point Breakdown Modal */}
            {showBreakdownModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-8 bg-gray-900 border-b border-white/5 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t('matches.points_breakdown')}</h2>
                                <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest mt-1">{t('matches.breakdown_subtitle')}</p>
                            </div>
                            <button onClick={() => setShowBreakdownModal(false)} className="text-white hover:text-red-500 transition-all font-black text-3xl">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50 max-h-[60vh]">
                            {loadingBreakdown ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                                    <p className="text-gray-400 font-black uppercase text-xs animate-pulse">{t('matches.calculating')}</p>
                                </div>
                            ) : breakdown ? (
                                <>
                                    <div className="bg-red-600 rounded-3xl p-6 text-center text-white shadow-xl shadow-red-500/20 mb-6">
                                        <p className="text-[10px] font-black uppercase text-red-100 opacity-60 mb-1">{t('matches.total_earned')}</p>
                                        <div className="text-6xl font-black italic tracking-tighter">
                                            {breakdown.total} <span className="text-xl not-italic">PTS</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {breakdown.items.map((item, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${item.reached
                                                ? 'bg-green-50 border-green-100'
                                                : 'bg-white border-gray-100 grayscale'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${item.reached ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {item.reached ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </div>
                                                    <span className={`font-bold text-sm uppercase ${item.reached ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className={`font-black text-sm ${item.reached ? 'text-green-600' : 'text-gray-300'}`}>
                                                    +{item.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 font-bold uppercase text-sm">{t('stats.no_data')}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 text-center">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {t('matches.based_on_scoring')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
