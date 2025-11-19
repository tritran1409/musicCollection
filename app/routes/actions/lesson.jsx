import { redirect } from "react-router";
import { LessonModel } from "../../.server/lesson.repo";
import { getUser } from "../../service/auth.server";
import { commitSession, getSession } from "../../sessions.server";

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const user = await getUser(request);
  const lessonModel = new LessonModel();
  const redirectUrl = formData.get("redirectUrl");

  try {
    switch (intent) {
      case "create": {
        const title = formData.get("title");
        const description = formData.get("description");
        const classId = formData.get("classId");
        const filesJson = formData.get("files");
        const documentsJson = formData.get("documents");
        
        // Validate
        if (!title || !user.id) {
          return Response.json(
            { error: "Thiếu thông tin bắt buộc" },
            { status: 400 }
          );
        }

        const files = filesJson ? JSON.parse(filesJson) : [];
        const documents = documentsJson ? JSON.parse(documentsJson) : [];

        // Validate limits
        if (files.length > 10) {
          return Response.json(
            { error: "Tối đa 10 file cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        if (documents.length > 10) {
          return Response.json(
            { error: "Tối đa 10 tài liệu cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        const newLesson = await lessonModel.createLesson({
          title,
          description,
          ownerId: user.id,
          classId: classId ? Number(classId) : null,
          fileIds: files,
          documentIds: documents,
        });

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Tạo bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json(
          { 
            success: true, 
            message: "Tạo bài giảng thành công",
            lesson: newLesson 
          },
          { status: 201 }
        );
      }

      case "update": {
        const id = formData.get("lessonId");
        const title = formData.get("title");
        const description = formData.get("description");
        const classId = formData.get("classId");
        const filesJson = formData.get("files");
        const documentsJson = formData.get("documents");

        if (!id) {
          return Response.json(
            { error: "Thiếu ID bài giảng" },
            { status: 400 }
          );
        }

        const files = filesJson ? JSON.parse(filesJson) : undefined;
        const documents = documentsJson ? JSON.parse(documentsJson) : undefined;

        // Validate limits
        if (files && files.length > 10) {
          return Response.json(
            { error: "Tối đa 10 file cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        if (documents && documents.length > 10) {
          return Response.json(
            { error: "Tối đa 10 tài liệu cho mỗi bài giảng" },
            { status: 400 }
          );
        }

        const updatedLesson = await lessonModel.updateLesson(id, {
          title,
          description,
          classId: classId ? Number(classId) : null,
          fileIds: files,
          documentIds: documents,
        });

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Cập nhật bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json({
          success: true,
          message: "Cập nhật bài giảng thành công",
          lesson: updatedLesson,
        });
      }

      case "delete": {
        const id = formData.get("lessonId");

        if (!id) {
          return Response.json(
            { error: "Thiếu ID bài giảng" },
            { status: 400 }
          );
        }

        await lessonModel.delete(id);

        if (redirectUrl) {
          const session = await getSession(request.headers.get("Cookie"));
          session.flash("message", "Xóa bài giảng thành công!");
          return redirect(redirectUrl, {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }

        return Response.json({
          success: true,
          message: "Xóa bài giảng thành công",
        });
      }

      default:
        return Response.json(
          { error: "Intent không hợp lệ" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Lesson action error:", error);
    
    // Handle specific validation errors
    if (error.message.includes("not found")) {
      return Response.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes("Maximum") || error.message.includes("Tối đa")) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { 
        error: error.message || "Có lỗi xảy ra",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Loader để lấy danh sách lessons
export async function loader({ request }) {
  try {
    const user = await getUser(request);
    const lessonModel = new LessonModel();
    
    if (user?.id) {
      const lessons = await lessonModel.findByOwnerId(Number(user.id));
      return Response.json({ 
        lessons,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });
    }

    const lessons = await lessonModel.findAll();
    return Response.json({ lessons });
  } catch (error) {
    console.error("Lesson loader error:", error);
    return Response.json(
      { 
        error: "Không thể tải danh sách bài giảng",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}