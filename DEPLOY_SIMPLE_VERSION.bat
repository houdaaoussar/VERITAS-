@echo off
cls
echo ========================================
echo  SIMPLE VERSION - No Customer/Period
echo ========================================
echo.
echo Changes:
echo ✅ Upload file → Auto-imports to calculator
echo ✅ Estimation → No customer/period selection
echo ✅ Everything just works!
echo.
pause

echo.
echo Committing changes...
git add .
git commit -m "Simplified: Auto-import uploads, skip customer/period selection"

echo.
echo Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ DEPLOYED!
echo ========================================
echo.
echo Wait 3-5 minutes for AWS deployment.
echo.
echo 🎯 What's Changed:
echo ==================
echo.
echo UPLOAD PAGE:
echo 1. Upload CSV file
echo 2. ✅ Auto-imports immediately!
echo 3. ✅ Data available in calculator
echo 4. ✅ No period selection needed!
echo.
echo ESTIMATION PAGE:
echo 1. Open estimation page
echo 2. ✅ No customer dropdown!
echo 3. ✅ No period dropdown!
echo 4. Enter data directly
echo 5. Click "Calculate Emissions"
echo 6. ✅ See results immediately!
echo.
echo ========================================
echo  HOW TO USE
echo ========================================
echo.
echo UPLOAD WORKFLOW:
echo ----------------
echo 1. Go to Upload page
echo 2. Drag & drop CSV file
echo 3. ✅ Done! Data imported automatically
echo 4. Go to Calculator to use the data
echo.
echo ESTIMATION WORKFLOW:
echo --------------------
echo 1. Go to Estimation page
echo 2. Enter your data:
echo    - Number of employees
echo    - Commute distance
echo    - Business travel
echo    - etc.
echo 3. Click "Calculate Emissions"
echo 4. ✅ See results!
echo.
echo NO SETUP NEEDED!
echo NO CUSTOMER SELECTION!
echo NO PERIOD SELECTION!
echo JUST WORKS!
echo.
pause
