import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useLabour(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["labour", params],
    queryFn: async () => unwrap(await api.get(`/labour${qs ? `?${qs}` : ""}`)) || [],
  });
}

export function useLabourOne(id) {
  return useQuery({
    queryKey: ["labourOne", id],
    queryFn: async () => unwrap(await api.get(`/labour/${id}`)),
    enabled: !!id,
  });
}

export function useCreateLabour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/labour", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labour"] }),
  });
}

export function useUpdateLabour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }) => unwrap(await api.put(`/labour/${id}`, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labour"] }),
  });
}
