// hooks/useFdcSearch.ts
import { useEffect, useRef, useState } from "react";
import { fdcSearch, FdcFood } from "../lib/fdc";

export function useFdcSearch(query: string) {
  const [data, setData] = useState<FdcFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debounced = useDebounced(query, 250);

  useEffect(() => {
    if (!debounced?.trim()) {
      setData([]);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fdcSearch({ query: debounced, pageSize: 25 });
        if (!ac.signal.aborted) setData(res.foods || []);
      } catch (e: any) {
        if (!ac.signal.aborted) setError(e?.message ?? "Search failed");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [debounced]);

  return { data, loading, error };
}

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
