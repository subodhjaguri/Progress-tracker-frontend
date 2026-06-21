import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => unwrap(await api.get("/dashboard")),
  });
}
