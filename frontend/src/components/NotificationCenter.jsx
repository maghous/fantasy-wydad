import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, CheckSquare, Trophy, Star, ShieldAlert } from 'lucide-react';
import { notificationAPI } from '../services/api';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data);
        } catch (err) {
            console.error("Erreur notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fade-in backdrop-blur-xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-600" />
                    {t('notifications.title')}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleMarkAllRead}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition"
                        title={t('notifications.mark_all_read')}
                    >
                        <CheckSquare className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-10 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">{t('common.loading')}</div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                        <Bell className="w-12 h-12" />
                        <p className="text-xs font-black uppercase tracking-widest text-white">{t('notifications.no_notifications')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-4 hover:bg-white/5 transition-colors relative ${!notif.isRead ? 'bg-red-600/5' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <NotifIcon type={notif.type} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white leading-snug">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 bg-white/5 inline-block px-2 py-0.5 rounded">
                                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 ring-4 ring-red-600/20"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-white/5 text-center border-t border-white/10">
                <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition">
                    {t('notifications.view_history')}
                </button>
            </div>
        </div>
    );
};

const NotifIcon = ({ type }) => {
    switch (type) {
        case 'badge': return <Trophy className="w-5 h-5 text-yellow-500" />;
        case 'points': return <Star className="w-5 h-5 text-blue-500" />;
        case 'league': return <Star className="w-5 h-5 text-green-500" />;
        default: return <ShieldAlert className="w-5 h-5 text-red-600" />;
    }
};

export default NotificationCenter;
