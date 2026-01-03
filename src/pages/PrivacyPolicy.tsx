import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', paddingTop: '100px', paddingBottom: '30px', display: 'flex', justifyContent: 'center' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'auto',
                    height: 'auto',
                    padding: '8px'
                }}
            >
                <FaArrowLeft />
            </button>

            <div style={{
                maxWidth: '800px',
                width: '90%',
                padding: '30px',
                background: '#f9f9f9',
                color: '#333',
                lineHeight: '1.6',
                borderRadius: '12px',
                position: 'relative',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>

                <h1>Privacy Policy</h1>
                <p>Last updated: January 3, 2026</p>
                <br></br>

                <p>This Privacy Policy explains how our Blink application ("we", "our", or "us") collects, uses, and protects your personal data when you use our services.</p>

                <h2>1. Information We Collect</h2>
                <p>We may collect personal information you provide directly to us, such as your email address when creating an account. We may also collect usage data to improve our services.</p>

                <h2>2. Use of Information</h2>
                <p>We use the collected information to:</p>
                <ul>
                    <li>Provide and maintain our services</li>
                    <li>Respond to your inquiries</li>
                    <li>Improve user experience</li>
                    <li>Communicate with you, if necessary</li>
                </ul>

                <h2>3. Data Storage</h2>
                <p>Your notes and account data may be stored securely in our backend (such as Firebase). Some data may also be stored locally on your device for offline access.</p>

                <h2>4. Data Security</h2>
                <p>We implement appropriate security measures to protect your data. However, no system is 100% secure, and we cannot guarantee absolute security.</p>

                <h2>5. Sharing of Information</h2>
                <p>We do not sell, trade, or share your personal data with third parties, except as required by law.</p>

                <h2>6. Cookies and Tracking</h2>
                <p>We may use cookies or similar technologies to enhance the user experience, such as remembering login sessions.</p>

                <h2>7. User Rights</h2>
                <p>You have the right to access, update, or delete your personal data by contacting us or through your account settings.</p>

                <h2>8. Changes to this Policy</h2>
                <p>We may update this Privacy Policy from time to time. We encourage you to review it periodically.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
