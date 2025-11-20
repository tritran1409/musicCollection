/**
 * So sánh sâu giữa hai giá trị (deep compare)
 * @param {*} a 
 * @param {*} b 
 * @returns {boolean}
 */
export function deepEqual(a, b) {
  // Trường hợp giống hệt nhau (bao gồm cả NaN)
  if (Object.is(a, b)) return true;

  // Nếu một trong hai không phải object hoặc null => so sánh bình thường
  if (typeof a !== 'object' || a === null ||
    typeof b !== 'object' || b === null) {
    return false;
  }

  // Nếu là Array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Nếu một là array, một không phải => false
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // So sánh object
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}
export function buildWhereClause(filters) {
  const conditions = [];
  const whereClause = {};

  // Filter by category
  if (filters.categoryId && filters.categoryId !== "all") {
    whereClause.categoryId = filters.categoryId;
  }

  // Filter by owner name (text search)
  if (filters.owner && filters.owner.trim()) {
    conditions.push({
      ownerName: { contains: filters.owner.trim(), mode: "insensitive" }
    });
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
export function buildDateRangeQuery(dateRange, customDateFrom, customDateTo) {
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

