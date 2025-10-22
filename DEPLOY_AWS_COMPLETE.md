# 🚀 Complete AWS Deployment Guide - Co-Lab VERITAS™

This guide provides **4 deployment options** for AWS. Choose the one that best fits your needs.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **AWS Account** with appropriate permissions
- ✅ **AWS CLI** installed and configured (`aws configure`)
- ✅ **Docker** installed (for containerized deployments)
- ✅ **Node.js 18+** installed
- ✅ **Git** repository (for Amplify/CodePipeline)

---

## 🎯 Deployment Options Comparison

| Method | Difficulty | Cost/Month | Best For | Setup Time |
|--------|-----------|------------|----------|------------|
| **AWS Amplify** | ⭐ Easy | $5-20 | Quick deployment, CI/CD | 10 min |
| **Elastic Beanstalk** | ⭐⭐ Medium | $15-30 | Managed platform | 15 min |
| **ECS Fargate** | ⭐⭐⭐ Advanced | $20-40 | Containerized apps | 30 min |
| **EC2 Manual** | ⭐⭐⭐⭐ Expert | $10-25 | Full control | 45 min |

---

## 🚀 Option 1: AWS Amplify (RECOMMENDED - Easiest)

### **Why Choose Amplify?**
- ✅ Automatic CI/CD from GitHub
- ✅ Built-in HTTPS/SSL
- ✅ Global CDN
- ✅ Easy environment management
- ✅ Automatic scaling

### **Step-by-Step Deployment**

#### 1. Prepare Your Code

```powershell
# Build the application
npm install
npm run build

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

#### 2. Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Ready for AWS Amplify deployment"

# Create GitHub repository at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/colab-veritas.git
git branch -M main
git push -u origin main
```

#### 3. Deploy on AWS Amplify

1. **Go to AWS Amplify Console:**
   - https://console.aws.amazon.com/amplify/

2. **Click "New app" → "Host web app"**

3. **Connect GitHub:**
   - Select your repository
   - Select branch: `main`
   - Click "Next"

4. **Configure Build Settings:**
   - The `amplify.yml` file is already configured!
   - Click "Next"

5. **Add Environment Variables:**
   
   Click "Advanced settings" and add:
   
   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `your-random-secret-key-min-32-chars` |
   | `JWT_REFRESH_SECRET` | `your-random-refresh-key-min-32-chars` |
   | `PORT` | `3000` |
   | `CORS_ORIGIN` | `*` |

6. **Deploy:**
   - Click "Save and deploy"
   - Wait 5-10 minutes ☕

7. **Get Your URL:**
   ```
   https://main.d1234abcd.amplifyapp.com
   ```

### **Testing Your Deployment**

```bash
# Test health endpoint
curl https://your-amplify-url.com/health

# Test API
curl https://your-amplify-url.com/api/health
```

### **Continuous Deployment**
Every push to `main` branch automatically triggers a new deployment!

---

## 🚀 Option 2: AWS Elastic Beanstalk

### **Why Choose Elastic Beanstalk?**
- ✅ Managed platform
- ✅ Easy scaling
- ✅ Built-in monitoring
- ✅ Load balancing included

### **Step-by-Step Deployment**

#### 1. Install EB CLI

```powershell
# Install EB CLI
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

#### 2. Configure AWS Credentials

```powershell
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1 (or your preferred region)
# Output format: json
```

#### 3. Initialize Elastic Beanstalk

```powershell
# Navigate to project directory
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"

# Initialize EB
eb init

# Select:
# - Region: (choose closest to you)
# - Application name: colab-veritas
# - Platform: Node.js
# - Platform version: Node.js 18
# - Use CodeCommit: No
# - Setup SSH: Yes (optional)
```

#### 4. Create Environment

```powershell
# Create production environment
eb create colab-veritas-prod --instance-type t3.small

# This will:
# - Create EC2 instances
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
```

#### 5. Set Environment Variables

```powershell
eb setenv NODE_ENV="production" `
  JWT_SECRET="your-random-secret-key-min-32-chars" `
  JWT_REFRESH_SECRET="your-random-refresh-key-min-32-chars" `
  PORT="8080" `
  CORS_ORIGIN="*"
```

#### 6. Deploy

```powershell
# Deploy application
eb deploy

# Open in browser
eb open
```

### **Useful EB Commands**

```powershell
# Check status
eb status

# View logs
eb logs

# SSH into instance
eb ssh

