@echo off
REM Pre-upload verification script for Windows

echo ========================================
echo   MYVIBES Pre-Upload Verification
echo ========================================
echo.

REM Check Node.js
echo 1. Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not installed
    echo Download from: https://nodejs.org
    pause
    exit /b 1
) else (
    echo [OK] Node.js installed
)
echo.

REM Check npm
echo 2. Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found
    pause
    exit /b 1
) else (
    echo [OK] npm installed
)
echo.

REM Run security check
echo 3. Running security checks...
call check-secrets.bat
echo.

REM Check dependencies
echo 4. Checking dependencies...
if exist "node_modules" (
    echo [OK] node_modules exists
) else (
    echo [INFO] Installing dependencies...
    call npm install
)
echo.

REM Test build
echo 5. Testing production build...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Build failed! Fix errors before uploading.
    echo Run 'npm run build' to see errors.
    pause
    exit /b 1
) else (
    echo [OK] Build successful
)
echo.

REM Check critical files
echo 6. Checking critical files...
set MISSING=0

if exist "README.md" (echo [OK] README.md) else (echo [ERROR] README.md missing & set /a MISSING+=1)
if exist ".gitignore" (echo [OK] .gitignore) else (echo [ERROR] .gitignore missing & set /a MISSING+=1)
if exist "package.json" (echo [OK] package.json) else (echo [ERROR] package.json missing & set /a MISSING+=1)
if exist "deploy.md" (echo [OK] deploy.md) else (echo [ERROR] deploy.md missing & set /a MISSING+=1)

if %MISSING% gtr 0 (
    echo.
    echo [ERROR] Missing critical files!
    pause
    exit /b 1
)
echo.

REM Check Git
echo 7. Checking Git status...
git --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git not installed
    echo Install from: https://git-scm.com/download/win
) else (
    echo [OK] Git installed
    
    REM Check if git repo initialized
    if exist ".git" (
        echo [OK] Git repository initialized
    ) else (
        echo [INFO] Git not initialized. Run: git init
    )
)
echo.

REM Summary
echo ========================================
echo.
echo [SUCCESS] All verification checks passed!
echo.
echo Next steps:
echo 1. Review CLEANUP-CHECKLIST.md
echo 2. Commit your code:
echo    git add .
echo    git commit -m "Initial commit"
echo 3. Create GitHub repository
echo 4. Push to GitHub:
echo    git remote add origin https://github.com/USERNAME/myvibes.git
echo    git push -u origin main
echo.
echo Ready for GitHub upload!
echo.
pause
