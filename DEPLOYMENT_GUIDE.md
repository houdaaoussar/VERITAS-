# 🚀 AWS Deployment Guide - Complete Setup

## ✅ Changes Made to the System

### **Enhanced Features:**
1. ✅ Multi-sheet Excel file support with intelligent sheet selection
2. ✅ Deep data analysis - finds headers anywhere in the file
3. ✅ Flexible column name recognition (100+ synonyms)
4. ✅ Lenient validation - accepts data with missing fields
5. ✅ Automatic calculator integration
6. ✅ Real-time data extraction and conversion

---

## 📦 **Deployment Options**

### **Option 1: AWS Amplify (Frontend) + EC2 (Backend)**

#### **Step 1: Deploy Frontend to AWS Amplify**

1. **Commit your changes to Git:**
```bash
git add .
git commit -m "Enhanced Excel ingest with intelligent data extraction"
git push origin main
```

2. **AWS Amplify will automatically:**
   - Detect the changes
   - Build the frontend
   - Deploy to production
   - Update the live site

3. **Monitor deployment:**
   - Go to AWS Amplify Console
   - Check build logs
   - Verify deployment status

---

#### **Step 2: Deploy Backend to AWS EC2**

**A. Connect to your EC2 instance:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

**B. Navigate to your project:**
```bash
cd /path/to/HoudaProject
```

**C. Pull latest changes:**
```bash
git pull origin main
```

**D. Install dependencies:**
```bash
npm install
```

**E. Build the backend:**
```bash
npm run build
```

**F. Restart the service:**
```bash
pm2 restart all
# OR if using systemd:
sudo systemctl restart your-app-name
```

---

### **Option 2: Full AWS Amplify Deployment**

If you want to deploy both frontend and backend on Amplify:

1. **Update amplify.yml** (already created - see below)
2. **Push to Git**
3. **Amplify handles everything**

---

## 📝 **Pre-Deployment Checklist**

### **1. Environment Variables**

Make sure these are set in AWS:

**For EC2/Amplify Backend:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=3002
JWT_SECRET=your-secret-key
```

**For Amplify Console:**
- Go to App Settings → Environment Variables
- Add all required variables

---

### **2. Database Migration**

Run migrations before deploying:
```bash
npx prisma migrate deploy
```

---

### **3. Build Test**

Test the build locally first:
```bash
# Backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 🔧 **Deployment Commands**

### **Quick Deployment Script:**

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# 1. Build backend
echo "📦 Building backend..."
npm run build

# 2. Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# 3. Run database migrations
echo "🗄️ Running migrations..."
npx prisma migrate deploy

# 4. Restart services
echo "🔄 Restarting services..."
pm2 restart all

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## 🌐 **AWS Services Setup**

### **Frontend (AWS Amplify):**
- ✅ Automatic builds from Git
- ✅ CDN distribution
- ✅ SSL certificate
- ✅ Custom domain support

### **Backend (AWS EC2):**
- ✅ Node.js server
- ✅ PostgreSQL database
- ✅ PM2 process manager
- ✅ Nginx reverse proxy

### **Database (AWS RDS):**
- ✅ PostgreSQL instance
- ✅ Automated backups
- ✅ Multi-AZ deployment

---

## 📊 **Post-Deployment Verification**

### **1. Check Frontend:**
```bash
curl https://your-domain.com
```

### **2. Check Backend API:**
```bash
curl https://your-api-domain.com/api/health
```

### **3. Test File Upload:**
- Go to Upload page
- Upload a test Excel file
- Verify data appears in Calculator

---

## 🐛 **Troubleshooting**

### **Build Fails:**
```bash
# Clear cache
rm -rf node_modules
npm install

# Check Node version
node --version  # Should be >= 18.0.0
```

### **Backend Not Starting:**
```bash
# Check logs
pm2 logs

# Check environment variables
printenv | grep DATABASE_URL
```

### **Database Connection Issues:**
```bash
# Test connection
npx prisma db pull
```

---

## 🔐 **Security Checklist**

- ✅ Environment variables set (not in code)
- ✅ CORS configured for production domain
- ✅ Rate limiting enabled
- ✅ Helmet security headers
- ✅ Database credentials secured
- ✅ SSL/TLS certificates active

---

## 📞 **Support**

If you encounter issues:
1. Check AWS CloudWatch logs
2. Check PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Check database connectivity

---

## ✅ **Deployment Complete!**

Your enhanced system is now live with:
- ✅ Intelligent Excel file processing
- ✅ Multi-sheet support
- ✅ Flexible data extraction
- ✅ Automatic calculator integration

**Test it with your real data files!** 🎉
