# Setup Panenku PostgreSQL Database
# Run this script with: .\setup-db.ps1

$pgPath = "C:\Program Files\PostgreSQL\18\bin"
$env:PATH = "$pgPath;$env:PATH"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Panenku Database Setup" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Step 1: Get PostgreSQL password
$password = Read-Host "Masukkan password PostgreSQL user 'postgres'" -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password)
)
$env:PGPASSWORD = $plainPassword

# Step 2: Create database
Write-Host "`n[1/4] Creating database 'panenku_dev'..." -ForegroundColor Yellow
$dbResult = createdb -U postgres panenku_dev 2>&1
if ($LASTEXITCODE -eq 0 -or $dbResult -like "*already exists*") {
    Write-Host "[OK] Database created/exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to create database: $dbResult" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

# Step 3: Enable pgcrypto extension
Write-Host "`n[2/4] Enabling pgcrypto extension..." -ForegroundColor Yellow
$extResult = psql -U postgres -d panenku_dev -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] pgcrypto enabled" -ForegroundColor Green
} else {
    Write-Host "[WARN] pgcrypto status: $extResult" -ForegroundColor Yellow
}

# Step 4: Load schema
Write-Host "`n[3/4] Loading database schema..." -ForegroundColor Yellow
$schemaResult = psql -U postgres -d panenku_dev -f db/schema.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Schema loaded" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to load schema: $schemaResult" -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}

# Step 5: Load seed data
Write-Host "`n[4/4] Loading seed data..." -ForegroundColor Yellow
$seedResult = psql -U postgres -d panenku_dev -f db/seed.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Seed data loaded" -ForegroundColor Green
} else {
    Write-Host "[WARN] Seed load: $seedResult" -ForegroundColor Yellow
}

# Step 6: Verify
Write-Host "`n[Verify] Checking tables..." -ForegroundColor Yellow
$checkResult = psql -U postgres -d panenku_dev -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';" 2>&1
Write-Host $checkResult -ForegroundColor Cyan

# Clear password from memory
$env:PGPASSWORD = ""

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "SUCCESS - Database setup complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. cd server" -ForegroundColor White
Write-Host "2. cp .env.example .env" -ForegroundColor White
Write-Host "3. Edit .env and set DATABASE_URL" -ForegroundColor White
Write-Host "4. npm install" -ForegroundColor White
Write-Host "5. npm run dev" -ForegroundColor White
