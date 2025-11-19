// routes/documents.$documentId.export.word.jsx
import { DocumentModel } from "../../.server/document.repo";

export async function loader({ params }) {
  const { documentId } = params;
  
  try {
    const model = new DocumentModel();
    const docxBuffer = await model.exportWord(documentId);

    if (!docxBuffer) {
      throw new Response("Document not found", { status: 404 });
    }

    // ✅ Đảm bảo buffer được convert đúng
    return new Response(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="document-${documentId}.docx"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export Word Error:", error);
    throw new Response(error.message || "Failed to export document", { 
      status: 500 
    });
  }
}