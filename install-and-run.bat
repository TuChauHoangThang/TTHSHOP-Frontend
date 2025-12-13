@echo off
echo Dang cai dat react-router-dom...
call npm install react-router-dom
if %errorlevel% neq 0 (
    echo Loi: Khong the cai dat. Vui long kiem tra Node.js da duoc cai dat chua.
    pause
    exit /b 1
)
echo.
echo Dang khoi dong ung dung...
call npm start

