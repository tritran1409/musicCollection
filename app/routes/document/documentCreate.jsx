import { CategoryModel } from "../../.server/category.repo";
import DocumentEditorComponent from "../../components/DocumentEditorComponent/DocumentEditorComponent";
export const loader = async ({ request, params }) => {
  const categoryId = params.categoryId;
  const categoryModel = new CategoryModel();
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }
  return { category };
};
export default function DocumentEditor({ loaderData }) {
  const { category } = loaderData;
  return (
    <DocumentEditorComponent
      document={null}
      isEdit={false}
      apiEndpoint="/api/document"
      redirectPath={`/bang-dieu-khien/thong-tin-suu-tam/${category.slug}`}
      categoryId={category.id}
    />
  );
}