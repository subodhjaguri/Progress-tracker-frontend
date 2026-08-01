import React, { useState, useEffect } from "react";
import { Compass, FileText, Ruler, Calculator } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Section, Field } from "../../components/index.js";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { useProjects } from "../../api/projects.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function EngineeringPage() {
  const { role } = useAuth();
  const { data: projects = [], isLoading } = useProjects();
  const [projectId, setProjectId] = useState("");
  const [activeCategory, setActiveCategory] = useState("Drawing");

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <>
      <PageHeading
        eyebrow="ENGINEERING & TECHNICAL"
        title="Technical Documents & Site Designs"
        text="Upload, review, and manage technical drawings, structural charts, and estimation sheets."
      />

      <div className="report-controls">
        <Field label="Select Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.length === 0 && <option value="">No assigned projects</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {isLoading || !projectId ? (
        <div className="empty-inline">
          <strong>Loading projects…</strong>
        </div>
      ) : (
        <>
          <div className="stats-grid material-stats">
            <div
              className={`stat-card clickable ${activeCategory === "Drawing" ? "active-tab" : ""}`}
              onClick={() => setActiveCategory("Drawing")}
            >
              <Ruler size={24} className="stat-icon" />
              <div>
                <strong>Drawings & Blueprints</strong>
                <span>Architectural & structural CAD drawings</span>
              </div>
            </div>

            <div
              className={`stat-card clickable ${activeCategory === "Engineering Document" ? "active-tab" : ""}`}
              onClick={() => setActiveCategory("Engineering Document")}
            >
              <Calculator size={24} className="stat-icon" />
              <div>
                <strong>BOQs & Estimations</strong>
                <span>Technical specs, BOQ sheets & calculations</span>
              </div>
            </div>

            <div
              className={`stat-card clickable ${activeCategory === "Other" ? "active-tab" : ""}`}
              onClick={() => setActiveCategory("Other")}
            >
              <FileText size={24} className="stat-icon" />
              <div>
                <strong>Technical Reports & Notes</strong>
                <span>Soil reports, site surveys & structural audit notes</span>
              </div>
            </div>
          </div>

          <Section
            title={`${selectedProject?.name || "Project"} — ${activeCategory} Vault`}
            eyebrow="TECHNICAL REPOSITORY"
            className="wide-panel"
          >
            <DocumentsPanel
              parentType="Project"
              parentId={projectId}
              categoryFilter={activeCategory}
            />
          </Section>
        </>
      )}
    </>
  );
}
