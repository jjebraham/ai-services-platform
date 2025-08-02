# Supabase Configuration Guide

This guide explains how to save your Supabase credentials in the `.env` file so you don't have to enter them every time you restart the server.

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

Run the interactive setup script:

```bash
npm run setup:supabase
```

This script will:
1. Prompt you for your Supabase credentials
2. Automatically update your `.env` file
3. Validate your inputs

### Option 2: Manual Setup

1. **Get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** > **API**
   - Copy the following:
     - **Project URL** (e.g., `https://your-project.supabase.co`)
     - **Anon/Public Key** (starts with `eyJ...`)
     - **Service Role Key** (starts with `eyJ...`) - Optional but recommended

2. **Update your `.env` file:**
   
   Open the `.env` file and replace the placeholder values:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart your server:**
   
   ```bash
   npm run start:supabase
   ```

## Running the Server

### Development Mode
```bash
npm run dev:supabase
```

### Production Mode
```bash
npm run start:supabase
```

## How It Works

1. **Environment Variables**: The server automatically reads Supabase credentials from environment variables on startup
2. **Automatic Initialization**: If valid credentials are found, Supabase is automatically configured
3. **Fallback**: If no credentials are found, the server runs with a fallback database and shows a warning
4. **Admin Panel**: You can still use the admin panel at `http://localhost:5000` to configure Supabase manually

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | No (but recommended) |

## Troubleshooting

### "Invalid URL" Error
- Make sure your `SUPABASE_URL` is a valid Supabase project URL
- It should look like: `https://your-project.supabase.co`

### "Supabase not configured" Message
- Check that your `.env` file has the correct credentials
- Make sure there are no extra spaces or quotes around the values
- Restart the server after updating the `.env` file

### Port Already in Use
If port 5000 is already in use, you can specify a different port:

```bash
PORT=5001 npm run start:supabase
```

## Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file is already in `.gitignore`
- Use the service role key only for administrative operations
- In production, use environment variables provided by your hosting platform

## Next Steps

After configuring Supabase:

1. **Create Database Tables**: Use the admin panel to initialize your database tables
2. **Test Registration**: Try registering a new user to verify everything works
3. **Set Up Authentication**: Configure your authentication flows

For more help, visit the [Supabase Documentation](https://supabase.com/docs).