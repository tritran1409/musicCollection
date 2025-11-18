import React from "react";
import { DocumentModel } from "../../.server/document.repo";
import DocumentEditorComponent from "../../components/DocumentEditorComponent/DocumentEditorComponent";
import { CategoryModel } from "../../.server/category.repo";

/**
 * Loader cho route document editor
 * Xử lý cả create và update
 */
export async function loader({ params }) {
  const { documentId } = params;
  
  // Nếu có documentId và không phải 'create', load document để edit
  if (documentId) {
    const documentModel = new DocumentModel();
    const document = await documentModel.findById(documentId);
    
    if (!document) {
      throw new Response("Không tìm thấy tài liệu", { status: 404 });
    }
    const categoryModel = new CategoryModel();
    const category = await categoryModel.findById(document.categoryId);
    return { document, category };
  }
  
  // Ngược lại là create mode
  return { document: null };
}

/**
 * Component route - chỉ cần pass props từ loader vào DocumentEditorComponent
 */
export default function DocumentEditor({ loaderData }) {
  const { document, category } = loaderData;
  
  return (
    <DocumentEditorComponent
      document={document}
      isEdit={true}
      apiEndpoint="/api/document"
      redirectPath={`/bang-dieu-khien/thong-tin-suu-tam/${category?.slug}`}
      categoryId={category?.id}
    />
  );
}