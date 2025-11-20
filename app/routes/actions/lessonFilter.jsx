import { LessonModel } from "../../.server/lesson.repo";
import { buildWhereClause, buildDateRangeQuery } from "../../helper/dataHelper";

export async function action({ request, params }) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "filter") {
        return await handleLessonFilter(formData, params);
    }

    return { error: "Invalid intent" };
}

async function handleLessonFilter(formData, params) {
    try {
        const lessonModel = new LessonModel();
        const { classId } = params;

        // Parse filters from formData
        const filters = {
            searchText: formData.get("searchText") || "",
            dateRange: formData.get("dateRange") || "all",
            dateFrom: formData.get("dateFrom") || "",
            dateTo: formData.get("dateTo") || "",
            sortBy: formData.get("sortBy") || "createdAt-desc",
            owner: formData.get("owner") || "",
        };

        // Parse pagination
        const page = parseInt(formData.get("page")) || 1;
        const limit = parseInt(formData.get("limit")) || 20;

        console.log('📊 Lesson Filter - Received filters:', filters);

        // Build where clause
        const whereClause = buildLessonWhereClause(filters, classId);

        console.log('📊 Lesson Filter - Where clause:', JSON.stringify(whereClause, null, 2));

        // Parse sort
        const [sortField, sortOrder] = filters.sortBy.split("-");
        const orderBy = { [sortField]: sortOrder };

        // Query with filters
        const { lessons, total } = await lessonModel.findManyWithFilters(
            whereClause,
            {
                skip: (page - 1) * limit,
                take: limit,
                orderBy,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }
        );

        console.log('📊 Lesson Filter - Query results:', {
            total,
            lessonsCount: lessons.length,
            firstLesson: lessons[0]
        });

        return {
            lessons,
            total,
            page,
            limit,
        };
    } catch (error) {
        console.error("Error filtering lessons:", error);
        return { error: error.message, lessons: [], total: 0 };
    }
}

// Build where clause for lesson filtering
function buildLessonWhereClause(filters, classId) {
    const conditions = [];
    const whereClause = {};

    // Always filter by classId
    if (classId) {
        whereClause.classId = Number(classId);
    }

    // Filter by owner name (text search)
    if (filters.owner && filters.owner.trim()) {
        conditions.push({
            ownerName: { contains: filters.owner.trim(), mode: "insensitive" }
        });
    }

    // Filter by date range
    const dateCondition = buildDateRangeQuery(
        filters.dateRange,
        filters.dateFrom,
        filters.dateTo
    );
    if (dateCondition.createdAt) {
        whereClause.createdAt = dateCondition.createdAt;
    }

    // Search text - search across title
    if (filters.searchText.trim()) {
        const searchTerm = filters.searchText.toLowerCase();
        conditions.push({
            title: { contains: searchTerm, mode: "insensitive" }
        });
    }

    // Combine all conditions
    const finalConditions = [];

    // Add whereClause if not empty
    if (Object.keys(whereClause).length > 0) {
        finalConditions.push(whereClause);
    }

    // Add other conditions
    finalConditions.push(...conditions);

    // Return combined or single condition
    if (finalConditions.length === 0) return {};
    if (finalConditions.length === 1) return finalConditions[0];
    return { AND: finalConditions };
}
