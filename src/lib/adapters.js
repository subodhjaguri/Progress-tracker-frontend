import { fmtDate, initials } from "./format.js";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";

// Map API shapes to the field names the components already use, so the UI changes stay
// minimal. Codes (PRJ-001 / WO-001) come from the API instead of being derived from ids.

export function adaptProject(p) {
  if (!p) return null;
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    site: p.siteName || p.name,
    location: p.siteLocation || "—",
    siteAddress: p.siteAddress,
    clientName: p.clientName,
    clientMobile: p.clientMobile,
    description: p.description,
    status: p.status,
    manager: p.manager?.name || "—",
    progress: p.progress ?? 0,
    workOrderCount: p.workOrderCount ?? p.summary?.totalWorkOrders ?? 0,
    targetDate: fmtDate(p.targetDate),
    startDate: fmtDate(p.startDate),
    image: p.image || FALLBACK_IMG,
    summary: p.summary,
    workOrders: Array.isArray(p.workOrders) ? p.workOrders.map(adaptWorkOrder) : undefined,
  };
}

export function adaptWorkOrder(w) {
  if (!w) return null;
  const project = typeof w.projectId === "object" && w.projectId ? w.projectId : null;
  return {
    id: w.id,
    code: w.code,
    title: w.title,
    description: w.description,
    projectId: project ? project.id : w.projectId,
    projectName: project ? project.name : undefined,
    projectCode: project ? project.code : undefined,
    contractor: w.contractor?.name || "—",
    reporter: w.reporter?.name,
    createdBy: w.createdBy?.name || "—",
    priority: w.priority || "Medium",
    dueDate: fmtDate(w.dueDate),
    status: w.status,
    progress: w.progress ?? 0,
    updated: w.lastUpdateAt ? fmtDate(w.lastUpdateAt) : "—",
  };
}

export function adaptMaterial(m) {
  if (!m) return null;
  const project = typeof m.project === "object" && m.project ? m.project : null;
  return {
    id: m.id,
    date: fmtDate(m.date),
    materialName: m.materialName,
    quantity: m.quantity,
    unit: m.unit,
    type: m.type,
    party: m.party,
    note: m.note,
    projectName: project?.name,
    projectCode: project?.code,
  };
}

export function adaptUpdate(u) {
  if (!u) return null;
  const wo = typeof u.workOrderId === "object" && u.workOrderId ? u.workOrderId : null;
  return {
    id: u.id,
    author: u.author?.name || "—",
    initials: initials(u.author?.name || ""),
    time: fmtDate(u.date),
    text: u.note,
    progress: u.progress ?? 0,
    photos: u.attachments?.length ?? 0,
    orderId: wo ? wo.id : u.workOrderId,
    orderTitle: wo ? wo.title : undefined,
  };
}
