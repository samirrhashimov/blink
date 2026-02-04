import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Terms and Conditions" description="Read the Terms and Conditions for using Blink." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Terms and Conditions</h1>
                <p className="last-updated">Last updated: February 4, 2026</p>

                <p>
                    These Terms and Conditions govern your access to and use of the Blink application
                    ("Service"). By using the Service, you agree to these Terms. If you do not agree,
                    you must not use the Service.
                </p>

                <h2>1. Nature of the Service</h2>
                <p>
                    Blink is provided as-is for personal and non-commercial use. The Service is offered
                    without guarantees regarding availability, reliability, or data persistence.
                </p>

                <h2>2. User Responsibilities</h2>
                <p>
                    You agree to use the Service only for lawful purposes. You are solely responsible
                    for any content, links, or data you share through the Service.
                </p>

                <h2>3. Accounts and Security</h2>
                <p>
                    If you create an account, you are responsible for maintaining the confidentiality
                    of your credentials and for all activity that occurs under your account.
                </p>

                <h2>4. Intellectual Property</h2>
                <p>
                    The Service, including its design, branding, and code, is owned by Blink or its
                    licensors. You may not copy, modify, or redistribute any part of the Service
                    without permission.
                </p>

                <h2>5. Privacy</h2>
                <p>
                    We aim to minimize data collection. Any personal data processing is described in
                    our <Link to="/legal/privacy-policy" style={{ color: 'var(--primary)', fontWeight: '600' }}>Privacy Policy</Link>.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, Blink shall not be liable for any direct,
                    indirect, incidental, or consequential damages resulting from your use of or
                    inability to use the Service.
                </p>

                <h2>7. Service Changes and Termination</h2>
                <p>
                    We reserve the right to modify, suspend, or discontinue the Service at any time
                    without prior notice. Access may be terminated if these Terms are violated.
                </p>

                <h2>8. Governing Law</h2>
                <p>
                    These Terms are governed by applicable laws, without regard to conflict of law
                    principles.
                </p>

                <h2>9. Changes to These Terms</h2>
                <p>
                    We reserve the right to modify or update these Terms at any time. Any changes
                    will become effective once published within the application. By continuing
                    to use the Service after such changes, you acknowledge and agree to be bound
                    by the updated Terms.
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;
