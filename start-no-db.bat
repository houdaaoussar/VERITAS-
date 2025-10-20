@echo off
echo ========================================
echo Starting Houda Project (No Database Mode)
echo ========================================
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo USE_DATABASE=false >> .env
    echo.
)

echo Installing dependencies...
call npm install
echo.

echo Starting server...
echo Server will be available at: http://localhost:3000
echo.
echo Default credentials:
echo   Customer ID: customer_default
echo   Period ID: period_default
echo   Site ID: site_default
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev:backend
