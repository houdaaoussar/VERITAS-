@echo off
echo ========================================
echo AWS Deployment Helper
echo ========================================
echo.
echo Choose deployment method:
echo.
echo 1. AWS Amplify (Recommended - Easiest)
echo 2. AWS Elastic Beanstalk
echo 3. Prepare for manual EC2 deployment
echo 4. Just build the app
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto amplify
if "%choice%"=="2" goto elasticbeanstalk
if "%choice%"=="3" goto ec2prep
if "%choice%"=="4" goto build
goto end

:amplify
echo.
echo ========================================
echo Preparing for AWS Amplify Deployment
echo ========================================
echo.
echo Step 1: Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo.
echo Step 2: Building backend...
call npm install
echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Push your code to GitHub:
echo    git init
echo    git add .
echo    git commit -m "Deploy to AWS"
echo    git push origin main
echo.
echo 2. Go to AWS Amplify Console:
echo    https://console.aws.amazon.com/amplify/
echo.
echo 3. Click "New app" and connect your GitHub repo
echo.
echo 4. Add these environment variables:
echo    USE_DATABASE=false
echo    NODE_ENV=production
echo    JWT_SECRET=your-secret-key-here
echo.
echo 5. Deploy!
echo.
goto end

:elasticbeanstalk
echo.
echo ========================================
echo Deploying to Elastic Beanstalk
echo ========================================
echo.
echo Checking if EB CLI is installed...
eb --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: EB CLI not installed!
    echo.
    echo Install it with:
    echo   pip install awsebcli --upgrade --user
    echo.
    goto end
)
echo.
echo Building application...
cd frontend
call npm install
call npm run build
cd ..
call npm install
echo.
echo Deploying to Elastic Beanstalk...
eb deploy
echo.
echo Opening application...
eb open
goto end

:ec2prep
echo.
echo ========================================
echo Preparing for EC2 Deployment
echo ========================================
echo.
echo Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo.
echo Building backend...
call npm install
echo.
echo Creating deployment package...
if exist deployment rmdir /s /q deployment
mkdir deployment
xcopy /E /I /Y src deployment\src
xcopy /E /I /Y frontend\dist deployment\frontend\dist
copy package.json deployment\
copy package-lock.json deployment\
echo.
echo ========================================
echo Deployment Package Ready!
echo ========================================
echo.
echo Package location: .\deployment\
echo.
echo Next steps:
echo 1. Upload the 'deployment' folder to your EC2 instance
echo 2. SSH into your EC2 instance
echo 3. Run:
echo    cd deployment
echo    npm install --production
echo    npm start
echo.
goto end

:build
echo.
echo ========================================
echo Building Application
echo ========================================
echo.
echo Building frontend...
cd frontend
call npm install
call npm run build
cd ..
echo.
echo Building backend...
call npm install
echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo You can now:
echo - Test locally: npm start
echo - Deploy to AWS using one of the methods above
echo.
goto end

:end
echo.
pause
