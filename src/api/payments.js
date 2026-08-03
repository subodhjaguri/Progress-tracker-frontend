import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function usePayments(params = {}, enabled = true) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => unwrap(await api.get(`/payments${qs ? `?${qs}` : ""}`)) || [],
    enabled,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/payments", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }) =>
      unwrap(await api.patch(`/payments/${id}/status`, { status, note })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
