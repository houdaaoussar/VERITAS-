@echo off
echo ========================================
echo Testing CSV Upload
echo ========================================
echo.

REM Check if server is running
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Server is not running!
    echo Please start the server first with: npm run dev:backend
    pause
    exit /b 1
)

echo Server is running!
echo.

REM Create a test CSV file
echo Creating test CSV file...
(
echo Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
echo Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
echo Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
echo Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
) > test_emissions.csv

echo Test CSV created: test_emissions.csv
echo.

echo Uploading CSV to server...
curl -X POST "http://localhost:3000/api/ingest?customerId=customer_default&periodId=period_default&save=true" -F "file=@test_emissions.csv"

echo.
echo.
echo ========================================
echo Upload complete!
echo ========================================
echo.
echo To view activities:
echo curl http://localhost:3000/api/activities?customerId=customer_default^&periodId=period_default
echo.
pause
