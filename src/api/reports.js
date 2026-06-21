import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useDailyReport(projectId, date) {
  return useQuery({
    queryKey: ["dailyReport", projectId, date],
    queryFn: async () =>
      unwrap(await api.get(`/projects/${projectId}/daily-report?date=${date}`)),
    enabled: !!projectId,
  });
}
