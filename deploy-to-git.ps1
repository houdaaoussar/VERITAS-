# PowerShell Deployment Script for Windows
# Commits and pushes changes to trigger AWS Amplify deployment

Write-Host "================================" -ForegroundColor Cyan
Write-Host "[DEPLOY] Git Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "[ERROR] Git is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Git is installed" -ForegroundColor Green
Write-Host ""

# Check git status
Write-Host "[INFO] Checking git status..." -ForegroundColor Blue
git status

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "[INPUT] Commit Message" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Enhanced Excel ingest with intelligent data extraction and calculator integration"
}

Write-Host ""
Write-Host "[STEP 1] Adding files to git..." -ForegroundColor Blue
git add .

Write-Host ""
Write-Host "[STEP 2] Committing changes..." -ForegroundColor Blue
git commit -m "$commitMessage"

Write-Host ""
Write-Host "[STEP 3] Pushing to remote..." -ForegroundColor Blue
git push origin main

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "[SUCCESS] Deployment Triggered!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "[NEXT] Next steps:" -ForegroundColor Cyan
Write-Host "  1. Go to AWS Amplify Console" -ForegroundColor White
Write-Host "  2. Monitor the build progress" -ForegroundColor White
Write-Host "  3. Check deployment logs" -ForegroundColor White
Write-Host "  4. Test the live site" -ForegroundColor White
Write-Host ""
Write-Host "[LINK] AWS Amplify Console:" -ForegroundColor Cyan
Write-Host "  https://console.aws.amazon.com/amplify/" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
