import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api.js";

export function useDocuments(parentType, parentId) {
  return useQuery({
    queryKey: ["documents", parentType, parentId],
    queryFn: async () =>
      unwrap(await api.get(`/documents?parentType=${parentType}&parentId=${parentId}`)) || [],
    enabled: !!parentType && !!parentId,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, parentType, parentId, category, isSensitive, progressUpdateId }) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("parentType", parentType);
      fd.append("parentId", parentId);
      fd.append("category", category);
      if (isSensitive) fd.append("isSensitive", "true");
      if (progressUpdateId) fd.append("progressUpdateId", progressUpdateId);
      // axios sets the multipart boundary automatically for FormData bodies.
      return unwrap(await api.post("/documents", fd));
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["documents", vars.parentType, vars.parentId] }),
  });
}

export function useDeleteDocument(parentType, parentId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`/documents/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents", parentType, parentId] }),
  });
}

// Files are served via an auth-gated stream, so fetch as a blob (token attached by the
// api interceptor) and trigger a browser download.
export async function downloadDocument(doc) {
  const res = await api.get(`/documents/${doc.id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.originalName || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
