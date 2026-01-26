import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language;

    return (
        <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-wydad-100" />
            <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-wydad-100 border-none focus:ring-0 cursor-pointer text-sm font-semibold hover:text-white transition"
            >
                <option value="fr" className="text-gray-800">Français</option>
                <option value="en" className="text-gray-800">English</option>
                <option value="ar" className="text-gray-800">العربية</option>
            </select>
        </div>
    );
}
