import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PatientsList from "./pages/dashboard/PatientsList";
import PatientDetail from "./pages/dashboard/PatientDetail";
import AddPatient from "./pages/dashboard/AddPatient";
import StudiesList from "./pages/dashboard/StudiesList";
import StudyForm from "./pages/dashboard/StudyForm";
import EvaluationsList from "./pages/dashboard/EvaluationsList";
import EvaluationReport from "./pages/dashboard/EvaluationReport";
import VisuospatialTest from "./pages/VisuospatialTest";
import NamingTest from "./pages/NamingTest";
import MemoryTest from "./pages/MemoryTest";
import AttentionTest from "./pages/AttentionTest";
import LanguageTest from "./pages/LanguageTest";
import AbstractionTest from "./pages/AbstractionTest";
import DelayedRecallTest from "./pages/DelayedRecallTest";
import OrientationTest from "./pages/OrientationTest";
import FinalReport from "./pages/FinalReport";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/new" element={<AddPatient />} />
        <Route path="patients/:patientId" element={<PatientDetail />} />
        <Route path="studies" element={<StudiesList />} />
        <Route path="studies/new" element={<StudyForm />} />
        <Route path="studies/:studyId/edit" element={<StudyForm />} />
        <Route path="evaluations" element={<EvaluationsList />} />
        <Route path="evaluations/:evaluationId" element={<EvaluationReport />} />
      </Route>
      <Route path="/test/start" element={<Navigate to="/dashboard" replace />} />
      <Route path="/tests/:testId/visuospatial" element={<VisuospatialTest />} />
      <Route path="/tests/:testId/naming" element={<NamingTest />} />
      <Route path="/tests/:testId/memory" element={<MemoryTest />} />
      <Route path="/tests/:testId/attention" element={<AttentionTest />} />
      <Route path="/tests/:testId/language" element={<LanguageTest />} />
      <Route path="/tests/:testId/abstraction" element={<AbstractionTest />} />
      <Route path="/tests/:testId/delayed-recall" element={<DelayedRecallTest />} />
      <Route path="/tests/:testId/orientation" element={<OrientationTest />} />
      <Route path="/tests/:testId/report" element={<FinalReport />} />
    </Routes>
  );
}
