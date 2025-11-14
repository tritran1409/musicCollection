import FileLibraryLayout from "../components/common/FileLibraryLayout.jsx";

export default function FileLibraryPage() {
  const pageName = `🔎 Tìm kiếm nâng cao`;
  return <FileLibraryLayout files={{
    files: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startIndex: 0,
    endIndex: 0,
  }} fileType={"custom"} accept={"*/*"} pageName={pageName} />;
}
