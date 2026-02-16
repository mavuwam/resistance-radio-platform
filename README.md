# Resistance Radio Platform

Zimbabwe Voice - A dual-purpose platform combining advocacy and community radio to empower citizens in defending democracy and constitutional term limits.

## 🎯 Mission

Empower Zimbabwean citizens to organize, mobilize, and make their voices heard on critical issues affecting democracy, with a focus on protecting constitutional term limits and democratic freedoms.

## ✨ Features

- **Advocacy Platform**: Create and sign petitions defending democracy and good governance
- **Community Radio**: On-demand shows, episodes, and live streaming
- **News & Articles**: Community-driven content and journalism
- **Events Management**: Organize and promote community events
- **Resource Library**: Civic education materials and constitutional guides
- **Admin Dashboard**: Content management system for administrators

## 🏗️ Architecture

**Monorepo** with separate frontend and backend applications:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Deployment**: AWS (S3 + CloudFront + EC2 + RDS)
- **CI/CD**: AWS CodePipeline + CodeBuild + CodeDeploy

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS Account
- GitHub Account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run database migrations
npm run migrate --workspace=backend

# Start development servers
npm run dev:backend   # Backend on port 5000
npm run dev:frontend  # Frontend on port 5173
```

### CI/CD Setup

Set up automated deployments with one command:

```bash
./setup-cicd.sh
```

See [CICD-QUICK-START.md](CICD-QUICK-START.md) for detailed instructions.

## 📚 Documentation

- [CI/CD Quick Start](CICD-QUICK-START.md) - Set up automated deployments
- [CodePipeline Setup](CODEPIPELINE-SETUP.md) - Detailed CI/CD documentation
- [API Documentation](API-DOCUMENTATION.md) - Backend API reference
- [Deployment Guide](DEPLOYMENT.md) - Manual deployment instructions
- [Content Management](CONTENT-MANAGEMENT-GUIDE.md) - Admin guide

## 🛠️ Technology Stack

### Backend
- Node.js 18+ with Express.js
- TypeScript (strict mode)
- PostgreSQL 14+ with pg driver
- JWT authentication with bcrypt
- AWS S3 for file storage
- Winston for logging
- Sentry for error tracking

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router v6
- Axios for HTTP requests
- HLS.js for audio streaming
- React Helmet Async for SEO

### Infrastructure
- AWS S3 + CloudFront (Frontend)
- AWS EC2 (Backend)
- AWS RDS PostgreSQL (Database)
- AWS CodePipeline (CI/CD)
- Nginx with Let's Encrypt SSL

## 🌐 Live URLs

- **Website**: https://resistanceradiostation.org
- **API**: https://api.resistanceradiostation.org
- **Admin**: https://resistanceradiostation.org/admin

## 📦 Project Structure

```
resistance-radio-platform/
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # External services
│   │   └── db/          # Database migrations
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── services/    # API client
│   └── package.json
├── aws/                 # AWS deployment scripts
├── scripts/             # CodeDeploy scripts
└── package.json         # Root workspace config
```

## 🔧 Development

### Available Commands

```bash
# Development
npm run dev:backend          # Start backend dev server
npm run dev:frontend         # Start frontend dev server

# Building
npm run build                # Build all workspaces
npm run build --workspace=backend
npm run build --workspace=frontend

# Testing
npm test                     # Run all tests
npm run test:backend
npm run test:frontend

# Linting
npm run lint                 # Lint all workspaces

# Database
npm run migrate --workspace=backend
npm run seed --workspace=backend
```

### Environment Variables

#### Backend (.env)
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=resistance_radio_dev
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Automated (Recommended)

Push to `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Pipeline stages:
1. **Source**: Pull from GitHub
2. **Build**: Build frontend & backend (parallel)
3. **Deploy**: Deploy to S3/CloudFront & EC2

### Manual

See [DEPLOYMENT.md](DEPLOYMENT.md) for manual deployment instructions.

## 🔐 Security

- HTTPS enforced on all endpoints
- JWT-based authentication
- CORS configured for production domains
- Rate limiting on API endpoints
- Input sanitization and validation
- Helmet.js security headers
- SQL injection prevention
- XSS protection

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Logging**: Winston with CloudWatch
- **Analytics**: Custom analytics service
- **Health Checks**: `/api/health` endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for the people of Zimbabwe

## 🆘 Support

For issues or questions:
- Check documentation in the `/docs` folder
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an issue on GitHub

---

**Empowering voices. Defending democracy. Building community.**
