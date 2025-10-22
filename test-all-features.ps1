# Complete Feature Testing Script for VERITAS™
# Tests all features locally

Write-Host "🧪 VERITAS™ Complete Feature Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Backend Health
Write-Host "`n1️⃣ Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -ErrorAction Stop
    if ($health.status -eq "healthy") {
        Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
        Write-Host "      Version: $($health.version)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "   ❌ Backend unhealthy!" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "      Start with: npm run dev:backend" -ForegroundColor Yellow
    $testsFailed++
}

# Test 2: Frontend
Write-Host "`n2️⃣ Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running!" -ForegroundColor Green
        Write-Host "      URL: http://localhost:5173" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    Write-Host "   ❌ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "      Start with: npm run dev:frontend" -ForegroundColor Yellow
    $testsFailed++
}

# Test 3: API Endpoints
Write-Host "`n3️⃣ Testing API Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{ Path = "/api/health"; Name = "API Health" },
    @{ Path = "/api/sites/test"; Name = "Sites Test" },
    @{ Path = "/api/periods/test"; Name = "Periods Test" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000$($endpoint.Path)" -ErrorAction Stop
        Write-Host "   ✅ $($endpoint.Name)" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "   ❌ $($endpoint.Name)" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 4: CSV Upload
Write-Host "`n4️⃣ Testing CSV Upload..." -ForegroundColor Yellow

# Create test CSV
$csvContent = @"
Emission Source,Site/Location,Activity Data,Unit,Start Date,End Date,Notes
Natural Gas,Main Office,1500,kWh,2024-01-01,2024-01-31,Office heating
Electricity,Main Office,25000,kWh,2024-01-01,2024-01-31,Office electricity
Diesel,Fleet,800,litres,2024-01-01,2024-01-31,Company vehicles
"@

$testFile = "test_automated.csv"
$csvContent | Out-File -FilePath $testFile -Encoding UTF8

try {
    $form = @{ file = Get-Item $testFile }
    $upload = Invoke-RestMethod -Uri "http://localhost:3000/api/ingest/test" -Method Post -Form $form -ErrorAction Stop
    
    if ($upload.status -eq "success" -and $upload.rows_imported -gt 0) {
        Write-Host "   ✅ CSV Upload works!" -ForegroundColor Green
        Write-Host "      Rows imported: $($upload.rows_imported)" -ForegroundColor Gray
        Write-Host "      Rows failed: $($upload.rows_failed)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "   ⚠️  CSV uploaded but no rows imported" -ForegroundColor Yellow
        Write-Host "      Status: $($upload.status)" -ForegroundColor Gray
        $testsFailed++
    }
} catch {
    Write-Host "   ❌ CSV Upload failed!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testsFailed++
} finally {
    # Clean up test file
    if (Test-Path $testFile) {
        Remove-Item $testFile -ErrorAction SilentlyContinue
    }
}

# Test 5: Estimation API
Write-Host "`n5️⃣ Testing Estimation API..." -ForegroundColor Yellow
try {
    # This will fail if not authenticated, but we're just checking if the endpoint exists
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/estimations/test/test" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Estimation API endpoint exists" -ForegroundColor Green
    $testsPassed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✅ Estimation API endpoint exists (requires auth)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ❌ Estimation API endpoint not found" -ForegroundColor Red
        $testsFailed++
    }
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testsFailed" -ForegroundColor Red
Write-Host "📈 Total:  $($testsPassed + $testsFailed)" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 All tests passed! Your app is ready!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
}

Write-Host "`n🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:3000/api/health" -ForegroundColor White

Write-Host "`n🔑 Test Credentials:" -ForegroundColor Cyan
Write-Host "   Email:     admin@acme.com" -ForegroundColor White
Write-Host "   Password:  password123" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
if ($testsFailed -gt 0) {
    Write-Host "   1. Fix failed tests" -ForegroundColor White
    Write-Host "   2. Run this script again" -ForegroundColor White
    Write-Host "   3. Test manually in browser" -ForegroundColor White
} else {
    Write-Host "   1. Open http://localhost:5173 in browser" -ForegroundColor White
    Write-Host "   2. Login with test credentials" -ForegroundColor White
    Write-Host "   3. Test all features manually" -ForegroundColor White
    Write-Host "   4. Deploy to AWS when ready!" -ForegroundColor White
}

Write-Host ""
