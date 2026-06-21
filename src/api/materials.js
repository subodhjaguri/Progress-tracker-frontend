import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";
import { adaptMaterial } from "../lib/adapters.js";

export function useMaterials(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["materials", params],
    queryFn: async () =>
      (unwrap(await api.get(`/materials${qs ? `?${qs}` : ""}`)) || []).map(adaptMaterial),
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/materials", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}
