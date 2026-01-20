@echo off
REM Quick Setup Script for MYVIBES on Windows

echo ========================================
echo    MYVIBES Local Setup (Windows)
echo ========================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo [OK] Found package.json
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take 2-3 minutes...
echo.
call npm install

if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed
echo.

REM Check for .env
if not exist ".env" (
    echo [INFO] No .env file found
    echo The app has built-in fallbacks - this is OK!
    echo.
    echo Optional: Copy .env.example to .env if needed:
    echo   copy .env.example .env
    echo.
) else (
    echo [OK] .env file exists
    echo.
)

REM Initialize git if not already
if not exist ".git" (
    echo Initializing git repository...
    git init
    if errorlevel 1 (
        echo [WARNING] Git not installed or failed
        echo Install from: https://git-scm.com/download/win
    ) else (
        echo [OK] Git initialized
    )
) else (
    echo [OK] Git already initialized
)
echo.

REM Summary
echo ========================================
echo.
echo [SUCCESS] Setup Complete!
echo.
echo Next steps:
echo 1. Start dev server:  npm run dev
echo 2. Open browser:      http://localhost:5173
echo 3. Test the app
echo 4. When ready:        pre-upload.bat
echo.
echo See WINDOWS-SETUP.md for detailed instructions
echo.
pause
