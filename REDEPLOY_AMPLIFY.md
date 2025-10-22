# 🔄 Redeploy to AWS Amplify - Quick Guide

Since you've already deployed to AWS Amplify before, here's how to redeploy your updated version.

---

## ⚡ Quick Redeploy (Automated)

### **Option 1: Use the Script (Easiest)**

```powershell
# Run the automated redeploy script
.\redeploy-amplify.ps1
```

This script will:
1. ✅ Verify builds work locally
2. ✅ Add and commit your changes
3. ✅ Push to GitHub
4. ✅ Trigger automatic Amplify deployment

---

## 🔧 Manual Redeploy

### **Option 2: Manual Git Push**

```powershell
# 1. Build and verify locally
npm run build
cd frontend
npm install
npm run build
cd ..

# 2. Add changes
git add .

# 3. Commit changes
git commit -m "Update deployment with new features"

# 4. Push to GitHub (triggers Amplify deployment)
git push origin main
```

---

## 📊 Monitor Deployment

### **Check Amplify Console**

1. Go to: https://console.aws.amazon.com/amplify/
2. Select your app
3. Click on the latest build
4. Monitor progress (takes 5-10 minutes)

### **Deployment Stages**
- ⏳ **Provision** - Setting up environment
- ⏳ **Build** - Building backend and frontend
- ⏳ **Deploy** - Deploying to CDN
- ✅ **Verify** - Running health checks

---

## 🔍 Verify Deployment

### **After deployment completes:**

```powershell
# Get your Amplify URL from the console, then test:

# Test health endpoint
curl https://your-amplify-url.com/health

# Test API
curl https://your-amplify-url.com/api/health

# Test in browser
start https://your-amplify-url.com
```

---

## ⚙️ Update Environment Variables (If Needed)

If you need to update environment variables:

1. Go to **Amplify Console**
2. Select your app
3. Click **"App settings"** → **"Environment variables"**
4. Update variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret`
   - `JWT_REFRESH_SECRET=your-refresh-secret`
   - `PORT=3000`
5. Click **"Save"**
6. Trigger redeploy: **"Redeploy this version"**

---

## 🐛 Troubleshooting

### **Build Failed?**

**Check build logs in Amplify Console:**
1. Click on the failed build
2. Review error messages
3. Common issues:
   - Missing dependencies → Check `package.json`
   - Build errors → Test `npm run build` locally
   - Environment variables → Verify in Amplify settings

**Fix and redeploy:**
```powershell
# Fix the issue locally
npm run build  # Verify it works

# Push fix
git add .
git commit -m "Fix build issue"
git push origin main
```

### **Deployment Stuck?**

1. Cancel the build in Amplify Console
2. Click **"Redeploy this version"**
3. If still stuck, contact AWS Support

### **App Not Loading?**

```powershell
# Check if backend is running
curl https://your-amplify-url.com/health

# Check browser console for errors
# Verify CORS settings in src/server-simple.ts
```

### **Need to Rollback?**

1. Go to Amplify Console
2. Find previous successful deployment
3. Click **"Redeploy this version"**

---

## 📝 What's New in This Deployment?

Your updated deployment includes:

✅ **Docker Configuration** - Production-ready containerization  
✅ **Updated Build Scripts** - Better build process  
✅ **Enhanced Amplify Config** - Backend + frontend builds  
✅ **Deployment Scripts** - Automated deployment helpers  
✅ **Comprehensive Documentation** - Multiple deployment guides  

---

## 🔄 Continuous Deployment

**AWS Amplify automatically deploys when you push to GitHub!**

Every time you:
```powershell
git push origin main
```

Amplify will:
1. Detect the change
2. Start a new build
3. Run tests (if configured)
4. Deploy to production
5. Notify you of completion

---

## 💡 Pro Tips

### **Speed Up Builds**
- Amplify caches `node_modules` automatically
- First build: ~8-10 minutes
- Subsequent builds: ~3-5 minutes

### **Preview Deployments**
Create a new branch for testing:
```powershell
git checkout -b feature/new-feature
git push origin feature/new-feature
```
Amplify can create preview URLs for branches!

### **Custom Domain**
1. Go to Amplify Console → **"Domain management"**
2. Click **"Add domain"**
3. Follow DNS configuration steps
4. Get free SSL certificate automatically

---

## ✅ Deployment Checklist

Before pushing:
- [ ] Code builds successfully locally (`npm run build`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)
- [ ] No console errors
- [ ] Environment variables are set in Amplify
- [ ] Git changes committed
- [ ] Ready to push!

After deployment:
- [ ] Health check passes
- [ ] API endpoints working
- [ ] Frontend loads correctly
- [ ] No errors in browser console
- [ ] Test key features

---

## 🎯 Quick Commands Reference

```powershell
# Quick redeploy
.\redeploy-amplify.ps1

# Manual redeploy
git add . && git commit -m "Update" && git push origin main

# Check git status
git status

# View commit history
git log --oneline -5

# Check remote
git remote -v

# Pull latest changes
git pull origin main

# Force push (use carefully!)
git push origin main --force
```

---

## 📞 Need Help?

- **Amplify Console:** https://console.aws.amazon.com/amplify/
- **Build Logs:** Check in Amplify Console → Your App → Build
- **AWS Docs:** https://docs.amplify.aws/
- **Support:** https://console.aws.amazon.com/support/

---

## 🎉 Ready to Redeploy!

Run the script or push to GitHub:

```powershell
# Automated
.\redeploy-amplify.ps1

# OR Manual
git add .
git commit -m "Redeploy with updates"
git push origin main
```

**Your updated app will be live in ~5-10 minutes!** 🚀

---

**Made with ❤️ for sustainable business**
