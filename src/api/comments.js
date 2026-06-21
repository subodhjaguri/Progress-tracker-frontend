import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useComments(parentType, parentId) {
  return useQuery({
    queryKey: ["comments", parentType, parentId],
    queryFn: async () =>
      unwrap(await api.get(`/comments?parentType=${parentType}&parentId=${parentId}`)) || [],
    enabled: !!parentType && !!parentId,
  });
}

export function usePostComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => unwrap(await api.post("/comments", body)),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["comments", vars.parentType, vars.parentId] }),
  });
}
