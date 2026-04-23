import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminPortalLayout from "./layouts/portal/AdminPortalLayout";
import StudentPortalLayout from "./layouts/portal/StudentPortalLayout";
import LoginPage from "./pages/auth/LoginPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import ActualiteDetailPage from "./pages/public/ActualiteDetailPage";
import ActualitesPage from "./pages/public/ActualitesPage";
import ContactPage from "./pages/public/ContactPage";
import FormationCategoryPage from "./pages/public/FormationCategoryPage";
import FormationDetailPage from "./pages/public/FormationDetailPage";
import FormationsPage from "./pages/public/FormationsPage";
import HomePage from "./pages/public/HomePage";
import InscriptionPage from "./pages/public/InscriptionPage";
import MediathequePage from "./pages/public/MediathequePage";
import StudentDashboardPage from "./pages/portal/student/StudentDashboardPage";
import StudentDocumentsPage from "./pages/portal/student/StudentDocumentsPage";
import StudentForumPage from "./pages/portal/student/StudentForumPage";
import StudentNotesPage from "./pages/portal/student/StudentNotesPage";
import StudentPaymentsPage from "./pages/portal/student/StudentPaymentsPage";
import StudentSchedulePage from "./pages/portal/student/StudentSchedulePage";
import StudentStagesPage from "./pages/portal/student/StudentStagesPage";

const AdminAcademicPage = lazy(() => import("./pages/portal/admin/AdminAcademicPage"));
const AdminAccountingPage = lazy(() => import("./pages/portal/admin/AdminAccountingPage"));
const AdminDashboardPage = lazy(() => import("./pages/portal/admin/AdminDashboardPage"));
const AdminMediaLibraryPage = lazy(() => import("./pages/portal/admin/AdminMediaLibraryPage"));
const AdminNewsPage = lazy(() => import("./pages/portal/admin/AdminNewsPage"));
const AdminSettingsPage = lazy(() => import("./pages/portal/admin/AdminSettingsPage"));
const AdminStatisticsPage = lazy(() => import("./pages/portal/admin/AdminStatisticsPage"));
const AdminStudentsPage = lazy(() => import("./pages/portal/admin/AdminStudentsPage"));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/formations" element={<FormationsPage />} />
        <Route path="/formations/fsp" element={<FormationCategoryPage programType="FSP" />} />
        <Route path="/formations/fsp/:code" element={<FormationDetailPage />} />
        <Route path="/formations/fs-menum" element={<FormationCategoryPage programType="FS-MENUM" />} />
        <Route path="/formations/fs-menum/:code" element={<FormationDetailPage />} />
        <Route path="/formations/certifiantes" element={<FormationCategoryPage programType="FCQ" />} />
        <Route path="/formations/certifiantes/:code" element={<FormationDetailPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/actualites" element={<ActualitesPage />} />
        <Route path="/actualites/:slug" element={<ActualiteDetailPage />} />
        <Route path="/mediatheque" element={<MediathequePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["etudiant"]} />}>
        <Route path="/etudiant" element={<StudentPortalLayout />}>
          <Route index element={<Navigate to="/etudiant/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="notes" element={<StudentNotesPage />} />
          <Route path="edt" element={<StudentSchedulePage />} />
          <Route path="paiements" element={<StudentPaymentsPage />} />
          <Route path="documents" element={<StudentDocumentsPage />} />
          <Route path="forum" element={<StudentForumPage />} />
          <Route path="stages" element={<StudentStagesPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["staff", "compta", "admin", "direction"]} />}>
        <Route path="/admin" element={<AdminPortalLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="etudiants" element={<AdminStudentsPage />} />
          <Route path="scolarite" element={<AdminAcademicPage />} />
          <Route path="comptabilite" element={<AdminAccountingPage />} />
          <Route path="statistiques" element={<AdminStatisticsPage />} />
          <Route path="medias" element={<Navigate to="/admin/mediatheque" replace />} />
          <Route path="mediatheque" element={<AdminMediaLibraryPage />} />
          <Route path="actualites" element={<AdminNewsPage />} />
          <Route path="parametres" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
