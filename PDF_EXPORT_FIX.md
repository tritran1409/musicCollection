# Fix PDF Export on Railway

## Vấn đề
Khi deploy trên Railway, Puppeteer không thể tìm thấy Chromium tại `/tmp/chromium` vì `@sparticuz/chromium` package tải Chromium về thư mục tạm và có thể không hoạt động đúng.

## Giải pháp
Sử dụng Chromium đã được cài đặt trong Docker image tại `/usr/bin/chromium-browser` thay vì dùng `chromium.executablePath()`.

## Thay đổi cần thiết trong `app/.server/document.repo.js`

Tìm dòng 464-474 trong hàm `exportPdf`:

```javascript
browser = await puppeteer.launch({
  args: isLocal
    ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ]
    : chromium.args,
  executablePath: isLocal
    ? getChromePath() // Tự động tìm Chrome
    : await chromium.executablePath(),  // ❌ LỖI: Tải về /tmp/chromium
  headless: true,
});
```

Thay thế bằng:

```javascript
// Check if running on Railway/production
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

browser = await puppeteer.launch({
  args: isProduction
    ? chromium.args
    : [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  executablePath: isProduction
    ? (process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser')  // ✅ Dùng system Chromium
    : getChromePath(), // Tự động tìm Chrome trên local
  headless: true,
});
```

## Lưu ý
- Dockerfile đã cài đặt Chromium tại `/usr/bin/chromium-browser`
- Environment variable `PUPPETEER_EXECUTABLE_PATH` đã được set trong Dockerfile
- Không cần thay đổi gì khác, chỉ cần sửa executablePath
