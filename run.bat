@echo off
setlocal enabledelayedexpansion
title TraceX - Real-Time Phishing Detection Platform Launcher

set "ROOT_DIR=%~dp0"

:: -----------------------------------------------------------------------------
:: CLI Argument Router
:: -----------------------------------------------------------------------------
if /i "%~1"=="all" goto ACTION_ALL
if /i "%~1"=="backend" goto ACTION_BACKEND
if /i "%~1"=="frontend" goto ACTION_FRONTEND
if /i "%~1"=="test" goto ACTION_TEST
if /i "%~1"=="benchmark" goto ACTION_TEST
if /i "%~1"=="stop" goto ACTION_STOP
if /i "%~1"=="build" goto ACTION_BUILD
if /i "%~1"=="help" goto SHOW_HELP
if /i "%~1"=="/?" goto SHOW_HELP
if /i "%~1"=="-h" goto SHOW_HELP

:: -----------------------------------------------------------------------------
:: Environment Detection & Validation
:: -----------------------------------------------------------------------------
:DETECT_ENV
cls
echo ====================================================================
echo     TRACE-X : REAL-TIME PHISHING DETECTION ^& FORENSICS PLATFORM    
echo ====================================================================
echo.
echo [*] Inspecting runtime environment prerequisites...
echo.

:: 1. Detect Java (Java 17 or Java 21)
set "JAVA_CMD="

where java.exe >nul 2>nul
if %ERRORLEVEL% equ 0 set "JAVA_CMD=java"

if not defined JAVA_CMD if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
)

if not defined JAVA_CMD (
    for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.antigravity-ide\extensions\java.exe" 2^>nul') do (
        if exist "%%I" set "JAVA_CMD=%%I"
    )
)

if not defined JAVA_CMD (
    for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.vscode\extensions\java.exe" 2^>nul') do (
        if exist "%%I" set "JAVA_CMD=%%I"
    )
)

if not defined JAVA_CMD (
    for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk*" "%ProgramFiles%\Java\jdk*" "%ProgramFiles%\Microsoft\jdk*" "%ProgramFiles%\Amazon Corretto\jdk*" "%ProgramFiles%\Zulu\zulu*") do (
        if exist "%%D\bin\java.exe" set "JAVA_CMD=%%D\bin\java.exe"
    )
)

if not defined JAVA_CMD (
    for /d %%D in ("%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk*" "%USERPROFILE%\.jdks\*") do (
        if exist "%%D\bin\java.exe" set "JAVA_CMD=%%D\bin\java.exe"
    )
)

if not defined JAVA_CMD (
    echo [ERROR] Java Runtime [Java 17+ or Java 21] was not found!
    echo         The TraceX backend requires a 64-bit Java runtime.
    echo         Please download and install OpenJDK 17 or 21:
    echo         https://adoptium.net/temurin/releases/
    echo.
    pause
    exit /b 1
)
echo  [+] Java Runtime detected:
echo      "%JAVA_CMD%"

:: 2. Detect Node.js
set "NODE_CMD="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined NODE_CMD set "NODE_CMD=%%I"
if not defined NODE_CMD if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_CMD if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"

if not defined NODE_CMD (
    echo [ERROR] Node.js was not found!
    echo         The TraceX frontend dashboard requires Node.js [v18+].
    echo         Please download and install Node.js from:
    echo         https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo  [+] Node.js detected:
echo      "%NODE_CMD%"

:: 3. Detect npm
set "NPM_CMD="
for /f "delims=" %%I in ('where npm.cmd 2^>nul') do if not defined NPM_CMD set "NPM_CMD=%%I"
if not defined NPM_CMD if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if not defined NPM_CMD if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"

if not defined NPM_CMD (
    echo [ERROR] npm package manager was not found!
    echo         Please ensure npm is installed and configured in your PATH.
    echo.
    pause
    exit /b 1
)
echo  [+] npm package manager detected:
echo      "%NPM_CMD%"

:: 4. Verify Backend JAR
if not exist "%ROOT_DIR%backend\target\tracex-backend-1.0.0.jar" (
    echo.
    echo [WARNING] Backend JAR not found at: backend\target\tracex-backend-1.0.0.jar
    echo           Checking for Maven to build backend package...
    where mvn.cmd >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [*] Packaging backend microservice with Maven...
        cd /d "%ROOT_DIR%backend"
        call mvn clean package -DskipTests
        cd /d "%ROOT_DIR%"
    ) else (
        echo [ERROR] Maven is not installed or available on PATH.
        echo         Please build the backend first with 'mvn clean package -DskipTests'
        echo         or place 'tracex-backend-1.0.0.jar' in 'backend\target\'.
        echo.
        pause
        exit /b 1
    )
)
echo  [+] Backend JAR verified: backend\target\tracex-backend-1.0.0.jar

