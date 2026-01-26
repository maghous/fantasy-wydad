import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuthStore';
import { Trophy, Target, Star, Calendar, Shield, Award, TrendingUp, Zap, Settings } from 'lucide-react';
import { userAPI } from '../services/api';

const Profile = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLowPerf, setIsLowPerf] = useState(localStorage.getItem('performance_mode') === 'low');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Assuming we have an endpoint for current user profile
                const res = await userAPI.getProfile();
                setProfileData(res.data);
            } catch (err) {
                console.error("Erreur de profil:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">{t('common.loading')}</div>;

    const stats = profileData?.stats || { totalPoints: 0, exactScores: 0, correctResults: 0, totalPredictions: 0 };
    const badges = profileData?.badges || [];
    const level = Math.floor(stats.totalPoints / 100) + 1;

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20 font-sans text-white">
            {/* Header / Basic Info */}
            <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-white/5 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl">
                <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/20">
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                        {user?.username}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        {user?.isAdmin && (
                            <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-600/30 rounded-full text-[10px] font-black uppercase tracking-widest">{t('profile.admin_badge')}</span>
                        )}
                        <span className="px-3 py-1 bg-green-600/20 text-green-500 border border-green-600/30 rounded-full text-[10px] font-black uppercase tracking-widest">{t('profile.level_label')} {level}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Grid */}
                {/* ... existing code ... */}

                {/* Badges Section */}
                {/* ... existing code ... */}
            </div>

            {/* Settings Section */}
            <section className="mt-12 bg-white/5 p-8 rounded-[32px] border border-white/10">
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                    <Settings className="text-gray-400" />
                    {t('profile.settings') || 'Settings'}
                </h3>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isLowPerf ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-lg font-black uppercase italic">{t('profile.perf_mode') || 'Performance Mode'}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {isLowPerf ? (t('profile.perf_low_desc') || 'Low effects (Recommended for mobile)') : (t('profile.perf_high_desc') || 'Full premium effects')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const newValue = !isLowPerf;
                            setIsLowPerf(newValue);
                            if (newValue) {
                                localStorage.setItem('performance_mode', 'low');
                                document.body.classList.add('low-perf');
                            } else {
                                localStorage.removeItem('performance_mode');
                                document.body.classList.remove('low-perf');
                            }
                        }}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isLowPerf ? 'bg-yellow-500' : 'bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${isLowPerf ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white/5 p-6 rounded-3xl border ${color} hover:bg-white/10 transition-colors`}>
        <div className="text-2xl mb-4">{icon}</div>
        <div className="text-2xl font-black text-white mb-1">{value}</div>
        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
);

export default Profile;
