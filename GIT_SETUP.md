# Hướng dẫn đẩy dự án lên GitHub - Nhánh Thắng

## Bước 1: Kiểm tra Git đã được cài đặt chưa
```bash
git --version
```
Nếu chưa có, tải và cài đặt Git từ: https://git-scm.com/download/win

## Bước 2: Khởi tạo Git repository (nếu chưa có)
```bash
git init
```

## Bước 3: Thêm remote repository
```bash
git remote add origin https://github.com/TuChauHoangThang/App-TMDT-Shop-b-n-handmake-TTH.git
```

Nếu đã có remote rồi, kiểm tra bằng:
```bash
git remote -v
```

Nếu cần thay đổi URL:
```bash
git remote set-url origin https://github.com/TuChauHoangThang/App-TMDT-Shop-b-n-handmake-TTH.git
```

## Bước 4: Thêm tất cả các file vào staging area
```bash
git add .
```

## Bước 5: Commit các thay đổi
```bash
git commit -m "first commit - dự án TTH Shop bán hàng handmade"
```

## Bước 6: Tạo và chuyển sang nhánh "Thắng"
```bash
git checkout -b Thang
```

Hoặc nếu đã có nhánh main và muốn tạo nhánh mới:
```bash
git branch Thang
git checkout Thang
```

## Bước 7: Push nhánh "Thắng" lên GitHub
```bash
git push -u origin Thang
```

## Các lệnh hữu ích khác:

### Xem trạng thái Git
```bash
git status
```

### Xem các nhánh
```bash
git branch
```

### Xem log commit
```bash
git log
```

### Nếu cần pull code từ GitHub trước khi push
```bash
git pull origin Thang
```

### Nếu gặp lỗi và cần force push (cẩn thận khi dùng)
```bash
git push -u origin Thang --force
```

## Lưu ý:
- Đảm bảo file `.gitignore` đã có để không commit các file không cần thiết (node_modules, build, etc.)
- Nếu có file nhạy cảm (API keys, passwords), không commit chúng
- Sau khi push thành công, bạn có thể tạo Pull Request từ nhánh "Thắng" sang "main" trên GitHub

