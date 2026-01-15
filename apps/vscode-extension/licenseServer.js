const express = require('express');
const app = express();
const port = 3000;

// Mock license database
const validLicenses = {
    'PRO-1234-5678-9012': { valid: true, expires: '2026-12-31' },
    'PRO-ABCD-EFGH-IJKL': { valid: true, expires: '2027-06-30' }
};

app.use(express.json());

// License validation endpoint
app.get('/validate', (req, res) => {
    const licenseKey = req.query.key;
    
    if (!licenseKey) {
        return res.status(400).json({ valid: false, error: 'License key required' });
    }
    
    const license = validLicenses[licenseKey];
    
    if (license) {
        res.json(license);
    } else {
        res.json({ valid: false, error: 'Invalid license key' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'License server is running' });
});

console.log(`License server running on http://localhost:${port}`);
app.listen(port);