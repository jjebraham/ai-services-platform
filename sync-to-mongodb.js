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

async function syncToMongoDB() {
    try {
        const targetEmail = 'ahkr1900@gmail.com';
        
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: targetEmail });
        if (existingUser) {
            console.log('✅ User already exists in MongoDB:', existingUser);
            await mongoose.disconnect();
            return;
        }
        
        // Initialize Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Get user from Supabase Auth
        console.log('Fetching user from Supabase Auth...');
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
        
        console.log('Found user in Supabase Auth:', {
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.user_metadata?.fullName
        });
        
        // Parse full name
        const fullName = authUser.user_metadata?.fullName || 'Ahmad Hakir';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Ahmad';
        const lastName = nameParts.slice(1).join(' ') || 'Hakir';
        
        // Create MongoDB user
        const mongoUser = new User({
            email: authUser.email,
            role: 'user',
            profile: {
                firstName: firstName,
                lastName: lastName
            },
            accountStatus: 'active',
            emailVerified: authUser.email_confirmed_at ? true : false,
            createdAt: new Date(authUser.created_at),
            updatedAt: new Date()
        });
        
        console.log('Creating user in MongoDB...');
        const savedUser = await mongoUser.save();
        
        console.log('✅ Successfully created user in MongoDB:', {
            id: savedUser._id,
            email: savedUser.email,
            firstName: savedUser.profile.firstName,
            lastName: savedUser.profile.lastName,
            emailVerified: savedUser.emailVerified,
            accountStatus: savedUser.accountStatus,
            createdAt: savedUser.createdAt
        });
        
        await mongoose.disconnect();
        
    } catch (err) {
        console.error('Script error:', err);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

syncToMongoDB();