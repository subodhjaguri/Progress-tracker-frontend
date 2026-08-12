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

// ---- Engineering checklists (engineer-authored to-do lists) ----

export function useChecklists(projectId) {
  return useQuery({
    queryKey: ["engineeringChecklists", projectId],
    queryFn: async () =>
      unwrap(await api.get(`/engineering-checklists?project=${projectId}`)) || [],
    enabled: !!projectId,
  });
}

export function useCreateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/engineering-checklists", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineeringChecklists"] }),
  });
}

/** One write path for every edit: rename, add/remove items, and ticking them off. */
export function useUpdateChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) =>
      unwrap(await api.put(`/engineering-checklists/${id}`, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineeringChecklists"] }),
  });
}

export function useDeleteChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`/engineering-checklists/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineeringChecklists"] }),
  });
}
