import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { Section } from "../../components/index.js";
import { AuthImage } from "../../components/AuthImage.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDocuments, useUploadDocument } from "../../api/documents.js";
import { fmtDate } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

export function PhotosPanel({ parentType, parentId }) {
  const { announce } = useData();
  const { data: docs = [] } = useDocuments(parentType, parentId);
  const upload = useUploadDocument();
  const fileRef = useRef();
  const photos = docs.filter((d) => d.category === "Site Photo");

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync({ file, parentType, parentId, category: "Site Photo" });
      announce("Photo uploaded");
    } catch (err) {
      announce(errMessage(err, "Upload failed"));
    }
    e.target.value = "";
  };

  return (
    <Section
      title="Site photos"
      action={
        <>
          <input type="file" accept="image/*" ref={fileRef} hidden onChange={onPick} />
          <button
            className="small-button"
            onClick={() => fileRef.current?.click()}
            disabled={upload.isPending}
          >
            <Upload size={15} />
            {upload.isPending ? "Uploading…" : "Upload photo"}
          </button>
        </>
      }
    >
      {photos.length === 0 ? (
        <div className="empty-inline">
          <strong>No photos yet</strong>
          <p>Upload a site photo to get started.</p>
        </div>
      ) : (
        <div className="media-gallery">
          {photos.map((p) => (
            <figure key={p.id}>
              <AuthImage docId={p.id} alt={p.originalName} />
              <figcaption>
                <strong>{p.originalName}</strong>
                <span>{fmtDate(p.createdAt)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}
