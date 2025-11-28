import React from 'react';

const TapAuthModal = ({ url, onClose }) => {
    if (!url) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h3 style={{ margin: 0 }}>3D Secure Authentication</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <iframe
                        src={url}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        title="3D Secure Authentication"
                    />
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '10px'
                }}>
                    Please complete the authentication in the window above.
                </p>
            </div>
        </div>
    );
};

export default TapAuthModal;
