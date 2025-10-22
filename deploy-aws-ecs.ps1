# AWS ECS Deployment Script for Co-Lab VERITAS
# This script deploys the application to AWS ECS using Fargate

param(
    [Parameter(Mandatory=$true)]
    [string]$AwsRegion,
    
    [Parameter(Mandatory=$true)]
    [string]$AwsAccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "colab-veritas-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "colab-veritas-service",
    
    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest"
)

Write-Host "🚀 Starting AWS ECS Deployment..." -ForegroundColor Green
Write-Host "Region: $AwsRegion" -ForegroundColor Cyan
Write-Host "Account: $AwsAccountId" -ForegroundColor Cyan

# Variables
$RepositoryName = "colab-veritas"
$RepositoryUri = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com/$RepositoryName"

# Step 1: Build the application
Write-Host "`n📦 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 2: Login to ECR
Write-Host "`n🔐 Logging in to Amazon ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $RepositoryUri
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ECR login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged in to ECR!" -ForegroundColor Green

# Step 3: Create ECR repository if it doesn't exist
Write-Host "`n📦 Checking ECR repository..." -ForegroundColor Yellow
aws ecr describe-repositories --repository-names $RepositoryName --region $AwsRegion 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating ECR repository..." -ForegroundColor Yellow
    aws ecr create-repository --repository-name $RepositoryName --region $AwsRegion
    Write-Host "✅ Repository created!" -ForegroundColor Green
} else {
    Write-Host "✅ Repository exists!" -ForegroundColor Green
}

# Step 4: Build Docker image
Write-Host "`n🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t $RepositoryName`:$ImageTag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built!" -ForegroundColor Green

# Step 5: Tag image
Write-Host "`n🏷️  Tagging image..." -ForegroundColor Yellow
docker tag $RepositoryName`:$ImageTag $RepositoryUri`:$ImageTag
docker tag $RepositoryName`:$ImageTag $RepositoryUri`:latest
Write-Host "✅ Image tagged!" -ForegroundColor Green

# Step 6: Push to ECR
Write-Host "`n⬆️  Pushing image to ECR..." -ForegroundColor Yellow
docker push $RepositoryUri`:$ImageTag
docker push $RepositoryUri`:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pushed to ECR!" -ForegroundColor Green

# Step 7: Update ECS service
Write-Host "`n🔄 Updating ECS service..." -ForegroundColor Yellow
aws ecs update-service --cluster $ClusterName --service $ServiceName --force-new-deployment --region $AwsRegion
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Service update failed. You may need to create the service first." -ForegroundColor Yellow
} else {
    Write-Host "✅ ECS service updated!" -ForegroundColor Green
}

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Check ECS console: https://console.aws.amazon.com/ecs/" -ForegroundColor White
Write-Host "2. Monitor deployment status" -ForegroundColor White
Write-Host "3. Check application logs in CloudWatch" -ForegroundColor White
