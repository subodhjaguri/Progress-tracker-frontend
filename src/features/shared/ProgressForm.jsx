import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "./FormActions.jsx";
import { usePostProgressUpdate } from "../../api/workOrders.js";
import { useUploadDocument } from "../../api/documents.js";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

export function ProgressForm({ order, onClose }) {
  const post = usePostProgressUpdate(order.id);
  const upload = useUploadDocument();
  const { announce } = useData();
  const fileRef = useRef();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const busy = post.isPending || upload.isPending;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      note: form.get("notes"),
      progress: Number(form.get("progress")),
      status: form.get("status"),
    };
    try {
      const update = await post.mutateAsync(body);
      // Attach any selected files to this update (photos vs other docs).
      for (const file of files) {
        await upload.mutateAsync({
          file,
          parentType: "WorkOrder",
          parentId: order.id,
          category: file.type.startsWith("image/") ? "Site Photo" : "Other",
          progressUpdateId: update?.id,
        });
      }
      announce(files.length ? "Update posted with attachments" : "Progress update posted");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not post update"));
    }
  };

  return (
    <Modal title="Post progress update" subtitle={order.title} onClose={onClose}>
      <form className="form-grid single" onSubmit={submit}>
        <Field label="Progress percentage">
          <div className="range-field">
            <input
              name="progress"
              type="range"
              min="0"
              max="100"
              defaultValue={order.progress}
              onInput={(event) =>
                (event.currentTarget.nextElementSibling.textContent = `${event.currentTarget.value}%`)
              }
            />
            <strong>{order.progress}%</strong>
          </div>
        </Field>
        <Field label="Current status">
          <select name="status" defaultValue={order.status}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Blocked</option>
            <option>Completed</option>
          </select>
        </Field>
        <Field label="What happened today?">
          <textarea
            name="notes"
            rows="4"
            required
            placeholder="Keep it clear and specific for the project owner..."
          />
        </Field>
        <input
          type="file"
          multiple
          ref={fileRef}
          hidden
          onChange={(e) => setFiles([...e.target.files])}
        />
        <button type="button" className="upload-zone" onClick={() => fileRef.current?.click()}>
          <Upload size={24} />
          <strong>
            {files.length
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "Add photos or documents"}
          </strong>
          <span>
            {files.length
              ? files.map((f) => f.name).join(", ")
              : "Click to attach files to this update"}
          </span>
        </button>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={busy ? "Posting…" : "Post update"} />
      </form>
    </Modal>
  );
}
