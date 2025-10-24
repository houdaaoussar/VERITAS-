@echo off
echo ========================================
echo  Fix Production File Upload - MongoDB
echo ========================================
echo.

echo This will install MongoDB driver for file storage.
echo No AWS S3 setup needed!
echo.

echo [1/1] Installing mongodb package...
call npm install mongodb
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo  ✅ Setup Complete!
    echo ========================================
    echo.
    echo Files will now be stored in MongoDB GridFS.
    echo.
    echo Next steps:
    echo ===========
    echo 1. Push to GitHub:
    echo    git add .
    echo    git commit -m "MongoDB GridFS file storage"
    echo    git push origin main
    echo.
    echo 2. Wait for AWS Amplify deployment (3-5 min)
    echo.
    echo 3. Test file upload in production
    echo.
    echo 4. Check MongoDB Atlas for uploaded files:
    echo    Collections -^> uploads.files
    echo.
    echo ✅ No S3 configuration needed!
    echo ✅ No additional AWS setup!
    echo ✅ Everything stored in MongoDB!
    echo.
) else (
    echo ========================================
    echo  ❌ Installation Failed
    echo ========================================
    echo.
    echo Try running manually:
    echo   npm install mongodb
    echo.
)

pause
