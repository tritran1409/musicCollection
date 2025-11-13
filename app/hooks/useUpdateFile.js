import { useFetcherWithReset } from "./useFetcherWithReset";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useUpdateFile() {
  const fetcher = useFetcherWithReset();
  const [error, setError] = useState(null);

  const updateFile = async (data, url = "/updateFile") => {
      if (!data || typeof data !== "object" || !data.id) {
        setError("Thiếu dữ liệu hoặc ID file để cập nhật");
        return;
      }

      try {
        setError(null);
        fetcher.submit(JSON.stringify(data), {
          method: "post",
          action: url,
          encType: "application/json",
        });
      } catch (err) {
        console.error("Update failed:", err);
        setError(err.message);
      }
    }
  const deleteFile = async (fileId) => {
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
    }

  const state = useMemo(
    () => ({
      loading: fetcher.state === "submitting" || fetcher.state === "loading",
      data: fetcher.data,
      error: error || fetcher.data?.error || null,
    }),
    [fetcher.state, fetcher.data, error]
  );
  useEffect(() => {
    if (fetcher.data) {
      fetcher.reset();
    }
  }, [fetcher.data]);

  return { updateFile, deleteFile, ...state };
}
