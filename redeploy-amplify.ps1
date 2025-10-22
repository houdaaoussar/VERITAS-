# Redeploy to AWS Amplify - Co-Lab VERITAS™
# This script prepares and pushes updates to trigger Amplify deployment

Write-Host "🚀 Redeploying to AWS Amplify..." -ForegroundColor Green

# Step 1: Check if we're in a git repository
Write-Host "`n📋 Checking git status..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Red
    git init
    Write-Host "✅ Git initialized!" -ForegroundColor Green
}

# Step 2: Build the application locally to verify
Write-Host "`n🔨 Building application to verify..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 3: Build frontend to verify
Write-Host "`n🎨 Building frontend to verify..." -ForegroundColor Yellow
cd frontend
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed! Please fix errors before deploying." -ForegroundColor Red
    cd ..
    exit 1
}
cd ..
Write-Host "✅ Frontend build successful!" -ForegroundColor Green

# Step 4: Check git status
Write-Host "`n📊 Checking for changes..." -ForegroundColor Yellow
git status

# Step 5: Add all changes
Write-Host "`n➕ Adding changes..." -ForegroundColor Yellow
git add .

# Step 6: Commit changes
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git commit -m $commitMessage

# Step 7: Check remote
Write-Host "`n🔗 Checking git remote..." -ForegroundColor Yellow
$remote = git remote -v
if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "⚠️  No remote configured. Please add your GitHub repository:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
    exit 1
}
Write-Host "✅ Remote configured!" -ForegroundColor Green

# Step 8: Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# Step 9: Push to GitHub
Write-Host "`n⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed! You may need to pull first or resolve conflicts." -ForegroundColor Red
    Write-Host "Try: git pull origin $currentBranch --rebase" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "`n🎉 AWS Amplify will automatically detect the changes and start deployment!" -ForegroundColor Green

Write-Host "`n📊 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/" -ForegroundColor White
Write-Host "2. Select your app" -ForegroundColor White
Write-Host "3. Monitor the deployment progress" -ForegroundColor White
Write-Host "4. Once complete, test your app!" -ForegroundColor White

Write-Host "`n🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "   Check deployment status: aws amplify list-apps --region YOUR_REGION" -ForegroundColor White
Write-Host "   View logs in Amplify Console" -ForegroundColor White

Write-Host "`n✨ Deployment initiated! Check Amplify Console for progress." -ForegroundColor Green
