const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.json({ 
        message: 'AI Services Platform is running!', 
        status: 'success',
        timestamp: new Date().toISOString(),
        server: 'selenium.us-west1-a.t-slate-312420'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(' AI Services Platform test server running on port ' + PORT);
    console.log(' Server URL: http://selenium.us-west1-a.t-slate-312420:' + PORT);
});
