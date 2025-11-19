// Trong route action handler

import { DocumentModel } from "../../.server/document.repo";

export async function action({ request, params }) {
  const formData = await request.formData();
  return handleDocumentFilter(formData, params);
}

async function handleDocumentFilter(formData, params) {
  try {
    const documentModel = new DocumentModel();

    // 📥 Parse filter parameters
    const filters = {
      searchText: formData.get("searchText") || "",
      categoryId: formData.get("categoryId") || params.categoryId || null,
      dateRange: formData.get("dateRange") || "all",
      dateFrom: formData.get("dateFrom") || null,
      dateTo: formData.get("dateTo") || null,
      sortBy: formData.get("sortBy") || "createdAt-desc",
      owner: formData.get("owner") || "",
      tags: JSON.parse(formData.get("tags") || "[]"),
    };

    // 📄 Parse pagination
    const page = parseInt(formData.get("page") || "1");
    const limit = parseInt(formData.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 🔍 Build where clause
    const whereClause = buildWhereClause(filters);

    // 📊 Parse sort
    const [sortField, sortOrder] = filters.sortBy.split("-");
    const orderBy = { [sortField]: sortOrder };

    // 🗄️ Execute query với method findManyWithFilters
    const result = await documentModel.findManyWithFilters(
      whereClause,
      {
        orderBy,
        skip: offset,
        take: limit,
      }
    );

    // 📦 Return filtered results
    return Response.json({
      documents: result.documents,
      total: result.total,
      filters,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      }
    });

  } catch (error) {
    console.error("Error filtering documents:", error);
    return Response.json(
      { 
        error: "Có lỗi xảy ra khi lọc tài liệu",
        documents: [],
        total: 0 
      },
      { status: 500 }
    );
  }
}

// 🔧 Helper: Build where clause from filters
function buildWhereClause(filters) {
  const conditions = [];
  const whereClause = {};

  // Filter by category
  if (filters.categoryId && filters.categoryId !== "all") {
    whereClause.categoryId = filters.categoryId;
  }

  // Filter by owner
  if (filters.owner) {
    whereClause.ownerId = filters.owner;
  }

  // 📅 Filter by date range
  const dateCondition = buildDateRangeQuery(
    filters.dateRange, 
    filters.dateFrom, 
    filters.dateTo
  );
  if (dateCondition.createdAt) {
    whereClause.createdAt = dateCondition.createdAt;
  }

  // 🔍 Search text - search across multiple fields
  if (filters.searchText.trim()) {
    const searchTerm = filters.searchText.toLowerCase();
    conditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { content: { contains: searchTerm, mode: "insensitive" } },
      ]
    });
  }

  // 🏷️ Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    conditions.push({
      tags: {
        hasSome: filters.tags
      }
    });
  }

  // Combine all conditions
  if (conditions.length > 0) {
    return {
      AND: [whereClause, ...conditions]
    };
  }

  return whereClause;
}

// 🔧 Helper: Build date range query
function buildDateRangeQuery(dateRange, customDateFrom, customDateTo) {
  // Custom date range có ưu tiên cao hơn
  if (customDateFrom || customDateTo) {
    const query = {};
    if (customDateFrom) query.gte = new Date(customDateFrom);
    if (customDateTo) query.lte = new Date(customDateTo);
    return { createdAt: query };
  }

  if (dateRange === "all") return {};

  const now = new Date();
  const dateFrom = new Date();
  
  switch (dateRange) {
    case "today":
      dateFrom.setHours(0, 0, 0, 0);
      break;
    case "week":
      dateFrom.setDate(now.getDate() - 7);
      break;
    case "month":
      dateFrom.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      dateFrom.setMonth(now.getMonth() - 3);
      break;
    case "year":
      dateFrom.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { createdAt: { gte: dateFrom } };
}