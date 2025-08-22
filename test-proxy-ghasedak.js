const axios = require('axios');
const https = require('https');

// Test proxy connection to Ghasedak API with different configurations
async function testProxyWithHTTPS() {
    const proxyConfig = {
        host: 'p.webshare.io',
        port: 80,
        auth: {
            username: 'jjebraham-1',
            password: 'Amir1234'
        }
    };

    try {
        console.log('Testing proxy connection with HTTPS (original)...');
        
        const response = await axios({
            method: 'GET',
            url: 'https://api.ghasedak.me/v2/account/balance',
            headers: {
                'apikey': process.env.GHASEDAK_API_KEY || 'test-key'
            },
            proxy: proxyConfig,
            timeout: 10000,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });

        console.log('✅ HTTPS proxy connection successful!');
        console.log('Response status:', response.status);
        
    } catch (error) {
        console.log('❌ HTTPS proxy connection failed:');
        console.log('- Error:', error.message);
        console.log('- Code:', error.code);
    }
}

async function testProxyWithHTTP() {
    const proxyConfig = {
        host: 'p.webshare.io',
        port: 80,
        auth: {
            username: 'jjebraham-1',
            password: 'Amir1234'
        }
    };

    try {
        console.log('\nTesting proxy connection with HTTP...');
        
        const response = await axios({
            method: 'GET',
            url: 'http://httpbin.org/ip',
            proxy: proxyConfig,
            timeout: 10000
        });

        console.log('✅ HTTP proxy connection successful!');
        console.log('Response status:', response.status);
        console.log('Your IP through proxy:', response.data.origin);
        
    } catch (error) {
        console.log('❌ HTTP proxy connection failed:');
        console.log('- Error:', error.message);
        console.log('- Code:', error.code);
    }
}

async function testDirectConnection() {
    try {
        console.log('\nTesting direct connection (no proxy)...');
        
        const response = await axios({
            method: 'GET',
            url: 'http://httpbin.org/ip',
            timeout: 10000
        });

        console.log('✅ Direct connection successful!');
        console.log('Response status:', response.status);
        console.log('Your direct IP:', response.data.origin);
        
    } catch (error) {
        console.log('❌ Direct connection failed:');
        console.log('- Error:', error.message);
        console.log('- Code:', error.code);
    }
}

async function testProxyCredentials() {
    console.log('\nTesting different proxy credentials...');
    
    for (let i = 1; i <= 3; i++) {
        const proxyConfig = {
            host: 'p.webshare.io',
            port: 80,
            auth: {
                username: `jjebraham-${i}`,
                password: 'Amir1234'
            }
        };

        try {
            console.log(`Testing proxy ${i}...`);
            
            const response = await axios({
                method: 'GET',
                url: 'http://httpbin.org/ip',
                proxy: proxyConfig,
                timeout: 5000
            });

            console.log(`✅ Proxy ${i} working! IP:`, response.data.origin);
            break;
            
        } catch (error) {
            console.log(`❌ Proxy ${i} failed:`, error.code || error.message);
        }
    }
}

async function main() {
    console.log('=== Comprehensive Proxy Test ===\n');
    
    await testDirectConnection();
    await testProxyWithHTTP();
    await testProxyCredentials();
    await testProxyWithHTTPS();
    
    console.log('\n=== Test Complete ===');
}

main().catch(console.error);