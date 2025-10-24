@echo off
echo ========================================
echo  Push Changes to GitHub (Auto-Deploy)
echo ========================================
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo ERROR: Not a git repository!
    echo Please run 'git init' first.
    pause
    exit /b 1
)

echo [1/4] Checking current status...
git status
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" (
    set commit_message=Fixed database connection, file upload, and estimation feature
)
git commit -m "%commit_message%"
echo.

echo [4/4] Pushing to GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo  ✅ Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo 🚀 AWS Amplify will now automatically deploy your changes.
    echo.
    echo 📊 Monitor deployment:
    echo https://console.aws.amazon.com/amplify/
    echo.
    echo ⏱️  Deployment usually takes 3-5 minutes.
    echo.
) else (
    echo ========================================
    echo  ❌ Push failed!
    echo ========================================
    echo.
    echo Possible issues:
    echo - Not connected to internet
    echo - GitHub credentials not configured
    echo - No remote repository set
    echo.
    echo Try running manually:
    echo   git push origin main
    echo.
)

pause
