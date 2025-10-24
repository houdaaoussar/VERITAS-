# ✅ FINAL DEPLOYMENT CHECKLIST - Fix File Upload

## 🚨 Current Issue
File uploads fail in production because files are stored locally and get deleted when server restarts.

## ✅ Solution
Store files in MongoDB GridFS (persistent storage).

---

## 📋 Step-by-Step Fix

### ✅ Step 1: Install MongoDB Driver

```bash
npm install mongodb
```

### ✅ Step 2: Verify Changes Are Ready

Check these files exist:
- ✅ `src/services/mongoFileStorage.ts` - MongoDB storage service
- ✅ `src/routes/uploads.ts` - Updated to use MongoDB

### ✅ Step 3: Test Locally (Optional but Recommended)

```bash
# Start server
npm run dev

# Try uploading a file
# Check console for: "✅ File uploaded to MongoDB GridFS"
```

### ✅ Step 4: Commit and Push

```bash
git add .
git commit -m "Fix file upload with MongoDB GridFS storage"
git push origin main
```

### ✅ Step 5: Monitor AWS Amplify Deployment

1. Go to: https://console.aws.amazon.com/amplify/
2. Click your app
3. Watch the build progress (3-5 minutes)
4. Wait for all stages to show ✅

### ✅ Step 6: Verify Environment Variables in AWS

Make sure these are set in Amplify:
- ✅ `DATABASE_URL` - Your MongoDB connection string
- ✅ `PORT` - 3002 (or your port)
- ✅ `NODE_ENV` - production

### ✅ Step 7: Test File Upload in Production

1. Go to your live app URL
2. Login
3. Navigate to Uploads page
4. Upload a CSV file
5. **It should work now!** ✅

### ✅ Step 8: Verify in MongoDB Atlas

1. Go to MongoDB Atlas
2. Browse Collections
3. Look for `uploads.files` collection
4. You should see your uploaded file

---

## 🔍 How to Check If It's Working

### Success Indicators:

1. **Upload succeeds:**
   - No error message
   - File appears in uploads list
   - Status shows "PENDING" or "COMPLETED"

2. **File in MongoDB:**
   - Check MongoDB Atlas
   - `uploads.files` collection has entries
   - `uploads.chunks` collection has data

3. **Parse works:**
   - Click "Parse" on uploaded file
   - Shows row count and columns
   - No "File not found" error

4. **Import works:**
   - Click "Import" after parsing
   - Activities are created
   - Can see activities in Activities page

---

## 🐛 If Still Not Working

### Check 1: MongoDB Connection

```bash
# Test connection locally
npx prisma db push
```

If this fails, your DATABASE_URL is wrong.

### Check 2: Package Installed

```bash
# Check if mongodb is installed
npm list mongodb
```

Should show: `mongodb@6.x.x`

### Check 3: AWS Amplify Logs

1. Go to Amplify Console
2. Click your app
3. Click latest deployment
4. Check "Build logs" for errors
5. Look for:
   - ❌ "Cannot find module 'mongodb'" → Run `npm install mongodb`
   - ❌ "DATABASE_URL not configured" → Add to Amplify env vars
   - ❌ "GridFS initialization failed" → Check MongoDB connection

### Check 4: Frontend API URL

Make sure frontend is pointing to correct backend:
- Check `VITE_API_BASE_URL` in Amplify environment variables
- Should be your backend URL

---

## 📊 Architecture

### Before (Broken):
```
User uploads file → Local disk → Server restarts → File deleted ❌
```

### After (Fixed):
```
User uploads file → MongoDB GridFS → Persistent storage → Always available ✅
```

---

## 🎯 What Each File Does

### `src/services/mongoFileStorage.ts`
- Uploads files to MongoDB GridFS
- Downloads files from MongoDB
- Deletes files from MongoDB
- Manages file storage

### `src/routes/uploads.ts` (Updated)
- Receives file upload
- Stores in MongoDB GridFS
- Downloads from MongoDB for parsing
- Cleans up temp files

---

## ✅ Final Checklist

Before deploying, verify:

- [ ] `npm install mongodb` completed
- [ ] Code committed to Git
- [ ] Pushed to GitHub
- [ ] AWS Amplify deployment started
- [ ] All build stages passed
- [ ] Environment variables set in Amplify
- [ ] Tested file upload in production
- [ ] File visible in MongoDB Atlas
- [ ] Parse and import work

---

## 🆘 Emergency Rollback

If something breaks:

```bash
# Revert to previous version
git revert HEAD
git push origin main
```

AWS Amplify will automatically deploy the previous version.

---

## 📞 Support Commands

### Test MongoDB Connection
```bash
npx prisma db push
```

### Check Installed Packages
```bash
npm list mongodb
```

### View Environment Variables (Local)
```bash
cat .env
```

### Check Git Status
```bash
git status
```

### View Recent Commits
```bash
git log --oneline -5
```

---

## 🎉 Success!

When everything works, you'll see:

✅ File uploads without errors  
✅ Files persist after server restart  
✅ Parse works correctly  
✅ Import creates activities  
✅ Files visible in MongoDB Atlas  

---

## 📝 Next Steps After Fix

1. **Add dummy data** if customers dropdown is empty:
   ```bash
   node add-dummy-data.js
   ```

2. **Test estimation feature:**
   - Navigate to estimation page
   - Enter data
   - Calculate emissions

3. **Test full workflow:**
   - Upload CSV
   - Parse file
   - Import activities
   - Run calculations
   - View reports

---

**NOW: Run `npm install mongodb` and push to GitHub!**

```bash
npm install mongodb
git add .
git commit -m "Fix file upload with MongoDB GridFS"
git push origin main
```

🚀 **Your file uploads will work in production!**
