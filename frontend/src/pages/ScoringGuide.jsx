import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Target,
    Trophy,
    User,
    Clock,
    Zap,
    Star,
    Crown,
    CheckCircle,
    TrendingUp
} from 'lucide-react';

const ScoringGuide = () => {
    const { t } = useTranslation();
    const indicators = [
        {
            id: 'score',
            title: t('scoring_guide.score.title'),
            description: t('scoring_guide.score.desc'),
            icon: <Target className="w-8 h-8 text-red-600" />,
            color: 'bg-red-50'
        },
        {
            id: 'result',
            title: t('scoring_guide.result.title'),
            description: t('scoring_guide.result.desc'),
            icon: <Trophy className="w-8 h-8 text-yellow-600" />,
            color: 'bg-yellow-50'
        },
        {
            id: 'scorer',
            title: t('scoring_guide.scorer.title'),
            description: t('scoring_guide.scorer.desc'),
            icon: <User className="w-8 h-8 text-blue-600" />,
            color: 'bg-blue-50'
        },
        {
            id: 'interval',
            title: t('scoring_guide.interval.title'),
            description: t('scoring_guide.interval.desc'),
            icon: <Clock className="w-8 h-8 text-green-600" />,
            color: 'bg-green-50'
        },
        {
            id: 'first_scorer',
            title: t('scoring_guide.first_scorer.title'),
            description: t('scoring_guide.first_scorer.desc'),
            icon: <Zap className="w-8 h-8 text-purple-600" />,
            color: 'bg-purple-50'
        },
        {
            id: 'last_scorer',
            title: t('scoring_guide.last_scorer.title'),
            description: t('scoring_guide.last_scorer.desc'),
            icon: <Star className="w-8 h-8 text-orange-600" />,
            color: 'bg-orange-50'
        },
        {
            id: 'brace',
            title: t('scoring_guide.brace.title'),
            description: t('scoring_guide.brace.desc'),
            icon: <TrendingUp className="w-8 h-8 text-pink-600" />,
            color: 'bg-pink-50'
        },
        {
            id: 'hattrick',
            title: t('scoring_guide.hattrick.title'),
            description: t('scoring_guide.hattrick.desc'),
            icon: <Crown className="w-8 h-8 text-indigo-600" />,
            color: 'bg-indigo-50'
        },
        {
            id: 'scorer_win',
            title: t('scoring_guide.scorer_win.title'),
            description: t('scoring_guide.scorer_win.desc'),
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            color: 'bg-emerald-50'
        },
        {
            id: 'penalty_scorer',
            title: t('scoring_guide.penalty_scorer.title'),
            description: t('scoring_guide.penalty_scorer.desc'),
            icon: <Zap className="w-8 h-8 text-red-500" />,
            color: 'bg-red-100'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20 font-sans">
            <header className="mb-16 text-center animate-fade-in">
                <h1 className="text-5xl font-black mb-4 uppercase italic tracking-tighter text-white leading-none">
                    {t('scoring_guide.title').split(' ')[0]} <span className="text-red-600">{t('scoring_guide.title').split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-white font-medium text-lg max-w-2xl mx-auto opacity-80">
                    {t('scoring_guide.subtitle')}
                </p>
                <div className="w-24 h-1.5 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(193,39,45,0.5)]"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {indicators.map((item, index) => (
                    <div
                        key={item.id}
                        className={`group relative p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Decorative background circle */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${item.color} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>

                        <div className="relative z-10">
                            <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm inline-block border border-gray-50">
                                {item.icon}
                            </div>

                            <h3 className="text-xl font-black text-gray-900 uppercase italic mb-3">
                                {item.title}
                            </h3>

                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="mt-20 p-10 bg-gray-900 rounded-[40px] text-white overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-black uppercase italic mb-6">
                        {t('scoring_guide.need_to_know').split(' ')[0]} {t('scoring_guide.need_to_know').split(' ')[1]} {t('scoring_guide.need_to_know').split(' ')[2]} <span className="text-red-500">{t('scoring_guide.need_to_know').split(' ').slice(3).join(' ')}</span>
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ul className="space-y-4 text-gray-300 font-medium">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span>{t('scoring_guide.penalty_rule')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span>{t('scoring_guide.csc_rule')}</span>
                            </li>
                        </ul>
                        <ul className="space-y-4 text-gray-300 font-medium">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span>{t('scoring_guide.validation_delay')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span>{t('scoring_guide.custom_league_rules')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ScoringGuide;
