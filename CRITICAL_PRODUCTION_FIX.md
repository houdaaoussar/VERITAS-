# 🚨 CRITICAL: Production File Upload Fix

## The Problem

**File uploads are failing in production because:**

1. ❌ AWS Amplify/Elastic Beanstalk uses **ephemeral storage**
2. ❌ Files uploaded to local disk are **deleted on restart**
3. ❌ No persistent storage configured
4. ❌ Database connection issues

---

## ✅ IMMEDIATE FIX (Choose One)

### Option 1: AWS S3 Storage (RECOMMENDED)

#### Step 1: Install AWS SDK

```bash
cd "c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject"
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### Step 2: Create S3 Bucket

1. Go to: https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. **Bucket name:** `houdaproject-uploads-prod`
4. **Region:** `us-west-2` (or your region)
5. **Uncheck** "Block all public access"
6. Click "Create bucket"

#### Step 3: Create IAM User

1. Go to: https://console.aws.amazon.com/iam/
2. Users → Create user
3. Username: `houdaproject-s3`
4. Attach policy: `AmazonS3FullAccess`
5. Create access key → Save credentials:
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJalr...`

#### Step 4: Update Environment Variables

**Local `.env`:**
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=us-west-2
AWS_S3_BUCKET=houdaproject-uploads-prod
USE_S3_STORAGE=true

# Database
DATABASE_URL=your-mongodb-url
PORT=3002
```

**AWS Amplify Environment Variables:**
1. Go to Amplify Console
2. Your app → Environment variables
3. Add:
   - `AWS_ACCESS_KEY_ID` = your key
   - `AWS_SECRET_ACCESS_KEY` = your secret
   - `AWS_REGION` = us-west-2
   - `AWS_S3_BUCKET` = houdaproject-uploads-prod
   - `USE_S3_STORAGE` = true
   - `DATABASE_URL` = your MongoDB URL

---

### Option 2: MongoDB GridFS (Simpler, No S3 Needed)

Store files directly in MongoDB Atlas.

#### Install GridFS Package:
```bash
npm install gridfs-stream
```

This is simpler but not recommended for large files (>16MB).

---

## 🔧 Database Fix

### Issue: Database Connection

Your MongoDB connection might be failing. Check:

1. **MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas
   - Network Access
   - Add IP: `0.0.0.0/0` (allow all) for testing
   - Or add your AWS IP range

2. **Connection String:**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/houdaproject?retryWrites=true&w=majority"
   ```

3. **Test Connection:**
   ```bash
   npx prisma db push
   ```

---

## 📦 Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.400.0",
    "@aws-sdk/s3-request-presigner": "^3.400.0"
  }
}
```

Install:
```bash
npm install
```

---

## 🚀 Deploy Steps

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Update Environment Variables
- Add AWS credentials to Amplify
- Add DATABASE_URL to Amplify

### 3. Push to GitHub
```bash
git add .
git commit -m "Added S3 storage for production file uploads"
git push origin main
```

### 4. Wait for Deployment (3-5 minutes)

### 5. Test Upload
- Go to your live app
- Try uploading a CSV file
- Check S3 bucket for uploaded file

---

## 🧪 Test Locally First

Before deploying:

```bash
# Set environment variables
# In .env file, add AWS credentials

# Start server
npm run dev

# Test upload via frontend or API
curl -X POST http://localhost:3002/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.csv" \
  -F "customerId=YOUR_CUSTOMER_ID"
```

---

## 📊 Monitoring

### Check S3 Uploads:
1. Go to S3 Console
2. Open your bucket
3. Check `uploads/` folder for files

### Check Database:
```bash
# View uploads in database
npx prisma studio
# Navigate to Upload model
```

### Check Logs:
- Amplify Console → Your app → Logs
- Look for "File uploaded to S3" messages

---

## ⚠️ IMPORTANT NOTES

1. **Never commit AWS credentials to Git**
   - Use environment variables only
   - `.env` is in `.gitignore`

2. **S3 Bucket Security:**
   - Enable encryption
   - Use IAM policies
   - Enable versioning

3. **Cost:**
   - S3 storage: ~$0.023/GB/month
   - Very cheap for typical usage

4. **Backup:**
   - Enable S3 versioning
   - Set lifecycle rules

---

## 🎯 Success Criteria

✅ File uploads work in production  
✅ Files persist after server restart  
✅ Database connection stable  
✅ No errors in logs  
✅ Files visible in S3 bucket  

---

## 🆘 If Still Failing

### Check These:

1. **AWS Credentials Valid?**
   ```bash
   aws s3 ls s3://houdaproject-uploads-prod
   ```

2. **Database Accessible?**
   ```bash
   npx prisma db push
   ```

3. **Environment Variables Set?**
   - Check Amplify Console
   - Verify all variables present

4. **Logs Show Errors?**
   - Check Amplify build logs
   - Check application logs

---

## 📞 Quick Support Commands

```bash
# Test S3 connection
aws s3 ls

# Test database connection
npx prisma db push

# View environment variables (local)
cat .env

# Check if dependencies installed
npm list @aws-sdk/client-s3
```

---

**NEXT STEP: Install AWS SDK and configure S3 now!**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```
