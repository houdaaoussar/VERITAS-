@echo off
echo ========================================
echo Testing CSV Upload (No Auth Required)
echo ========================================
echo.
echo Uploading test_emissions.csv...
echo.
curl -X POST "http://localhost:3000/api/ingest/test" -F "file=@test_emissions.csv"
echo.
echo.
echo ========================================
echo Upload Complete!
echo ========================================
echo.
pause
