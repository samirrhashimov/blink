import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

const DeleteAccount = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-page-container">
            <SEO
                title="Account Deletion Request - Blink"
                description="Steps to follow to delete your Blink account and associated data."
            />
            <button
                onClick={() => navigate(-1)}
                className="back-btn-legal"
                title="Go back"
            >
                <FaArrowLeft />
            </button>

            <div className="legal-card">
                <h1>Account Deletion Request</h1>
                <p className="last-updated">Last updated: February 9, 2026</p>

                <p>
                    As <strong>Blink</strong> (developed by LinzaApps), we value our users' data privacy and control.
                    In accordance with Google Play policies, you have the right to delete your account and associated data at any time.
                </p>

                <h2>1. How to Delete Your Account?</h2>
                <p>
                    You can use one of the following methods to delete your account:
                </p>
                <ul>
                    <li>
                        <strong>Within the App:</strong> Log in to the application, go to the <strong>Settings</strong> tab, and follow the <strong>"Delete My Account"</strong> option.
                    </li>
                    <li>
                        <strong>Request via Email:</strong> You can request the deletion of your data by sending an email with the subject "Account Deletion Request" from your registered email address to <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a>. Your request will be processed within 7 business days at the latest.
                    </li>
                </ul>

                <h2>2. What Data is Deleted?</h2>
                <p>
                    When an account deletion request is approved, the following data is permanently removed from our systems:
                </p>
                <ul>
                    <li><strong>Account Information:</strong> Your email address, name/surname, and profile picture.</li>
                    <li><strong>User Content:</strong> All saved links, created folders (containers), and tags.</li>
                    <li><strong>Relationship Data:</strong> Folder access shared with other users and invitations.</li>
                </ul>

                <h2>3. Data Retention and Exceptions</h2>
                <p>
                    While most data is deleted immediately upon account deletion, some information may be retained for a limited period for legal obligations or security reasons:
                </p>
                <ul>
                    <li><strong>Legal Records:</strong> Data related to financial transactions or legal obligations may be stored for the period prescribed by relevant laws.</li>
                    <li><strong>Backups:</strong> Your data is immediately deleted from our active systems, but may remain in our system backups for security purposes for up to 30 days (it is completely cleared at the end of this period).</li>
                    <li><strong>Anonymized Data:</strong> Statistical data used to improve application performance may continue to be stored in a way that does not identify you.</li>
                </ul>

                <h2>4. Important Note</h2>
                <p>
                    Account deletion is <strong>permanent</strong> and cannot be undone. Once your account is deleted, you will no longer be able to access your saved links and data.
                </p>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <p><strong>Developer:</strong> LinzaApps</p>
                    <p><strong>Contact:</strong> <a href="mailto:linzaapps@gmail.com">linzaapps@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
