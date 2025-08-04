#!/usr/bin/env node

// Test script to verify admin panel functionality
const http = require('http');

const API_BASE = 'http://localhost:5000';
const ADMIN_KEY = 'admin123';

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const requestOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': ADMIN_KEY,
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function testAdminPanel() {
    console.log('🧪 Testing Admin Panel Functionality...\n');

    try {
        // Test 1: Basic auth status (should work without admin key)
        console.log('1. Testing basic auth status...');
        const authStatus = await makeRequest('/api/auth/status', { headers: {} });
        console.log(`   Status: ${authStatus.status}`);
        console.log(`   Response: ${JSON.stringify(authStatus.data, null, 2)}\n`);

        // Test 2: Admin status with admin key
        console.log('2. Testing admin status with admin key...');
        const adminStatus = await makeRequest('/api/admin/supabase/status');
        console.log(`   Status: ${adminStatus.status}`);
        console.log(`   Response: ${JSON.stringify(adminStatus.data, null, 2)}\n`);

        // Test 3: Admin status without admin key (should fail)
        console.log('3. Testing admin status without admin key (should fail)...');
        const noKeyStatus = await makeRequest('/api/admin/supabase/status', { headers: {} });
        console.log(`   Status: ${noKeyStatus.status}`);
        console.log(`   Response: ${JSON.stringify(noKeyStatus.data, null, 2)}\n`);

        // Test 4: Admin users endpoint
        console.log('4. Testing admin users endpoint...');
        const usersStatus = await makeRequest('/api/admin/users');
        console.log(`   Status: ${usersStatus.status}`);
        console.log(`   Response: ${JSON.stringify(usersStatus.data, null, 2)}\n`);

        console.log('✅ Admin panel tests completed!');
        console.log('\n📋 Summary:');
        console.log('- Auth status should return 200');
        console.log('- Admin status with key should return 200 or 500 (if Supabase not configured)');
        console.log('- Admin status without key should return 403');
        console.log('- Admin users with key should return 200 or 400 (if database not configured)');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running on port 5000');
        console.log('   Run: npm start or node server.js');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    testAdminPanel();
}

module.exports = { testAdminPanel };

