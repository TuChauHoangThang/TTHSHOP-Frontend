@echo off
chcp 65001 >nul
echo ========================================
echo   Đẩy dự án lên GitHub - Nhánh Thắng
echo ========================================
echo.

REM Kiểm tra Git đã được cài đặt chưa
git --version >nul 2>&1
if errorlevel 1 (
    echo [LỖI] Git chưa được cài đặt!
    echo Vui lòng tải và cài đặt Git từ: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/7] Đang kiểm tra Git...
git --version
echo.

REM Khởi tạo Git repository nếu chưa có
if not exist ".git" (
    echo [2/7] Đang khởi tạo Git repository...
    git init
) else (
    echo [2/7] Git repository đã tồn tại.
)
echo.

REM Kiểm tra và thêm remote
echo [3/7] Đang kiểm tra remote repository...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Đang thêm remote repository...
    git remote add origin https://github.com/TuChauHoangThang/App-TMDT-Shop-b-n-handmake-TTH.git
    echo Đã thêm remote thành công!
) else (
    echo Remote đã tồn tại. Đang kiểm tra URL...
    git remote set-url origin https://github.com/TuChauHoangThang/App-TMDT-Shop-b-n-handmake-TTH.git
    echo Đã cập nhật remote URL!
)
echo.

REM Thêm tất cả các file
echo [4/7] Đang thêm các file vào staging area...
git add .
echo Đã thêm các file thành công!
echo.

REM Commit
echo [5/7] Đang commit các thay đổi...
git commit -m "first commit - dự án TTH Shop bán hàng handmade"
if errorlevel 1 (
    echo [CẢNH BÁO] Có thể không có thay đổi nào để commit, hoặc đã commit rồi.
)
echo.

REM Tạo và chuyển sang nhánh Thắng
echo [6/7] Đang tạo và chuyển sang nhánh Thắng...
git checkout -b Thang 2>nul
if errorlevel 1 (
    echo Nhánh Thắng có thể đã tồn tại. Đang chuyển sang nhánh Thắng...
    git checkout Thang
)
echo Đang ở nhánh: Thắng
git branch
echo.

REM Push lên GitHub
echo [7/7] Đang push lên GitHub...
echo.
echo [QUAN TRỌNG] Bạn sẽ được yêu cầu nhập thông tin đăng nhập GitHub:
echo - Username: Tên người dùng GitHub của bạn
echo - Password: Personal Access Token (không phải mật khẩu GitHub)
echo.
echo Nếu chưa có Personal Access Token, tạo tại:
echo https://github.com/settings/tokens
echo.
pause
git push -u origin Thang

if errorlevel 1 (
    echo.
    echo [LỖI] Push không thành công!
    echo Có thể do:
    echo - Chưa đăng nhập GitHub
    echo - Sai thông tin đăng nhập
    echo - Repository chưa được tạo trên GitHub
    echo.
    echo Vui lòng kiểm tra lại và thử lại!
) else (
    echo.
    echo ========================================
    echo   ĐÃ PUSH THÀNH CÔNG LÊN GITHUB!
    echo ========================================
    echo.
    echo Nhánh: Thắng
    echo Repository: https://github.com/TuChauHoangThang/App-TMDT-Shop-b-n-handmake-TTH.git
    echo.
)

pause

