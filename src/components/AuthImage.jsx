import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";

// Loads an auth-gated image by fetching it as a blob (Bearer token attached by the api
// interceptor) and rendering it via an object URL — an <img src> can't send the token.
export function AuthImage({ docId, alt }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    let objectUrl;
    api
      .get(`/documents/${docId}/download`, { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        if (active) setUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [docId]);

  return url ? <img src={url} alt={alt} /> : <div className="img-skeleton" />;
}