:: 5. Verify Frontend Dependencies
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo.
    echo [*] Frontend dependencies not found. Installing node_modules...
    cd /d "%ROOT_DIR%frontend"
    call "%NPM_CMD%" install
    cd /d "%ROOT_DIR%"
)
echo  [+] Frontend dependencies verified: frontend\node_modules
echo.

:: -----------------------------------------------------------------------------
:: Interactive Selection Menu
:: -----------------------------------------------------------------------------
:MENU
echo ====================================================================
echo                   SELECT RUNTIME EXECUTION MODE                     
echo ====================================================================
echo.
echo   [1] Start Full Platform [Backend + Frontend + Browser]  ^<-- DEFAULT
echo   [2] Start Backend Only  [Spring Boot Microservice on :8080]
echo   [3] Start Frontend Only [Next.js Dashboard on :3000]
echo   [4] Run Forensic Latency Benchmark Suite [PowerShell]
echo   [5] Stop Running TraceX Services [Port 8080 ^& 3000]
echo   [6] Rebuild Backend ^& Frontend Packages
echo   [Q] Quit Launcher
echo.
echo ====================================================================
choice /c 123456Q /t 5 /d 1 /m "Select option [1-6, Q] (Auto-starts [1] in 5s): "
set "CHOICE_VAL=%ERRORLEVEL%"

if "%CHOICE_VAL%"=="1" goto ACTION_ALL
if "%CHOICE_VAL%"=="2" goto ACTION_BACKEND
if "%CHOICE_VAL%"=="3" goto ACTION_FRONTEND
if "%CHOICE_VAL%"=="4" goto ACTION_TEST
if "%CHOICE_VAL%"=="5" goto ACTION_STOP
if "%CHOICE_VAL%"=="6" goto ACTION_BUILD
if "%CHOICE_VAL%"=="7" goto QUIT
goto MENU

:: -----------------------------------------------------------------------------
:: Action: Start Full Platform
:: -----------------------------------------------------------------------------
:ACTION_ALL
call :DETECT_ENV_SILENT
call :CHECK_PORT_CONFLICTS

echo.
echo ====================================================================
echo              LAUNCHING TRACEX FULL PLATFORM SERVICES                
echo ====================================================================
echo.

:: Launch Backend
echo [*] Launching TraceX Backend [Spring Boot on Port 8080]...
start "TraceX Backend (Port 8080)" cmd /k "title TraceX Backend [Port 8080] && cd /d "%ROOT_DIR%backend" && echo ==================================================================== && echo   TraceX Backend Microservice [Spring Boot 3.2.5 + ONNX Runtime]     && echo   Listening on: http://localhost:8080                                  && echo   H2 Console:   http://localhost:8080/h2-console                       && echo ==================================================================== && echo. && "%JAVA_CMD%" -jar "%ROOT_DIR%backend\target\tracex-backend-1.0.0.jar""

:: Small delay to let Spring Boot begin socket bind
timeout /t 2 /nobreak >nul

:: Launch Frontend
echo [*] Launching TraceX Frontend [Next.js Dashboard on Port 3000]...
start "TraceX Frontend (Port 3000)" cmd /k "title TraceX Frontend [Port 3000] && cd /d "%ROOT_DIR%frontend" && echo ==================================================================== && echo   TraceX Frontend Dashboard [Next.js 14 + React 18]                  && echo   Listening on: http://localhost:3000                                  && echo ==================================================================== && echo. && if exist "node_modules\next\dist\bin\next" ("%NODE_CMD%" node_modules\next\dist\bin\next dev -p 3000) else (call "%NPM_CMD%" run dev)"

echo.
echo [*] Initializing services, opening dashboard in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:3000

goto MONITOR_PANEL

:: -----------------------------------------------------------------------------
:: Action: Start Backend Only
:: -----------------------------------------------------------------------------
:ACTION_BACKEND
call :DETECT_ENV_SILENT
echo.
echo [*] Launching TraceX Backend [Spring Boot on Port 8080]...
start "TraceX Backend (Port 8080)" cmd /k "title TraceX Backend [Port 8080] && cd /d "%ROOT_DIR%backend" && echo ==================================================================== && echo   TraceX Backend Microservice [Spring Boot 3.2.5 + ONNX Runtime]     && echo   Listening on: http://localhost:8080                                  && echo ==================================================================== && echo. && "%JAVA_CMD%" -jar "%ROOT_DIR%backend\target\tracex-backend-1.0.0.jar""

