require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');

// User schema (simplified version)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: 'user' },
    profile: {
        firstName: String,
        lastName: String,
        phone: String,
        address: String
    },
    accountStatus: { type: String, default: 'active' },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkAndSync() {
    try {
        const targetEmail = 'ahkr1900@gmail.com';
        
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
        
        // Check MongoDB
        console.log('\n=== CHECKING MONGODB ==>');
        const mongoUser = await User.findOne({ email: targetEmail });
        
        if (mongoUser) {
            console.log('✅ User found in MongoDB:', {
                id: mongoUser._id,
                email: mongoUser.email,
                firstName: mongoUser.profile?.firstName,
                lastName: mongoUser.profile?.lastName,
                emailVerified: mongoUser.emailVerified,
                accountStatus: mongoUser.accountStatus,
                createdAt: mongoUser.createdAt
            });
        } else {
            console.log('❌ User NOT found in MongoDB');
        }
        
        // Initialize Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Get user from Supabase Auth
        console.log('\n=== SYNCING TO USER_PROFILES ==>');
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching users from Auth:', authError);
            return;
        }
        
        const authUser = users.find(user => user.email === targetEmail);
        
        if (!authUser) {
            console.log('❌ User not found in Supabase Auth');
            return;
        }
        
        // Check if already exists in user_profiles
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', targetEmail)
            .single();
            
        if (existingProfile) {
            console.log('✅ User already exists in user_profiles');
            return;
        }
        
        // Create user profile
        const userProfile = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.fullName || 'Ahmad Hakir',
            created_at: authUser.created_at,
            updated_at: new Date().toISOString(),
            is_active: true,
            role: 'user',
            last_login: null,
            email_verified: authUser.email_confirmed_at ? true : false
        };
        
        console.log('Creating user profile in user_profiles table...');
        
        const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([userProfile])
            .select();
            
        if (insertError) {
            console.error('❌ Error creating user profile:', insertError);
        } else {
            console.log('✅ Successfully created user profile:', newProfile[0]);
        }
        
        await mongoose.disconnect();
        
    } catch (err) {
        console.error('Script error:', err);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

checkAndSync();