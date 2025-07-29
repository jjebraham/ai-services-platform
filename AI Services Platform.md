# AI Services Platform

A full-stack web application that allows users to purchase access to third-party AI services through a unified platform. Built with React (frontend) and Node.js/Express (backend).

## 🚀 Features

### User Features
- **Authentication System**
  - Email/password registration and login
  - Google OAuth integration
  - Password reset via email
  - Email verification

- **KYC Workflow**
  - Multi-step verification process
  - Personal information collection
  - ID selfie upload
  - Proof of address upload
  - Admin review and approval system

- **AI Services Catalog**
  - Dynamic list of third-party AI services
  - Service details with pricing and descriptions
  - Real-time availability status
  - Category-based organization

- **Order Management**
  - Service selection and quantity specification
  - Real-time USD to Toman currency conversion
  - Stripe and PayPal payment integration
  - Order history and tracking

- **Support System**
  - Ticket creation with categories
  - Real-time chat support
  - Ticket history and status tracking

- **Notifications**
  - Email notifications for order updates
  - In-app notification system
  - Admin alerts for important events

### Admin Features
- **Dashboard**
  - Real-time analytics and metrics
  - Quick action buttons
  - Recent activity overview

- **User Management**
  - User account overview
  - KYC review and approval
  - Account suspension/activation
  - Bulk user operations

- **Order Management**
  - Order processing and tracking
  - Refund and cancellation handling
  - Revenue analytics

- **Service Management**
  - Add/edit/remove AI services
  - Pricing configuration
  - Service availability control

- **Settings**
  - Exchange rate API configuration
  - Payment gateway setup
  - Email service configuration
  - Platform settings

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Stripe & PayPal** - Payment processing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd ai-services-platform
\`\`\`

### 2. Automated Deployment
Use the provided deployment script for easy setup:

\`\`\`bash
# Development deployment (starts both frontend and backend)
./deploy.sh deploy

# Production deployment (creates deployment files)
./deploy.sh deploy production

# Stop development servers
./deploy.sh stop
\`\`\`

### 3. Manual Setup

#### Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
\`\`\`

#### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## ⚙️ Configuration

### Backend Environment Variables (.env)
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-services-platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your-api-key
EXCHANGE_RATE_PROVIDER=fixer

# Server
PORT=5000
NODE_ENV=development
\`\`\`

### Frontend Environment Variables (.env)
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

## 📁 Project Structure

\`\`\`
ai-services-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── AIService.js
│   │   ├── Order.js
│   │   ├── SupportTicket.js
│   │   ├── Notification.js
│   │   ├── Settings.js
│   │   └── CMSPage.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── services.js
│   │   ├── orders.js
│   │   ├── tickets.js
│   │   ├── notifications.js
│   │   ├── admin.js
│   │   ├── cms.js
│   │   ├── upload.js
│   │   └── kyc.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── email.js
│   │   ├── exchangeRate.js
│   │   └── initialize.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── ForgotPasswordPage.jsx
│   │   │   │   ├── ResetPasswordPage.jsx
│   │   │   │   └── VerifyEmailPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminServices.jsx
│   │   │   │   └── AdminSettings.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── OrderPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── SupportPage.jsx
│   │   │   └── KYCPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
├── deploy.sh
├── README.md
└── .gitignore
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/forgot-password\` - Password reset request
- \`POST /api/auth/reset-password\` - Password reset
- \`GET /api/auth/verify-email\` - Email verification
- \`GET /api/auth/me\` - Get current user

### Services
- \`GET /api/services\` - Get all services
- \`GET /api/services/:id\` - Get service by ID
- \`POST /api/admin/services\` - Create service (Admin)
- \`PUT /api/admin/services/:id\` - Update service (Admin)
- \`DELETE /api/admin/services/:id\` - Delete service (Admin)

### Orders
- \`GET /api/orders\` - Get user orders
- \`POST /api/orders\` - Create new order
- \`GET /api/orders/:id\` - Get order details
- \`GET /api/admin/orders\` - Get all orders (Admin)

### Support
- \`GET /api/tickets\` - Get user tickets
- \`POST /api/tickets\` - Create support ticket
- \`GET /api/tickets/:id\` - Get ticket details
- \`POST /api/tickets/:id/reply\` - Reply to ticket

### KYC
- \`POST /api/kyc/submit\` - Submit KYC documents
- \`GET /api/kyc/status\` - Get KYC status
- \`GET /api/admin/kyc\` - Get pending KYC (Admin)
- \`POST /api/admin/kyc/:id/review\` - Review KYC (Admin)

## 🚀 Deployment

### Development
\`\`\`bash
./deploy.sh deploy
\`\`\`

### Production

#### Using the Deployment Script
\`\`\`bash
./deploy.sh deploy production
\`\`\`

#### Manual Production Deployment

1. **Build Frontend**
   \`\`\`bash
   cd frontend
   npm run build
   \`\`\`

2. **Set Environment Variables**
   - Update \`.env\` files with production values
   - Set \`NODE_ENV=production\`

3. **Deploy Backend**
   \`\`\`bash
   # Using PM2
   npm install -g pm2
   cd backend
   pm2 start server.js --name ai-services-backend
   pm2 startup
   pm2 save
   \`\`\`

4. **Deploy Frontend**
   - Serve the \`frontend/dist\` directory with a web server
   - Configure reverse proxy (nginx/Apache) if needed

### Docker Deployment (Optional)

Create \`Dockerfile\` for containerized deployment:

\`\`\`dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd backend
npm test
\`\`\`

### Frontend Testing
\`\`\`bash
cd frontend
npm test
\`\`\`

### Integration Testing
\`\`\`bash
# Start both servers
./deploy.sh deploy

# Run integration tests
npm run test:integration
\`\`\`

## 📝 Usage

### For Users
1. Register an account or login
2. Complete KYC verification if required
3. Browse available AI services
4. Select a service and specify quantity
5. Complete payment through Stripe or PayPal
6. Access purchased services through your dashboard
7. Create support tickets if needed

### For Administrators
1. Login with admin credentials
2. Access admin panel from the header
3. Manage users, orders, and services
4. Review and approve KYC submissions
5. Configure platform settings
6. Monitor analytics and metrics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates and Maintenance

- Regular security updates
- Feature enhancements
- Bug fixes
- Performance optimizations

---

**Note**: This is a comprehensive platform for AI service management. Make sure to configure all environment variables and external services before deploying to production.

