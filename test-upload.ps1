# Quick CSV Upload Test Script
# This tests if your CSV upload is working

Write-Host "🧪 Testing CSV Upload..." -ForegroundColor Cyan

# Step 1: Create a test CSV file
Write-Host "`n📝 Creating test CSV file..." -ForegroundColor Yellow
$csvContent = @"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
"@

$csvContent | Out-File -FilePath "test_upload.csv" -Encoding UTF8
Write-Host "✅ Test CSV created: test_upload.csv" -ForegroundColor Green

# Step 2: Check if backend is running
Write-Host "`n🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Please start it with: npm run dev:backend" -ForegroundColor Yellow
    exit 1
}

# Step 3: Test upload
Write-Host "`n📤 Testing file upload..." -ForegroundColor Yellow
try {
    $uri = "http://localhost:3000/api/ingest/test"
    $filePath = "test_upload.csv"
    
    $form = @{
        file = Get-Item -Path $filePath
    }
    
    $response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
    
    Write-Host "✅ Upload successful!" -ForegroundColor Green
    Write-Host "`n📊 Results:" -ForegroundColor Cyan
    Write-Host "   Status: $($response.status)" -ForegroundColor White
    Write-Host "   Rows imported: $($response.rows_imported)" -ForegroundColor White
    Write-Host "   Rows failed: $($response.rows_failed)" -ForegroundColor White
    
    if ($response.data) {
        Write-Host "`n📋 Sample data:" -ForegroundColor Cyan
        $response.data | Select-Object -First 3 | Format-Table
    }
    
    Write-Host "`n🎉 CSV upload is working correctly!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "`n Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "`nServer response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    Write-Host "`n💡 Troubleshooting tips:" -ForegroundColor Cyan
    Write-Host "1. Make sure backend is running: npm run dev:backend" -ForegroundColor White
    Write-Host "2. Check .env file has USE_DATABASE=false" -ForegroundColor White
    Write-Host "3. Check port 3000 is not blocked" -ForegroundColor White
    Write-Host "4. See TEST_CSV_UPLOAD.md for more help" -ForegroundColor White
}

Write-Host "`n✨ Test complete!" -ForegroundColor Cyan
