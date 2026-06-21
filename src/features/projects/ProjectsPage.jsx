import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  CalendarDays,
  ClipboardList,
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatusPill, ProgressBar } from "../../components/index.js";
import { PROJECT_FILTERS } from "../../lib/constants.js";
import { useData } from "../../context/DataContext.jsx";
import { useProjects } from "../../api/projects.js";

export function ProjectsPage() {
  const navigate = useNavigate();
  const { setModal } = useData();
  const { data: projects = [], isLoading } = useProjects();
  const [filter, setFilter] = useState("All");

  const shown =
    filter === "All" ? projects : projects.filter((project) => project.status === filter);

  return (
    <>
      <PageHeading
        eyebrow="PROJECTS"
        title="Every site, one clear view"
        text="Track schedules, teams, work and field activity across your portfolio."
        action={
          <button className="primary-button" onClick={() => setModal({ type: "project" })}>
            <Plus size={18} />
            Create project
          </button>
        }
      />
      <div className="toolbar">
        <div className="filter-tabs">
          {PROJECT_FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="secondary-button">
          <SlidersHorizontal size={17} />
          More filters
        </button>
      </div>
      {isLoading && (
        <div className="empty-inline">
          <strong>Loading projects…</strong>
        </div>
      )}
      {!isLoading && shown.length === 0 && (
        <div className="empty-inline">
          <strong>No projects yet</strong>
          <p>Create your first project to get started.</p>
        </div>
      )}
      <div className="project-card-grid">
        {shown.map((project) => (
          <article
            className="project-card"
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="project-image">
              <img src={project.image} alt={project.name} />
              <StatusPill value={project.status} />
              <button>
                <MoreHorizontal size={19} />
              </button>
            </div>
            <div className="project-card-body">
              <span className="project-code">{project.code}</span>
              <h2>{project.name}</h2>
              <p>
                <MapPin size={15} />
                {project.location}
              </p>
              <ProgressBar value={project.progress} />
              <div className="project-card-meta">
                <span>
                  <CalendarDays size={15} />
                  Due {project.targetDate}
                </span>
                <span>
                  <ClipboardList size={15} />
                  {project.workOrderCount} work orders
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
