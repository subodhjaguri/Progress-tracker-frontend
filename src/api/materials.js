import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";
import { adaptMaterial } from "../lib/adapters.js";

export function useMaterials(params = {}, enabled = true) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["materials", params],
    queryFn: async () =>
      (unwrap(await api.get(`/materials${qs ? `?${qs}` : ""}`)) || []).map(adaptMaterial),
    enabled,
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/materials", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateBulkMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/materials/bulk", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// The supervisor confirms a delivery ("Confirmed") or flags a problem ("Issue").
export function useConfirmMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }) =>
      unwrap(await api.post(`/materials/${id}/confirm`, { status, note })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRequestMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/materials/request", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useProvideMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.patch(`/materials/${id}/provide`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAcknowledgeMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.patch(`/materials/${id}/acknowledge`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateManagerNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }) =>
      unwrap(await api.patch(`/materials/${id}/manager-note`, { note })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
