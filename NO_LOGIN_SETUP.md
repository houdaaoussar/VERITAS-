# 🚀 Run Project WITHOUT Login

## ✅ Changes Made

The app now **auto-logs you in** as a demo admin user - no login page required!

---

## 🔧 Steps to Run

### 1. Kill Any Existing Process on Port 3000

**Option A - Find and Kill:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Option B - Restart Computer** (easier)

---

### 2. Start the Application

```bash
npm run dev
```

This will start:
- **Backend** on http://localhost:3000
- **Frontend** on http://localhost:3001

---

### 3. Open Your Browser

Go to: **http://localhost:3001**

You'll be **automatically logged in** as:
- Email: demo@example.com
- Role: ADMIN

No login page will appear! 🎉

---

## ⚠️ Important Notes

### **The Emissions Inventory Upload Feature NEEDS Backend Data**

Even though you bypass login, the CSV upload feature requires:
- Sites (places where emissions occur)
- Reporting Periods (time periods for data)
- A database to store activities

### **Two Options:**

#### **Option 1: Use Mock Data Only (Frontend Only)**
If you want to see the UI without backend:
- The upload page will load
- You can select dropdowns (but they'll be empty)
- Upload won't work without real data

#### **Option 2: Create Minimal Data (Recommended)**
Run these commands to create just enough data:

```bash
# Create database
npx prisma migrate dev --name init

# Seed minimal data (sites + periods)
npm run db:seed
```

This creates:
- 3 demo sites
- Reporting periods for 2023-2024
- You can now upload CSV files!

---

## 🎯 Quick Test Flow

1. Start app: `npm run dev`
2. Open: http://localhost:3001
3. Click "**Emissions Inventory**" in sidebar
4. You'll see dropdowns for Site and Period
   - If empty: Run `npm run db:seed` first
   - If filled: Select a site and period
5. Upload `sample_emissions_inventory.csv`
6. Follow the wizard!

---

## 🔄 To Re-enable Login (If Needed Later)

Edit `frontend/src/contexts/AuthContext.tsx`:
- Uncomment the "ORIGINAL CODE" section
- Remove the "AUTO-LOGIN" section

---

## ✨ What Works Now

✅ Automatic login (no credentials needed)
✅ Access all pages immediately
✅ Admin privileges (full access)
✅ No authentication errors
✅ Direct access to Emissions Inventory page

---

## 🐛 Troubleshooting

**"Port 3000 already in use"**
- Kill the process or restart computer

**"Dropdowns are empty on Emissions Inventory page"**
- Run `npm run db:seed` to create sites and periods

**"Upload fails"**
- Backend must be running
- Database must exist
- Sites and periods must be created

---

That's it! Enjoy your no-login app! 🚀
