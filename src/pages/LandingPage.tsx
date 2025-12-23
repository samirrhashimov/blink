import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Share2, Zap, Users, Search, Moon } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import '../css/About.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page bg-white text-black" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-black">
              <img src={blinkLogo} alt="Blink" style={{ height: '40px', width: 'auto' }} />
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary landing1">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section (from original landing) */}
      <section className="hero-section about-hero" style={{ backgroundColor: '#ffffff' }}>
        <div className="about-hero-container">
          <div className="about-hero-content hero-content">
            <h1 className="about-hero-title">Your Links, <span className="about-hero-highlight">Organized</span></h1>
            <p className="about-hero-subtitle">The place to store and share links with your team. Keep everything organized and up-to-date.</p>
            <div className="hero-buttons about-cta-buttons">
              <Link to="/signup" className="btn-primary about-btn-primary">
                Sign up for free
              </Link>
              <Link to="https://github.com/samirrhashimov/blink.git" className="btn-secondary about-btn-secondary">
                See on GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (from About) */}
      <section className="about-features">
        <div className="about-features-container">
          <h2 className="about-section-title">Why Choose Blink?</h2>
          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-blue">
                <Lock className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Secure & Private</h3>
              <p className="about-feature-text">Your data is protected with enterprise-grade Firebase security. Only you and authorized collaborators can access your vaults.</p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-green">
                <Share2 className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Easy Sharing</h3>
              <p className="about-feature-text">Collaborate effortlessly by sharing vaults with team members. Send invitations and manage permissions.</p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-purple">
                <Zap className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Lightning Fast</h3>
              <p className="about-feature-text">Real-time synchronization ensures your links are always up-to-date across all devices instantly.</p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-pink">
                <Users className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Team Collaboration</h3>
              <p className="about-feature-text">Work together seamlessly with granular permission controls and real-time notifications for all team activities.</p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-yellow">
                <Search className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Smart Search</h3>
              <p className="about-feature-text">Find any link instantly with our powerful search across titles, descriptions, URLs, and vault names.</p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon about-icon-cyan">
                <Moon className="about-icon-svg" />
              </div>
              <h3 className="about-feature-title">Light & Dark Mode</h3>
              <p className="about-feature-text">Choose your preferred theme. Blink adapts to your style and is easy on the eyes, day or night.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="about-usecases">
        <div className="about-usecases-container">
          <h2 className="about-section-title">Perfect For</h2>
          <div className="about-usecases-grid">
            <div className="about-usecase-card about-usecase-blue">
              <h3 className="about-usecase-title">Teams & Organizations</h3>
              <p className="about-usecase-text">Centralize important resources, project documentation, and team links. Share with specific team members and control who can edit.</p>
            </div>

            <div className="about-usecase-card about-usecase-green">
              <h3 className="about-usecase-title">Content Creators</h3>
              <p className="about-usecase-text">Organize reference materials, inspiration links, and resources. Generate shareable vault links for your audience.</p>
            </div>

            <div className="about-usecase-card about-usecase-purple">
              <h3 className="about-usecase-title">Developers & Designers</h3>
              <p className="about-usecase-text">Keep API documentation, design tools, development resources, and useful utilities in one organized place.</p>
            </div>

            <div className="about-usecase-card about-usecase-pink">
              <h3 className="about-usecase-title">Personal Organization</h3>
              <p className="about-usecase-text">Manage bookmarks, research materials, and personal projects with a clean, distraction-free interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-techstack">
        <div className="about-techstack-container">
          <h2 className="about-section-title">Built with Modern Technology</h2>
          <div className="about-techstack-grid">
            {['React 18', 'TypeScript', 'Firebase', 'CSS3', 'Firestore', 'React Router', 'Vite', 'Lucide Icons'].map((tech) => (
              <div key={tech} className="about-tech-badge">
                <p className="about-tech-name">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-cta-container">
          <div className="about-cta-buttons">
            <Link to="/signup" className="about-btn about-btn-primary">
              Get Started <ArrowRight className="about-btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-footer-container">
          <p className="about-footer-text">© 2025 Blink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