echo.
echo [SUCCESS] Backend launched in a dedicated window.
echo           API Endpoint: http://localhost:8080/api/v1/scan
echo           H2 Database:  http://localhost:8080/h2-console
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Action: Start Frontend Only
:: -----------------------------------------------------------------------------
:ACTION_FRONTEND
call :DETECT_ENV_SILENT
echo.
echo [*] Launching TraceX Frontend [Next.js Dashboard on Port 3000]...
start "TraceX Frontend (Port 3000)" cmd /k "title TraceX Frontend [Port 3000] && cd /d "%ROOT_DIR%frontend" && echo ==================================================================== && echo   TraceX Frontend Dashboard [Next.js 14 + React 18]                  && echo   Listening on: http://localhost:3000                                  && echo ==================================================================== && echo. && if exist "node_modules\next\dist\bin\next" ("%NODE_CMD%" node_modules\next\dist\bin\next dev -p 3000) else (call "%NPM_CMD%" run dev)"

timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo [SUCCESS] Frontend launched in a dedicated window: http://localhost:3000
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Action: Run Latency Benchmark Suite
:: -----------------------------------------------------------------------------
:ACTION_TEST
cls
echo ====================================================================
echo           TraceX Forensic Latency Benchmark Suite                   
echo ====================================================================
echo.
echo [*] Verifying if Backend service is active on Port 8080...
netstat -ano | findstr /C:":8080 " | findstr /I "LISTENING" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Backend is not currently running on Port 8080.
    echo           Please start the Backend first before running the benchmark suite.
    echo.
    choice /c YN /m "Would you like to start the Backend now? [Y/N]: "
    if "!ERRORLEVEL!"=="1" (
        call :DETECT_ENV_SILENT
        echo [*] Launching Backend...
        start "TraceX Backend (Port 8080)" cmd /k "title TraceX Backend [Port 8080] && cd /d "%ROOT_DIR%backend" && "%JAVA_CMD%" -jar "%ROOT_DIR%backend\target\tracex-backend-1.0.0.jar""
        echo [*] Waiting 12 seconds for Spring Boot and ONNX pre-warm...
        timeout /t 12 /nobreak >nul
    ) else (
        goto MENU
    )
)

echo [*] Executing latency benchmark script [scripts\test_latency.ps1]...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\test_latency.ps1"
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Action: Stop Running Services
:: -----------------------------------------------------------------------------
:ACTION_STOP
call "%ROOT_DIR%stop.bat" --silent
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Action: Rebuild Packages
:: -----------------------------------------------------------------------------
:ACTION_BUILD
cls
echo ====================================================================
echo                   REBUILD TRACEX PACKAGES                           
echo ====================================================================
echo.
where mvn.cmd >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [*] Packaging Backend with Maven...
    cd /d "%ROOT_DIR%backend"
    call mvn clean package -DskipTests
    cd /d "%ROOT_DIR%"
) else (
    echo [SKIP] Maven command not found in PATH. Skipping backend build.
)

call :DETECT_ENV_SILENT
echo.
echo [*] Installing frontend packages...
cd /d "%ROOT_DIR%frontend"
call "%NPM_CMD%" install
cd /d "%ROOT_DIR%"

