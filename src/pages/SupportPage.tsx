import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, MessageSquare } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import SEO from '../components/SEO';
import '../css/About.css';
import { useTranslation } from 'react-i18next';

const SupportPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('SUBMITTING');

        const form = e.currentTarget;
        const data = new FormData(form);

        try {
            const response = await fetch('https://formspree.io/f/mojleqkq', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('SUCCESS');
                form.reset();
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            setStatus('ERROR');
        }
    };

    return (
        <div className="landing-page bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
            <SEO
                title="Support"
                description="Need help? Contact the Blink support team for any questions or issues."
            />

            {/* Header */}
            <header className="landing-header">
                <div className="container">
                    <div className="flex items-center" style={{ gap: "2rem" }}>
                        <Link to="/dashboard" className="back-link">
                            <ArrowLeft />
                        </Link>
                        <Link to="/" className="flex items-center gap-3">
                            <img src={blinkLogo} alt="Blink" className="landing-logo" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container py-20">
                <div className="max-w-2xl mx-auto">
                    <div className='support-container'>
                        {status === 'SUCCESS' ? (
                            <div className="text-center py-12">
                                <div
                                    className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400"
                                    style={{ margin: "50px 0 15px 0" }}>
                                    <CheckCircle size={56} />
                                </div>
                                <h2 className="text-2xl font-bold">{t('support.success')}</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    {t('support.successSubtitle')}
                                </p>
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="btn-primary px-8 py-3 rounded-full"
                                    style={{ marginTop: "30px" }}
                                >
                                    {t('support.sendAnotherMessage')}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-12">
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }} className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                        <MessageSquare size={32} />
                                        <h1 className="text-4xl font-bold" style={{ display: "inline" }}>{t('support.title')}</h1>
                                    </div>
                                    <p style={{ fontSize: "14px" }} className="text-gray-600 dark:text-gray-400 text-lg">
                                        {t('support.subtitle')}
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6 support-form">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium ml-1">{t('support.form.name')}</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                placeholder={t('support.placeholders.name')}
                                                className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium ml-1">{t('support.form.email')}</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="_replyto"
                                                required
                                                placeholder={t('support.placeholders.email')}
                                                className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium ml-1">{t('support.form.subject')}</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            placeholder={t('support.placeholders.subject')}
                                            className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium ml-1">{t('support.form.message')}</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={6}
                                            placeholder={t('support.placeholders.message')}
                                            className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {status === 'ERROR' && (
                                        <p className="text-red-500 text-sm font-medium">
                                            {t('support.error')}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'SUBMITTING'}
                                        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                    >
                                        {status === 'SUBMITTING' ? (
                                            <>{t('support.submitting')}</>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                {t('support.submit')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupportPage;
