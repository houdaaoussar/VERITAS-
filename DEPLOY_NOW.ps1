# Quick Deploy to AWS Amplify Script

Write-Host "🚀 Deploying to AWS Amplify..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Check git status
Write-Host "`n1️⃣ Checking git status..." -ForegroundColor Yellow
git status

# Step 2: Add all changes
Write-Host "`n2️⃣ Adding all changes..." -ForegroundColor Yellow
git add .

# Step 3: Commit
Write-Host "`n3️⃣ Committing changes..." -ForegroundColor Yellow
$commitMessage = "Deploy updated VERITAS with all features - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

# Step 4: Push to GitHub
Write-Host "`n4️⃣ Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This will trigger AWS Amplify deployment automatically!" -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host "`n📊 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/" -ForegroundColor White
Write-Host "2. Your app should start building automatically" -ForegroundColor White
Write-Host "3. Wait 5-10 minutes for deployment" -ForegroundColor White
Write-Host "4. Check your app URL when deployment completes" -ForegroundColor White

Write-Host "`n🎉 Deployment initiated!" -ForegroundColor Green
