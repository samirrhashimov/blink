import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('en') ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
    };

    const currentLang = i18n.language.startsWith('en') ? 'EN' : 'TR';

    return (
        <button
            onClick={toggleLanguage}
            className={className || "theme-toggle mediaforbuttons uppercase font-bold text-xs"}
            title={i18n.language.startsWith('en') ? "Switch to Turkish" : "İngilizceye Geç"}
        >
            {currentLang}
        </button>
    );
};

export default LanguageToggle;
