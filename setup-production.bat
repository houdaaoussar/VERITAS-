@echo off
echo ========================================
echo  Production File Upload Setup
echo ========================================
echo.

echo [1/2] Installing AWS SDK for S3...
call npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
echo.

if %errorlevel% equ 0 (
    echo ✅ AWS SDK installed successfully!
    echo.
    echo [2/2] Next steps:
    echo ================
    echo.
    echo 1. Create S3 bucket in AWS Console:
    echo    https://console.aws.amazon.com/s3/
    echo    Bucket name: houdaproject-uploads-prod
    echo.
    echo 2. Create IAM user with S3 access:
    echo    https://console.aws.amazon.com/iam/
    echo.
    echo 3. Add environment variables to .env:
    echo    AWS_ACCESS_KEY_ID=your-key
    echo    AWS_SECRET_ACCESS_KEY=your-secret
    echo    AWS_REGION=us-west-2
    echo    AWS_S3_BUCKET=houdaproject-uploads-prod
    echo    USE_S3_STORAGE=true
    echo.
    echo 4. Add same variables to AWS Amplify Console
    echo.
    echo 5. Push to GitHub:
    echo    git add .
    echo    git commit -m "Added S3 storage"
    echo    git push origin main
    echo.
    echo See CRITICAL_PRODUCTION_FIX.md for detailed instructions.
    echo.
) else (
    echo ❌ Installation failed!
    echo.
    echo Try running manually:
    echo   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
    echo.
)

pause
