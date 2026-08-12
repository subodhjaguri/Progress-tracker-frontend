import React, { useState } from "react";
import { Plus, Trash2, Pencil, X, CircleCheckBig } from "lucide-react";
import { Section, Field, Modal } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useData } from "../../context/DataContext.jsx";
import {
  useChecklists,
  useCreateChecklist,
  useUpdateChecklist,
  useDeleteChecklist,
} from "../../api/engineering.js";
import { errMessage } from "../../lib/api.js";
import { fmtDate } from "../../lib/format.js";

// Subdocuments come back with `_id`; the root doc gets an `id` via the toJSON
// transform. Read both so item identity survives a round trip.
const itemId = (item) => item.id || item._id;
const emptyLine = () => ({ key: Math.random().toString(36).slice(2), text: "" });

export function ChecklistsPanel({ projectId, projectName, canWrite }) {
  const { announce } = useData();
  const { data: checklists = [], isLoading } = useChecklists(projectId);
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist();
  const deleteChecklist = useDeleteChecklist();

  const [editing, setEditing] = useState(null); // the checklist being edited, or "new"
  const [title, setTitle] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState("");

  const openNew = () => {
    setEditing("new");
    setTitle("");
    setLines([emptyLine()]);
    setError("");
  };

  const openEdit = (checklist) => {
    setEditing(checklist);
    setTitle(checklist.title);
    setLines(
      checklist.items.length
        ? checklist.items.map((item) => ({
            key: itemId(item),
            id: itemId(item),
            text: item.text,
            done: item.done,
          }))
        : [emptyLine()],
    );
    setError("");
  };

  const close = () => {
    setEditing(null);
    setError("");
  };

  const setLine = (index, text) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, text } : l)));
  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index) =>
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!title.trim()) return setError("Give the checklist a title");
    const items = lines
      .filter((l) => l.text.trim())
      .map((l) => ({ id: l.id, text: l.text.trim(), done: !!l.done }));
    if (!items.length) return setError("Add at least one item");

    try {
      if (editing === "new") {
        await createChecklist.mutateAsync({ project: projectId, title: title.trim(), items });
        announce("Checklist created");
      } else {
        await updateChecklist.mutateAsync({ id: editing.id, title: title.trim(), items });
        announce("Checklist updated");
      }
      close();
    } catch (err) {
      setError(errMessage(err, "Could not save the checklist"));
    }
  };

  // Ticking an item is the same write as any other edit — send the list back.
  const toggleItem = async (checklist, target) => {
    if (!canWrite) return;
    const items = checklist.items.map((item) => ({
      id: itemId(item),
      text: item.text,
      done: itemId(item) === itemId(target) ? !item.done : item.done,
    }));
    try {
      await updateChecklist.mutateAsync({ id: checklist.id, items });
    } catch (err) {
      announce(errMessage(err, "Could not update the checklist"));
    }
  };

  const remove = async (checklist) => {
    try {
      await deleteChecklist.mutateAsync(checklist.id);
      announce("Checklist deleted");
    } catch (err) {
      announce(errMessage(err, "Could not delete the checklist"));
    }
  };

  return (
    <Section
      title={`${projectName || "Project"} — Site Checklists`}
      eyebrow="ENGINEERING TO-DO LISTS"
      className="wide-panel"
      action={
        canWrite ? (
          <button className="small-button" onClick={openNew}>
            <Plus size={15} /> New Checklist
          </button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="empty-inline">
          <strong>Loading checklists…</strong>
        </div>
      ) : checklists.length === 0 ? (
        <div className="empty-inline">
          <CircleCheckBig />
          <strong>No checklists yet</strong>
          <p>
            {canWrite
              ? "Create one to track what needs verifying on the next site visit."
              : "The site engineer has not added a checklist for this project yet."}
          </p>
        </div>
      ) : (
        <div className="checklist-list">
          {checklists.map((checklist) => {
            const done = checklist.items.filter((i) => i.done).length;
            const total = checklist.items.length;
            const complete = total > 0 && done === total;
            return (
              <article className="checklist-card" key={checklist.id}>
                <header>
                  <div>
                    <strong>{checklist.title}</strong>
                    <small>
                      By {checklist.author?.name || "Engineer"} ·{" "}
                      {fmtDate(checklist.createdAt)}
                    </small>
                  </div>
                  <div className="checklist-head-right">
                    <span className={`checklist-count${complete ? " complete" : ""}`}>
                      {done}/{total} done
                    </span>
                    {canWrite && (
                      <>
                        <button
                          className="icon-button"
                          title="Edit checklist"
                          onClick={() => openEdit(checklist)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button"
                          title="Delete checklist"
                          onClick={() => remove(checklist)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </header>

                <ul className="checklist-items">
                  {checklist.items.map((item) => (
                    <li key={itemId(item)} className={item.done ? "done" : ""}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!item.done}
                          disabled={!canWrite || updateChecklist.isPending}
                          onChange={() => toggleItem(checklist, item)}
                        />
                        <span>{item.text}</span>
                      </label>
                      {item.done && item.doneBy?.name && (
                        <small>
                          {item.doneBy.name}
                          {item.doneAt ? ` · ${fmtDate(item.doneAt)}` : ""}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? "New Site Checklist" : "Edit Checklist"}
          subtitle={projectName}
          onClose={close}
        >
          <form className="form-grid single" onSubmit={submit}>
            <Field label="Checklist Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pre-pour foundation checks"
              />
            </Field>

            <Field label="Items">
              <div className="checklist-editor">
                {lines.map((line, index) => (
                  <div className="checklist-editor-row" key={line.key}>
                    <input
                      value={line.text}
                      onChange={(e) => setLine(index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="icon-button"
                      title="Remove item"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" className="small-button" onClick={addLine}>
                  <Plus size={14} /> Add item
                </button>
              </div>
            </Field>

            {error && <p className="field-note warn">{error}</p>}

            <FormActions
              onClose={close}
              label={
                createChecklist.isPending || updateChecklist.isPending
                  ? "Saving…"
                  : editing === "new"
                    ? "Create Checklist"
                    : "Save Changes"
              }
            />
          </form>
        </Modal>
      )}
    </Section>
  );
}
