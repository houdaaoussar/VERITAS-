@echo off
echo ========================================
echo  HoudaProject - Local Testing Script
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the HoudaProject directory.
    pause
    exit /b 1
)

echo [1/4] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo WARNING: Prisma generate failed, but continuing...
)
echo.

echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)
echo.

echo [3/4] Checking environment configuration...
if not exist ".env" (
    echo WARNING: .env file not found!
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy ".env.example" ".env"
        echo IMPORTANT: Please update .env with your database credentials!
        pause
    ) else (
        echo ERROR: .env.example not found. Please create .env manually.
        pause
        exit /b 1
    )
) else (
    echo .env file exists.
)
echo.

echo [4/4] Starting development server...
echo.
echo ========================================
echo  Server will run on: http://localhost:3002
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
