import React, { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, Percent, ListChecks } from "lucide-react";
import { Section, Field, ProgressBar } from "../../components/index.js";
import {
  useSubTasks,
  useCreateSubTask,
  useUpdateSubTask,
  useDeleteSubTask,
} from "../../api/subtasks.js";
import { errMessage } from "../../lib/api.js";

export function SubTasksPanel({ workOrderId, canManage = true }) {
  const { data: subtasks = [], isLoading } = useSubTasks(workOrderId);
  const createSub = useCreateSubTask();
  const updateSub = useUpdateSubTask();
  const deleteSub = useDeleteSubTask();

  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");

  const completedCount = subtasks.filter((s) => s.status === "Completed").length;
  const hasWeighted = subtasks.some((s) => s.weight !== null && s.weight !== undefined);
  const totalWeightSum = subtasks.reduce((sum, s) => sum + (s.weight || 0), 0);

  let progress = 0;
  if (subtasks.length > 0) {
    if (hasWeighted) {
      progress = subtasks
        .filter((s) => s.status === "Completed")
        .reduce((sum, s) => sum + (s.weight || 0), 0);
    } else {
      progress = Math.round((completedCount / subtasks.length) * 100);
    }
  }

  const handleToggleStatus = async (subtask) => {
    if (!canManage) return;
    const nextStatus = subtask.status === "Completed" ? "Not Started" : "Completed";
    try {
      await updateSub.mutateAsync({
        workOrderId,
        subId: subtask.id,
        status: nextStatus,
      });
    } catch (err) {
      console.error(errMessage(err, "Failed to update subtask"));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Subtask title is required");

    try {
      await createSub.mutateAsync({
        workOrderId,
        title: title.trim(),
        description: description.trim() || undefined,
        weight: weight !== "" ? Number(weight) : undefined,
      });
      setTitle("");
      setWeight("");
      setDescription("");
      setShowAddForm(false);
    } catch (err) {
      setError(errMessage(err, "Could not create subtask"));
    }
  };

  const handleDelete = async (subId) => {
    try {
      await deleteSub.mutateAsync({ workOrderId, subId });
    } catch (err) {
      console.error(errMessage(err, "Failed to delete subtask"));
    }
  };

  return (
    <Section
      title="Sub-tasks & Progress Breakdown"
      eyebrow="WORK BREAKDOWN STRUCTURE"
      action={
        canManage && !showAddForm ? (
          <button className="small-button" onClick={() => setShowAddForm(true)}>
            <Plus size={15} />
            Add subtask
          </button>
        ) : undefined
      }
      className="wide-panel"
    >
      {/* Subtask overall progress header */}
      <div className="subtasks-summary-card">
        <div className="subtasks-summary-header">
          <div>
            <span className="eyebrow">WORK ORDER PROGRESS</span>
            <h3>
              {progress}% Completed
              <small>
                ({completedCount} of {subtasks.length} subtasks done)
              </small>
            </h3>
          </div>
          {hasWeighted && (
            <div className="weight-badge" title="Total weight assigned across all subtasks">
              <Percent size={14} />
              <span>{totalWeightSum}% allocated</span>
            </div>
          )}
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Add Subtask Form */}
      {showAddForm && (
        <form className="subtask-inline-form" onSubmit={handleCreate}>
          <div className="subtask-form-grid">
            <Field label="Subtask Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare basement raw materials"
                required
                autoFocus
              />
            </Field>
            <Field label="Weight % (Optional)">
              <input
                type="number"
                min="0"
                max={100 - totalWeightSum}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={hasWeighted ? `Max ${100 - totalWeightSum}%` : "e.g. 20"}
              />
            </Field>
            <Field label="Description (Optional)" className="full">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details or effort description"
              />
            </Field>
          </div>
          {error && <div className="login-error">{error}</div>}
          <div className="subtask-form-actions">
            <button type="submit" className="primary-button small" disabled={createSub.isPending}>
              {createSub.isPending ? "Adding…" : "Add subtask"}
            </button>
            <button
              type="button"
              className="secondary-button small"
              onClick={() => {
                setShowAddForm(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subtask list */}
      <div className="subtasks-list">
        {isLoading && (
          <div className="empty-inline">
            <strong>Loading subtasks…</strong>
          </div>
        )}
        {!isLoading && subtasks.length === 0 && (
          <div className="empty-inline">
            <ListChecks size={28} />
            <strong>No subtasks defined yet</strong>
            <p>Break down this work order into subtasks to automatically calculate its progress percentage.</p>
          </div>
        )}
        {subtasks.map((st) => {
          const isDone = st.status === "Completed";
          return (
            <div className={`subtask-item ${isDone ? "completed" : ""}`} key={st.id}>
              <button
                className="subtask-check-btn"
                onClick={() => handleToggleStatus(st)}
                disabled={!canManage || updateSub.isPending}
                title={isDone ? "Mark as not started" : "Mark as completed"}
              >
                {isDone ? (
                  <CheckCircle2 size={20} className="check-icon done" />
                ) : (
                  <Circle size={20} className="check-icon todo" />
                )}
              </button>

              <div className="subtask-content">
                <div className="subtask-title-line">
                  <strong className={isDone ? "strikethrough" : ""}>{st.title}</strong>
                  {st.weight !== null && st.weight !== undefined && (
                    <span className="subtask-weight-pill">{st.weight}% weight</span>
                  )}
                </div>
                {st.description && <p className="subtask-desc">{st.description}</p>}
                {isDone && st.completedAt && (
                  <small className="subtask-meta">Completed</small>
                )}
              </div>

              {canManage && (
                <button
                  className="subtask-delete-btn"
                  onClick={() => handleDelete(st.id)}
                  title="Remove subtask"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
