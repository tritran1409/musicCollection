// Trong route action handler

import { DocumentModel } from "../../.server/document.repo";
import { buildWhereClause } from "../../helper/dataHelper";

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

