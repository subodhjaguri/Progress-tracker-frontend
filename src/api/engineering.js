import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useEngineeringNotes(projectId) {
  return useQuery({
    queryKey: ["engineeringNotes", projectId],
    queryFn: async () =>
      unwrap(await api.get(`/engineering-notes?project=${projectId}`)) || [],
    enabled: !!projectId,
  });
}

export function useCreateEngineeringNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/engineering-notes", body)),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["engineeringNotes", variables.project] });
    },
  });
}

export function useDeleteEngineeringNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`/engineering-notes/${id}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engineeringNotes"] });
    },
  });
}
