import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useManagers(enabled = true) {
  return useQuery({
    queryKey: ["managers"],
    queryFn: async () => unwrap(await api.get("/managers")),
    enabled,
  });
}

export function useContractors(enabled = true) {
  return useQuery({
    queryKey: ["contractors"],
    queryFn: async () => unwrap(await api.get("/contractors")),
    enabled,
  });
}

export function useContractor(id) {
  return useQuery({
    queryKey: ["contractor", id],
    queryFn: async () => unwrap(await api.get(`/contractors/${id}`)),
    enabled: !!id,
  });
}

export function useCreateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/managers", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}

export function useCreateContractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/contractors", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors"] }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (id) => unwrap(await api.post(`/users/${id}/reset-password`, {})),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) =>
      unwrap(await api.patch(`/users/${id}/status`, { status })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      qc.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (body) => (await api.post("/auth/change-password", body)).data,
  });
}
