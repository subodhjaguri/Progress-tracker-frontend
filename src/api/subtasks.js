import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useSubTasks(workOrderId) {
  return useQuery({
    queryKey: ["subtasks", workOrderId],
    queryFn: async () => unwrap(await api.get(`/work-orders/${workOrderId}/subtasks`)),
    enabled: !!workOrderId,
  });
}

export function useCreateSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workOrderId, ...body }) =>
      unwrap(await api.post(`/work-orders/${workOrderId}/subtasks`, body)),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["subtasks", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrder", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workOrderId, subId, ...body }) =>
      unwrap(await api.put(`/work-orders/${workOrderId}/subtasks/${subId}`, body)),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["subtasks", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrder", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workOrderId, subId }) =>
      unwrap(await api.delete(`/work-orders/${workOrderId}/subtasks/${subId}`)),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["subtasks", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrder", vars.workOrderId] });
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
