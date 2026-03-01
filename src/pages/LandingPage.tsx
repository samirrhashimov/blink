import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, Share2, Zap, Users, Search, Moon, Sun, Shield, Layout, Globe, Tag, Palette, Github, ArrowRight, HelpCircle } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import homepageImg from '../assets/Screenshots/homepage.png';
import inviteImg from '../assets/Screenshots/invite.png';
import shareImg from '../assets/Screenshots/share.png';
import containerDetailsImg from '../assets/Screenshots/containerdetails.png';
import tagsImg from '../assets/Screenshots/tags.png';
import firefoxExtImg from '../assets/og-img.png';
import '../css/About.css';
import SEO from '../components/SEO';
import LanguageToggle from '../components/LanguageToggle';
import SupportButton from '../components/SupportButton';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [demoColor, setDemoColor] = useState('#6366f1');
  const navigate = useNavigate();

  return (
    <div className="landing-page bg-white dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      <SEO
        title={t('landing.title')}
        description={t('landing.description')}
      />
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-black">
              <img src={blinkLogo} alt="Blink" className="landing-logo" />
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Switch Theme"
                title="Switch Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <a
                href="https://github.com/samirrhashimov/blink"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-github-link"
                title="View on GitHub"
              >
                <Github size={20} />
              </a>
              <Link
                to="/support"
                className="nav-support-link"
                title="Help"
              >
                <HelpCircle size={20} />
              </Link>
              <div className="hidden md:flex">
                <SupportButton />
              </div>
              <Link
                to="/login"
                className="nav-login-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(128, 128, 128, 0.4)',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  height: '42px',
                  boxSizing: 'border-box'
                }}
              >
                {t('landing.login')}
              </Link>
              <Link
                to="/signup"
                className="landing-auth-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#13a4ec',
                  color: 'white',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  height: '42px',
                  boxSizing: 'border-box',
                  border: '1px solid #13a4ec'
                }}
              >
                {t('landing.getStarted')}
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
              {t('landing.hero.title')} <span className="about-hero-highlight block mt-2">{t('landing.hero.highlight')}</span>
            </h1>
            <p className="about-hero-subtitle text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              {t('landing.hero.subtitle')}
            </p>
            <div className="hero-buttons flex gap-4">
              <Link to="/signup" className="btn-primary about-btn-primary px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                {t('landing.hero.startFree')}
                <ArrowRight size={20} />
              </Link>
              <Link to="https://github.com/samirrhashimov/blink.git" className="btn-secondary about-btn-secondary px-8 py-3 text-lg rounded-full flex items-center gap-2">
                <Github size={20} />
                {t('landing.hero.viewGithub')}
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
            <h2 className="feature-section-title">{t('landing.features.containers.title')}</h2>
            <p className="feature-section-desc">
              {t('landing.features.containers.desc')}
            </p>
          </div>
          <div className="feature-image-container">
            <img src={containerDetailsImg} alt="Container Details" className="feature-screenshot rotate-1 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4 text-green-600 dark:text-green-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="feature-section-title">{t('landing.features.sharing.title')}</h2>
            <p className="feature-section-desc">
              {t('landing.features.sharing.desc')}
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
            <h2 className="feature-section-title">{t('landing.features.invitations.title')}</h2>
            <p className="feature-section-desc">
              {t('landing.features.invitations.desc')}
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
            <h2 className="feature-section-title">{t('landing.features.tagging.title')}</h2>
            <p className="feature-section-desc">
              {t('landing.features.tagging.desc')}
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
            <h2 className="feature-section-title">{t('landing.features.themes.title')}</h2>
            <p className="feature-section-desc">
              {t('landing.features.themes.desc')}
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
                <h3 className="demo-container-title">{t('landing.features.themes.demoTitle')}</h3>
                <p className="demo-container-description">{t('landing.features.themes.demoDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 6 - Firefox Extension */}
        <div className="feature-row feature-row-firefox">
          <div className="feature-text-firefox">
            <div className="firefox-image-wrapper">
              <img src={firefoxExtImg} alt="Firefox Extension" />
            </div>
            <div className="firefox-content-wrapper">
              <h2 className="feature-section-title firefox-title">{t('landing.features.firefox.title')}</h2>
              <p className="feature-section-desc firefox-desc">
                {t('landing.features.firefox.desc')}
              </p>
              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/blinklinknet/"
                target="_blank"
                rel="noopener noreferrer"
                className="firefox-download-btn"
              >
                <svg className="firefox-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="g" cx="210%" cy="-100%" r="290%">
                      <stop offset=".1" stopColor="#ffe226" />
                      <stop offset=".79" stopColor="#ff7139" />
                    </radialGradient>
                    <radialGradient id="c" cx="49%" cy="40%" r="128%" gradientTransform="matrix(.82 0 0 1 .088 0)">
                      <stop offset=".3" stopColor="#960e18" />
                      <stop offset=".35" stopColor="#b11927" stopOpacity=".74" />
                      <stop offset=".43" stopColor="#db293d" stopOpacity=".34" />
                      <stop offset=".5" stopColor="#f5334b" stopOpacity=".09" />
                      <stop offset=".53" stopColor="#ff3750" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="d" cx="48%" cy="-12%" r="140%">
                      <stop offset=".13" stopColor="#fff44f" />
                      <stop offset=".53" stopColor="#ff980e" />
                    </radialGradient>
                    <radialGradient id="e" cx="22.76%" cy="110.11%" r="100%">
                      <stop offset=".35" stopColor="#3a8ee6" />
                      <stop offset=".67" stopColor="#9059ff" />
                      <stop offset="1" stopColor="#c139e6" />
                    </radialGradient>
                    <radialGradient id="f" cx="52%" cy="33%" r="59%" gradientTransform="scale(.9 1)">
                      <stop offset=".21" stopColor="#9059ff" stopOpacity="0" />
                      <stop offset=".97" stopColor="#6e008b" stopOpacity=".6" />
                    </radialGradient>
                    <radialGradient id="b" cx="87.4%" cy="-12.9%" r="128%" gradientTransform="matrix(.8 0 0 1 .178 .129)">
                      <stop offset=".13" stopColor="#ffbd4f" />
                      <stop offset=".28" stopColor="#ff980e" />
                      <stop offset=".47" stopColor="#ff3750" />
                      <stop offset=".78" stopColor="#eb0878" />
                      <stop offset=".86" stopColor="#e50080" />
                    </radialGradient>
                    <radialGradient id="h" cx="84%" cy="-41%" r="180%">
                      <stop offset=".11" stopColor="#fff44f" />
                      <stop offset=".46" stopColor="#ff980e" />
                      <stop offset=".72" stopColor="#ff3647" />
                      <stop offset=".9" stopColor="#e31587" />
                    </radialGradient>
                    <radialGradient id="i" cx="16.1%" cy="-18.6%" r="348.8%" gradientTransform="scale(1 .47) rotate(84 .279 -.297)">
                      <stop offset="0" stopColor="#fff44f" />
                      <stop offset=".3" stopColor="#ff980e" />
                      <stop offset=".57" stopColor="#ff3647" />
                      <stop offset=".74" stopColor="#e31587" />
                    </radialGradient>
                    <radialGradient id="j" cx="18.9%" cy="-42.5%" r="238.4%">
                      <stop offset=".14" stopColor="#fff44f" />
                      <stop offset=".48" stopColor="#ff980e" />
                      <stop offset=".66" stopColor="#ff3647" />
                      <stop offset=".9" stopColor="#e31587" />
                    </radialGradient>
                    <radialGradient id="k" cx="159.3%" cy="-44.72%" r="313.1%">
                      <stop offset=".09" stopColor="#fff44f" />
                      <stop offset=".63" stopColor="#ff980e" />
                    </radialGradient>
                    <linearGradient id="a" x1="87.25%" y1="15.5%" x2="9.4%" y2="93.1%">
                      <stop offset=".05" stopColor="#fff44f" />
                      <stop offset=".37" stopColor="#ff980e" />
                      <stop offset=".53" stopColor="#ff3647" />
                      <stop offset=".7" stopColor="#e31587" />
                    </linearGradient>
                    <linearGradient id="l" x1="80%" y1="14%" x2="18%" y2="84%">
                      <stop offset=".17" stopColor="#fff44f" stopOpacity=".8" />
                      <stop offset=".6" stopColor="#fff44f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M478.711 166.353c-10.445-25.124-31.6-52.248-48.212-60.821 13.52 26.505 21.345 53.093 24.335 72.936 0 .039.015.136.047.4C427.706 111.135 381.627 83.823 344 24.355c-1.9-3.007-3.805-6.022-5.661-9.2a73.716 73.716 0 01-2.646-4.972A43.7 43.7 0 01332.1.677a.626.626 0 00-.546-.644.818.818 0 00-.451 0c-.034.012-.084.051-.12.065-.053.021-.12.069-.176.1.027-.036.083-.117.1-.136-60.37 35.356-80.85 100.761-82.732 133.484a120.249 120.249 0 00-66.142 25.488 71.355 71.355 0 00-6.225-4.7 111.338 111.338 0 01-.674-58.732c-24.688 11.241-43.89 29.01-57.85 44.7h-.111c-9.527-12.067-8.855-51.873-8.312-60.184-.114-.515-7.107 3.63-8.023 4.255a175.073 175.073 0 00-23.486 20.12 210.478 210.478 0 00-22.442 26.913c0 .012-.007.026-.011.038 0-.013.007-.026.011-.038a202.838 202.838 0 00-32.247 72.805c-.115.521-.212 1.061-.324 1.586-.452 2.116-2.08 12.7-2.365 15-.022.177-.032.347-.053.524a229.066 229.066 0 00-3.9 33.157c0 .41-.025.816-.025 1.227C16 388.418 123.6 496 256.324 496c118.865 0 217.56-86.288 236.882-199.63.407-3.076.733-6.168 1.092-9.271 4.777-41.21-.53-84.525-15.587-120.746zM201.716 354.447c1.124.537 2.18 1.124 3.334 1.639.048.033.114.07.163.1a126.191 126.191 0 01-3.497-1.739zm55.053-144.93zm198.131-30.59l-.032-.233c.012.085.027.174.04.259z" fill="url(#a)" />
                  <path d="M478.711 166.353c-10.445-25.124-31.6-52.248-48.212-60.821 13.52 26.505 21.345 53.093 24.335 72.936 0-.058.011.048.036.226.012.085.027.174.04.259 22.675 61.47 10.322 123.978-7.479 162.175-27.539 59.1-94.215 119.67-198.576 116.716C136.1 454.651 36.766 370.988 18.223 261.41c-3.379-17.28 0-26.054 1.7-40.084-2.071 10.816-2.86 13.94-3.9 33.157 0 .41-.025.816-.025 1.227C16 388.418 123.6 496 256.324 496c118.865 0 217.56-86.288 236.882-199.63.407-3.076.733-6.168 1.092-9.271 4.777-41.21-.53-84.525-15.587-120.746z" fill="url(#b)" />
                  <path d="M478.711 166.353c-10.445-25.124-31.6-52.248-48.212-60.821 13.52 26.505 21.345 53.093 24.335 72.936 0-.058.011.048.036.226.012.085.027.174.04.259 22.675 61.47 10.322 123.978-7.479 162.175-27.539 59.1-94.215 119.67-198.576 116.716C136.1 454.651 36.766 370.988 18.223 261.41c-3.379-17.28 0-26.054 1.7-40.084-2.071 10.816-2.86 13.94-3.9 33.157 0 .41-.025.816-.025 1.227C16 388.418 123.6 496 256.324 496c118.865 0 217.56-86.288 236.882-199.63.407-3.076.733-6.168 1.092-9.271 4.777-41.21-.53-84.525-15.587-120.746z" fill="url(#c)" />
                  <path d="M361.922 194.6c.524.368 1 .734 1.493 1.1a130.706 130.706 0 00-22.31-29.112C266.4 91.892 321.516 4.626 330.811.194c.027-.036.083-.117.1-.136-60.37 35.356-80.85 100.761-82.732 133.484 2.8-.194 5.592-.429 8.442-.429 45.051 0 84.289 24.77 105.301 61.487z" fill="url(#d)" />
                  <path d="M256.772 209.514c-.393 5.978-21.514 26.593-28.9 26.593-68.339 0-79.432 41.335-79.432 41.335 3.027 34.81 27.261 63.475 56.611 78.643 1.339.692 2.694 1.317 4.05 1.935a132.768 132.768 0 007.059 2.886 106.743 106.743 0 0031.271 6.031c119.78 5.618 142.986-143.194 56.545-186.408 22.137-3.85 45.115 5.053 57.947 14.067-21.012-36.714-60.25-61.484-105.3-61.484-2.85 0-5.641.235-8.442.429a120.249 120.249 0 00-66.142 25.488c3.664 3.1 7.8 7.244 16.514 15.828 16.302 16.067 58.13 32.705 58.219 34.657z" fill="url(#e)" />
                  <path d="M256.772 209.514c-.393 5.978-21.514 26.593-28.9 26.593-68.339 0-79.432 41.335-79.432 41.335 3.027 34.81 27.261 63.475 56.611 78.643 1.339.692 2.694 1.317 4.05 1.935a132.768 132.768 0 007.059 2.886 106.743 106.743 0 0031.271 6.031c119.78 5.618 142.986-143.194 56.545-186.408 22.137-3.85 45.115 5.053 57.947 14.067-21.012-36.714-60.25-61.484-105.3-61.484-2.85 0-5.641.235-8.442.429a120.249 120.249 0 00-66.142 25.488c3.664 3.1 7.8 7.244 16.514 15.828 16.302 16.067 58.13 32.705 58.219 34.657z" fill="url(#f)" />
                  <path d="M170.829 151.036a244.042 244.042 0 014.981 3.3 111.338 111.338 0 01-.674-58.732c-24.688 11.241-43.89 29.01-57.85 44.7 1.155-.033 36.014-.66 53.543 10.732z" fill="url(#g)" />
                  <path d="M18.223 261.41C36.766 370.988 136.1 454.651 248.855 457.844c104.361 2.954 171.037-57.62 198.576-116.716 17.8-38.2 30.154-100.7 7.479-162.175l-.008-.026-.032-.233c-.025-.178-.04-.284-.036-.226 0 .039.015.136.047.4 8.524 55.661-19.79 109.584-64.051 146.044l-.133.313c-86.245 70.223-168.774 42.368-185.484 30.966a144.108 144.108 0 01-3.5-1.743c-50.282-24.029-71.054-69.838-66.6-109.124-42.457 0-56.934-35.809-56.934-35.809s38.119-27.179 88.358-3.541c46.53 21.893 90.228 3.543 90.233 3.541-.089-1.952-41.917-18.59-58.223-34.656-8.713-8.584-12.85-12.723-16.514-15.828a71.355 71.355 0 00-6.225-4.7 282.929 282.929 0 00-4.981-3.3c-17.528-11.392-52.388-10.765-53.543-10.735h-.111c-9.527-12.067-8.855-51.873-8.312-60.184-.114-.515-7.107 3.63-8.023 4.255a175.073 175.073 0 00-23.486 20.12 210.478 210.478 0 00-22.442 26.919c0 .012-.007.026-.011.038 0-.013.007-.026.011-.038a202.838 202.838 0 00-32.247 72.805c-.115.521-8.65 37.842-4.44 57.199z" fill="url(#h)" />
                  <path d="M341.105 166.587a130.706 130.706 0 0122.31 29.112c1.323.994 2.559 1.985 3.608 2.952 54.482 50.2 25.936 121.2 23.807 126.26 44.261-36.46 72.575-90.383 64.051-146.044C427.706 111.135 381.627 83.823 344 24.355c-1.9-3.007-3.805-6.022-5.661-9.2a73.716 73.716 0 01-2.646-4.972A43.7 43.7 0 01332.1.677a.626.626 0 00-.546-.644.818.818 0 00-.451 0c-.034.012-.084.051-.12.065-.053.021-.12.069-.176.1-9.291 4.428-64.407 91.694 10.298 166.389z" fill="url(#i)" />
                  <path d="M367.023 198.651c-1.049-.967-2.285-1.958-3.608-2.952-.489-.368-.969-.734-1.493-1.1-12.832-9.014-35.81-17.917-57.947-14.067 86.441 43.214 63.235 192.026-56.545 186.408a106.743 106.743 0 01-31.271-6.031 134.51 134.51 0 01-7.059-2.886c-1.356-.618-2.711-1.243-4.05-1.935.048.033.114.07.163.1 16.71 11.4 99.239 39.257 185.484-30.966l.133-.313c2.129-5.054 30.675-76.057-23.807-126.258z" fill="url(#j)" />
                  <path d="M148.439 277.443s11.093-41.335 79.432-41.335c7.388 0 28.509-20.615 28.9-26.593s-43.7 18.352-90.233-3.541c-50.239-23.638-88.358 3.541-88.358 3.541s14.477 35.809 56.934 35.809c-4.453 39.286 16.319 85.1 66.6 109.124 1.124.537 2.18 1.124 3.334 1.639-29.348-15.169-53.582-43.834-56.609-78.644z" fill="url(#k)" />
                  <path d="M478.711 166.353c-10.445-25.124-31.6-52.248-48.212-60.821 13.52 26.505 21.345 53.093 24.335 72.936 0 .039.015.136.047.4C427.706 111.135 381.627 83.823 344 24.355c-1.9-3.007-3.805-6.022-5.661-9.2a73.716 73.716 0 01-2.646-4.972A43.7 43.7 0 01332.1.677a.626.626 0 00-.546-.644.818.818 0 00-.451 0c-.034.012-.084.051-.12.065-.053.021-.12.069-.176.1.027-.036.083-.117.1-.136-60.37 35.356-80.85 100.761-82.732 133.484 2.8-.194 5.592-.429 8.442-.429 45.053 0 84.291 24.77 105.3 61.484-12.832-9.014-35.81-17.917-57.947-14.067 86.441 43.214 63.235 192.026-56.545 186.408a106.743 106.743 0 01-31.271-6.031 134.51 134.51 0 01-7.059-2.886c-1.356-.618-2.711-1.243-4.05-1.935.048.033.114.07.163.1a144.108 144.108 0 01-3.5-1.743c1.124.537 2.18 1.124 3.334 1.639-29.35-15.168-53.584-43.833-56.611-78.643 0 0 11.093-41.335 79.432-41.335 7.388 0 28.509-20.615 28.9-26.593-.089-1.952-41.917-18.59-58.223-34.656-8.713-8.584-12.85-12.723-16.514-15.828a71.355 71.355 0 00-6.225-4.7 111.338 111.338 0 01-.674-58.732c-24.688 11.241-43.89 29.01-57.85 44.7h-.111c-9.527-12.067-8.855-51.873-8.312-60.184-.114-.515-7.107 3.63-8.023 4.255a175.073 175.073 0 00-23.486 20.12 210.478 210.478 0 00-22.435 26.916c0 .012-.007.026-.011.038 0-.013.007-.026.011-.038a202.838 202.838 0 00-32.247 72.805c-.115.521-.212 1.061-.324 1.586-.452 2.116-2.486 12.853-2.77 15.156-.022.177.021-.176 0 0a279.565 279.565 0 00-3.544 33.53c0 .41-.025.816-.025 1.227C16 388.418 123.6 496 256.324 496c118.865 0 217.56-86.288 236.882-199.63.407-3.076.733-6.168 1.092-9.271 4.777-41.21-.53-84.525-15.587-120.746zm-23.841 12.341c.012.085.027.174.04.259l-.008-.026-.032-.233z" fill="url(#l)" />
                </svg>
                {t('landing.features.firefox.button')}
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* Grid Features (Why Choose Blink?) */}
      <section className="about-features bg-gray-50 dark:bg-gray-800/50 py-20 rounded-3xl mx-4 md:mx-auto max-w-7xl">
        <div className="about-features-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.everything.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" style={{ marginBottom: '2rem' }}>{t('landing.features.everything.subtitle')}</p>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-blue group-hover:scale-110 transition-transform">
                <Shield className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.security.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.security.desc')}</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-purple group-hover:scale-110 transition-transform">
                <Zap className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.sync.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.sync.desc')}</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-pink group-hover:scale-110 transition-transform">
                <Globe className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.anywhere.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.anywhere.desc')}</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-yellow group-hover:scale-110 transition-transform">
                <Search className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.search.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.search.desc')}</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-cyan group-hover:scale-110 transition-transform">
                <Moon className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.darkmode.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.darkmode.desc')}</p>
            </div>

            <div className="about-feature-card group hover:-translate-y-2 transition-transform">
              <div className="about-feature-icon about-icon-green group-hover:scale-110 transition-transform">
                <Lock className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">{t('landing.features.everything.permissions.title')}</h3>
              <p className="about-feature-text">{t('landing.features.everything.permissions.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="bg-blue-50 dark:bg-blue-700 rounded-3xl p-12 mx-4 max-w-6xl md:mx-auto text-gray-900 dark:text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link to="/login" className="header-getstarted-footer">
                {t('landing.features.cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer border-t border-gray-200 dark:border-gray-800">
        <div className="about-footer-container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-gray-600 dark:text-gray-400 font-medium">© {new Date().getFullYear()} Blink - by LinzaApps</span>
          </div>
          <div className="flex gap-6 text-gray-600 dark:text-gray-400 text-sm">
            <a href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/legal/privacy-policy');
              }} className="hover:text-blue-500 transition-colors">{t('landing.features.footer.privacy')}</a>
            <a href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/legal/terms-and-conditions');
              }} className="hover:text-blue-500 transition-colors">{t('landing.features.footer.terms')}</a>
            <a href="https://github.com/samirrhashimov/blink.git" className="hover:text-blue-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;

