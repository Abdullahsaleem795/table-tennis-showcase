@echo off
title Table Tennis Showcase GitHub Push Helper
echo ==========================================================
echo   Table Tennis Showcase GitHub Push Helper
echo ==========================================================
echo.
echo This script will connect your local repository to your GitHub.
echo Please make sure you have created a new empty repository at:
echo https://github.com/new
echo.

set /p REPO_URL="Paste your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b
)

echo.
echo Removing old remote if exists...
git remote remove origin >nul 2>&1

echo.
echo Connecting to: %REPO_URL%
git remote add origin %REPO_URL%

echo.
echo Pushing codebase to main branch...
git branch -M main
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. 
    echo Please verify that the repository exists on GitHub, and that 
    echo your credentials or personal access token are entered correctly.
) else (
    echo.
    echo [SUCCESS] Codebase pushed successfully to GitHub!
    echo Next steps: 
    echo 1. Link this GitHub repo to Render (Backend)
    echo 2. Link this GitHub repo to Vercel (Frontend)
)
echo.
pause
