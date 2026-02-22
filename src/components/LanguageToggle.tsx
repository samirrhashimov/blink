import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', label: 'English', short: 'EN' },
        { code: 'tr', label: 'Türkçe', short: 'TR' }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };



    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={className || "theme-toggle-btn"}
                aria-label="Change Language"
                title={i18n.language.startsWith('en') ? "Change Language" : "Dili Değiştir"}
            >
                <Globe size={20} />
            </button>

            {isOpen && (
                <div className="language-dropdown glass-card animate-appear">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`language-option ${i18n.language.startsWith(lang.code) ? 'active' : ''}`}
                        >
                            <span className="flex-grow">{lang.label}</span>
                            {i18n.language.startsWith(lang.code) && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageToggle;
