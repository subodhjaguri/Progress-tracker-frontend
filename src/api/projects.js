import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";
import { adaptProject } from "../lib/adapters.js";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => (unwrap(await api.get("/projects")) || []).map(adaptProject),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => adaptProject(unwrap(await api.get(`/projects/${id}`))),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/projects", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
