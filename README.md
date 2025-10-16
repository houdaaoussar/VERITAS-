# Co-Lab VERITAS™ Sustainability Management Platform

A comprehensive carbon accounting and sustainability management platform built with Node.js, PostgreSQL, and React.

## 🌟 Features

### Core Functionality
- **Carbon Accounting Engine**: Deterministic emissions calculations for Scope 1, 2, and 3
- **Data Management**: Upload, validate, and process activity data from CSV/Excel files
- **Reporting & Analytics**: Comprehensive dashboards and CSRD/ESRS E1 compliance reports
- **Project Tracking**: Monitor sustainability initiatives and variance analysis
- **Multi-tenant Architecture**: Secure customer isolation with role-based access control

### Technical Highlights
- **Backend**: Node.js with TypeScript, Express.js, Prisma ORM
- **Database**: PostgreSQL with comprehensive audit logging
- **Frontend**: React with TypeScript, Tailwind CSS, React Query
- **Authentication**: JWT-based with role-based permissions (Admin, Editor, Viewer)
- **Security**: CORS, rate limiting, input validation, tenant scoping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HoudaProject
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Seed with demo data
   npx ts-node scripts/seed.ts
   ```

6. **Start the application**
   ```bash
   # Start backend (terminal 1)
   npm run dev
   
   # Start frontend (terminal 2)
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | password123 |
| Editor | editor@acme.com | password123 |
| Viewer | viewer@acme.com | password123 |

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Data Management
- `GET /api/activities` - List activities with filtering
- `POST /api/activities` - Create new activity
- `POST /api/activities/bulk` - Bulk create activities
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### File Upload & Processing
- `POST /api/uploads` - Upload CSV/Excel file
- `POST /api/uploads/:id/parse` - Parse uploaded file
- `POST /api/uploads/:id/import` - Import activities from file
- `GET /api/uploads/history` - Get upload history

### Calculations
- `POST /api/calculations/run` - Start emissions calculation
- `GET /api/calculations/runs` - List calculation runs
- `GET /api/calculations/:id/results` - Get calculation results
- `GET /api/calculations/:id/export` - Export results as CSV

### Reporting
- `GET /api/reporting/overview` - Dashboard overview data
- `GET /api/reporting/progress` - Emissions trends over time
- `GET /api/reporting/csrd` - CSRD/ESRS E1 compliance export
- `GET /api/reporting/export` - Export detailed emissions data

### Projects & Initiatives
- `GET /api/projects` - List sustainability projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Project statistics

### Sites Management
- `GET /api/sites` - List customer sites
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site

## 🏗️ Architecture

### Backend Structure
```
src/
├── middleware/          # Authentication, error handling, validation
├── routes/             # API route handlers
├── services/           # Business logic (calculation engine, emission factors)
├── utils/              # Utilities (logger, validation schemas)
└── server.ts           # Express server setup
```

### Frontend Structure
```
frontend/src/
├── components/         # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── pages/             # Application pages
├── services/          # API client and data fetching
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

### Database Schema
- **Customers**: Multi-tenant customer data
- **Users**: Authentication and role management
- **Sites**: Physical locations and facilities
- **Activities**: Emissions activity data
- **EmissionFactors**: Carbon accounting factors
- **CalcRuns**: Calculation execution tracking
- **EmissionResults**: Calculated emissions data
- **Projects**: Sustainability initiatives
- **AuditLogs**: Comprehensive audit trail

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/veritas"

# JWT Authentication
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_DIR="./logs"
```

## 📈 Emission Factors

The platform includes comprehensive emission factors from authoritative sources:

- **DEFRA 2025**: UK government emission factors
- **IPCC Guidelines**: International standards
- **Geographic Coverage**: UK, EU, Global factors
- **Activity Types**: 
  - Scope 1: Natural gas, diesel, gasoline combustion
  - Scope 2: Electricity consumption (grid average)
  - Scope 3: Business travel, waste disposal, purchased goods

## 🛡️ Security Features

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Tenant Isolation**: Strict customer data separation
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse protection
- **Audit Logging**: Complete activity tracking
- **CORS Protection**: Cross-origin request security

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Build backend
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Seed initial data
5. Deploy application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📋 Compliance & Standards

- **CSRD (Corporate Sustainability Reporting Directive)**: Full compliance support
- **ESRS E1**: Climate change reporting standards
- **GHG Protocol**: Scope 1, 2, 3 emissions methodology
- **ISO 14064**: Greenhouse gas accounting standards
- **GDPR**: Data protection compliance
- **ISO 27001**: Information security management

## 🔄 Data Flow

1. **Data Upload**: CSV/Excel files uploaded and validated
2. **Processing**: Activity data parsed and stored
3. **Calculation**: Emissions calculated using appropriate factors
4. **Reporting**: Results aggregated and presented in dashboards
5. **Export**: Data exported in various formats (CSV, JSON, CSRD)

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 📄 License

This project is proprietary software developed for Co-Lab VERITAS™.

---

**Co-Lab VERITAS™** - Empowering sustainable business decisions through accurate carbon accounting and comprehensive sustainability management.
