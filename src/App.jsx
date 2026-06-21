import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CircleCheckBig, HardHat } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { DataProvider, useData } from "./context/DataContext.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Topbar } from "./components/layout/Topbar.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { LoginPage } from "./features/auth/LoginPage.jsx";
import { ProjectForm } from "./features/projects/ProjectForm.jsx";
import { WorkOrderForm } from "./features/workOrders/WorkOrderForm.jsx";
import { ProgressForm } from "./features/shared/ProgressForm.jsx";
import { MaterialForm } from "./features/materials/MaterialForm.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// Centralized modal host — `modal` is { type, ...payload } in DataContext.
// Project / work-order / progress forms are self-contained API forms (Part 1b);
// material remains mock until Part 2.
function ModalHost() {
  const { modal, setModal } = useData();
  if (!modal) return null;
  const close = () => setModal(null);
  if (modal.type === "project") return <ProjectForm onClose={close} />;
  if (modal.type === "work-order") return <WorkOrderForm onClose={close} />;
  if (modal.type === "progress") return <ProgressForm order={modal.order} onClose={close} />;
  if (modal.type === "material") return <MaterialForm onClose={close} />;
  return null;
}

function Toast() {
  const { toast } = useData();
  if (!toast) return null;
  return (
    <div className="toast">
      <CircleCheckBig size={18} />
      {toast}
    </div>
  );
}

function Layout() {
  const [mobileNav, setMobileNav] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} />
      <div className="main-shell">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main className="page-content">
          <AppRoutes />
        </main>
      </div>
      <ModalHost />
      <Toast />
    </div>
  );
}

// Auth gate: /login is public; everything else requires an authenticated session.
function Gate() {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <div className="app-loading">
        <div className="brand-mark">
          <HardHat size={26} />
        </div>
        <span>Loading…</span>
      </div>
    );
  }
  return (
    <Routes>
      <Route
        path="/login"
        element={status === "authed" ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={status === "authed" ? <Layout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Gate />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
