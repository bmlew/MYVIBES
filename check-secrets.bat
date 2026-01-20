@echo off
REM Security check script for Windows

echo ========================================
echo    Checking for Secrets (Windows)
echo ========================================
echo.

set ISSUES=0

echo Checking for API keys...
findstr /s /i "api_key.*=.*['\"]" src\*.tsx src\*.ts 2>nul | findstr /v ".example" | findstr /v "your-" >nul
if errorlevel 1 (
    echo [OK] No hardcoded API keys found
) else (
    echo [WARNING] Found potential API keys!
    set /a ISSUES+=1
)
echo.

echo Checking for passwords...
findstr /s /i "password.*=.*['\"]" src\*.tsx src\*.ts 2>nul | findstr /v ".example" | findstr /v "your-" | findstr /v "PASSWORD" | findstr /v "password:" >nul
if errorlevel 1 (
    echo [OK] No hardcoded passwords found
) else (
    echo [WARNING] Found potential passwords!
    set /a ISSUES+=1
)
echo.

echo Checking for .env file...
if exist ".env" (
    echo [OK] .env file exists
) else (
    echo [INFO] .env file not found - create one from .env.example
)
echo.

echo Checking .gitignore...
if exist ".gitignore" (
    echo [OK] .gitignore exists
    findstr /c:".env" .gitignore >nul
    if errorlevel 1 (
        echo [WARNING] .env is NOT in .gitignore!
        set /a ISSUES+=1
    ) else (
        echo [OK] .env is in .gitignore
    )
) else (
    echo [WARNING] .gitignore not found!
    set /a ISSUES+=1
)
echo.

echo ========================================
echo.
if %ISSUES%==0 (
    echo [SUCCESS] All checks passed! Ready for GitHub.
) else (
    echo [WARNING] Found %ISSUES% potential issues.
    echo Please review above and fix before uploading.
)
echo.
pause
