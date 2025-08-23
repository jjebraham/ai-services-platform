require('dotenv').config();
const axios = require('axios');

async function testLogin() {
    try {
        const targetEmail = 'ahkr1900@gmail.com';
        const testPassword = 'testpassword123'; // This won't work since user was registered via Supabase
        
        console.log('=== TESTING LOGIN PROCESS ==>');
        console.log(`Attempting to login with: ${targetEmail}`);
        
        // Test login endpoint
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: targetEmail,
            password: testPassword
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Login successful:', loginResponse.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed with response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            
            // This is expected since the user was registered via Supabase Auth
            // and doesn't have a traditional password
            if (error.response.status === 401 || error.response.status === 400) {
                console.log('\n📝 NOTE: This is expected behavior.');
                console.log('The user was registered via Supabase Auth (email confirmation)');
                console.log('and does not have a traditional password set.');
                console.log('Login would require either:');
                console.log('1. Password reset to set a password');
                console.log('2. Magic link authentication');
                console.log('3. OAuth login (Google, etc.)');
            }
        } else if (error.request) {
            console.log('❌ No response received:', error.message);
        } else {
            console.log('❌ Request setup error:', error.message);
        }
    }
}

testLogin();