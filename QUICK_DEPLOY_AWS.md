# 🚀 Quick Deploy to AWS - 3 Easy Steps!

## ✅ Fastest Way to Deploy

### **Method: AWS Amplify** (Recommended)

---

## 📋 Step 1: Prepare Your Code

### **Run the deployment helper:**
```bash
.\deploy-to-aws.bat
```

Choose option **1** (AWS Amplify)

This will:
- ✅ Build your frontend
- ✅ Build your backend
- ✅ Prepare everything for deployment

---

## 📤 Step 2: Push to GitHub

### **If you don't have a GitHub repo yet:**

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name: `houda-emissions-tracker`
   - Make it Public or Private
   - Don't initialize with README
   - Click "Create repository"

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Ready for AWS deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/houda-emissions-tracker.git
   git push -u origin main
   ```

### **If you already have a GitHub repo:**
```bash
git add .
git commit -m "Deploy to AWS"
git push origin main
```

---

## 🌐 Step 3: Deploy on AWS Amplify

### **A. Go to AWS Amplify Console:**
https://console.aws.amazon.com/amplify/

### **B. Click "New app" → "Host web app"**

### **C. Connect GitHub:**
1. Click "GitHub"
2. Authorize AWS Amplify
3. Select your repository: `houda-emissions-tracker`
4. Select branch: `main`
5. Click "Next"

### **D. Configure Build Settings:**

The `amplify.yml` file is already configured! Just verify it looks good.

Click "Next"

### **E. Add Environment Variables:**

Click "Advanced settings" and add:

| Variable | Value |
|----------|-------|
| `USE_DATABASE` | `false` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `your-super-secret-key-change-this-123` |
| `PORT` | `3000` |

**Important:** Change `JWT_SECRET` to a random string!

### **F. Review and Deploy:**

1. Review all settings
2. Click "Save and deploy"
3. Wait 5-10 minutes ☕

### **G. Get Your URL:**

Once deployed, you'll get a URL like:
```
https://main.d1234abcd.amplifyapp.com
```

**Your app is live!** 🎉

---

## ✅ Test Your Deployment

### **1. Test Backend:**
```bash
curl https://your-amplify-url.com
```

Should return: "Co-Lab VERITAS™ API is running"

### **2. Test Upload:**
```bash
curl -X POST https://your-amplify-url.com/api/ingest/test \
  -F "file=@test_emissions.csv"
```

Should return success with data!

### **3. Open in Browser:**
```
https://your-amplify-url.com
```

You should see your app with auto-login!

---

## 🔧 Update Frontend API URL

After deployment, update your frontend to use the production backend:

### **Edit `frontend/.env.production`:**
```env
VITE_API_BASE_URL=https://your-amplify-url.com
```

### **Commit and push:**
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

Amplify will automatically redeploy!

---

## 💰 Cost

### **AWS Amplify Free Tier:**
- ✅ 1000 build minutes/month
- ✅ 15 GB served/month
- ✅ 5 GB stored

### **After Free Tier:**
- ~$0.01 per build minute
- ~$0.15 per GB served
- **Estimated: $5-20/month** for moderate usage

---

## 🎯 What You Get

✅ **Automatic HTTPS** - Secure by default  
✅ **Auto-deploy on git push** - CI/CD included  
✅ **Global CDN** - Fast worldwide  
✅ **Custom domain support** - Add your domain  
✅ **Monitoring** - Built-in logs and metrics  
✅ **Rollback** - Easy to revert deployments  

---

## 🔄 Continuous Deployment

Every time you push to GitHub:
1. Amplify detects the change
2. Automatically builds your app
3. Runs tests (if configured)
4. Deploys to production
5. You get notified!

---

## 📊 Monitor Your App

### **View Logs:**
1. Go to Amplify Console
2. Click your app
3. Click "Monitoring"
4. View logs, errors, performance

### **Set Up Alerts:**
1. Click "Monitoring" → "Alarms"
2. Create alarm for errors
3. Get notified via email/SMS

---

## 🌐 Add Custom Domain (Optional)

### **Step 1: In Amplify Console:**
1. Click "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `emissions-tracker.com`)

### **Step 2: Update DNS:**
Follow Amplify's instructions to update your DNS records

### **Step 3: Wait for SSL:**
Amplify automatically provisions SSL certificate (5-10 minutes)

**Done!** Your app is now at `https://yourdomain.com` 🎉

---

## 🐛 Troubleshooting

### **Build Failed?**

1. **Check build logs** in Amplify Console
2. **Common issues:**
   - Missing environment variables
   - Node version mismatch
   - npm install errors

**Fix:** Update `amplify.yml` or environment variables

### **App Not Loading?**

1. **Check if backend is running:**
   ```bash
   curl https://your-url.com
   ```

2. **Check environment variables** in Amplify Console

3. **Check browser console** for errors

### **CORS Errors?**

Update CORS in `src/server-simple.ts`:
```typescript
app.use(cors({
  origin: 'https://your-amplify-url.com',
  credentials: true
}));
```

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Amplify app created
- [ ] Environment variables added
- [ ] Build successful
- [ ] App accessible at Amplify URL
- [ ] Backend API working
- [ ] Upload test successful
- [ ] Calculator showing data
- [ ] Auto-login working

---

## 📞 Need Help?

### **AWS Support:**
- Free tier: Community forums
- Paid: AWS Support plans

### **Documentation:**
- Amplify: https://docs.amplify.aws/
- Troubleshooting: https://docs.amplify.aws/console/

---

## 🚀 You're Live!

**Congratulations!** Your emissions tracking app is now deployed to AWS!

**Share your app:**
```
https://your-amplify-url.com
```

**Next steps:**
1. Add custom domain
2. Set up monitoring
3. Invite users
4. Track emissions! 🌱

---

**Total time: ~15 minutes** ⏱️

**Your app is now accessible worldwide!** 🌍
