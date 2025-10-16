# MongoDB Atlas Setup Guide (AWS)

This guide will help you set up MongoDB Atlas on AWS for your HoudaProject application.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required for the free tier)
3. Verify your email address

## Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"** or **"Create"**
2. Choose deployment option:
   - **Shared** (Free tier - M0) for development/testing
   - **Dedicated** for production (paid)
3. Select **AWS** as your cloud provider
4. Choose your preferred **AWS Region** (select closest to your users):
   - US East (N. Virginia) - `us-east-1`
   - EU (Frankfurt) - `eu-central-1`
   - Asia Pacific (Singapore) - `ap-southeast-1`
   - etc.
5. Cluster Tier: Select **M0 Sandbox** (Free)
6. Cluster Name: Enter `houdaproject-cluster` (or your preferred name)
7. Click **"Create Cluster"** (takes 1-3 minutes)

## Step 3: Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `houdaproject_user` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Database User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development:
   - Click **"Allow Access from Anywhere"** (IP: `0.0.0.0/0`)
   - ⚠️ For production, add only your specific IP addresses
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go back to **"Database"** section
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@houdaproject-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open `.env` file in your project root
2. Replace the `DATABASE_URL` with your MongoDB connection string:
   ```env
   DATABASE_URL="mongodb+srv://houdaproject_user:YOUR_PASSWORD@houdaproject-cluster.xxxxx.mongodb.net/houdaproject?retryWrites=true&w=majority"
   ```
3. Replace:
   - `YOUR_PASSWORD` with the actual password you saved
   - `houdaproject` is your database name (you can change this)

## Step 7: Install Dependencies & Generate Prisma Client

Run these commands in your project directory:

```bash
# Install Prisma (if not already installed)
npm install

# Generate Prisma Client for MongoDB
npx prisma generate

# Push the schema to MongoDB (creates collections)
npx prisma db push
```

## Step 8: Seed Initial Data (Optional)

If you have a seed script:

```bash
npm run db:seed
```

## Step 9: Start Your Application

```bash
npm run dev
```

Your application should now be connected to MongoDB Atlas on AWS! 🎉

## Verification

To verify your connection:

1. Open MongoDB Atlas Dashboard
2. Go to **"Database"** → **"Collections"**
3. You should see your database `houdaproject` with all collections:
   - `customers`
   - `sites`
   - `users`
   - `reporting_periods`
   - `uploads`
   - `activities`
   - `emission_factors`
   - `calc_runs`
   - `emission_results`
   - `projects`
   - `project_actuals`
   - `audit_log`

## MongoDB Atlas Features on AWS

### Performance
- Built on AWS infrastructure
- Auto-scaling
- Global clusters for multi-region deployment

### Security
- Encryption at rest and in transit
- VPC peering with your AWS resources
- AWS PrivateLink support
- Automated backups

### Monitoring
- Real-time performance metrics
- Query performance insights
- Alerts and notifications

## Cost Information

### Free Tier (M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Perfect for development/testing
- ✅ Runs on AWS

### Paid Tiers (Production)
- M10: Starting at ~$57/month (2GB RAM, 10GB storage)
- M20: ~$114/month (4GB RAM, 20GB storage)
- M30: ~$225/month (8GB RAM, 40GB storage)
- Scales up to M700+ for enterprise needs

## Troubleshooting

### Connection Issues

1. **Authentication Failed**
   - Verify username and password in connection string
   - Check Database User exists in Atlas

2. **Network Error**
   - Verify IP address is whitelisted in Network Access
   - Check firewall settings

3. **Database Not Found**
   - Database will be created automatically on first write
   - Verify database name in connection string

### Prisma Issues

1. **"Invalid MongoDB URL"**
   - Ensure connection string starts with `mongodb+srv://`
   - Check for special characters in password (URL encode them)

2. **"Schema validation failed"**
   - Run `npx prisma validate` to check schema
   - Run `npx prisma generate` to regenerate client

## Migration from SQLite

Your data from SQLite is NOT automatically migrated. To migrate:

1. Export data from SQLite
2. Transform data to match MongoDB ObjectId format
3. Import into MongoDB Atlas

For production migration, consider using a migration tool or script.

## Support

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Atlas Support: https://support.mongodb.com/
- Prisma MongoDB Documentation: https://www.prisma.io/docs/concepts/database-connectors/mongodb

## Next Steps

1. ✅ Set up MongoDB Atlas cluster on AWS
2. ✅ Update DATABASE_URL in .env
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma db push`
5. ✅ Start your application
6. 📊 Monitor your database in Atlas dashboard
7. 🔐 Set up backups and security best practices
8. 📈 Consider upgrading to paid tier for production
