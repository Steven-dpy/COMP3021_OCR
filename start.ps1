# start.ps1
Write-Host "========================================" -ForegroundColor Green
Write-Host "   OCR Service Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Python
Write-Host "[1/7] Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found, please install Python 3.9+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check virtual environment
Write-Host "[2/7] Setting up virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "myenv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv myenv
}
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\myenv\Scripts\Activate.ps1

# Install dependencies
Write-Host "[3/7] Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "requirements.txt not found, skipping dependency installation" -ForegroundColor Yellow
}

# Create directories
Write-Host "[4/7] Creating necessary directories..." -ForegroundColor Yellow
$directories = @("..\share", "logs", "temp")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Cyan
    }
}
Write-Host "Directories created successfully" -ForegroundColor Green

# Start OCR service
Write-Host "[5/7] Starting OCR service..." -ForegroundColor Yellow
Write-Host "Starting service..." -ForegroundColor Magenta
Write-Host "Access URL: http://localhost:8001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop service" -ForegroundColor Yellow
Write-Host ""

# Start OCR service process
Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"& .\myenv\Scripts\Activate.ps1; paddlex --install serving; paddlex --serve --pipeline OCR --port 8001`"" -WindowStyle Normal

# Wait for OCR service to start
Write-Host "Waiting for OCR service to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Start backend service
Write-Host "[6/7] Starting backend service..." -ForegroundColor Yellow

# Check if backend directory exists
if (Test-Path "backend") {
    # Start backend in new PowerShell window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd '$PWD\backend'; & '..\myenv\Scripts\Activate.ps1'; python manage.py makemigrations; python manage.py makemigrations recognition; python manage.py migrate; python manage.py runserver`"" -WindowStyle Normal
    
    Write-Host "Starting backend service..." -ForegroundColor Magenta
    Write-Host "Access URL: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host "API documentation: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop service" -ForegroundColor Yellow
} else {
    Write-Host "Backend directory not found, skipping backend service" -ForegroundColor Yellow
}

Write-Host ""

# Start frontend service
Write-Host "[7/7] Starting frontend service..." -ForegroundColor Yellow

# Check if frontend directory exists
if (Test-Path "frontend") {
    # Start frontend in new PowerShell window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd '$PWD\frontend'; if (Test-Path 'node_modules') { Write-Host 'Dependencies already exist, skipping installation...' } else { npm install }; npm run dev`"" -WindowStyle Normal
    
    Write-Host "Starting frontend service..." -ForegroundColor Magenta
    Write-Host "Access URL: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop service" -ForegroundColor Yellow
} else {
    Write-Host "Frontend directory not found, skipping frontend service" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "       All services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "OCR Service: http://localhost:8001" -ForegroundColor Cyan
Write-Host "Backend Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend Service: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, close all PowerShell windows" -ForegroundColor Yellow
Write-Host ""

# Wait for user input to keep window open
Write-Host "Press Enter to exit monitoring..." -ForegroundColor Gray
Read-Host