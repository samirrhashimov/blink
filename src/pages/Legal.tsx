import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';

const Legal = () => {
    const navigate = useNavigate();

    const legalItems = [
        { title: 'Privacy Policy', path: '/legal/privacy-policy', description: 'How we collect and use your data' },
        { title: 'Terms and Conditions', path: '/legal/terms-and-conditions', description: 'Rules for using our service' }
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '80px', padding: '20px' }}>
            <button
                onClick={() => navigate('/')}
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
                    width: '24px',
                    height: '24px',
                    padding: '0',
                    margin: '0'
                }}
            >
                <FaArrowLeft />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {legalItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        style={{
                            textDecoration: 'none',
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            border: `1px solid #f0f0f0`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(5px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                {item.title}
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                {item.description}
                            </p>
                        </div>
                        <FaChevronRight style={{
                            color: '#999',
                            fontSize: '16px'
                        }} />
                    </Link>
                ))}
            </div>

            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <p style={{
                    color: '#666',
                    fontSize: '14px'
                }}>
                    © {new Date().getFullYear()} Blink - by LinzaApps
                </p>
            </div>
        </div>
    );
};

export default Legal;