# Terminate environment (when done)
eb terminate colab-veritas-prod
```

---

## 🚀 Option 3: AWS ECS Fargate (Containerized)

### **Why Choose ECS Fargate?**
- ✅ Serverless containers
- ✅ No server management
- ✅ Docker-based
- ✅ Easy scaling

### **Step-by-Step Deployment**

#### 1. Build Application

```powershell
# Build backend
npm install
npm run build

# Test Docker build locally
docker build -t colab-veritas .
docker run -p 3000:3000 -e NODE_ENV=production -e JWT_SECRET=test colab-veritas
```

#### 2. Create ECR Repository

```powershell
# Set variables
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "YOUR_ACCOUNT_ID"  # Get from AWS Console

# Create ECR repository
aws ecr create-repository --repository-name colab-veritas --region $AWS_REGION
```

#### 3. Push Docker Image to ECR

```powershell
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and tag image
docker build -t colab-veritas .
docker tag colab-veritas:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/colab-veritas:latest"

# Push to ECR
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/colab-veritas:latest"
```

#### 4. Use Deployment Script (Automated)

```powershell
# Run the automated deployment script
.\deploy-aws-ecs.ps1 -AwsRegion "us-east-1" -AwsAccountId "YOUR_ACCOUNT_ID"
```

#### 5. Create ECS Cluster (via AWS Console)

1. Go to **ECS Console**: https://console.aws.amazon.com/ecs/
2. Click **"Create Cluster"**
3. Choose **"Networking only"** (Fargate)
4. Cluster name: `colab-veritas-cluster`
5. Click **"Create"**

#### 6. Create Task Definition

1. Click **"Task Definitions"** → **"Create new Task Definition"**
2. Choose **"Fargate"**
3. Task Definition Name: `colab-veritas-task`
4. Task Role: `ecsTaskExecutionRole`
5. Task memory: `1GB`
6. Task CPU: `0.5 vCPU`
7. Add Container:
   - Name: `colab-veritas-app`
   - Image: `YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/colab-veritas:latest`
   - Port mappings: `3000`
   - Environment variables:
     - `NODE_ENV=production`
     - `PORT=3000`
     - `JWT_SECRET=your-secret`
     - `JWT_REFRESH_SECRET=your-refresh-secret`
8. Click **"Create"**

#### 7. Create Service

1. Go to your cluster
2. Click **"Create Service"**
3. Launch type: **Fargate**
4. Task Definition: `colab-veritas-task`
5. Service name: `colab-veritas-service`
6. Number of tasks: `1`
7. Configure networking:
   - VPC: Default VPC
   - Subnets: Select all
   - Security group: Allow port 3000
   - Auto-assign public IP: **ENABLED**
8. Load balancer: **Application Load Balancer** (optional)
9. Click **"Create Service"**

#### 8. Get Public IP

```powershell
# Get task ARN
aws ecs list-tasks --cluster colab-veritas-cluster --service-name colab-veritas-service --region $AWS_REGION

# Get task details (replace TASK_ARN)
aws ecs describe-tasks --cluster colab-veritas-cluster --tasks TASK_ARN --region $AWS_REGION
```

Access your app at: `http://PUBLIC_IP:3000`

---

## 🚀 Option 4: AWS EC2 (Manual Setup)

### **Why Choose EC2?**
- ✅ Full control
- ✅ Custom configuration
- ✅ Cost-effective (t2.micro free tier)

### **Step-by-Step Deployment**

#### 1. Launch EC2 Instance

1. Go to **EC2 Console**: https://console.aws.amazon.com/ec2/
2. Click **"Launch Instance"**
3. Configure:
   - Name: `colab-veritas-server`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance type: **t2.small** (or t2.micro for free tier)
   - Key pair: Create new or select existing
4. Network settings:
   - Allow SSH (22) from your IP
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere
   - Allow Custom TCP (3000) from anywhere
5. Storage: **20 GB**
6. Click **"Launch Instance"**

#### 2. Connect to EC2

```powershell
# Connect via SSH (replace with your key and IP)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

#### 3. Install Dependencies

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

# Verify installations
node --version
npm --version
pm2 --version
```

#### 4. Deploy Application

```bash
# Clone repository (or upload files via SCP)
git clone https://github.com/YOUR_USERNAME/colab-veritas.git
cd colab-veritas

# Install dependencies
npm install

# Build application
npm run build

# Create .env file
nano .env
```

