import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../utils/format";

const DEFAULT_PAGE = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
};

// fetcher-kon si api call karni hai
// params-API ko kya parameters bhejne hain
// deps-Kab API dobara call karni hai.
export function usePaginatedFetch(fetcher, params, deps = []) {
  const [data, setData] = useState(DEFAULT_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    fetcher(params)
      .then((res) => {
        if (!active) return;
        const payload = res.data;
        setData({
          content: payload.content ?? [],
          // Custom PageResponseDto uses pageNumber/pageSize; Spring's native
          // Page<T> (e.g. /api/users) uses number/size — support both.
          pageNumber: payload.pageNumber ?? payload.number ?? 0,
          pageSize: payload.pageSize ?? payload.size ?? params?.size ?? 10,
          totalElements: payload.totalElements ?? (payload.content?.length || 0),
          totalPages: payload.totalPages ?? 1,
        });
      })
      .catch((err) => {
        if (!active) return;
        const message = getErrorMessage(err, "Failed to load data.");
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadTick]);

  return { ...data, loading, error, reload };
}
