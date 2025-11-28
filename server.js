import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Tap API credentials - USE ENVIRONMENT VARIABLES
const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY;
const TAP_API_URL = 'https://api.tap.company/v2/charges';

if (!TAP_SECRET_KEY) {
    console.error('⚠️  TAP_SECRET_KEY environment variable not set!');
    console.log('Set it with: export TAP_SECRET_KEY=your_secret_key');
}

// Middleware
app.use(cors());
app.use(express.json());

// Create charge endpoint
app.post('/api/charge', async (req, res) => {
    try {
        const { token, amount, currency } = req.body;

        console.log('Creating charge with token:', token);
        console.log('Request Body:', req.body);

        const payload = {
            amount: amount || 1,
            currency: currency || 'SAR',
            threeDSecure: true, // Enables 3D Secure
            source: {
                id: token
            },
            redirect: {
                url: 'https://www.bash.website'
            },
            customer: {
                first_name: "Test",
                email: "test@test.com"
            },
            description: 'Test charge from Card SDK',
            metadata: {
                udf1: 'test payment'
            }
        };

        console.log('Sending Payload to Tap:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            TAP_API_URL,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${TAP_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Tap API Response:', response.data);

        res.json({
            success: true,
            charge: response.data
        });

    } catch (error) {
        console.error('Charge creation error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data || { message: error.message }
        });
    }
});

// Get charge status endpoint
app.get('/api/charge/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Checking status for charge:', id);

        const response = await axios.get(
            `${TAP_API_URL}/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${TAP_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            charge: response.data
        });

    } catch (error) {
        console.error('Get charge error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data || { message: error.message }
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Tap Payment Server Running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Tap Payment Server running on http://localhost:${PORT} (v2 with customer fix)`);
    console.log(`📝 Charge endpoint: http://localhost:${PORT}/api/charge`);
});
