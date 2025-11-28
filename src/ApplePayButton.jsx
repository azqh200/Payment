import React, { useState, useEffect } from 'react';
import {
    ApplePayButton,
    ThemeMode,
    SupportedNetworks,
    Scope,
    Environment,
    Locale,
    ButtonType,
    Edges
} from '@tap-payments/apple-pay-button';

const TapApplePayButton = () => {
    const [applePayAvailable, setApplePayAvailable] = useState(null);

    useEffect(() => {
        // Check if Apple Pay is available
        if (window.ApplePaySession) {
            const available = ApplePaySession.canMakePayments();
            setApplePayAvailable(available);
            console.log('Apple Pay Available:', available);
        } else {
            setApplePayAvailable(false);
            console.log('ApplePaySession not found');
        }
    }, []);

    const handleSuccess = async (token) => {
        console.log('✅ Apple Pay Token received:', token);

        try {
            // Send token to backend to create charge
            const response = await fetch('/api/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token.id,
                    amount: 1,
                    currency: 'SAR'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Apple Pay Charge successful:', result.charge);
                alert('Payment successful! Charge ID: ' + result.charge.id);
            } else {
                console.error('❌ Charge failed:', result.error);
                alert('Payment failed: ' + JSON.stringify(result.error));
            }
        } catch (error) {
            console.error('❌ Error processing Apple Pay payment:', error);
            alert('Error processing payment: ' + error.message);
        }
    };

    const handleError = (err) => {
        console.error('❌ Apple Pay Error:', err);
    };

    const handleCancel = () => {
        console.log('❌ Apple Pay Cancelled');
    };

    return (
        <div style={{
            marginTop: '20px',
            padding: '20px',
            border: '2px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3 style={{ marginBottom: '10px' }}>Or pay with Apple Pay:</h3>

            {applePayAvailable === false && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    marginBottom: '10px'
                }}>
                    <p style={{ margin: 0, color: '#856404' }}>
                        ⚠️ Apple Pay is not available on this device/browser.
                        <br />
                        <small>Apple Pay requires Safari on macOS/iOS with cards in Wallet.</small>
                    </p>
                </div>
            )}

            {applePayAvailable === true && (
                <p style={{ fontSize: '12px', color: '#28a745', marginBottom: '10px' }}>
                    ✅ Apple Pay is available on this device
                </p>
            )}

            <ApplePayButton
                publicKey={'pk_live_68nPeWOCI0h3lNVMQAxbDYKE'}
                environment={Environment.Production}
                debug
                merchant={{
                    domain: 'bash.website',
                    id: '58473337'
                }}
                transaction={{
                    amount: '1',
                    currency: 'SAR'
                }}
                scope={Scope.TapToken}
                acceptance={{
                    supportedBrands: [
                        SupportedNetworks.Mada,
                        SupportedNetworks.Visa,
                        SupportedNetworks.MasterCard
                    ],
                    supportedCardsWithAuthentications: ['3DS']
                }}
                customer={{
                    id: '',
                    name: [{
                        lang: Locale.EN,
                        first: 'Test',
                        last: 'User',
                        middle: 'Test'
                    }],
                    contact: {
                        email: 'test@test.com',
                        phone: {
                            countryCode: '965',
                            number: '50000000'
                        }
                    }
                }}
                interface={{
                    locale: Locale.EN,
                    theme: ThemeMode.DARK,
                    type: ButtonType.BUY,
                    edges: Edges.CURVED
                }}
                onCancel={handleCancel}
                onError={handleError}
                onSuccess={handleSuccess}
                onReady={() => {
                    console.log('✅ Apple Pay Button Ready');
                    setApplePayAvailable(true);
                }}
                onClick={() => console.log('🔘 Apple Pay Button Clicked')}
            />
        </div>
    );
};

export default TapApplePayButton;
