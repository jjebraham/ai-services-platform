# AI Services Platform with Supabase Integration

A complete AI services platform with user authentication, dashboard, and admin panel using Supabase as the database.

## Features

- **User Authentication**: Registration, login, logout with Supabase
- **User Dashboard**: Personalized dashboard for registered users
- **Admin Panel**: Configure Supabase, manage users, view statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Security**: JWT tokens, password hashing, rate limiting

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:3002`

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be ready

### Step 2: Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 3: Configure via Admin Panel

1. Open the application at `http://localhost:3002`
2. Click **Admin** button
3. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. In the admin panel, click **Configure Supabase**
5. Enter your Supabase credentials:
   - **Supabase URL**: Your project URL
   - **Anon Key**: Your anon public key
   - **Service Role Key**: Your service role key
6. Click **Save Configuration**
7. Click **Initialize Database** to create the required tables

## Database Schema

The system automatically creates these tables in Supabase:

### `users` table
- `id` (UUID, primary key)
- `email` (text, unique)
- `password_hash` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `user_profiles` table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users.id)
- `full_name` (text)
- `avatar_url` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/status` - Check authentication status

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/supabase/status` - Check Supabase status
- `POST /api/admin/supabase/configure` - Configure Supabase
- `POST /api/admin/supabase/initialize` - Initialize database
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/stats` - Get system statistics

## Usage

### For Users

1. **Registration**: Click "Get Started" → "Create Account"
2. **Login**: Click "Login" and enter credentials
3. **Dashboard**: Access personalized dashboard after login
4. **Logout**: Use logout button in dashboard

### For Admins

1. **Access**: Click "Admin" button on homepage
2. **Configure**: Set up Supabase connection
3. **Manage**: View and manage users
4. **Monitor**: Check system statistics

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Session management

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 3002) |
| `HOST` | Server host | No (default: 0.0.0.0) |
| `SESSION_SECRET` | Session encryption key | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `ADMIN_EMAIL` | Admin email | Yes |
| `ADMIN_PASSWORD` | Admin password | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes* |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes* |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes* |

*Supabase variables can be set via admin panel

## Troubleshooting

### Common Issues

1. **"Supabase not configured"**
   - Use the admin panel to configure Supabase credentials

2. **"Database connection failed"**
   - Check your Supabase credentials
   - Ensure your Supabase project is active

3. **"Tables not found"**
   - Run "Initialize Database" in admin panel

4. **"Authentication failed"**
   - Check if user exists in database
   - Verify password is correct

### Logs

Check server logs for detailed error messages:

```bash
npm run dev  # Development mode with detailed logs
```

## Development

### File Structure

```
├── server.js                 # Main server file
├── supabase-server.js        # Updated server with Supabase
├── supabase-config.js        # Supabase configuration
├── services/
│   └── auth-service.js       # Authentication service
├── routes/
│   ├── auth-routes.js        # Authentication routes
│   └── admin-routes.js       # Admin routes
├── complete-supabase-app.html # Frontend application
└── package.json              # Dependencies
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## License

MIT License