import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

export function useFetcherWithReset(key = null) {
  let fetcher;
  if (key) {
    fetcher = useFetcher({ key });
  } else {
    fetcher = useFetcher();
  }
  const [data, setData] = useState(fetcher.data);

  useEffect(() => {
    if (fetcher.state === "idle") {
      setData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);
  
  return {
    ...fetcher,
    data: data,
    reset: () => setData(undefined),
  };
}