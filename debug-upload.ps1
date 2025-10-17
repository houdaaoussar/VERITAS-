# Debug Upload Issues

Write-Host "=== Debugging Excel Upload ===" -ForegroundColor Cyan
Write-Host ""

# Check 1: Backend Running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Fix: Run 'npm run dev:backend' in another terminal" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Check 2: Frontend Running
Write-Host "2. Checking if frontend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Frontend is accessible!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend might not be running" -ForegroundColor Yellow
    Write-Host "   Fix: Run 'npm run dev' in frontend folder" -ForegroundColor Yellow
}

Write-Host ""

# Check 3: MongoDB Connection
Write-Host "3. Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "   Check backend console for MongoDB connection messages" -ForegroundColor Gray

Write-Host ""

# Check 4: File Upload Endpoint
Write-Host "4. Testing upload endpoint (without file)..." -ForegroundColor Yellow
Write-Host "   This should fail with 'No file uploaded' - that's expected" -ForegroundColor Gray

Write-Host ""

# Instructions
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open browser and go to: http://localhost:3002" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Tools" -ForegroundColor White
Write-Host "3. Go to 'Console' tab" -ForegroundColor White
Write-Host "4. Try uploading your Excel file" -ForegroundColor White
Write-Host "5. Look for errors in Console" -ForegroundColor White
Write-Host ""
Write-Host "Common Errors:" -ForegroundColor Yellow
Write-Host "  - 'Network Error' → Backend not running or wrong URL" -ForegroundColor Gray
Write-Host "  - '401 Unauthorized' → Not logged in" -ForegroundColor Gray
Write-Host "  - '403 Forbidden' → Wrong user role" -ForegroundColor Gray
Write-Host "  - '400 Bad Request' → Check error message" -ForegroundColor Gray
Write-Host ""
Write-Host "If you see an error, copy it and share it!" -ForegroundColor Cyan
