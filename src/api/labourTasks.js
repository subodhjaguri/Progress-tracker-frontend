import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useLabourTasks(workOrderId) {
  return useQuery({
    queryKey: ["labourTasks", workOrderId],
    queryFn: async () =>
      unwrap(await api.get(`/work-orders/${workOrderId}/labour-tasks`)) || [],
    enabled: !!workOrderId,
  });
}

export function useCreateLabourTask(workOrderId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) =>
      unwrap(await api.post(`/work-orders/${workOrderId}/labour-tasks`, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labourTasks", workOrderId] }),
  });
}

export function useUpdateLabourTask(workOrderId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }) => unwrap(await api.put(`/labour-tasks/${id}`, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labourTasks", workOrderId] }),
  });
}