Paste in `.env`:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-random-refresh-key-min-32-chars
CORS_ORIGIN=*
LOG_LEVEL=info
```

#### 5. Start with PM2

```bash
# Start application
pm2 start dist/server-simple.js --name colab-veritas

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs colab-veritas
```

#### 6. Setup Nginx (Optional - Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/colab-veritas
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/colab-veritas /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit secrets to Git!** Use AWS Secrets Manager:

```powershell
# Store secrets
aws secretsmanager create-secret --name colab-veritas/jwt-secret --secret-string "your-secret-key"
aws secretsmanager create-secret --name colab-veritas/jwt-refresh-secret --secret-string "your-refresh-key"
```

### 2. Security Groups

- ✅ Restrict SSH (22) to your IP only
- ✅ Use HTTPS (443) instead of HTTP (80)
- ✅ Enable AWS WAF for DDoS protection

### 3. IAM Roles

- ✅ Use IAM roles instead of access keys
- ✅ Follow principle of least privilege
- ✅ Enable MFA for AWS console access

---

## 📊 Monitoring & Logging

### CloudWatch Logs

```powershell
# View logs
aws logs tail /aws/elasticbeanstalk/colab-veritas-prod/var/log/nodejs/nodejs.log --follow
```

### CloudWatch Metrics

1. Go to **CloudWatch Console**
2. Create dashboard
3. Add metrics:
   - CPU Utilization
   - Network In/Out
   - Request Count
   - Error Rate

### Set Up Alarms

```powershell
# Create CPU alarm
aws cloudwatch put-metric-alarm --alarm-name colab-veritas-high-cpu `
  --alarm-description "Alert when CPU exceeds 80%" `
  --metric-name CPUUtilization `
  --namespace AWS/EC2 `
  --statistic Average `
  --period 300 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold
```

---

## 🔄 CI/CD Pipeline (Optional)

### Using AWS CodePipeline

1. **Create CodePipeline**
2. **Source**: GitHub repository
3. **Build**: AWS CodeBuild (uses `buildspec.yml`)
4. **Deploy**: ECS or Elastic Beanstalk

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        run: |
          docker build -t colab-veritas .
          docker tag colab-veritas:latest ${{ steps.login-ecr.outputs.registry }}/colab-veritas:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/colab-veritas:latest
```

---

## 🧪 Testing Your Deployment

### Health Check

```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.1.0"
}
```

### API Test

```bash
# Test ingest endpoint
curl -X POST https://your-domain.com/api/ingest/test \
  -F "file=@test_emissions.csv"
```

---

## 💰 Cost Estimation

### AWS Amplify
- **Free Tier**: 1000 build minutes, 15 GB served
- **After**: ~$5-20/month

### Elastic Beanstalk
- **t3.small**: ~$15/month
- **Load Balancer**: ~$18/month
- **Total**: ~$33/month

### ECS Fargate
- **0.5 vCPU, 1GB RAM**: ~$15/month
- **Load Balancer**: ~$18/month (optional)
- **Total**: ~$15-33/month

### EC2
- **t2.micro** (free tier): $0
- **t2.small**: ~$17/month
- **Total**: ~$17/month

---

## 🐛 Troubleshooting

### Build Failures

```powershell
# Check build logs
eb logs
# or
aws logs tail /ecs/colab-veritas --follow
```

### Port Issues

- Elastic Beanstalk uses port **8080** by default
- Update `PORT=8080` in environment variables

### CORS Errors

Update `src/server-simple.ts`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

### Database Connection

- Ensure environment variables are set correctly
- Check security groups allow outbound connections

---

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI configured
- [ ] Application builds successfully locally
- [ ] Environment variables configured
- [ ] Deployment method chosen
- [ ] Application deployed
- [ ] Health check passes
- [ ] API endpoints working
- [ ] Monitoring configured
- [ ] SSL certificate installed (production)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place

---

## 📞 Support

- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Support**: https://console.aws.amazon.com/support/
- **Community Forums**: https://forums.aws.amazon.com/

---

## 🎉 Success!

Your Co-Lab VERITAS™ application is now deployed on AWS!

**Next Steps:**
1. ✅ Test all endpoints
2. ✅ Configure monitoring
3. ✅ Set up backups
4. ✅ Add custom domain
5. ✅ Enable HTTPS
6. ✅ Invite users

---

**Made with ❤️ for sustainable business**
