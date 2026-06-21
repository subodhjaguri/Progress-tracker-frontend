import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "../features/dashboard/Dashboard.jsx";
import { ProjectsPage } from "../features/projects/ProjectsPage.jsx";
import { ProjectDetail } from "../features/projects/ProjectDetail.jsx";
import { WorkOrdersPage } from "../features/workOrders/WorkOrdersPage.jsx";
import { WorkOrderDetail } from "../features/workOrders/WorkOrderDetail.jsx";
import { AttendancePage } from "../features/attendance/AttendancePage.jsx";
import { MaterialsPage } from "../features/materials/MaterialsPage.jsx";
import { DailyReport } from "../features/reports/DailyReport.jsx";
import { TeamPage } from "../features/team/TeamPage.jsx";
import { ContractorDetail } from "../features/team/ContractorDetail.jsx";
import { LabourPage } from "../features/labour/LabourPage.jsx";
import { LabourDetail } from "../features/labour/LabourDetail.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/work-orders" element={<WorkOrdersPage />} />
      <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/materials" element={<MaterialsPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/contractors/:id" element={<ContractorDetail />} />
      <Route path="/labour" element={<LabourPage />} />
      <Route path="/labour/:id" element={<LabourDetail />} />
      <Route path="/reports" element={<DailyReport />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
