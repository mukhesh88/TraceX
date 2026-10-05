@echo off
setlocal enabledelayedexpansion
title TraceX - Service Terminator

echo ====================================================================
echo                   Stopping TraceX Platform Services                 
echo ====================================================================
echo.

set "STOPPED=0"

:: 1. Terminate process on Port 8080 (TraceX Backend)
echo [*] Checking for active processes on Port 8080 [Spring Boot Backend]...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr /I "LISTENING" 2^>nul') do (
    echo  [-] Terminating backend process [PID: %%a]...
    taskkill /F /PID %%a >nul 2>&1
    set "STOPPED=1"
)

:: 2. Terminate process on Port 3000 (TraceX Frontend)
echo [*] Checking for active processes on Port 3000 [Next.js Frontend]...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":3000 " ^| findstr /I "LISTENING" 2^>nul') do (
    echo  [-] Terminating frontend process [PID: %%a]...
    taskkill /F /PID %%a >nul 2>&1
    set "STOPPED=1"
)

:: 3. Terminate by Window Title if still open
taskkill /FI "WINDOWTITLE eq TraceX Backend*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq TraceX Frontend*" /F /T >nul 2>&1

echo.
if "%STOPPED%"=="1" (
    echo [SUCCESS] TraceX backend and frontend services have been successfully stopped.
) else (
    echo [INFO] No active TraceX processes found on Port 8080 or Port 3000.
)
echo ====================================================================
echo.
if /i not "%~1"=="--silent" (
    echo Press any key to exit...
    pause >nul
)
