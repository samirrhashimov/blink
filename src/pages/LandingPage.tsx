import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, Share2, Zap, Users, Search, Moon, Sun, Shield, Layout, Globe, Tag, Palette } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import homepageImg from '../assets/Screenshots/homepage.png';
import inviteImg from '../assets/Screenshots/invite.png';
import shareImg from '../assets/Screenshots/share.png';
import vaultDetailsImg from '../assets/Screenshots/vaultdetails.png';
import tagsImg from '../assets/Screenshots/tags.png';
import '../css/About.css';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [demoColor, setDemoColor] = useState('#6366f1');

  return (
    <div className="landing-page bg-white dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-black">
              <img src={blinkLogo} alt="Blink" className="landing-logo" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Switch Theme"
                title="Switch Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="landing-auth-btn font-medium hover:text-blue-500 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary landing-auth-btn px-6 py-2 rounded-full">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="about-hero bg-white dark:bg-gray-900 pt-20 pb-16">
        <div className="hero-grid">
          <div className="hero-content text-left">
            <h1 className="about-hero-title text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Your Links, <span className="about-hero-highlight block mt-2">Organized</span>
            </h1>
            <p className="about-hero-subtitle text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              The ultimate workspace to store, manage, and collaborate on links with your team. Secure, fast, and beautifully designed.
            </p>
            <div className="hero-buttons flex gap-4">
              <Link to="/signup" className="btn-primary about-btn-primary px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Start for free
              </Link>
              <Link to="https://github.com/samirrhashimov/blink.git" className="btn-secondary about-btn-secondary px-8 py-3 text-lg rounded-full">
                View on GitHub
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src={homepageImg} alt="Blink Dashboard" className="hero-screenshot" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Visual Feature Breakdown */}
      <section className="feature-section-alternating">

        {/* Feature 1 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4 text-blue-600 dark:text-blue-400">
              <Layout className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">Centralized Containers</h2>
            <p className="feature-section-desc">
              Create dedicated workspaces called "Containers" for different projects, teams, or personal interests. Keep your links customized and organized in one secure place.
            </p>
          </div>
          <div className="feature-image-container">
            <img src={vaultDetailsImg} alt="Vault Details" className="feature-screenshot rotate-1 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4 text-green-600 dark:text-green-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">Easy Sharing</h2>
            <p className="feature-section-desc">
              Share your collections with the world or specific people. Manage permissions, elevate or revoke them when necessary.
            </p>
          </div>
          <div className="feature-image-container">
            <img src={shareImg} alt="Sharing Modal" className="feature-screenshot -rotate-1 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">Incoming Invitations</h2>
            <p className="feature-section-desc">
              Manage requests to join other workspaces. Review, accept, or decline incoming invitations to collaborate on and help manage shared containers.
            </p>
          </div>
          <div className="feature-image-container">
            <img src={inviteImg} alt="Team Invitation" className="feature-screenshot rotate-1 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Feature 4 - Smart Tagging System */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-4 text-orange-600 dark:text-orange-400">
              <Tag className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">Smart Tagging System</h2>
            <p className="feature-section-desc">
              Organize your links with powerful tags. Create custom tags, filter by categories, and find exactly what you need in seconds. Perfect for managing large collections.
            </p>
          </div>
          <div className="feature-image-container">
            <img src={tagsImg} alt="Tagging System" className="feature-screenshot rotate-1 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Feature 5 - Customizable Themes */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg mb-4 text-pink-600 dark:text-pink-400">
              <Palette className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">Customizable Themes</h2>
            <p className="feature-section-desc">
              Personalize your workspace with custom container colors. Choose from our curated color palette to make each container uniquely yours. Try it out below!
            </p>
            <div className="color-demo-palette" style={{ marginTop: '1.5rem' }}>
              {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'].map((color) => (
                <button
                  key={color}
                  onClick={() => setDemoColor(color)}
                  className="color-demo-option"
                  style={{
                    backgroundColor: color,
                    border: demoColor === color ? '3px solid white' : '3px solid transparent',
                    boxShadow: demoColor === color ? `0 0 0 2px ${color}` : 'none',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="feature-image-container">
            <div className="demo-container-card" style={{ backgroundColor: demoColor }}>
              <div className="demo-container-overlay" style={{ backgroundColor: demoColor }}></div>
              <div className="demo-container-content">
                <h3 className="demo-container-title">My Container</h3>
                <p className="demo-container-description">Custom colored workspace</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Grid Features (Why Choose Blink?) */}
      <section className="about-features bg-gray-50 dark:bg-gray-800/50 py-20 rounded-3xl mx-4 md:mx-auto max-w-7xl">
        <div className="about-features-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" style={{ marginBottom: '2rem' }}>Powerful features designed to make link management effortless and secure.</p>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-blue group-hover:scale-110 transition-transform">
                <Shield className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Top-tier Security</h3>
              <p className="about-feature-text">Enterprise-grade encryption aim to keep your data private and protected.</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-purple group-hover:scale-110 transition-transform">
                <Zap className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Real-time Sync</h3>
              <p className="about-feature-text">Changes happen instantly across all devices. Just smooth, real-time updates.</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-pink group-hover:scale-110 transition-transform">
                <Globe className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Accessible Anywhere</h3>
              <p className="about-feature-text">Access your links from any device, anywhere in the world. Your personal cloud for the web.</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-yellow group-hover:scale-110 transition-transform">
                <Search className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Smart Search</h3>
              <p className="about-feature-text">Instant search across titles, URLs, and descriptions helps you find what you need in milliseconds.</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-cyan group-hover:scale-110 transition-transform">
                <Moon className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Dark Mode</h3>
              <p className="about-feature-text">Native dark mode support that respects your system preferences and saves your eyes at night.</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-green group-hover:scale-110 transition-transform">
                <Lock className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Permission Control</h3>
              <p className="about-feature-text">Control who can view, edit, or manage your links.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="bg-blue-50 dark:bg-blue-700 rounded-3xl p-12 mx-4 max-w-6xl md:mx-auto text-gray-900 dark:text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Stop losing links. Start blinking.</h2>
            <p className="text-black dark:text-blue-100 text-xl mb-10 max-w-2xl">A faster, cleaner way to share what matters.</p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link to="/login" style={{ marginTop: '2rem', padding: '1rem 1.5rem' }} className="px-8 py-4 bg-blue-200 dark:bg-blue-700 bg-opacity-50 text-black dark:text-white font-semibold rounded-full hover:bg-opacity-70 transition-colors border border-blue-400">
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer border-t border-gray-200 dark:border-gray-800">
        <div className="about-footer-container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-gray-500 font-medium">© 2025 Blink - by LinzaApps</span>
          </div>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
            <a href="https://github.com/samirrhashimov/blink.git" className="hover:text-blue-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

