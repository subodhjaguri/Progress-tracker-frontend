import React, { useState, useEffect } from "react";
import { Compass, FileText, Ruler, Calculator, Plus, Trash2, Edit3 } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Section, Field, Modal } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { RichTextEditor } from "../../components/ui/RichTextEditor.jsx";
import { useProjects } from "../../api/projects.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useEngineeringNotes, useCreateEngineeringNote, useDeleteEngineeringNote } from "../../api/engineering.js";
import { errMessage } from "../../lib/api.js";

export function EngineeringPage() {
  const { role } = useAuth();
  const { announce } = useData();
  const { data: projects = [], isLoading } = useProjects();
  const [projectId, setProjectId] = useState("");
  const [activeCategory, setActiveCategory] = useState("Site Summary");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: notes = [] } = useEngineeringNotes(projectId);
  const createNote = useCreateEngineeringNote();
  const deleteNote = useDeleteEngineeringNote();

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const selectedProject = projects.find((p) => p.id === projectId);

  const filteredNotes = notes.filter((n) => {
    const d = new Date(n.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteHtmlContent.trim()) {
      announce("Please provide both title and site description content.");
      return;
    }
    try {
      await createNote.mutateAsync({
        project: projectId,
        title: noteTitle,
        category: noteCategory,
        content: noteHtmlContent,
      });
      announce("Site summary and engineering description saved");
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteHtmlContent("");
    } catch (err) {
      announce(errMessage(err, "Could not save engineering note"));
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote.mutateAsync(id);
      announce("Engineering note deleted");
    } catch (err) {
      announce(errMessage(err, "Could not delete note"));
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="ENGINEERING & TECHNICAL"
        title="Technical Designs & Site Descriptions"
        text="Write rich site design summaries, structural specifications, and manage drawings and calculation sheets."
        action={
          <button className="primary-button" onClick={() => setShowNoteModal(true)}>
            <Plus size={18} />
            Write Site Description
          </button>
        }
      />

      <div className="report-controls" style={{ flexWrap: "wrap", gap: "1rem" }}>
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
        <Field label="From">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </Field>
        {(dateFrom || dateTo) && (
          <button
            className="secondary-button small"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {isLoading || !projectId ? (
        <div className="empty-inline">
          <strong>Loading projects…</strong>
        </div>
      ) : (
        <>
          <div className="stats-grid material-stats">
            <div
              className={`stat-card clickable ${activeCategory === "Site Summary" ? "active-tab" : ""}`}
              onClick={() => setActiveCategory("Site Summary")}
            >
              <Edit3 size={24} className="stat-icon" />
              <div>
                <strong>Site Descriptions & Summaries</strong>
                <span>Rich text site updates & design specs</span>
              </div>
            </div>

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
                <strong>Technical Reports</strong>
                <span>Soil reports, site surveys & structural audit notes</span>
              </div>
            </div>
          </div>

          {activeCategory === "Site Summary" ? (
            <Section
              title={`${selectedProject?.name || "Project"} — Site Descriptions & Specifications`}
              eyebrow="ENGINEERING NOTES & SUMMARIES"
              className="wide-panel"
              action={
                <button className="small-button" onClick={() => setShowNoteModal(true)}>
                  <Plus size={15} /> Compose New Description
                </button>
              }
            >
              {filteredNotes.length === 0 ? (
                <div className="empty-inline">
                  <strong>No site descriptions or engineering notes written yet</strong>
                  <p>Click "Compose New Description" to add formatted site details and structural summaries.</p>
                </div>
              ) : (
                <div className="documents-list" style={{ flexDirection: "column", gap: "1rem" }}>
                  {filteredNotes.map((n) => (
                    <article
                      key={n._id || n.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        padding: "1rem",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div>
                          <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{n.title}</strong>
                          <span style={{ marginLeft: "0.5rem", fontSize: "0.78rem", padding: "2px 8px", background: "#f1f5f9", borderRadius: "12px", color: "#475569" }}>
                            {n.category}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <small style={{ color: "#64748b" }}>
                            By {n.author?.name || "Engineer"} · {new Date(n.createdAt).toLocaleDateString()}
                          </small>
                          <button className="icon-button" onClick={() => handleDeleteNote(n._id || n.id)} title="Delete Note">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div
                        className="rich-note-content"
                        style={{
                          background: "#fafafa",
                          padding: "0.85rem 1rem",
                          borderRadius: "6px",
                          border: "1px solid #f1f5f9",
                          fontSize: "0.925rem",
                          lineHeight: "1.6",
                        }}
                        dangerouslySetInnerHTML={{ __html: n.content }}
                      />
                    </article>
                  ))}
                </div>
              )}
            </Section>
          ) : (
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
          )}
        </>
      )}

      {showNoteModal && (
        <Modal
          title="Compose Site Description / Engineering Summary"
          subtitle={`Project: ${selectedProject?.name || ""}`}
          onClose={() => setShowNoteModal(false)}
          wide
        >
          <form className="form-grid single" onSubmit={handleCreateNote}>
            <Field label="Description Title">
              <input
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Site Survey & Foundation Design Notes"
              />
            </Field>

            <Field label="Category">
              <select value={noteCategory} onChange={(e) => setNoteCategory(e.target.value)}>
                <option>Site Description & Summary</option>
                <option>Design Specs & Architectural</option>
                <option>Structural Analysis & Audit</option>
                <option>Other</option>
              </select>
            </Field>

            <Field label="Detailed Site Summary & Technical Notes (Rich Text Editor)">
              <RichTextEditor
                value={noteHtmlContent}
                onChange={setNoteHtmlContent}
                placeholder="Describe site conditions, foundation designs, architectural considerations, calculations..."
              />
            </Field>

            <FormActions
              onClose={() => setShowNoteModal(false)}
              label={createNote.isPending ? "Saving Note…" : "Save Site Description"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
