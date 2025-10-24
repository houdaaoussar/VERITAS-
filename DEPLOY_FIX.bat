@echo off
cls
echo ========================================
echo  DEPLOY FIX - Simple Version
echo ========================================
echo.

echo Checking git status...
git status

echo.
echo Adding all files...
git add .

echo.
echo Committing...
git commit -m "Fix: Auto-import uploads, skip customer/period selection"

echo.
echo Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo  PUSH FAILED - Troubleshooting
    echo ========================================
    echo.
    echo Possible issues:
    echo.
    echo 1. Nothing to commit (already up to date)
    echo    Solution: Changes already deployed!
    echo.
    echo 2. Not connected to internet
    echo    Solution: Check internet connection
    echo.
    echo 3. Git credentials not configured
    echo    Solution: Run these commands:
    echo    git config user.email "your@email.com"
    echo    git config user.name "Your Name"
    echo.
    echo 4. Remote not configured
    echo    Solution: Check git remote -v
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ SUCCESS!
echo ========================================
echo.
echo Your changes are deploying to AWS Amplify.
echo.
echo Monitor at: https://console.aws.amazon.com/amplify/
echo.
echo Wait 3-5 minutes, then test your app!
echo.
pause
