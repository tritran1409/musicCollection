import { useFetcher } from "react-router";
import { useCallback, useMemo, useState } from "react";

export default function useDeleteFile() {
  const fetcher = useFetcher();
  const [error, setError] = useState(null);

  const deleteFile = useCallback(
    async (fileId) => {
      if (!fileId) {
        setError("Thiếu dữ liệu hoặc ID file để xóa");
        return;
      }

      try {
        setError(null);
        fetcher.submit({id: fileId}, {
          method: "post",
          action: "/deleteFile",
          encType: "application/json",
        });
      } catch (err) {
        console.error("Delete failed:", err);
        setError(err.message);
      }
    },
    [fetcher]
  );

  const state = useMemo(
    () => ({
      loading: fetcher.state === "submitting" || fetcher.state === "loading",
      data: fetcher.data,
      error: error || fetcher.data?.error || null,
    }),
    [fetcher.state, fetcher.data, error]
  );

  return { deleteFile, ...state };
}
