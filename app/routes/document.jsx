import { CategoryModel } from "../.server/category.repo";
import { DocumentModel } from "../.server/document.repo";
import DocumentListView from "../components/documentList/DocumentListView";

export async function loader({ params }) {
  const { categorySlug } = params;
  const categoryModel = new CategoryModel();
  const category = await categoryModel.findBySlug(categorySlug);
  const documentModel = new DocumentModel();
  const documents = await documentModel.findByCategory(category.id);
  return { categoryId: category.id, documents };
}

export default function DocumentList({ loaderData }) {
  const { categoryId, documents } = loaderData;

  return (
    <DocumentListView
      documents={documents}
      categoryId={categoryId}
      disabledFilters={['category']}
      pageName="📚 Danh sách tài liệu văn học"
      showAddButton={true}
      filterKey="document-list"
    />
  );
}