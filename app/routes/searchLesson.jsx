import { LessonModel } from "../.server/lesson.repo";
import LessonSearchView from "../components/lessonList/LessonSearchView";

export async function loader({ request }) {
    const url = new URL(request.url);
    const owner = url.searchParams.get("owner") || "";
    const classId = url.searchParams.get("classId") || "";

    const lessonModel = new LessonModel();

    // Get all lessons or filter by classId if provided
    let lessons;
    if (classId) {
        lessons = await lessonModel.findByClass(Number(classId));
    } else {
        lessons = await lessonModel.findAll();
    }

    return {
        lessons,
        owner,
        classId: classId ? Number(classId) : null
    };
}

export default function SearchLesson({ loaderData }) {
    const { lessons, owner, classId } = loaderData;

    return (
        <LessonSearchView
            lessons={lessons}
            extraData={{ owner }}
            classId={classId}
            pageName="🔍 Tìm kiếm bài giảng"
            showAddButton={false}
            filterKey="lesson-search"
        />
    );
}
