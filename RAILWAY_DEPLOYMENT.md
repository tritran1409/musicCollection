# 🚀 Railway Deployment Guide - mCollection

Hướng dẫn deploy ứng dụng mCollection lên Railway với hỗ trợ Puppeteer cho export PDF/Word.

## 📋 Yêu cầu

- Tài khoản Railway (https://railway.app)
- MongoDB Atlas database (đã có)
- Code đã được push lên GitHub

## 🔧 Cấu hình đã setup

### 1. **Dockerfile** ✅
- Multi-stage build để tối ưu kích thước image
- Cài đặt Chromium và dependencies cho Puppeteer
- Generate Prisma Client trong build process
- Health check endpoint

### 2. **railway.json** ✅
- Chỉ định sử dụng Dockerfile
- Cấu hình restart policy

### 3. **package.json** ✅
- Đã có đầy đủ dependencies:
  - `@sparticuz/chromium` - Chromium binary cho serverless
  - `puppeteer-core` - Puppeteer không bao gồm Chromium
  - `html-to-docx` - Export Word
  - `sanitize-html` - Sanitize HTML content

## 📝 Các bước deploy

### Bước 1: Tạo project trên Railway

1. Đăng nhập vào [Railway](https://railway.app)
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository `mCollection`
5. Railway sẽ tự động detect Dockerfile

### Bước 2: Cấu hình Environment Variables

Trong Railway dashboard, thêm các biến môi trường sau:

```bash
# Node Environment
NODE_ENV=production

# Database (MongoDB Atlas)
DATABASE_URL=mongodb+srv://seven007:seven007@poaap.f0mxo.mongodb.net/music_collection?retryWrites=true&w=majority

# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
CHROME_PATH=/usr/bin/chromium-browser

# JWT Secret (tạo secret mới cho production)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary (nếu có)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (nếu có)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Bước 3: Deploy

1. Railway sẽ tự động build và deploy khi bạn push code
2. Hoặc click **"Deploy"** trong dashboard
3. Chờ build process hoàn thành (khoảng 5-10 phút)

### Bước 4: Kiểm tra deployment

1. Railway sẽ cung cấp một URL public (ví dụ: `https://your-app.up.railway.app`)
2. Truy cập URL để kiểm tra
3. Test chức năng export PDF/Word

## 🐛 Troubleshooting

### Lỗi Puppeteer không tìm thấy Chromium

**Triệu chứng:**
```
Error: Could not find Chrome
```

**Giải pháp:**
- Kiểm tra environment variables `PUPPETEER_EXECUTABLE_PATH` và `CHROME_PATH`
- Xem logs để confirm Chromium đã được cài đặt trong Docker image

### Lỗi Memory

**Triệu chứng:**
```
JavaScript heap out of memory
```

**Giải pháp:**
- Upgrade Railway plan để có thêm RAM
- Hoặc optimize Puppeteer args trong code

### Lỗi Prisma Client

**Triệu chứng:**
```
PrismaClient is unable to be run in the browser
```

**Giải pháp:**
- Kiểm tra Prisma Client đã được generate trong Dockerfile
- Rebuild image

## 📊 Monitoring

### Health Check

Railway sẽ tự động ping health check endpoint:
```
GET /health
```

### Logs

Xem logs trong Railway dashboard:
```bash
# Hoặc sử dụng Railway CLI
railway logs
```

## 🔄 CI/CD

Railway tự động deploy khi:
1. Push code lên branch `main`
2. Merge pull request vào `main`

Để tắt auto-deploy:
1. Vào Settings trong Railway dashboard
2. Tắt "Auto Deploy"

## 💡 Tips

### 1. Tối ưu build time
- Railway cache Docker layers
- Sắp xếp Dockerfile để tận dụng cache

### 2. Giảm kích thước image
- Sử dụng Alpine Linux (đã làm)
- Multi-stage build (đã làm)
- Chỉ copy files cần thiết

### 3. Monitoring Puppeteer
Thêm logging trong code:
```javascript
console.log('🚀 Launching Puppeteer with:', {
  isProduction,
  isRailway,
  executablePath,
  args: puppeteerArgs.length
});
```

## 🔐 Security

### Environment Variables
- **KHÔNG** commit `.env` file
- Sử dụng Railway's environment variables
- Rotate secrets định kỳ

### Database
- Sử dụng MongoDB Atlas với IP whitelist
- Enable authentication
- Sử dụng strong password

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Puppeteer Docker](https://pptr.dev/guides/docker)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

## ⚠️ Lưu ý quan trọng

### Puppeteer trên Railway

1. **Chromium binary**: Railway sử dụng Alpine Linux, cần cài chromium package
2. **Args**: Cần args `--no-sandbox`, `--disable-setuid-sandbox` cho container
3. **Memory**: Export PDF có thể tốn nhiều RAM, monitor usage
4. **Timeout**: Set timeout phù hợp cho Puppeteer launch (30s)

### Database Connection

1. **Connection String**: Sử dụng MongoDB Atlas connection string
2. **Prisma**: Đảm bảo Prisma Client được generate trong build
3. **Migrations**: Chạy migrations trước khi deploy (nếu cần)

## 🎯 Checklist trước khi deploy

- [ ] Code đã được test local
- [ ] Environment variables đã được set
- [ ] Database connection string đúng
- [ ] Dockerfile build thành công local
- [ ] `.gitignore` đã exclude `.env` và `node_modules`
- [ ] `package.json` có đầy đủ dependencies
- [ ] Prisma schema đúng với database

## 📞 Support

Nếu gặp vấn đề:
1. Check Railway logs
2. Check browser console (nếu là frontend issue)
3. Test Puppeteer locally với Docker
4. Liên hệ Railway support

---

**Happy Deploying! 🚀**
