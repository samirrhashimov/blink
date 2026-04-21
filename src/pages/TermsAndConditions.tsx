import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Terms and Conditions" description="Terms of service and rules for using the Blink application." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Terms and Conditions</h1>
                <p className="last-updated">Last updated: April 21, 2026</p>

                <p>
                    Welcome to <strong>Blink</strong>. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Blink application and services (&quot;Service&quot;) provided by LinzaApps (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
                </p>

                <h2>2. Eligibility</h2>
                <p>
                    You must be at least 13 years old to use the Service. Blink is rated 13+ on the Google Play Store. By using Blink, you represent and warrant that you meet these requirements.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                    To access certain features, you must create an account. You are responsible for:
                </p>
                <ul>
                    <li>Maintaining the confidentiality of your account credentials.</li>
                    <li>All activities that occur under your account.</li>
                    <li>Providing accurate and complete information.</li>
                </ul>
                <p>We reserve the right to suspend or terminate accounts that violate these Terms or Google Play policies.</p>

                <h2>4. Prohibited Conduct</h2>
                <p>You agree not to use the Service to:</p>
                <ul>
                    <li>Upload, store, or share content that is illegal, harmful, threatening, or infringing on intellectual property rights.</li>
                    <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
                    <li>Interfere with the proper working of the Service.</li>
                    <li>Use the Service for any unauthorized commercial purposes.</li>
                </ul>

                <h2>5. Intellectual Property</h2>
                <p>
                    The Service and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of LinzaApps and its licensors.
                </p>
                <p>
                    By uploading content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to store and display that content for the purpose of providing the Service to you.
                </p>

                <h2>6. Subscriptions and Payments</h2>
                <p>
                    Some features are available through a paid subscription (Blink PRO). Payments are processed by third-party providers (Lemon Squeezy, Apple, or Google). Refunds for Google Play purchases are handled by Google&apos;s refund policy. For direct purchases via Lemon Squeezy, refund requests may be submitted within 14 days to <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>. Detailed terms can be found in our <Link to="/legal/refund-policy" style={{ color: 'inherit', fontWeight: '700', textDecoration: 'underline' }}>Refund Policy</Link>.
                </p>

                <h2>7. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, LinzaApps and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                </p>
                <p>
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
                </p>

                <h2>8. Indemnification</h2>
                <p>
                    You agree to defend, indemnify, and hold harmless LinzaApps from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses resulting from your use of the Service or violation of these Terms.
                </p>

                <h2>9. Termination</h2>
                <p>
                    We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                </p>

                <h2>10. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of the Republic of Azerbaijan, without regard to its conflict of law provisions.
                </p>

                <h2>11. Changes to Terms</h2>
                <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&apos; notice prior to any new terms taking effect.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>.
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;
