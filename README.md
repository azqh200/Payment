# Tap Payment Demo

Integration of Tap Payments SDK with React for secure card payments and Apple Pay.

## Features

- 💳 **Card Payments**: Embedded card form using Tap Card SDK Web v2
- 🔐 **3D Secure**: Popup modal for 3DS authentication
- 🍎 **Apple Pay**: Apple Pay button integration (requires whitelisting)
- 🔄 **Automated Polling**: Auto-detection of payment completion
- 🧪 **Test Mode**: Configured for sandbox testing

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Payment Provider**: Tap Payments
- **SDKs**: 
  - @tap-payments/apple-pay-button
  - Tap Card SDK Web v2

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

Start both frontend and backend:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

The app will be available at `http://localhost:5173`

## Configuration

### Test Mode (Current)

- **Public Key**: `pk_test_X93dkNK0gAGHB7yerPlp6nVE`
- **Secret Key**: (Set via environment variable `TAP_SECRET_KEY`)
- **Merchant ID**: `58473337`
- **Amount**: 1 SAR

### Test Cards

- **Visa**: 4111 1111 1111 1111
- **Mastercard (3DS)**: 5123 4500 0000 0008
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

## Project Structure

```
tap-payment-demo/
├── src/
│   ├── PaymentForm.jsx    # Card payment form component
│   ├── ApplePayButton.jsx # Apple Pay button component
│   ├── TapAuthModal.jsx   # 3DS authentication modal
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server.js              # Express backend server
├── index.html             # HTML with Tap SDK script
└── package.json           # Dependencies
```

## API Endpoints

### Backend (Port 3001)

- `POST /api/charge` - Create a charge with token
- `GET /api/charge/:id` - Get charge status (for polling)
- `GET /api/health` - Health check

## Features in Detail

### Card Payments
- Embedded form using Tap Card SDK Web v2
- Secure tokenization (PCI compliant)
- Support for Visa, Mastercard, Mada, AMEX

### 3D Secure
- Opens in popup modal (not full page redirect)
- Auto-polling for payment completion
- Closes automatically after authentication

### Apple Pay
- Only appears on compatible devices (Safari, Chrome on macOS/iOS)
- Requires cards in Apple Wallet
- Domain whitelisting required for production

## Switching to Live Mode

1. Update public key in `src/PaymentForm.jsx` and `src/ApplePayButton.jsx`
2. Update secret key in `server.js`
3. Contact Tap to whitelist your production domain

## License

MIT
