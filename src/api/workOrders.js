import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";
import { adaptWorkOrder, adaptUpdate } from "../lib/adapters.js";

export function useWorkOrders(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["workOrders", params],
    queryFn: async () =>
      (unwrap(await api.get(`/work-orders${qs ? `?${qs}` : ""}`)) || []).map(adaptWorkOrder),
  });
}

export function useWorkOrder(id) {
  return useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => adaptWorkOrder(unwrap(await api.get(`/work-orders/${id}`))),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/work-orders", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useWorkOrderUpdates(id) {
  return useQuery({
    queryKey: ["workOrderUpdates", id],
    queryFn: async () =>
      (unwrap(await api.get(`/work-orders/${id}/progress-updates`)) || []).map(adaptUpdate),
    enabled: !!id,
  });
}

export function usePostProgressUpdate(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) =>
      unwrap(await api.post(`/work-orders/${id}/progress-updates`, body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workOrderUpdates", id] });
      qc.invalidateQueries({ queryKey: ["workOrder", id] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
