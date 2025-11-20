import { DocumentModel } from "../.server/document.repo.js";
import DocumentListView from "../components/documentList/DocumentListView.jsx";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") || "";

  const documentModel = new DocumentModel();
  const documents = await documentModel.findAll();

  return {
    documents,
    owner
  };
};

export default function SearchDocument({ loaderData }) {
  const { documents, owner } = loaderData;

  return (
    <DocumentListView
      documents={documents}
      categoryId={null}
      disabledFilters={[]}
      pageName="🔎 Tìm kiếm tài liệu"
      showAddButton={false}
      filterKey="search-document"
      extraData={{ owner }}
    />
  );
}
