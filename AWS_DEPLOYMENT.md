# AWS Deployment Guide

Complete guide to deploy HoudaProject to AWS.

## Prerequisites

✅ MongoDB Atlas connected (Already done!)
✅ Test user created
✅ Application running locally

---

## Option 1: AWS Elastic Beanstalk (Recommended - Easiest)

### Step 1: Install AWS CLI & EB CLI

```bash
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Verify installation
aws --version

# Install Elastic Beanstalk CLI
pip install awsebcli --upgrade --user

# Verify EB CLI
eb --version
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS credentials
aws configure

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1 (or your preferred region)
# - Default output format: json
```

### Step 3: Prepare Application

Create `.ebignore` file:
```
node_modules/
.env
dev.db
*.log
.git/
uploads/
dist/
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node dist/server-simple.js",
    "build": "tsc",
    "postinstall": "prisma generate"
  }
}
```

### Step 4: Initialize Elastic Beanstalk

```bash
# Initialize EB in your project
eb init

# Select:
# - Region: (choose closest to you)
# - Application name: houdaproject
# - Platform: Node.js
# - Use CodeCommit: No
# - Setup SSH: Yes (optional)
```

### Step 5: Create Environment

```bash
# Create production environment
eb create houdaproject-prod

# This will:
# - Create EC2 instances
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
```

### Step 6: Set Environment Variables

```bash
# Set your environment variables
eb setenv \
  DATABASE_URL="mongodb+srv://houdaaoussar9_db_user:crOMzmXANFmannHr@cluster0.f6pp8zw.mongodb.net/houdaproject?retryWrites=true&w=majority&appName=Cluster0" \
  JWT_SECRET="your-super-secret-jwt-key-change-in-production" \
  JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production" \
  NODE_ENV="production" \
  PORT="8080"
```

### Step 7: Deploy

```bash
# Deploy application
eb deploy

# Open in browser
eb open
```

---

## Option 2: AWS EC2 (Manual Setup)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier) or t2.small
   - Key pair: Create new or select existing
4. Security Group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (3002) - Anywhere
5. Launch instance

### Step 2: Connect to EC2

```bash
# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 3: Install Node.js & Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install git -y

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 4: Deploy Application

```bash
# Clone your repository (or upload files)
git clone <your-repo-url>
cd HoudaProject

# Install dependencies
npm install

# Build application
npm run build

# Generate Prisma client
npx prisma generate
```

### Step 5: Create .env file

```bash
nano .env
```

Paste:
```env
DATABASE_URL="mongodb+srv://houdaaoussar9_db_user:crOMzmXANFmannHr@cluster0.f6pp8zw.mongodb.net/houdaproject?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
NODE_ENV="production"
PORT=3002
```

### Step 6: Start with PM2

```bash
# Start application
pm2 start dist/server-simple.js --name houdaproject

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Step 7: Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/houdaproject
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/houdaproject /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Option 3: AWS ECS/Fargate (Docker Container)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3002

# Start application
CMD ["npm", "start"]
```

### Step 2: Build & Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name houdaproject

# Build Docker image
docker build -t houdaproject .

# Tag image
docker tag houdaproject:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/houdaproject:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/houdaproject:latest
```

### Step 3: Create ECS Cluster & Task

1. Go to ECS Console
2. Create Cluster (Fargate)
3. Create Task Definition
4. Create Service
5. Set environment variables
6. Deploy

---

## Cost Comparison

| Service | Cost (Monthly) | Difficulty |
|---------|---------------|------------|
| **Elastic Beanstalk** | ~$15-30 | ⭐⭐ Easy |
| **EC2 t2.micro** | Free tier / $10 | ⭐⭐⭐ Medium |
| **ECS Fargate** | ~$20-40 | ⭐⭐⭐⭐ Hard |

---

## Post-Deployment Steps

### 1. Setup Domain (Optional)

- Register domain (Route 53 or external)
- Point domain to your AWS service
- Setup SSL certificate (AWS Certificate Manager)

### 2. Enable HTTPS

```bash
# For EC2 with Nginx - use Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 3. Setup CI/CD (Optional)

- AWS CodePipeline
- GitHub Actions
- GitLab CI/CD

### 4. Monitoring

- CloudWatch Logs
- CloudWatch Metrics
- Set up alerts

---

## Environment Variables Required

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="production-secret-key"
JWT_REFRESH_SECRET="production-refresh-key"
NODE_ENV="production"
PORT=3002
CORS_ORIGIN="https://yourdomain.com"
```

---

## Troubleshooting

### Port Issues
- Elastic Beanstalk uses port 8080 by default
- Update `PORT=8080` in environment variables

### Database Connection
- Whitelist AWS IP ranges in MongoDB Atlas
- Or use "Allow from Anywhere" (0.0.0.0/0)

### Build Failures
- Check Node.js version matches
- Ensure `npm run build` works locally
- Check environment variables are set

---

## Quick Deploy Commands

```bash
# Elastic Beanstalk
eb init
eb create houdaproject-prod
eb setenv DATABASE_URL="..." JWT_SECRET="..." NODE_ENV="production"
eb deploy
eb open

# Check logs
eb logs

# Check status
eb status

# Terminate environment (if needed)
eb terminate houdaproject-prod
```

---

## Support Resources

- AWS Documentation: https://docs.aws.amazon.com/
- Elastic Beanstalk Guide: https://docs.aws.amazon.com/elasticbeanstalk/
- AWS Support: https://console.aws.amazon.com/support/

---

## Security Best Practices

1. ✅ Use IAM roles instead of access keys
2. ✅ Enable CloudWatch logging
3. ✅ Use AWS Secrets Manager for sensitive data
4. ✅ Enable auto-scaling
5. ✅ Setup backup strategies
6. ✅ Use HTTPS only
7. ✅ Implement rate limiting
8. ✅ Regular security updates

---

## Next Steps

1. Choose deployment method (Elastic Beanstalk recommended)
2. Follow the guide for your chosen method
3. Deploy application
4. Test deployed application
5. Setup monitoring
6. Configure domain & SSL
