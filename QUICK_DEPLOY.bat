@echo off
echo ========================================
echo Myliu App - GitHub Deploy Helper
echo ========================================
echo.

echo [1/4] Checking Git configuration...
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo Git user.name is not set!
    echo Please set it with:
    echo   git config --global user.name "SarkaSi"
    echo   git config --global user.email "your-email@example.com"
    echo.
    pause
    exit /b 1
)

echo [2/4] Adding files to Git...
git add .

echo [3/4] Creating commit...
git commit -m "Initial commit: Myliu pazintys platform"

echo [4/4] Checking remote...
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo IMPORTANT: Repository not connected!
    echo ========================================
    echo.
    echo First, create repository on GitHub:
    echo   1. Go to: https://github.com/new
    echo   2. Repository name: myliu-app
    echo   3. DO NOT check: Add README, .gitignore, license
    echo   4. Click "Create repository"
    echo.
    echo Then run this command:
    echo   git remote add origin https://github.com/SarkaSi/myliu-app.git
    echo   git branch -M main
    echo   git push -u origin main
    echo.
) else (
    echo Remote is configured.
    echo To push, run:
    echo   git push -u origin main
)

echo.
echo ========================================
echo Done! Check DEPLOY_STEPS.md for details
echo ========================================
pause
