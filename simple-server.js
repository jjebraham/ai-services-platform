const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes first
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        server: 'AI Services Platform'
    });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        message: 'AI Services Platform API is running!', 
        status: 'success',
        version: '1.0.0'
    });
});

// Static files middleware after API routes
app.use(express.static('public'));

// Root route fallback
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(' AI Services Platform running on port ' + PORT);
    console.log(' Server URL: http://34.169.105.176:' + PORT);
    console.log(' API Health: http://34.169.105.176:' + PORT + '/api/health');
});
