import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const RefundPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Refund Policy" description="Read our Refund Policy regarding Blink PRO subscriptions." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Refund Policy</h1>
                <p className="last-updated">Last updated: April 21, 2026</p>

                <p>
                    Thank you for choosing Blink PRO. We want to ensure you have a great experience with our premium features. This policy outlines our terms regarding refunds and cancellations for Blink PRO subscriptions.
                </p>

                <h2>1. Subscription Cancellations</h2>
                <p>
                    You can cancel your Blink PRO subscription at any time through your account settings or the platform where you purchased the subscription (e.g., Apple App Store or Google Play Store). Upon cancellation, you will continue to have access to PRO features until the end of your current billing period.
                </p>

                <h2>2. Refund Eligibility</h2>
                <p>
                    Since Blink provides digital services and immediate access to premium features (such as increased storage and file uploads), we generally do not offer refunds once a subscription has been active. However, exceptions may be made in the following cases:
                </p>
                <ul>
                    <li><strong>Technical Issues:</strong> If a persistent technical issue prevents you from using the PRO features and we are unable to resolve it within a reasonable timeframe.</li>
                    <li><strong>Accidental Duplicate Purchases:</strong> If you were charged twice for the same subscription due to a system error.</li>
                </ul>

                <h2>3. Platform-Specific Refunds</h2>
                <p>
                    If you purchased your subscription through a third-party app store, the refund process is governed by that store's policies:
                </p>
                <ul>
                    <li><strong>Apple App Store:</strong> All refunds are handled by Apple. You must request a refund through your Apple ID account.</li>
                    <li><strong>Google Play Store:</strong> Refunds are generally handled through Google Play. You can request a refund through the Google Play website or app.</li>
                </ul>

                <h2>4. Contact Us</h2>
                <p>
                    If you believe you are entitled to a refund or have any issues with your subscription, please contact us at <a href="mailto:linzaapps@gmail.com" style={{ color: 'inherit', fontWeight: '700', textDecoration: 'underline' }}>linzaapps@gmail.com</a>. We will review each request individually and aim to respond within 5-7 business days.
                </p>

                <div style={{ marginTop: '3.5rem', opacity: 0.6, fontSize: '0.9rem' }}>
                    <p>© {new Date().getFullYear()} Blink - by LinzaApps. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
