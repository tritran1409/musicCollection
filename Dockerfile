# ============================================
# Stage 1: Development dependencies
# ============================================
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# ============================================
# Stage 2: Production dependencies
# ============================================
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client for production
RUN npx prisma generate

# ============================================
# Stage 3: Build
# ============================================
FROM node:20-alpine AS build-env
WORKDIR /app

# Copy all source files
COPY . .

# Copy node_modules from development stage
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY --from=development-dependencies-env /app/generated ./generated

# Build the application
RUN npm run build

# ============================================
# Stage 4: Production runtime with Chromium
# ============================================
FROM node:20-alpine

WORKDIR /app

# 🔥 Install Chromium and required dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei \
    # Additional dependencies for better PDF rendering
    fontconfig \
    # Required for Puppeteer
    udev \
    ttf-opensans \
    && fc-cache -f

# 🔥 Environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Copy production node_modules and generated Prisma client
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=production-dependencies-env /app/generated ./generated

# Copy built application
COPY --from=build-env /app/build ./build

# Copy Prisma schema (needed for potential migrations)
COPY --from=build-env /app/prisma ./prisma

# Expose port (Railway will set PORT env variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "run", "start"]