import React, { useEffect, useState, useRef } from 'react';
import TapAuthModal from './TapAuthModal';

const PaymentForm = () => {
    const [chargeStatus, setChargeStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authUrl, setAuthUrl] = useState(null);
    const pollTimerRef = useRef(null);

    // Function to poll charge status
    const pollChargeStatus = async (chargeId) => {
        try {
            const response = await fetch(`/api/charge/${chargeId}`);
            const result = await response.json();

            if (result.success) {
                console.log('Polling status:', result.charge.status);

                if (result.charge.status === 'CAPTURED') {
                    // Payment complete!
                    clearInterval(pollTimerRef.current);
                    setAuthUrl(null); // Close modal
                    setChargeStatus({
                        success: true,
                        message: 'Payment successful!',
                        chargeId: result.charge.id,
                        amount: result.charge.amount,
                        currency: result.charge.currency
                    });
                } else if (result.charge.status === 'FAILED' || result.charge.status === 'DECLINED') {
                    // Payment failed
                    clearInterval(pollTimerRef.current);
                    setAuthUrl(null); // Close modal
                    setChargeStatus({
                        success: false,
                        message: 'Payment failed',
                        error: { message: result.charge.response.message }
                    });
                }
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    };

    const handleTokenSuccess = async (data) => {
        console.log('✅ Token received:', data);
        setLoading(true);
        setChargeStatus(null);

        try {
            // Send token to backend to create charge
            const response = await fetch('/api/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: data.id,
                    amount: 1,
                    currency: 'SAR'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Charge response:', result.charge);

                // Check if 3D Secure authentication is required
                if (result.charge.transaction && result.charge.transaction.url) {
                    console.log('🔐 3D Secure required, opening modal:', result.charge.transaction.url);
                    setAuthUrl(result.charge.transaction.url);
                    setChargeStatus({
                        success: true,
                        message: 'Please complete 3D Secure authentication...',
                        redirecting: true
                    });

                    // Start polling for status
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    pollTimerRef.current = setInterval(() => {
                        pollChargeStatus(result.charge.id);
                    }, 2000); // Poll every 2 seconds

                } else {
                    // No 3DS required, charge completed
                    console.log('✅ Charge successful:', result.charge);
                    setChargeStatus({
                        success: true,
                        message: 'Payment successful!',
                        chargeId: result.charge.id,
                        amount: result.charge.amount,
                        currency: result.charge.currency
                    });
                }
            } else {
                console.error('❌ Charge failed:', result.error);
                setChargeStatus({
                    success: false,
                    message: 'Payment failed',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('❌ Error creating charge:', error);
            setChargeStatus({
                success: false,
                message: 'Error processing payment',
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const initTap = () => {
            if (!window.CardSDK) {
                console.log("Waiting for Tap Card SDK...");
                setTimeout(initTap, 500);
                return;
            }

            const { renderTapCard, Theme, Currencies, Direction, Edges, Locale } = window.CardSDK;

            const { unmount } = renderTapCard('card-sdk-id', {
                publicKey: 'pk_live_68nPeWOCI0h3lNVMQAxbDYKE',
                merchant: {
                    id: '58473337'
                },
                transaction: {
                    amount: 1,
                    currency: 'SAR'
                },
                customer: {
                    name: [
                        { lang: 'en', first: 'Test', last: 'User', middle: '' }
                    ],
                    contact: {
                        email: 'test@test.com',
                        phone: {
                            countryCode: '965',
                            number: '50000000'
                        }
                    }
                },
                acceptance: {
                    supportedBrands: ['AMERICAN_EXPRESS', 'VISA', 'MASTERCARD', 'MADA'],
                    supportedCards: "ALL"
                },
                fields: {
                    cardHolder: true
                },
                addons: {
                    displayPaymentBrands: true,
                    loader: true,
                    saveCard: true
                },
                interface: {
                    locale: 'en',
                    theme: 'light',
                    edges: 'curved',
                    direction: 'ltr'
                },
                onReady: () => console.log('onReady'),
                onFocus: () => console.log('onFocus'),
                onBinIdentification: (data) => console.log('onBinIdentification', data),
                onValidInput: (data) => console.log('onValidInputChange', data),
                onInvalidInput: (data) => console.log('onInvalidInput', data),
                onChangeSaveCardLater: (isSaveCardSelected) => console.log(isSaveCardSelected, " :onChangeSaveCardLater"),
                onError: (data) => {
                    console.log('onError', data);
                    setChargeStatus({
                        success: false,
                        message: 'SDK Error: ' + (data.errors ? JSON.stringify(data.errors) : 'Unknown error'),
                        error: data
                    });
                },
                onSuccess: handleTokenSuccess
            });
        };

        initTap();
    }, []);

    return (
        <div className="payment-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <TapAuthModal
                url={authUrl}
                onClose={() => {
                    setAuthUrl(null);
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                }}
            />

            <h2>Tap Payments Integration (Embedded)</h2>

            {loading && !authUrl && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #0066cc',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    Processing payment...
                </div>
            )}

            {chargeStatus && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: chargeStatus.success ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${chargeStatus.success ? '#28a745' : '#dc3545'}`,
                    borderRadius: '4px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: chargeStatus.success ? '#155724' : '#721c24' }}>
                        {chargeStatus.redirecting ? '🔐 Authenticating...' : chargeStatus.success ? '✅ Success!' : '❌ Failed'}
                    </h3>
                    <p style={{ margin: '5px 0' }}>{chargeStatus.message}</p>
                    {chargeStatus.redirecting && (
                        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#155724' }}>
                            Please complete authentication in the popup window...
                        </p>
                    )}
                    {chargeStatus.chargeId && (
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            Charge ID: <code>{chargeStatus.chargeId}</code>
                        </p>
                    )}
                    {chargeStatus.amount && (
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            Amount: {chargeStatus.amount} {chargeStatus.currency}
                        </p>
                    )}
                    {chargeStatus.error && (
                        <pre style={{
                            margin: '10px 0 0 0',
                            padding: '10px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(chargeStatus.error, null, 2)}
                        </pre>
                    )}
                </div>
            )}

            <div id="card-sdk-id"></div>

            <button
                onClick={() => window.CardSDK.tokenize()}
                disabled={loading}
                style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
};

export default PaymentForm;
