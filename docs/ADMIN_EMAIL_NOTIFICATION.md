# Tính năng Email Thông báo Admin

## Mô tả

Khi có người đăng ký tài khoản **Giảng viên**, hệ thống sẽ tự động gửi 2 email:

1. **Email cho Giảng viên**: Thông báo tài khoản đang chờ phê duyệt
2. **Email cho Admin** ⭐ (MỚI): Thông báo có giảng viên mới cần duyệt

## Cách hoạt động

### 1. Khi Giảng viên đăng ký

```
User đăng ký với role="TEACHER"
    ↓
Tạo tài khoản với status="PENDING"
    ↓
Gửi 2 email song song:
    ├─→ Email cho Giảng viên (thông báo chờ duyệt)
    └─→ Email cho Admin (thông báo có người cần duyệt)
```

### 2. Email gửi cho Admin

Email sẽ bao gồm:
- 🔔 Tiêu đề: "Có giảng viên mới đăng ký - Music Collection"
- 👤 Họ tên giảng viên
- 📧 Email giảng viên
- 🔗 Link trực tiếp đến trang quản lý người dùng

## Cấu hình

### Bước 1: Thiết lập SMTP

Trong file `.env`, cấu hình SMTP:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Music Collection
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Bước 2: Thiết lập Email Admin

Thêm email của admin vào file `.env`:

```bash
ADMIN_EMAIL=admin@example.com
```

**Lưu ý:**
- Nếu không set `ADMIN_EMAIL`, hệ thống sẽ dùng `SMTP_USER` làm email admin
- Có thể set nhiều email admin bằng cách phân tách bằng dấu phẩy (tính năng có thể mở rộng sau)

### Bước 3: Kiểm tra hoạt động

1. Đăng ký tài khoản mới với role "Giảng viên"
2. Kiểm tra console log để xem trạng thái gửi email
3. Kiểm tra hộp thư của admin

## Code Implementation

### Files đã thay đổi

1. **`app/service/email.server.js`**
   - Thêm function `sendAdminNotificationEmail()`
   - Thêm template `getAdminNotificationTemplate()`

2. **`app/service/auth.server.js`**
   - Import `sendAdminNotificationEmail`
   - Gọi function khi có giảng viên đăng ký

3. **`.env.example`**
   - Thêm biến `ADMIN_EMAIL`

4. **`README.md`**
   - Thêm hướng dẫn cấu hình email

## Testing

### Development Mode (không có SMTP)

Khi chưa cấu hình SMTP, hệ thống sẽ:
- Log thông tin email vào console
- Không gửi email thật
- Vẫn tạo tài khoản thành công

```
📧 [DEV] Admin notification email would be sent for teacher: teacher@example.com
```

### Production Mode (có SMTP)

Khi đã cấu hình SMTP:
- Gửi email thật cho giảng viên
- Gửi email thật cho admin
- Log message ID khi gửi thành công

```
✅ Teacher pending email sent: <message-id>
✅ Admin notification email sent: <message-id>
```

## Troubleshooting

### Email không được gửi

1. **Kiểm tra cấu hình SMTP**
   ```bash
   # Xem console log
   npm run dev
   ```

2. **Kiểm tra App Password (Gmail)**
   - Bật 2-Step Verification
   - Tạo App Password tại: https://myaccount.google.com/apppasswords

3. **Kiểm tra email admin**
   ```bash
   # Trong .env
   ADMIN_EMAIL=valid-email@example.com
   ```

### Email vào Spam

- Thêm email gửi vào danh sách tin cậy
- Sử dụng SMTP service chuyên nghiệp (SendGrid, Mailgun)
- Cấu hình SPF, DKIM records

## Mở rộng tương lai

- [ ] Hỗ trợ nhiều email admin
- [ ] Tùy chỉnh template email từ admin panel
- [ ] Thông báo qua Slack/Discord
- [ ] Dashboard thống kê email đã gửi
- [ ] Retry mechanism khi gửi email thất bại

## Liên hệ

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
