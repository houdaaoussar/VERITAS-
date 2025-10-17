# Fix Port 3002 Already In Use Issue

Write-Host "=== Fixing Port 3002 Issue ===" -ForegroundColor Cyan
Write-Host ""

# Find process using port 3002
Write-Host "Finding process using port 3002..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($process) {
    Write-Host "Found process: PID $process" -ForegroundColor Green
    
    # Get process details
    $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
    
    if ($processInfo) {
        Write-Host "Process Name: $($processInfo.ProcessName)" -ForegroundColor Gray
        Write-Host "Process Path: $($processInfo.Path)" -ForegroundColor Gray
        Write-Host ""
        
        # Ask to kill
        Write-Host "Do you want to kill this process? (Y/N)" -ForegroundColor Yellow
        $response = Read-Host
        
        if ($response -eq "Y" -or $response -eq "y") {
            Stop-Process -Id $process -Force
            Write-Host "✅ Process killed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now run: npm run dev:backend" -ForegroundColor Cyan
        } else {
            Write-Host "Process not killed. You can:" -ForegroundColor Yellow
            Write-Host "  1. Manually kill it: Stop-Process -Id $process -Force" -ForegroundColor Gray
            Write-Host "  2. Use a different port in .env file" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "No process found using port 3002" -ForegroundColor Yellow
    Write-Host "Port should be available now!" -ForegroundColor Green
}
