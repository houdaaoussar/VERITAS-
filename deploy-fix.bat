@echo off
echo ========================================
echo  FINAL FIX - Deploy File Upload Solution
echo ========================================
echo.

echo This will:
echo 1. Install MongoDB driver
echo 2. Commit all changes
echo 3. Push to GitHub
echo 4. Trigger AWS Amplify deployment
echo.
pause

echo.
echo [1/3] Installing MongoDB driver...
call npm install mongodb

if %errorlevel% neq 0 (
    echo ❌ Installation failed!
    pause
    exit /b 1
)

echo ✅ MongoDB driver installed
echo.

echo [2/3] Committing changes...
git add .
git commit -m "Fix file upload with MongoDB GridFS storage"

if %errorlevel% neq 0 (
    echo ⚠️  Nothing to commit or commit failed
    echo Continuing anyway...
)

echo.
echo [3/3] Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Push failed!
    echo.
    echo Possible issues:
    echo - Not connected to internet
    echo - GitHub credentials not configured
    echo - No changes to push
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ DEPLOYMENT STARTED!
echo ========================================
echo.
echo AWS Amplify is now building and deploying your app.
echo.
echo 📊 Monitor progress:
echo https://console.aws.amazon.com/amplify/
echo.
echo ⏱️  Deployment takes 3-5 minutes
echo.
echo 🎯 After deployment:
echo 1. Go to your live app
echo 2. Try uploading a CSV file
echo 3. File upload should work now!
echo.
echo 📖 See FINAL_DEPLOYMENT_CHECKLIST.md for verification steps
echo.
pause
