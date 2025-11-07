import { useFetcher } from "react-router";
import { useCallback, useMemo, useState } from "react";

export default function useUpload() {
  const fetcher = useFetcher();
  const [error, setError] = useState(null);

  const upload = useCallback(
    async (file, url, extraData = {}) => {
      if (!file || !url) {
        setError("Thiếu file hoặc upload URL");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      for (const key in extraData) {
        formData.append(key, extraData[key]);
      }

      try {
        setError(null);
        fetcher.submit(formData, {
          method: "post",
          action: url,
          encType: "multipart/form-data",
        });
      } catch (err) {
        console.error("Upload failed:", err);
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

  return { upload, ...state };
}
