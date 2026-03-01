import React, { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SupportButton: React.FC = () => {
    const { t } = useTranslation();
    const [phase, setPhase] = useState(0); // 0: Support, 1: GitHub Star
    const [isAnimating, setIsAnimating] = useState(false);

    const content = React.useMemo(() => [
        {
            icon: <Heart size={18} className="heart-icon" />,
            text: t('common.support.buymeacoffee', 'Support Blink'),
            link: 'https://buymeacoffee.com/samirrhashimov',
        },
        {
            icon: <Star size={18} className="star-icon" />,
            text: t('common.support.starGithub', 'Star on GitHub'),
            link: 'https://github.com/samirrhashimov/blink',
        },
    ], [t]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setPhase((prev) => (prev + 1) % content.length);
                setIsAnimating(false);
            }, 500); // Animation duration half-time
        }, 10000); // 10 seconds

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
