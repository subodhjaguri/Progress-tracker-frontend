import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useSearch(q) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: async () => unwrap(await api.get(`/search?q=${encodeURIComponent(q)}`)),
    enabled: q.trim().length >= 2,
  });
}
