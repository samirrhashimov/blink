import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', marginTop: '80px', padding: '20px' }}>
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
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                color: '#333',
                lineHeight: '1.6'
            }}>
                <h1>Terms and Conditions</h1>
                <p>Last updated: January 3, 2026</p>
                <br></br>

                <p>Welcome to our Blink application ("we", "our", or "us"). By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By using the site, you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations.</p>

                <h2>2. Use of Service</h2>
                <p>You agree to use the application for lawful purposes only. You must not use it in any way that violates any laws or regulations.</p>

                <h2>3. Account Responsibility</h2>
                <p>If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>

                <h2>4. Intellectual Property</h2>
                <p>All content, trademarks, and data on this site are the property of the application or its licensors. You may not reproduce or distribute any content without permission.</p>

                <h2>5. Privacy</h2>
                <p>Your use of the application is also subject to our <Link to="/legal/privacy-policy">Privacy Policy</Link>, which outlines how we collect, use, and protect your information.</p>

                <h2>6. Modifications to Terms</h2>
                <p>We reserve the right to change these Terms at any time. We will notify you by updating the date above. Continued use of the service means you accept the changes.</p>

                <h2>7. Termination</h2>
                <p>We may suspend or terminate your access if you violate these Terms or use the app in a harmful or abusive manner.</p>
            </div>
        </div>
    );
};

export default TermsAndConditions;
