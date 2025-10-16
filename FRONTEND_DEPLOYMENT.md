# Frontend Deployment to AWS

## Your Backend API URL
```
http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com
```

## Deployment Options

### Option 1: AWS Amplify (Recommended - Easiest)

#### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

#### Step 2: Configure Amplify
```bash
cd frontend
amplify init
```

**Answer the prompts:**
- Enter a name for the project: `houdaproject-frontend`
- Enter a name for the environment: `prod`
- Choose your default editor: (any)
- Choose the type of app: `javascript`
- What javascript framework: `react`
- Source Directory Path: `src`
- Distribution Directory Path: `dist`
- Build Command: `npm run build`
- Start Command: `npm run dev`
- Do you want to use an AWS profile? `Y`
- Please choose the profile: (select your AWS profile)

#### Step 3: Add Hosting
```bash
amplify add hosting
```

**Choose:**
- Select the plugin module: `Hosting with Amplify Console`
- Choose a type: `Manual deployment`

#### Step 4: Publish
```bash
amplify publish
```

---

### Option 2: AWS Amplify Console (GUI - Easiest)

#### Step 1: Go to AWS Amplify Console
https://console.aws.amazon.com/amplify/

#### Step 2: Create New App
1. Click **"New app"** → **"Host web app"**
2. Choose **"Deploy without Git provider"**
3. Give it a name: `houdaproject-frontend`
4. Environment name: `prod`
5. Drag and drop the `frontend` folder (or zip it first)

#### Step 3: Configure Build Settings
The `amplify.yml` file is already created in your frontend folder.

#### Step 4: Deploy
Click **"Save and Deploy"**

Your app will be deployed to: `https://[app-id].amplifyapp.com`

---

### Option 3: AWS S3 + CloudFront (Manual)

#### Step 1: Build the Frontend
```bash
cd frontend
npm run build
```

#### Step 2: Create S3 Bucket
```bash
aws s3 mb s3://houdaproject-frontend --region us-west-2
```

#### Step 3: Configure Bucket for Static Website Hosting
```bash
aws s3 website s3://houdaproject-frontend --index-document index.html --error-document index.html
```

#### Step 4: Upload Files
```bash
aws s3 sync dist/ s3://houdaproject-frontend --acl public-read
```

#### Step 5: Create CloudFront Distribution (for HTTPS)
1. Go to CloudFront Console
2. Create Distribution
3. Origin Domain: `houdaproject-frontend.s3.amazonaws.com`
4. Viewer Protocol Policy: Redirect HTTP to HTTPS
5. Default Root Object: `index.html`
6. Create Distribution

---

## Quick Deploy Command (Amplify CLI)

If you have Amplify CLI installed and configured:

```bash
cd frontend
npm run build
amplify init
amplify add hosting
amplify publish
```

---

## After Deployment

Your frontend will be accessible at:
- **Amplify**: `https://[app-id].amplifyapp.com`
- **CloudFront**: `https://[cloudfront-id].cloudfront.net`

Update your backend CORS settings to allow requests from your frontend URL.

---

## Current Status

✅ **Backend**: Deployed at `http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com`
✅ **Frontend Config**: Updated to use AWS backend
⏳ **Frontend Deployment**: Ready to deploy using any method above
