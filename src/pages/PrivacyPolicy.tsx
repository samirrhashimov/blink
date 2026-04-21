import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Privacy Policy" description="Detailed information on how Blink collects, uses, and protects your personal data." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: April 21, 2026</p>

                <p>
                    At <strong>Blink</strong> ("we," "our," or "the Service"), operated by LinzaApps, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                </p>

                <h2>1. Data Controller</h2>
                <p>
                    For the purpose of the General Data Protection Regulation (GDPR) and other applicable data protection laws, the data controller is:
                    <br />
                    <strong>LinzaApps</strong>
                    <br />
                    Email: <a href="mailto:linzaapps@gmail.com" style={{ color: 'inherit', fontWeight: '700' }}>linzaapps@gmail.com</a>
                </p>

                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Data You Provide</h3>
                <p>
                    We collect information that you voluntarily provide when you create an account, such as:
                </p>
                <ul>
                    <li>Email address</li>
                    <li>Display name</li>
                    <li>Profile information</li>
                    <li>Payment information (processed securely via Lemon Squeezy)</li>
                </ul>

                <h3>2.2 Content Data</h3>
                <p>
                    We store the content you upload or create, including links, text notes, and files (images/documents). Files are stored securely using Cloudinary.
                </p>

                <h3>2.3 Technical and Usage Data</h3>
                <p>
                    We automatically collect certain information when you interact with our Service, including IP addresses, browser type, device information, and usage patterns to ensure stability and improve performance. This is also required for Google Play Store safety evaluations.
                </p>

                <h2>3. How We Use Your Information</h2>
                <p>We use your data for the following purposes:</p>
                <ul>
                    <li>To provide and maintain our Service.</li>
                    <li>To manage your account and subscription.</li>
                    <li>To process transactions and send related information.</li>
                    <li>To provide customer support and respond to inquiries.</li>
                    <li>To detect, prevent, and address technical issues or security breaches.</li>
                    <li>To comply with legal obligations and Google Play policies.</li>
                </ul>

                <h2>4. Legal Basis for Processing (GDPR)</h2>
                <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using personal information depends on the context:</p>
                <ul>
                    <li><strong>Contract:</strong> To perform our contract with you (e.g., providing the Service).</li>
                    <li><strong>Consent:</strong> Where you have given us clear consent.</li>
                    <li><strong>Legitimate Interests:</strong> To improve our Service and maintain security.</li>
                    <li><strong>Legal Obligation:</strong> To comply with the law.</li>
                </ul>

                <h2>5. Third-Party Sub-processors</h2>
                <p>We rely on trusted third-party providers to facilitate our Service:</p>
                <ul>
                    <li><strong>Google Firebase:</strong> Used for authentication and database management.</li>
                    <li><strong>Cloudinary:</strong> Used for secure storage and delivery of user-uploaded files and images.</li>
                    <li><strong>Lemon Squeezy:</strong> Used for secure payment processing and subscription management (Merchant of Record).</li>
                </ul>

                <h2>6. Your Rights</h2>
                <p>Depending on your location, you may have the following rights regarding your data:</p>
                <ul>
                    <li><strong>Access:</strong> The right to request copies of your personal data.</li>
                    <li><strong>Rectification:</strong> The right to request that we correct any inaccurate information.</li>
                    <li><strong>Erasure:</strong> The right to request that we erase your personal data ("Right to be Forgotten").</li>
                    <li><strong>Data Portability:</strong> The right to request that we transfer your data to another organization.</li>
                    <li><strong>Withdraw Consent:</strong> If we rely on consent, you can withdraw it at any time.</li>
                </ul>
                <p>To exercise these rights, please contact us at <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>.</p>

                <h2>7. Data Retention</h2>
                <p>
                    We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. Account data is generally deleted within 30 days of an account deletion request, except where we are required to retain data for longer to comply with legal obligations.
                </p>

                <h2>8. International Data Transfers</h2>
                <p>
                    Your information may be transferred to and maintained on computers located outside of your state, province, or country where the data protection laws may differ. Such transfers are safeguarded by the standard contractual clauses and data processing agreements maintained by our sub-processors (Google, Cloudinary, Lemon Squeezy).
                </p>

                <h2>9. Children&apos;s Privacy (Target Audience 13+)</h2>
                <p>
                    Our Service is intended for a general audience and is rated 13+ on the Google Play Store. We do not knowingly collect personal data from children under the age of 13.
                </p>
                <p>
                    If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.
                </p>

                <h2>10. Changes to This Policy</h2>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
