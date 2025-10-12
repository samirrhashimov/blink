import React from 'react';
import { Link } from 'react-router-dom';
import blinkLogo from '../assets/blinklogo2.png';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-black dark:text-white">
                <img src={blinkLogo} alt="Blink" style={{height: '40px', width: 'auto'}} />
              </div>
              <div className="hidden items-center gap-6 md:flex">
                <a className="text-sm font-medium text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80" href="#">
                  Product
                </a>
                <a className="text-sm font-medium text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80" href="#">
                  Pricing
                </a>
                <a className="text-sm font-medium text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80" href="#">
                  Resources
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Your links, organized</h1>
            <p>
              The place to store and share links with your team. Keep everything organized and up-to-date.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary">
                Sign up for free
              </Link>
              <button className="btn-secondary">
                Learn more
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2024 All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </footer>
    </div>
  );
};

export default LandingPage;
