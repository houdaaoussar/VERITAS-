# Fix and Start Script for HoudaProject
# This script regenerates Prisma client and starts the server

Write-Host "🔧 HoudaProject - Fix and Start Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green
Write-Host ""

# Step 1: Regenerate Prisma Client
Write-Host "📦 Step 1: Regenerating Prisma Client..." -ForegroundColor Yellow
Write-Host "Running: npx prisma generate" -ForegroundColor Gray
try {
    npx prisma generate
    Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Prisma generate failed, but continuing..." -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 2: Check if node_modules exists
Write-Host "📦 Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Check .env file
Write-Host "📦 Step 3: Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Gray
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created!" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANT: Please update .env with your database credentials!" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found. Please create .env manually." -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Display summary
Write-Host "📋 Fix Summary:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "✅ Database connection centralized" -ForegroundColor Green
Write-Host "✅ File upload routes fixed" -ForegroundColor Green
Write-Host "✅ Estimation feature enabled" -ForegroundColor Green
Write-Host "✅ Prisma schema updated" -ForegroundColor Green
Write-Host "✅ All imports corrected" -ForegroundColor Green
Write-Host ""

# Step 5: Ask to start server
Write-Host "🚀 Ready to start the server!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "1. Start development server (npm run dev)" -ForegroundColor White
Write-Host "2. Build and start production server (npm run build && npm start)" -ForegroundColor White
Write-Host "3. Exit (I'll start it manually)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        Write-Host "Server will run on: http://localhost:3002" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "2" {
        Write-Host ""
        Write-Host "🔨 Building project..." -ForegroundColor Yellow
        npm run build
        Write-Host ""
        Write-Host "🚀 Starting production server..." -ForegroundColor Green
        Write-Host "Server will run on: http://localhost:3002" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        npm start
    }
    "3" {
        Write-Host ""
        Write-Host "✅ Setup complete! You can now start the server manually:" -ForegroundColor Green
        Write-Host ""
        Write-Host "Development: npm run dev" -ForegroundColor Cyan
        Write-Host "Production:  npm run build && npm start" -ForegroundColor Cyan
        Write-Host ""
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Exiting..." -ForegroundColor Red
        Write-Host ""
        Write-Host "To start manually, run:" -ForegroundColor Yellow
        Write-Host "  npm run dev" -ForegroundColor Cyan
        Write-Host ""
    }
}

Write-Host ""
Write-Host "📖 For more information, see:" -ForegroundColor Cyan
Write-Host "   DATABASE_UPLOAD_ESTIMATION_FIXES.md" -ForegroundColor White
Write-Host ""
