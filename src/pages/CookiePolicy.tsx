import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const CookiePolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO title="Cookie Policy" description="Information about how Blink uses cookies and local storage." />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Cookie Policy</h1>
                <p className="last-updated">Last updated: April 21, 2026</p>

                <p>
                    This Cookie Policy explains how <strong>Blink</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) uses cookies and similar technologies to recognize you when you visit our application. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                </p>

                <h2>1. What are cookies?</h2>
                <p>
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>

                <h2>2. Why do we use cookies?</h2>
                <p>
                    We use cookies for several reasons. Some cookies are required for technical reasons in order for our Service to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Service.
                </p>

                <h2>3. Essential Cookies and Local Storage</h2>
                <p>
                    These are strictly necessary to provide you with services available through our Service and to use some of its features, such as access to secure areas.
                </p>
                <ul>
                    <li><strong>Authentication:</strong> We use Firebase Authentication cookies and local storage to keep you logged in.</li>
                    <li><strong>Preferences:</strong> We use local storage to remember your settings, such as theme preferences or language.</li>
                    <li><strong>Session Management:</strong> To maintain your session across different parts of the application.</li>
                </ul>

                <h2>4. Analytics and Performance</h2>
                <p>
                    We may use third-party analytics services (such as Google Analytics or similar) to help us understand how often the Service is used and which pages are visited. This data is aggregated and does not personally identify you.
                </p>

                <h2>5. How can I control cookies?</h2>
                <p>
                    Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Service.
                </p>
                <p>
                    To opt-out of being tracked by Google Analytics across all websites, visit <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: '700', textDecoration: 'underline' }}>tools.google.com/dlpage/gaoptout</a>.
                </p>

                <h2>6. Changes to this Cookie Policy</h2>
                <p>
                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons.
                </p>

                <h2>7. Contact Us</h2>
                <p>
                    If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>.
                </p>
            </div>
        </div>
    );
};

export default CookiePolicy;
