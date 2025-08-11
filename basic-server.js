const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            server: 'AI Services Platform'
        }));
    } else if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'AI Services Platform API is running!',
            status: 'success',
            version: '1.0.0'
        }));
    } else {
        const html = '<!DOCTYPE html>' +
            '<html lang=" en\>' +
 '<head>' +
 '<meta charset=\UTF-8\>' +
 '<meta name=\viewport\ content=\width=device-width initial-scale=1.0\>' +
 '<title>AI Services Platform</title>' +
 '<script src=\https://cdn.tailwindcss.com\></script>' +
 '</head>' +
 '<body>' +
 '<div id=\root\>' +
 '<div class=\min-h-screen bg-gray-50 flex items-center justify-center\>' +
 '<div class=\text-center\>' +
 '<h1 class=\text-4xl font-bold text-gray-900 mb-4\>AI Services Platform</h1>' +
 '<p class=\text-lg text-gray-600 mb-8\>Access Premium AI Tools</p>' +
 '<div class=\space-x-4\>' +
 '<button class=\bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700\>Get Started</button>' +
 '<button class=\border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50\>Learn More</button>' +
 '</div>' +
 '</div>' +
 '</div>' +
 '</div>' +
 '</body>' +
 '</html>';
 
 res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
 res.end(html);
 }
});

server.listen(PORT, '0.0.0.0', () => {
 console.log('AI Services Platform running on port ' + PORT);
 console.log('Server URL: http://34.169.105.176:' + PORT);
 console.log('API Health: http://34.169.105.176:' + PORT + '/api/health');
});
