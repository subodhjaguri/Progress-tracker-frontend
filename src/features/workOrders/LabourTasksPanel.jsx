import React, { useState } from "react";
import { Plus, ClipboardCheck, Clock3 } from "lucide-react";
import { Section, StatusPill } from "../../components/index.js";
import { useData } from "../../context/DataContext.jsx";
import {
  useLabourTasks,
  useCreateLabourTask,
  useUpdateLabourTask,
} from "../../api/labourTasks.js";
import { errMessage } from "../../lib/api.js";

const NEXT = {
  "Not Started": "In Progress",
  "In Progress": "Completed",
  Completed: "Not Started",
};

export function LabourTasksPanel({ workOrderId, canManage }) {
  const { announce } = useData();
  const { data: tasks = [] } = useLabourTasks(workOrderId);
  const create = useCreateLabourTask(workOrderId);
  const update = useUpdateLabourTask(workOrderId);
  const [title, setTitle] = useState("");

  const add = async () => {
    if (!title.trim()) return;
    try {
      await create.mutateAsync({ title: title.trim() });
      setTitle("");
    } catch (err) {
      announce(errMessage(err, "Could not add task"));
    }
  };

  const cycle = async (task) => {
    try {
      await update.mutateAsync({ id: task.id, body: { status: NEXT[task.status] } });
    } catch (err) {
      announce(errMessage(err, "Could not update task"));
    }
  };

  return (
    <Section title="Labour tasks">
      <div className="labour-tasks">
        {tasks.map((task) => (
          <article key={task.id}>
            <div className={task.status === "Completed" ? "task-icon" : "task-icon pending"}>
              {task.status === "Completed" ? <ClipboardCheck /> : <Clock3 />}
            </div>
            <div>
              <strong>{task.title}</strong>
              <span>{canManage ? "Tap the status to advance it" : task.status}</span>
            </div>
            {canManage ? (
              <button className="status-toggle" onClick={() => cycle(task)} aria-label="Change status">
                <StatusPill value={task.status} />
              </button>
            ) : (
              <StatusPill value={task.status} />
            )}
          </article>
        ))}
        {tasks.length === 0 && (
          <div className="empty-inline">
            <ClipboardCheck />
            <strong>No labour tasks yet</strong>
            {canManage && <p>Add the first task below.</p>}
          </div>
        )}
      </div>
      {canManage && (
        <div className="task-add">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="New task (e.g. Lay bricks)"
          />
          <button className="small-button" onClick={add} disabled={create.isPending}>
            <Plus size={15} />
            Add
          </button>
        </div>
      )}
    </Section>
  );
}
