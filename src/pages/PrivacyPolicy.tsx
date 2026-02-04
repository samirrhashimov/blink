import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Privacy Policy" description="Our privacy practices and how we handle your data." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: January 3, 2026</p>

                <p>
                    This Privacy Policy describes how Blink ("Service") handles limited personal
                    information in connection with your use of the application.
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                    We may collect basic account information such as an email address if you choose
                    to create an account. Limited technical or usage data may also be processed to
                    ensure functionality and improve the Service.
                </p>

                <h2>2. Purpose of Data Use</h2>
                <p>
                    Collected information is used solely to operate, maintain, and improve the
                    Service. We do not use personal data for advertising or profiling purposes.
                </p>

                <h2>3. Data Storage and Third-Party Services</h2>
                <p>
                    Data may be stored using third-party infrastructure providers (such as Firebase).
                    We rely on their security and compliance measures and do not control their
                    internal data handling practices.
                </p>

                <h2>4. Data Security</h2>
                <p>
                    Reasonable measures are taken to protect stored data. However, no method of
                    transmission or storage is completely secure, and we cannot guarantee absolute
                    protection.
                </p>

                <h2>5. Data Sharing</h2>
                <p>
                    We do not sell or rent personal data. Information may be disclosed only if
                    required by law or legal process.
                </p>

                <h2>6. Cookies and Local Storage</h2>
                <p>
                    The Service may use cookies or local storage strictly for functionality purposes,
                    such as session persistence or offline access.
                </p>

                <h2>7. User Control</h2>
                <p>
                    You may be able to manage or delete certain data through your account settings.
                    Availability of these options depends on the current implementation of the
                    Service.
                </p>

                <h2>8. Changes to this Privacy Policy</h2>
                <p>
                    We reserve the right to update this Privacy Policy at any time. Changes become
                    effective once published within the application. Continued use of the Service
                    after updates constitutes acceptance of the revised Policy.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
