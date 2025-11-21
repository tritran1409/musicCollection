// document.repo.js
import chromium from "@sparticuz/chromium";
import HTMLtoDOCX from "html-to-docx";
import puppeteer from "puppeteer-core";
import sanitizeHtml from "sanitize-html";
import { BaseModel } from './base.repo';

export class DocumentModel extends BaseModel {
  constructor() {
    super('document');
  }

  /**
   * Tìm tất cả documents với owner và category
   */
  async findAll(options = {}) {
    return super.findAll({}, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...options,
    });
  }

  /**
   * Tìm document theo ID với relations
   */
  async findById(id, options = {}) {
    return super.findById(id, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      ...options,
    });
  }

  /**
   * Tìm documents theo category
   */
  async findByCategory(categoryId) {
    return this.findMany(
      categoryId ? { categoryId } : {},
      {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }
    );
  }

  /**
   * Tìm documents theo classes
   */
  async findByClass(classId) {
    return this.findMany(
      {
        classes: {
          has: classId,
        },
      },
      {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }
    );
  }

  /**
   * Tạo document mới
   */
  async create(data) {
    return super.create({
      title: data.title,
      description: data.description || null,
      content: data.content,
      classes: data.classes || [],
      categoryId: data.categoryId || null,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
    });
  }

  /**
   * Cập nhật document
   */
  async update(id, data) {
    const updateData = {
      title: data.title,
      description: data.description,
      content: data.content,
    };

    if (data.classes !== undefined) {
      updateData.classes = data.classes;
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    return super.update(id, updateData);
  }

  /**
   * Tìm kiếm documents
   */
  async search(searchTerm, filters = {}) {
    const where = {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.classId) {
      where.classes = {
        has: filters.classId,
      };
    }

    return this.findMany(where, {
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async exportPdf(documentId) {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error("Document không tồn tại");

    const safeContent = sanitizeHtml(doc.content || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'p',
        'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'blockquote',
        'code', 'pre', 'a', 'hr',
        // ✅ Table tags
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
        'col', 'colgroup'
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target', 'rel'],
        // ✅ Table attributes
        table: ['border', 'cellpadding', 'cellspacing', 'width'],
        td: ['colspan', 'rowspan', 'align', 'valign'],
        th: ['colspan', 'rowspan', 'align', 'valign'],
        col: ['span', 'width'],
        colgroup: ['span', 'width'],
      },
    });

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { 
              font-family: 'Segoe UI', Arial, sans-serif;
              box-sizing: border-box;
            }
            body { 
              padding: 30px; 
              line-height: 1.6; 
              color: #333;
            }
            
            /* Headings */
            h1 { 
              font-size: 28px; 
              margin-bottom: 10px;
              font-weight: 700;
              color: #1a1a1a;
            }
            h2 { 
              font-size: 22px; 
              margin-top: 25px;
              margin-bottom: 10px;
              font-weight: 600;
              color: #2c2c2c;
            }
            h3 { 
              font-size: 18px; 
              margin-top: 20px;
              margin-bottom: 8px;
              font-weight: 600;
              color: #3d3d3d;
            }
            
            /* Subtitle */
            .subtitle { 
              color: #666; 
              margin-bottom: 25px;
              font-size: 14px;
              font-style: italic;
            }
            
            /* Content */
            .content { 
              margin-top: 30px; 
            }
            
            /* Paragraphs */
            p { 
              margin: 12px 0;
              text-align: justify;
            }
            
            /* Lists */
            ul, ol { 
              margin: 12px 0; 
              padding-left: 30px; 
            }
            li {
              margin: 6px 0;
            }
            
            /* Images */
            img { 
              max-width: 100%; 
              height: auto;
              display: block;
              margin: 15px auto;
            }
            
            /* ✅ TABLE STYLING */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
              background: white;
              page-break-inside: auto;
            }
            
            table caption {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              text-align: left;
              color: #1a1a1a;
            }
            
            thead {
              background-color: #f8f9fa;
              font-weight: 600;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
              page-break-inside: avoid;
            }
            
            th {
              background-color: #f2f2f2;
              font-weight: 600;
              color: #2c2c2c;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            tbody tr:hover {
              background-color: #f5f5f5;
            }
            
            /* ✅ Table responsive */
            @media print {
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
            }
            
            /* Code blocks */
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
            
            pre {
              background: #f4f4f4;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              line-height: 1.4;
              border-left: 4px solid #007bff;
            }
            
            pre code {
              background: none;
              padding: 0;
            }
            
            /* Blockquote */
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 15px;
              margin: 15px 0;
              color: #666;
              font-style: italic;
              background: #f9f9f9;
              padding: 10px 15px;
            }
            
            /* Text formatting */
            strong {
              font-weight: 600;
            }
            
            em {
              font-style: italic;
            }
            
            u {
              text-decoration: underline;
            }
            
            s {
              text-decoration: line-through;
            }
            
            /* Links */
            a {
              color: #007bff;
              text-decoration: underline;
            }
            
            /* Horizontal rule */
            hr {
              border: none;
              border-top: 2px solid #ddd;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>${doc.title || ""}</h1>
          ${doc.description ? `<div class="subtitle">${doc.description}</div>` : ""}
          <div class="content">${safeContent}</div>
        </body>
      </html>
    `;

    const isLocal = process.env.NODE_ENV === 'development';

    // 🔥 Tự động tìm Chrome path theo OS
    function getChromePath() {
      const platform = process.platform;

      if (platform === 'darwin') { // macOS
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else if (platform === 'linux') { // Linux
        // Thử các đường dẫn phổ biến
        const possiblePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          '/snap/bin/chromium',
        ];

        // Tìm path đầu tiên tồn tại
        const fs = require('fs');
        for (const path of possiblePaths) {
          if (fs.existsSync(path)) {
            return path;
          }
        }
      } else if (platform === 'win32') { // Windows
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      }

      return null;
    }

    let browser;

    try {
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

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 30, bottom: 30, left: 20, right: 20 },
      });

      await browser.close();
      return pdfBuffer;

    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('PDF Export Error:', error);
      throw new Error(`Không thể tạo PDF: ${error.message}`);
    }
  }
  async exportWord(documentId) {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error("Document không tồn tại");

    const safeContent = sanitizeHtml(doc.content || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'p',
        'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'blockquote',
        'code', 'pre', 'a', 'hr',
        // ✅ Table tags
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
        'col', 'colgroup'
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target', 'rel'],
        // ✅ Table attributes
        table: ['border', 'cellpadding', 'cellspacing', 'width'],
        td: ['colspan', 'rowspan', 'align', 'valign'],
        th: ['colspan', 'rowspan', 'align', 'valign'],
        col: ['span', 'width'],
        colgroup: ['span', 'width'],
      },
    });

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { 
              font-family: 'Segoe UI', Arial, sans-serif;
              box-sizing: border-box;
            }
            body { 
              padding: 30px; 
              line-height: 1.6; 
              color: #333;
            }
            
            /* Headings */
            h1 { 
              font-size: 28px; 
              margin-bottom: 10px;
              font-weight: 700;
              color: #1a1a1a;
            }
            h2 { 
              font-size: 22px; 
              margin-top: 25px;
              margin-bottom: 10px;
              font-weight: 600;
              color: #2c2c2c;
            }
            h3 { 
              font-size: 18px; 
              margin-top: 20px;
              margin-bottom: 8px;
              font-weight: 600;
              color: #3d3d3d;
            }
            
            /* Subtitle */
            .subtitle { 
              color: #666; 
              margin-bottom: 25px;
              font-size: 14px;
              font-style: italic;
            }
            
            /* Content */
            .content { 
              margin-top: 30px; 
            }
            
            /* Paragraphs */
            p { 
              margin: 12px 0;
              text-align: justify;
            }
            
            /* Lists */
            ul, ol { 
              margin: 12px 0; 
              padding-left: 30px; 
            }
            li {
              margin: 6px 0;
            }
            
            /* Images */
            img { 
              max-width: 100%; 
              height: auto;
              display: block;
              margin: 15px auto;
            }
            
            /* ✅ TABLE STYLING */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
              background: white;
              page-break-inside: auto;
            }
            
            table caption {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              text-align: left;
              color: #1a1a1a;
            }
            
            thead {
              background-color: #f8f9fa;
              font-weight: 600;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
              page-break-inside: avoid;
            }
            
            th {
              background-color: #f2f2f2;
              font-weight: 600;
              color: #2c2c2c;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            tbody tr:hover {
              background-color: #f5f5f5;
            }
            
            /* ✅ Table responsive */
            @media print {
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
            }
            
            /* Code blocks */
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
            
            pre {
              background: #f4f4f4;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              line-height: 1.4;
              border-left: 4px solid #007bff;
            }
            
            pre code {
              background: none;
              padding: 0;
            }
            
            /* Blockquote */
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 15px;
              margin: 15px 0;
              color: #666;
              font-style: italic;
              background: #f9f9f9;
              padding: 10px 15px;
            }
            
            /* Text formatting */
            strong {
              font-weight: 600;
            }
            
            em {
              font-style: italic;
            }
            
            u {
              text-decoration: underline;
            }
            
            s {
              text-decoration: line-through;
            }
            
            /* Links */
            a {
              color: #007bff;
              text-decoration: underline;
            }
            
            /* Horizontal rule */
            hr {
              border: none;
              border-top: 2px solid #ddd;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>${doc.title || ""}</h1>
          ${doc.description ? `<div class="subtitle">${doc.description}</div>` : ""}
          <div class="content">${safeContent}</div>
        </body>
      </html>
    `;

    try {
      const docxBuffer = await HTMLtoDOCX(html, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      return docxBuffer;
    } catch (error) {
      console.error('Word Export Error:', error);
      throw new Error(`Không thể tạo Word document: ${error.message}`);
    }
  }
  async findManyWithFilters(whereClause = {}, options = {}) {
    console.log(whereClause, 'whereClause');

    const defaultOptions = {
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      include: {
        ...defaultOptions.include,
        ...(options.include || {}),
      },
    };

    const [documents, total] = await Promise.all([
      this.findMany(whereClause, mergedOptions),
      this.count(whereClause),
    ]);

    return { documents, total };
  }

  /**
   * 📊 Count documents by category
   */
  async countByCategory(categoryId) {
    return this.count(
      categoryId ? { categoryId } : {}
    );
  }

  /**
   * 🔍 Advanced search với nhiều điều kiện
   */
  async advancedSearch(params = {}) {
    const {
      searchText = "",
      categoryId = null,
      type = null,
      dateFrom = null,
      dateTo = null,
      ownerId = null,
      tags = [],
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const whereClause = {};
    const conditions = [];

    // Category filter
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Owner filter
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    // Text search
    if (searchText.trim()) {
      conditions.push({
        OR: [
          { title: { contains: searchText, mode: "insensitive" } },
          { description: { contains: searchText, mode: "insensitive" } },
          { content: { contains: searchText, mode: "insensitive" } },
        ],
      });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      conditions.push({
        tags: { hasSome: tags },
      });
    }

    // Combine conditions
    const finalWhere = conditions.length > 0
      ? { AND: [whereClause, ...conditions] }
      : whereClause;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    return this.findManyWithFilters(finalWhere, {
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  /**
   * 📁 Tìm documents theo category với pagination
   */
  async findByCategoryPaginated(categoryId, options = {}) {
    const {
      page = 1,
      limit = 20,
      orderBy = { createdAt: 'desc' },
    } = options;

    const skip = (page - 1) * limit;

    return this.findManyWithFilters(
      categoryId ? { categoryId } : {},
      {
        skip,
        take: limit,
        orderBy,
      }
    );
  }

  /**
   * 👤 Tìm documents theo owner với pagination
   */
  async findByOwnerPaginated(ownerId, options = {}) {
    const {
      page = 1,
      limit = 20,
      orderBy = { createdAt: 'desc' },
    } = options;

    const skip = (page - 1) * limit;

    return this.findManyWithFilters(
      { ownerId },
      {
        skip,
        take: limit,
        orderBy,
      }
    );
  }

  /**
   * 🏷️ Tìm documents theo tags
   */
  async findByTags(tags = [], options = {}) {
    if (!tags || tags.length === 0) {
      return { documents: [], total: 0 };
    }

    const {
      page = 1,
      limit = 20,
      orderBy = { createdAt: 'desc' },
    } = options;

    const skip = (page - 1) * limit;

    return this.findManyWithFilters(
      {
        tags: { hasSome: tags },
      },
      {
        skip,
        take: limit,
        orderBy,
      }
    );
  }

  /**
   * 📅 Tìm documents theo date range
   */
  async findByDateRange(dateFrom, dateTo, options = {}) {
    const {
      page = 1,
      limit = 20,
      orderBy = { createdAt: 'desc' },
      categoryId = null,
    } = options;

    const skip = (page - 1) * limit;
    const whereClause = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    return this.findManyWithFilters(whereClause, {
      skip,
      take: limit,
      orderBy,
    });
  }

  /**
   * 🔢 Get statistics
   */
  async getStatistics(categoryId = null) {
    const whereClause = categoryId ? { categoryId } : {};

    const [
      total,
      totalThisMonth,
      totalThisWeek,
      totalToday,
    ] = await Promise.all([
      this.count(whereClause),
      this.count({
        ...whereClause,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      this.count({
        ...whereClause,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
      this.count({
        ...whereClause,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    return {
      total,
      totalThisMonth,
      totalThisWeek,
      totalToday,
    };
  }

  /**
   * 📋 Get recent documents
   */
  async getRecentDocuments(limit = 10, categoryId = null) {
    const whereClause = categoryId ? { categoryId } : {};

    const documents = await this.findMany(whereClause, {
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return documents;
  }

  /**
   * 🔍 Get popular tags
   */
  async getPopularTags(limit = 20, categoryId = null) {
    const whereClause = categoryId ? { categoryId } : {};

    const documents = await this.findMany(whereClause, {
      select: {
        tags: true,
      },
    });

    // Count tag frequency
    const tagCount = {};
    documents.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // Sort by frequency and return top tags
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
}