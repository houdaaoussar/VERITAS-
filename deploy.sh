#!/bin/bash

# 🚀 Automated Deployment Script for HoudaProject
# This script handles the complete deployment process

set -e  # Exit on error

echo "=================================="
echo "🚀 HoudaProject Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node version
echo -e "${BLUE}📋 Checking Node.js version...${NC}"
NODE_VERSION=$(node --version)
echo "Node version: $NODE_VERSION"
if [[ ! "$NODE_VERSION" =~ ^v(18|19|20|21) ]]; then
    echo -e "${RED}❌ Node.js version 18+ required${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK${NC}"
echo ""

# Step 2: Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
npm ci --prefer-offline
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 3: Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 4: Build backend
echo -e "${BLUE}🏗️  Building backend...${NC}"
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Step 5: Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm ci --prefer-offline
cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 6: Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 7: Run database migrations (optional, comment out if not needed)
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
if [ -n "$DATABASE_URL" ]; then
    npx prisma migrate deploy
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${RED}⚠️  DATABASE_URL not set, skipping migrations${NC}"
fi
echo ""

# Step 8: Summary
echo "=================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "📁 Backend build: ./dist"
echo "📁 Frontend build: ./frontend/dist"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy backend to your server (EC2, ECS, etc.)"
echo "  2. Deploy frontend to Amplify or S3"
echo "  3. Set environment variables"
echo "  4. Test the deployment"
echo ""
echo "=================================="
