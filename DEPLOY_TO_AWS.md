# 🚀 Deploy to AWS - Complete Guide

## ✅ Your App is Ready to Deploy!

Since you're using **in-memory storage** (no database needed), deployment is simple!

---

## 🎯 Deployment Options

### **Option 1: AWS Amplify** (Easiest - Recommended)
- ✅ Automatic builds
- ✅ Free tier available
- ✅ CI/CD included
- ✅ HTTPS by default
- ⏱️ 10 minutes setup

### **Option 2: AWS Elastic Beanstalk**
- ✅ Full control
- ✅ Easy scaling
- ✅ Good for production
- ⏱️ 15 minutes setup

### **Option 3: AWS EC2**
- ✅ Maximum control
- ✅ Custom configuration
- ⏱️ 30 minutes setup

---

## 🚀 Option 1: AWS Amplify (Recommended)

### **Prerequisites:**
- AWS Account
- GitHub account (to push your code)

### **Step 1: Push Code to GitHub**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for AWS deployment"

# Create GitHub repo and push
# (Follow GitHub instructions to create repo)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy Backend to Amplify**

1. **Go to AWS Amplify Console:**
   - https://console.aws.amazon.com/amplify/

2. **Click "New app" → "Host web app"**

3. **Connect GitHub:**
   - Select your repository
   - Select `main` branch

4. **Configure build settings:**
   ```yaml
   version: 1
   backend:
     phases:
       build:
         commands:
           - npm install
           - npm run build
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - frontend/node_modules/**/*
   ```

5. **Add Environment Variables:**
   ```
   USE_DATABASE=false
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=3000
   ```

6. **Click "Save and Deploy"**

7. **Wait for deployment** (5-10 minutes)

8. **Get your URL:**
   - Example: `https://main.d1234abcd.amplifyapp.com`

---

## 🚀 Option 2: AWS Elastic Beanstalk

### **Step 1: Install EB CLI**

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Verify
eb --version
```

### **Step 2: Configure AWS**

```bash
# Configure AWS credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Region: us-east-1
# - Output: json
```

### **Step 3: Initialize EB**

```bash
# In your project directory
eb init

# Choose:
# - Region: us-east-1 (or your preferred)
# - Application name: houda-emissions-tracker
# - Platform: Node.js
# - Version: Node.js 18
# - SSH: Yes (recommended)
```

### **Step 4: Create Environment**

```bash
# Create production environment
eb create houda-production

# This will:
# - Create EC2 instance
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your app
```

### **Step 5: Set Environment Variables**

```bash
# Set environment variables
eb setenv USE_DATABASE=false NODE_ENV=production JWT_SECRET=your-secret-key-here

# Or use AWS Console:
# Elastic Beanstalk → Your Environment → Configuration → Software → Environment properties
```

### **Step 6: Deploy**

```bash
# Deploy your app
eb deploy

# Open in browser
eb open
```

---

## 🚀 Option 3: AWS EC2 (Manual)

### **Step 1: Launch EC2 Instance**

1. **Go to EC2 Console:**
   - https://console.aws.amazon.com/ec2/

2. **Click "Launch Instance"**

3. **Configure:**
   - Name: `houda-emissions-tracker`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier) or t2.small
   - Key pair: Create new or use existing
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

4. **Click "Launch Instance"**

### **Step 2: Connect to Instance**

```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### **Step 3: Install Node.js**

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2
```

### **Step 4: Deploy Your App**

```bash
# Clone your repo (or upload files)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Create .env file
nano .env
# Add:
# USE_DATABASE=false
# NODE_ENV=production
# JWT_SECRET=your-secret-key
# PORT=3000

# Start with PM2
pm2 start npm --name "houda-backend" -- run start
pm2 save
pm2 startup
```

### **Step 5: Set Up Nginx (Optional)**

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/houda

# Add:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/houda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📝 Pre-Deployment Checklist

### **1. Update Environment Variables**

Create `.env.production`:
```env
USE_DATABASE=false
NODE_ENV=production
JWT_SECRET=change-this-to-a-secure-random-string
PORT=3000
FRONTEND_URL=https://your-frontend-url.com
```

### **2. Update Frontend API URL**

Edit `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### **3. Build Frontend**

```bash
cd frontend
npm run build
```

### **4. Test Production Build Locally**

```bash
# Build backend
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

---

## 🔧 Deployment Scripts

I'll create automated deployment scripts for you:

### **deploy-amplify.sh**
```bash
#!/bin/bash
echo "🚀 Deploying to AWS Amplify..."

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend
npm install
npm run build

echo "✅ Build complete!"
echo "📤 Push to GitHub to trigger Amplify deployment"
git add .
git commit -m "Deploy to AWS Amplify"
git push origin main
```

### **deploy-eb.sh**
```bash
#!/bin/bash
echo "🚀 Deploying to Elastic Beanstalk..."

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Deploy to EB
eb deploy

echo "✅ Deployment complete!"
eb open
```

---

## 🌐 Custom Domain (Optional)

### **Step 1: Register Domain**
- Use Route 53 or any domain registrar

### **Step 2: Configure DNS**
- Point A record to your EC2/Load Balancer IP
- Or use Amplify's custom domain feature

### **Step 3: Set Up SSL**
- Amplify: Automatic HTTPS
- EB: Use AWS Certificate Manager
- EC2: Use Let's Encrypt (Certbot)

---

## 📊 Cost Estimate

### **AWS Amplify:**
- Free tier: 1000 build minutes/month
- After: ~$0.01 per build minute
- Hosting: ~$0.15/GB served
- **Estimated: $5-20/month**

### **Elastic Beanstalk:**
- t2.micro (free tier): $0
- t2.small: ~$17/month
- Load balancer: ~$18/month
- **Estimated: $0-35/month**

### **EC2:**
- t2.micro (free tier): $0
- t2.small: ~$17/month
- **Estimated: $0-17/month**

---

## ✅ Post-Deployment

### **1. Test Your Deployment**

```bash
# Test backend
curl https://your-backend-url.com

# Test upload
curl -X POST https://your-backend-url.com/api/ingest/test \
  -F "file=@test_emissions.csv"
```

### **2. Monitor**

- AWS CloudWatch for logs
- Set up alarms for errors
- Monitor costs

### **3. Set Up CI/CD**

- Amplify: Automatic on git push
- EB: Use CodePipeline
- EC2: Use GitHub Actions

---

## 🐛 Troubleshooting

### **Issue: Build fails**
```bash
# Check logs
eb logs
# or
amplify console
```

### **Issue: App not starting**
```bash
# Check environment variables
eb printenv

# Check Node version
node --version
```

### **Issue: CORS errors**
Update backend CORS settings in `src/server-simple.ts`

---

## 🎯 Quick Start (Amplify)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main

# 2. Go to AWS Amplify Console
# 3. Connect GitHub repo
# 4. Add environment variables
# 5. Deploy!
```

---

## 📞 Need Help?

- AWS Amplify Docs: https://docs.amplify.aws/
- Elastic Beanstalk Docs: https://docs.aws.amazon.com/elasticbeanstalk/
- AWS Support: https://console.aws.amazon.com/support/

---

**Ready to deploy? Let me know which option you prefer and I'll help you through it!** 🚀
