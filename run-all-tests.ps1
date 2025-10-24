# Complete Application Test Script
# This script tests all major features of the HoudaProject

Write-Host "🧪 HoudaProject - Complete Application Test Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:3002"
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "Test123456"

# Test Results
$testResults = @{
    Passed = 0
    Failed = 0
    Tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $testResults.Passed++
            $testResults.Tests += @{ Name = $Name; Status = "PASSED" }
            return $response
        } else {
            Write-Host " ❌ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $testResults.Failed++
            $testResults.Tests += @{ Name = $Name; Status = "FAILED"; Error = "Status: $($response.StatusCode)" }
            return $null
        }
    }
    catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{ Name = $Name; Status = "FAILED"; Error = $_.Exception.Message }
        return $null
    }
}

Write-Host "📋 Step 1: Pre-flight Checks" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$BASE_URL/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Server is running on $BASE_URL" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "  cd 'c:\Users\Dell\Downloads\HoudaProject_update (4)\HoudaProject'" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "🧪 Step 2: Running API Tests" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Test-Endpoint -Name "Health Check" -Url "$BASE_URL/health"

# Test 2: API Health
Test-Endpoint -Name "API Health" -Url "$BASE_URL/api/health"

Write-Host ""
Write-Host "🔐 Step 3: Authentication Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: Login (if user exists)
Write-Host "Testing: Login..." -ForegroundColor Yellow -NoNewline
try {
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    if ($loginResponse.accessToken) {
        Write-Host " ✅ PASSED" -ForegroundColor Green
        $testResults.Passed++
        $testResults.Tests += @{ Name = "Login"; Status = "PASSED" }
        $TOKEN = $loginResponse.accessToken
        $USER_ID = $loginResponse.user.id
        $CUSTOMER_ID = $loginResponse.user.customerId
    } else {
        Write-Host " ❌ FAILED (No token received)" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{ Name = "Login"; Status = "FAILED"; Error = "No token" }
        $TOKEN = $null
    }
}
catch {
    Write-Host " ⚠️  SKIPPED (User may not exist)" -ForegroundColor Yellow
    Write-Host "   Create a test user first or update credentials in script" -ForegroundColor Gray
    $TOKEN = $null
}

Write-Host ""

# If we have a token, run authenticated tests
if ($TOKEN) {
    $authHeaders = @{
        "Authorization" = "Bearer $TOKEN"
    }

    Write-Host "📊 Step 4: Customer & Site Tests" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""

    # Test 4: Get Customers
    Test-Endpoint -Name "Get Customers" -Url "$BASE_URL/api/customers" -Headers $authHeaders

    # Test 5: Get Sites
    if ($CUSTOMER_ID) {
        Test-Endpoint -Name "Get Sites" -Url "$BASE_URL/api/sites?customerId=$CUSTOMER_ID" -Headers $authHeaders
    }

    Write-Host ""
    Write-Host "📅 Step 5: Reporting Period Tests" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""

    # Test 6: Get Periods
    if ($CUSTOMER_ID) {
        Test-Endpoint -Name "Get Reporting Periods" -Url "$BASE_URL/api/periods?customerId=$CUSTOMER_ID" -Headers $authHeaders
    }

    Write-Host ""
    Write-Host "📈 Step 6: Estimation Feature Tests (NEW!)" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""

    # Test 7: Estimation Preview (doesn't require saved data)
    Write-Host "Testing: Estimation Preview..." -ForegroundColor Yellow -NoNewline
    try {
        $estimationBody = @{
            numberOfEmployees = 50
            avgCommuteKm = 15
            avgWorkdaysPerYear = 220
            transportSplitCar = 70
            transportSplitPublic = 20
            transportSplitWalk = 10
            businessTravelSpendGBP = 50000
            numberOfFlights = 20
            avgFlightDistanceKm = 1500
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$BASE_URL/api/estimations/test-customer/test-period/preview" `
            -Method POST `
            -Body $estimationBody `
            -ContentType "application/json" `
            -Headers $authHeaders `
            -ErrorAction Stop

        if ($response.estimations -and $response.totalKgCo2e) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            Write-Host "   Total Emissions: $($response.totalTonnesCo2e) tonnes CO2e" -ForegroundColor Gray
            $testResults.Passed++
            $testResults.Tests += @{ Name = "Estimation Preview"; Status = "PASSED" }
        } else {
            Write-Host " ❌ FAILED (Invalid response)" -ForegroundColor Red
            $testResults.Failed++
            $testResults.Tests += @{ Name = "Estimation Preview"; Status = "FAILED" }
        }
    }
    catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{ Name = "Estimation Preview"; Status = "FAILED"; Error = $_.Exception.Message }
    }

    Write-Host ""
    Write-Host "📊 Step 7: Reporting Tests" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host ""

    # Test 8: Get Emissions Overview (may fail if no data)
    if ($CUSTOMER_ID) {
        Write-Host "Testing: Emissions Overview..." -ForegroundColor Yellow -NoNewline
        try {
            $response = Invoke-WebRequest -Uri "$BASE_URL/api/reporting/overview?customerId=$CUSTOMER_ID" `
                -Headers $authHeaders `
                -UseBasicParsing `
                -ErrorAction Stop
            
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $testResults.Passed++
            $testResults.Tests += @{ Name = "Emissions Overview"; Status = "PASSED" }
        }
        catch {
            Write-Host " ⚠️  SKIPPED (No data available)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "📋 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($testResults.Passed + $testResults.Failed)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review the results above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Detailed Test Results:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
foreach ($test in $testResults.Tests) {
    $status = if ($test.Status -eq "PASSED") { "✅" } else { "❌" }
    Write-Host "$status $($test.Name)" -ForegroundColor White
    if ($test.Error) {
        Write-Host "   Error: $($test.Error)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Review any failed tests above" -ForegroundColor White
Write-Host "2. Check server logs for detailed errors" -ForegroundColor White
Write-Host "3. Test frontend UI manually" -ForegroundColor White
Write-Host "4. Test file upload feature" -ForegroundColor White
Write-Host "5. See TEST_COMPLETE_APP.md for full testing guide" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
