import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import SEO from '../components/SEO';

const Legal = () => {
    const navigate = useNavigate();

    const legalItems = [
        { title: 'Privacy Policy', path: '/legal/privacy-policy', description: 'How we collect and use your data' },
        { title: 'Terms and Conditions', path: '/legal/terms-and-conditions', description: 'Rules for using our service' },
        { title: 'Account Deletion', path: '/legal/delete-account', description: 'How to request account deletion' }
    ];

    return (
        <div className="legal-page-container">
            <SEO title="Legal Information" description="Review our Privacy Policy, Terms and Conditions, and more." />
            
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1 style={{ marginBottom: '2rem' }}>Legal Information</h1>
                <p style={{ marginBottom: '3rem', opacity: 0.7 }}>
                    Please review our documents below to understand how we handle your data and the rules of using our service.
                </p>

                <div className="legal-menu-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {legalItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="legal-menu-item"
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '2rem',
                                borderRadius: '16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.3s ease',
                                color: 'inherit'
                            }}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>{item.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.7 }}>{item.description}</p>
                            </div>
                            <FaChevronRight style={{ opacity: 0.3 }} />
                        </Link>
                    ))}
                </div>

                <footer style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                    <p>© {new Date().getFullYear()} Blink - by LinzaApps. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default Legal;