echo.
echo [SUCCESS] Rebuild process complete.
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Monitor Panel (Active after Full Launch)
:: -----------------------------------------------------------------------------
:MONITOR_PANEL
cls
echo ====================================================================
echo           TRACE-X PLATFORM IS RUNNING SUCCESSFULLY!                 
echo ====================================================================
echo.
echo   [DASHBOARD]     http://localhost:3000
echo   [BACKEND API]   http://localhost:8080/api/v1/scan
echo   [TELEMETRY]     http://localhost:8080/api/v1/stats
echo   [H2 CONSOLE]    http://localhost:8080/h2-console
echo                   JDBC URL: jdbc:h2:mem:tracexdb  ^|  User: sa  ^|  Pass: [empty]
echo.
echo   [EXTENSION]     Loaded unpacked from:
echo                   %ROOT_DIR%extension
echo                   (Enable Developer mode at chrome://extensions or edge://extensions)
echo.
echo ====================================================================
echo   QUICK COMMANDS:
echo     [1] Open Frontend Dashboard in browser  [http://localhost:3000]
echo     [2] Open Backend Telemetry API          [http://localhost:8080/api/v1/stats]
echo     [3] Open H2 Database Console            [http://localhost:8080/h2-console]
echo     [4] Run Latency Benchmark Test Suite
echo     [5] Stop all TraceX services ^& Exit
echo     [Q] Exit this control window [services keep running]
echo ====================================================================
echo.
choice /c 12345Q /m "Select command [1-5, Q]: "
set "PANEL_VAL=%ERRORLEVEL%"

if "%PANEL_VAL%"=="1" (
    start http://localhost:3000
    goto MONITOR_PANEL
)
if "%PANEL_VAL%"=="2" (
    start http://localhost:8080/api/v1/stats
    goto MONITOR_PANEL
)
if "%PANEL_VAL%"=="3" (
    start http://localhost:8080/h2-console
    goto MONITOR_PANEL
)
if "%PANEL_VAL%"=="4" (
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\test_latency.ps1"
    echo.
    pause
    goto MONITOR_PANEL
)
if "%PANEL_VAL%"=="5" (
    call "%ROOT_DIR%stop.bat" --silent
    goto QUIT
)
if "%PANEL_VAL%"=="6" goto QUIT

goto MONITOR_PANEL

:: -----------------------------------------------------------------------------
:: Helper: Check for Port Conflicts
:: -----------------------------------------------------------------------------
:CHECK_PORT_CONFLICTS
set "PORT_CONFLICT=0"
netstat -ano | findstr /C:":8080 " | findstr /I "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 set "PORT_CONFLICT=1"

netstat -ano | findstr /C:":3000 " | findstr /I "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 set "PORT_CONFLICT=1"

if "%PORT_CONFLICT%"=="1" (
    echo.
    echo [NOTICE] Ports 8080 or 3000 are already in use by active processes.
    choice /c YN /m "Would you like to terminate existing processes on these ports first? [Y/N]: "
    if "!ERRORLEVEL!"=="1" (
        call "%ROOT_DIR%stop.bat" --silent
    )
)
exit /b 0

:: -----------------------------------------------------------------------------
:: Helper: Silent Environment Detection (For Subroutines)
:: -----------------------------------------------------------------------------
:DETECT_ENV_SILENT
if defined JAVA_CMD if defined NODE_CMD if defined NPM_CMD exit /b 0

:: Detect Java
where java.exe >nul 2>nul
if %ERRORLEVEL% equ 0 set "JAVA_CMD=java"

if not defined JAVA_CMD if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
)

if not defined JAVA_CMD (
    for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.antigravity-ide\extensions\java.exe" 2^>nul') do (
        if exist "%%I" set "JAVA_CMD=%%I"
    )
)

if not defined JAVA_CMD (
    for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.vscode\extensions\java.exe" 2^>nul') do (
        if exist "%%I" set "JAVA_CMD=%%I"
    )
)

if not defined JAVA_CMD (
    for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk*" "%ProgramFiles%\Java\jdk*" "%ProgramFiles%\Microsoft\jdk*" "%ProgramFiles%\Amazon Corretto\jdk*" "%ProgramFiles%\Zulu\zulu*") do (
        if exist "%%D\bin\java.exe" set "JAVA_CMD=%%D\bin\java.exe"
    )
)

:: Detect Node
set "NODE_CMD="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined NODE_CMD set "NODE_CMD=%%I"
if not defined NODE_CMD if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_CMD if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"

:: Detect npm
set "NPM_CMD="
for /f "delims=" %%I in ('where npm.cmd 2^>nul') do if not defined NPM_CMD set "NPM_CMD=%%I"
if not defined NPM_CMD if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if not defined NPM_CMD if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"

exit /b 0

:: -----------------------------------------------------------------------------
:: CLI Help
:: -----------------------------------------------------------------------------
:SHOW_HELP
echo ====================================================================
echo        TraceX Launcher - Command Line Usage Guide                  
echo ====================================================================
echo.
echo Syntax:
echo   run.bat [command]
echo.
echo Available Commands:
echo   all        Start Full Platform [Backend + Frontend + Browser] (Default)
echo   backend    Start Spring Boot Microservice only on Port 8080
echo   frontend   Start Next.js Dashboard only on Port 3000
echo   test       Execute automated forensic latency benchmark suite
echo   stop       Terminate all running TraceX backend and frontend processes
echo   build      Rebuild backend JAR and install frontend dependencies
echo   help       Display this usage message
echo.
echo Examples:
echo   run.bat
echo   run.bat all
echo   run.bat backend
echo   run.bat stop
echo ====================================================================
exit /b 0

:: -----------------------------------------------------------------------------
:: Exit Launcher
:: -----------------------------------------------------------------------------
:QUIT
echo.
echo [TraceX] Exiting launcher.
exit /b 0
