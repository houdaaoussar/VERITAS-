# AWS Amplify Deployment - Step by Step

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: https://github.com/houdaaoussar/VERITAS-
- ✅ Backend deployed: http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com

---

## 🚀 Deploy Frontend to AWS Amplify

### Step 1: Open AWS Amplify Console
Click this link: https://console.aws.amazon.com/amplify/

### Step 2: Create New App
1. Click the orange **"New app"** button (top right)
2. Select **"Host web app"** from the dropdown
3. Click **"Host web app"**

### Step 3: Connect to GitHub
1. Under "From your existing code", select **"GitHub"**
2. Click **"Continue"**
3. A popup will appear asking to authorize AWS Amplify
4. Click **"Authorize aws-amplify-console"**
5. You may need to enter your GitHub password

### Step 4: Select Repository
1. In the dropdown, find and select: **VERITAS-**
2. In the "Branch" dropdown, select: **main**
3. Click **"Next"**

### Step 5: Configure Build Settings

**App name:** `houdaproject-frontend`

**Build and test settings:**
Click **"Edit"** button and **REPLACE ALL** the YAML with this:

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

**IMPORTANT:** Make sure you click **"Save"** after editing!

### Step 6: Advanced Settings (IMPORTANT!)
Scroll down and expand **"Advanced settings"**

Add environment variable:
1. Click **"Add environment variable"**
2. **Key:** `VITE_API_URL`
3. **Value:** `http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com`
4. Click **"Add"** or make sure it's saved

### Step 7: Review and Deploy
1. Click **"Next"**
2. Review all settings:
   - Repository: VERITAS-
   - Branch: main
   - Build settings: Should show your custom YAML
   - Environment variables: Should show VITE_API_URL
3. Click **"Save and deploy"**

### Step 8: Wait for Deployment (3-5 minutes)
You'll see 4 stages:
1. ⏳ Provision - Setting up build environment
2. ⏳ Build - Running npm install and build
3. ⏳ Deploy - Uploading to CDN
4. ⏳ Verify - Final checks

Watch for **green checkmarks** ✅ on each stage!

### Step 9: Get Your URL
Once all stages are green:
1. You'll see your app URL at the top, like:
   `https://main.d1234abcd5678.amplifyapp.com`
2. Click on the URL to open your app!

---

## 🎯 After Deployment

### Your Live URLs:
- **Frontend:** `https://main.[your-id].amplifyapp.com`
- **Backend API:** `http://houdaproject-prod.eba-mqp9cwkd.us-west-2.elasticbeanstalk.com`

### Update Backend CORS (IMPORTANT!)
After you get your Amplify URL, you need to update the backend to allow requests from your frontend.

1. Go back to your terminal
2. Run:
```bash
eb setenv CORS_ORIGIN="https://main.[your-actual-amplify-url].amplifyapp.com"
```

Replace `[your-actual-amplify-url]` with your real Amplify URL!

---

## 🔄 Future Updates

To update your app in the future:
```bash
git add .
git commit -m "Your update message"
git push
```

AWS Amplify will **automatically** build and deploy! 🎉

---

## ❌ Troubleshooting

### Build Fails?
1. Check the build logs in Amplify Console
2. Make sure the YAML has the `cd frontend` command
3. Verify the `baseDirectory` is `frontend/dist`

### App Shows Blank Page?
1. Check browser console for errors (F12)
2. Verify VITE_API_URL environment variable is set
3. Check that API URL is correct

### CORS Errors?
1. Make sure you updated backend CORS_ORIGIN
2. Run: `eb setenv CORS_ORIGIN="https://your-amplify-url"`
3. Redeploy backend: `eb deploy`

---

## 🎊 Success Criteria

You'll know it's working when:
✅ All 4 deployment stages show green checkmarks
✅ You can open the Amplify URL
✅ You see the login page
✅ You can log in and see the dashboard

---

**START NOW:** Go to https://console.aws.amazon.com/amplify/
