# Deploy to AWS from GitHub

## Step 1: Push to GitHub

### 1. Initialize Git (if not already done)
```bash
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
git init
```

### 2. Add all files
```bash
git add .
git commit -m "Initial commit - HoudaProject with AWS deployment"
```

### 3. Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `HoudaProject` (or any name you want)
3. Description: "Co-Lab VERITAS™ - Sustainability Management Platform"
4. Choose: **Private** (recommended for now)
5. Do NOT initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 4. Push to GitHub
Copy the commands from GitHub (should look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/HoudaProject.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy Frontend with AWS Amplify from GitHub

### 1. Go to AWS Amplify Console
👉 https://console.aws.amazon.com/amplify/

### 2. Create New App
1. Click **"New app"** → **"Host web app"**
2. Choose **"GitHub"**
3. Click **"Continue"**
4. Authorize AWS Amplify to access your GitHub (if first time)

### 3. Select Repository
1. Choose your repository: `HoudaProject`
2. Choose branch: `main`
3. Click **"Next"**

### 4. Configure Build Settings
App name: `houdaproject-frontend`

Build settings - **IMPORTANT: Update the path!**

```yaml
version: 1
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
      - frontend/node_modules/**/*
```

### 5. Advanced Settings (Optional but Recommended)
Add environment variable:
- Key: `VITE_API_URL`
- Value: `http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com`

### 6. Review and Deploy
1. Review all settings
2. Click **"Save and deploy"**

Your frontend will be deployed to: `https://main.[app-id].amplifyapp.com`

---

## Step 3: Update Backend CORS

After frontend is deployed, update your backend to allow requests from the frontend URL.

In your backend `.env` or AWS environment variables, add:
```
CORS_ORIGIN=https://main.[app-id].amplifyapp.com
```

Then redeploy backend:
```bash
eb deploy
```

---

## Benefits of GitHub Deployment

✅ **Auto-deploy**: Every push to `main` branch auto-deploys
✅ **Version control**: Full history of all changes
✅ **Easy rollback**: Can rollback to any previous version
✅ **CI/CD**: Automatic builds and deployments
✅ **Collaboration**: Easy to work with team members

---

## Current URLs

**Backend API**: `http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com`
**Frontend** (after deployment): `https://main.[app-id].amplifyapp.com`

---

## Quick Commands

```bash
# Push code to GitHub
git add .
git commit -m "Your commit message"
git push

# AWS Amplify will automatically build and deploy!
```
