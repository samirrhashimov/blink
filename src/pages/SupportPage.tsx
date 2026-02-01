import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, MessageSquare } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import SEO from '../components/SEO';
import '../css/About.css';

const SupportPage: React.FC = () => {
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
                title="Support - Blink"
                description="Need help? Contact the Blink support team for any questions or issues."
            />

            {/* Header */}
            <header className="landing-header">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={blinkLogo} alt="Blink" className="landing-logo" />
                        </Link>
                        <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-blue-500 transition-colors">
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4 text-blue-600 dark:text-blue-400">
                            <MessageSquare size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Have a question, feedback, or found a bug? Send us a message and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <div>
                        {status === 'SUCCESS' ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 text-green-600 dark:text-green-400">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    Thank you for reaching out. We've received your message and will respond shortly.
                                </p>
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="btn-primary px-8 py-3 rounded-full"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="John Doe"
                                            className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="_replyto"
                                            required
                                            placeholder="john@example.com"
                                            className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium ml-1">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        placeholder="Bug report / Feature request"
                                        className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium ml-1">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        placeholder="How can we help you?"
                                        className="input-field w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    ></textarea>
                                </div>

                                {status === 'ERROR' && (
                                    <p className="text-red-500 text-sm font-medium">
                                        Something went wrong. Please try again or contact us directly.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'SUBMITTING'}
                                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                >
                                    {status === 'SUBMITTING' ? (
                                        <>Sending...</>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-10 border-t border-gray-200 dark:border-gray-800 mt-20">
                <div className="container text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Blink - All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default SupportPage;
