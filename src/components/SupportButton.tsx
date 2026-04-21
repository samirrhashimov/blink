import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { BiLogoPlayStore } from "react-icons/bi";
import { useTranslation } from 'react-i18next';

const SupportButton: React.FC = () => {
    const { t } = useTranslation();
    const [phase, setPhase] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const content = React.useMemo(() => [
        {
            icon: <Star size={18} className="star-icon" />,
            text: t('common.support.starGithub', 'Star on GitHub'),
            link: 'https://github.com/samirrhashimov/blink',
        },
        {
            icon: <BiLogoPlayStore size={18} className="playstore-icon" />,
            text: t('common.support.getPlayStore', 'On Play Store'),
            link: 'https://play.google.com/store/apps/details?id=com.linzaapps.blink',
        },
    ], [t]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setPhase((prev) => (prev + 1) % content.length);
                setIsAnimating(false);
            }, 450);
        }, 4500);

        return () => clearInterval(interval);
    }, [content.length]);

    const current = content[phase];

    return (
        <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`support-button-animated ${isAnimating ? 'animating' : ''}`}
        >
            <div className="support-button-inner">
                <span className="support-icon">{current.icon}</span>
                <span className="support-text">{current.text}</span>
            </div>
        </a>
    );
};

export default SupportButton;
