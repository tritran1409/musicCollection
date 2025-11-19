import { DocumentModel } from "../../.server/document.repo";

export async function loader({ params }) {
    const { documentId } = params;
    const model = new DocumentModel();
    const pdf = await model.exportPdf(documentId);

    if (!pdf) {
        throw new Response("Document not found", { status: 404 });
    }

    return new Response(pdf, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="document-${documentId}.pdf"`
        }
    });
}
