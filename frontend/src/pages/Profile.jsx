import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { Trophy, Target, Star, Calendar, Shield, Award, TrendingUp } from 'lucide-react';
import { userAPI } from '../services/api';

const Profile = () => {
    const { user } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;

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
                            <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-600/30 rounded-full text-[10px] font-black uppercase tracking-widest">Administrateur</span>
                        )}
                        <span className="px-3 py-1 bg-green-600/20 text-green-500 border border-green-600/30 rounded-full text-[10px] font-black uppercase tracking-widest">Niveau {level}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Grid */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={<Trophy className="text-yellow-500" />} label="Total Points" value={stats.totalPoints} color="border-yellow-500/20" />
                    <StatCard icon={<Target className="text-red-500" />} label="Scores Exacts" value={stats.exactScores} color="border-red-500/20" />
                    <StatCard icon={<Star className="text-blue-500" />} label="Résultats" value={stats.correctResults} color="border-blue-500/20" />
                    <StatCard icon={<Shield className="text-green-500" />} label="Prono Totaux" value={stats.totalPredictions} color="border-green-500/20" />

                    {/* Progress Chart Placeholder */}
                    <div className="col-span-full bg-white/5 p-8 rounded-3xl border border-white/10 mt-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <TrendingUp className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic mb-6">Performance Globale</h3>
                        <div className="flex items-end gap-2 h-32">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-red-600/40 border-t-2 border-red-600 rounded-t-lg transition-all hover:bg-red-600" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <span>S1</span><span>S2</span><span>S3</span><span>S4</span><span>S5</span><span>S6</span><span>S7</span>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="lg:col-span-4 bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                        <Award className="text-red-600" />
                        Trophées
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {badges.length > 0 ? badges.map((badge, idx) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center group transition-all hover:bg-white/10 hover:-translate-y-1">
                                <div className="text-4xl mb-2 filter grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 drop-shadow-lg">
                                    {badge.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{badge.name}</span>
                                <span className="text-[8px] text-gray-500 font-bold mt-1">
                                    {new Date(badge.dateAwarded).toLocaleDateString()}
                                </span>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-10 opacity-30">
                                <Award className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Aucun trophée pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
