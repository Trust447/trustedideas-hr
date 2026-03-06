// src/hooks/useApi.js
// Generic data fetching with loading, error, pagination, and refetch.

import { useState, useEffect, useCallback, useRef } from 'react';

const PER_PAGE = 20;

/**
 * useApi — fetches data and manages loading / error / pagination state.
 * Returns: { data, meta, loading, error, page, setPage, refetch }
 */
export function useApi(fn, params = {}, deps = []) {
  const [data,    setData]    = useState(null);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [page,    setPage]    = useState(params.page ?? 1);
  const abortRef = useRef(null);

  const fetch = useCallback(async (overrides = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fn({ per_page: PER_PAGE, ...params, page, ...overrides });
      if (controller.signal.aborted) return;

      if (result?.meta) {
        setData(result.data);
        setMeta(result.meta);
      } else if (result?.data) {
        setData(result.data);
      } else {
        setData(result);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, page, ...deps]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, meta, loading, error, page, setPage, refetch: fetch };
}

/**
 * useMutation — wraps POST / PUT / DELETE operations.
 * Returns { mutate, loading, error }
 */
export function useMutation(fn, { onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      const data = result?.data ?? result;
      onSuccess?.(data);
      return data;
    } catch (err) {
      const msg = err.message || 'Operation failed';
      setError(msg);
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn, onSuccess, onError]);

  return { mutate, loading, error, clearError: () => setError(null) };
}
