import { useFetcher } from "react-router";
import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook mở rộng useFetcher của Remix
 * Thêm tính năng reset() để xoá data sau khi fetch xong
 *
 * @param {{ autoReset?: boolean }} options
 */
export function useFetcherWithReset(options = {}) {
  const fetcher = useFetcher();
  const [localData, setLocalData] = useState(undefined);
  const [isResetting, setIsResetting] = useState(false);

  // Ghi nhận data mỗi khi fetcher.data thay đổi
  useEffect(() => {
    if (fetcher.data !== undefined && !isResetting) {
      setLocalData(fetcher.data);
    }
  }, [fetcher.data, isResetting]);

  // Tự động reset khi fetcher hoàn tất (nếu bật autoReset)
  useEffect(() => {
    if (options.autoReset && fetcher.state === "idle" && !fetcher.submission) {
      const timer = setTimeout(() => reset(), 0);
      return () => clearTimeout(timer);
    }
  }, [fetcher.state, fetcher.submission, options.autoReset]);

  const reset = useCallback(() => {
    setIsResetting(true);
    setLocalData(undefined);
    // reset flag ngay sau đó để không ảnh hưởng state sau
    setTimeout(() => setIsResetting(false), 0);
  }, []);

  return {
    ...fetcher,
    data: localData,
    reset,
  };
}
