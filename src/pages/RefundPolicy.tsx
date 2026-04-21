import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const RefundPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Refund Policy" description="Information regarding billing, cancellations, and refunds for Blink PRO." />
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
                    Thank you for choosing <strong>Blink PRO</strong>. We aim to provide the best possible experience for our users. This Refund Policy outlines the terms and conditions regarding subscriptions and refunds.
                </p>

                <h2>1. Subscription Billing</h2>
                <p>
                    Blink PRO is a subscription-based service. By subscribing, you authorize us (via our payment processors) to charge the applicable subscription fees to your designated payment method on a recurring basis.
                </p>

                <h2>2. Cancellations</h2>
                <p>
                    You may cancel your subscription at any time. To avoid being charged for the next billing cycle, you must cancel at least 24 hours before your current subscription period ends.
                </p>
                <ul>
                    <li>If you subscribed via our website (Lemon Squeezy), you can cancel in your <strong>Settings</strong> or via the link in your receipt email.</li>
                    <li>If you subscribed via the Apple App Store or Google Play Store, you must cancel through their respective subscription management interfaces.</li>
                </ul>
                <p>Upon cancellation, you will retain access to PRO features until the end of your current billing period.</p>

                <h2>3. Refund Eligibility</h2>
                <p>
                    As Blink provides digital content and immediate access to premium features, all sales are generally final and non-refundable. However, we may issue refunds in the following limited circumstances:
                </p>
                <ul>
                    <li><strong>Technical Failure:</strong> If a major technical defect prevents you from accessing PRO features and we are unable to fix it within 14 days of being notified.</li>
                    <li><strong>Duplicate Purchase:</strong> If you were accidentally charged multiple times for the same subscription due to a technical error on our part.</li>
                </ul>

                <h2>4. Right of Withdrawal (EU/EEA Users)</h2>
                <p>
                    If you are located in the European Union or European Economic Area, you generally have a right to withdraw from a distance contract within 14 days without giving any reason.
                </p>
                <p>
                    <strong>Important:</strong> By subscribing to Blink PRO and requesting immediate access to the service, you acknowledge that you lose your right of withdrawal once the digital content has been made available to you.
                </p>

                <h2>5. Processing Refunds</h2>
                <p>
                    Refunds for purchases made through the Apple App Store or Google Play Store must be requested directly through those platforms. We do not have the technical ability to refund transactions processed by Apple or Google.
                </p>
                <p>
                    For purchases made via <strong>Lemon Squeezy</strong>, please contact us at <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a> with your transaction details. As our Merchant of Record, Lemon Squeezy handles the billing and compliance for these transactions.
                </p>

                <h2>6. Contact Us</h2>
                <p>
                    If you have any questions regarding our Refund Policy, please contact us at <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>.
                </p>
            </div>
        </div>
    );
};

export default RefundPolicy;
