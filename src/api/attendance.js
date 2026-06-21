import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useAttendance(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: async () => unwrap(await api.get(`/attendance${qs ? `?${qs}` : ""}`)) || [],
    enabled: Object.values(params).some(Boolean),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/attendance", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendanceSummary"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAttendanceSummary(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return useQuery({
    queryKey: ["attendanceSummary", params],
    queryFn: async () => unwrap(await api.get(`/attendance/summary?${qs}`)),
    enabled: !!params.id,
  });
}
