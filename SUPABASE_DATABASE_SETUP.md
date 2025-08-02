# Supabase Database Setup Instructions

## Problem
The admin dashboard is showing a white screen because the Supabase database doesn't have the required tables yet.

## Solution
You need to create the database tables in your Supabase project. Here are two ways to do it:

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Go to your Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SQL Script**
   - Copy the entire content from `create-supabase-tables.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see the following tables:
     - `user_profiles`
     - `orders`
     - `support_tickets`
     - `ai_services`

### Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

## What the Script Creates

The SQL script creates:

1. **Tables**:
   - `user_profiles` - User information extending Supabase Auth
   - `orders` - Order management
   - `support_tickets` - Customer support tickets
   - `ai_services` - Available AI services

2. **Security**:
   - Row Level Security (RLS) policies
   - Proper access controls for users and admins

3. **Sample Data**:
   - Test users (including an admin user)
   - Sample orders and tickets
   - AI services catalog

4. **Triggers**:
   - Automatic user profile creation when users sign up

## After Running the Script

1. **Restart your server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart it
   npm run start:supabase
   ```

2. **Check the admin dashboard**:
   - Go to `http://localhost:5001/admin`
   - You should now see data and statistics

3. **Test the connection**:
   - The dashboard should show real data from Supabase
   - No more white screen or connection errors

## Troubleshooting

### If you get permission errors:
- Make sure you're using the Service Role Key in your `.env` file
- Check that RLS policies are correctly set up

### If tables don't appear:
- Refresh your Supabase dashboard
- Check the SQL Editor for any error messages
- Make sure you ran the entire script

### If data doesn't show:
- Check the browser console for errors
- Verify your `.env` file has correct Supabase credentials
- Restart the server after making changes

## Environment Variables

Make sure your `.env` file has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Next Steps

Once the tables are created and the dashboard is working:

1. **Create an admin user** through the Supabase Auth interface
2. **Customize the data** to match your needs
3. **Set up proper authentication** flows
4. **Configure email templates** in Supabase Auth settings

The admin dashboard should now display:
- ✅ User statistics and management
- ✅ Order tracking and analytics
- ✅ Support ticket management
- ✅ Revenue and performance metrics
- ✅ Real-time data from Supabase