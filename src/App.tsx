import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Family
import FamilyDashboard from "./pages/family/FamilyDashboard";
import FamilyMembers from "./pages/family/FamilyMembers";
import FamilyAppointments from "./pages/family/FamilyAppointments";
import FamilyVaccinations from "./pages/family/FamilyVaccinations";
import FamilyEmergencyCard from "./pages/family/FamilyEmergencyCard";
import FamilyRecords from "./pages/family/FamilyRecords";

// Hospital
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalPatients from "./pages/hospital/HospitalPatients";
import HospitalAppointments from "./pages/hospital/HospitalAppointments";
import HospitalRecords from "./pages/hospital/HospitalRecords";
import HospitalStaff from "./pages/hospital/HospitalStaff";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAudit from "./pages/admin/AdminAudit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Family Routes */}
              <Route path="/family/dashboard" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyDashboard /></ProtectedRoute>} />
              <Route path="/family/members" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyMembers /></ProtectedRoute>} />
              <Route path="/family/appointments" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyAppointments /></ProtectedRoute>} />
              <Route path="/family/vaccinations" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyVaccinations /></ProtectedRoute>} />
              <Route path="/family/emergency" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyEmergencyCard /></ProtectedRoute>} />
              <Route path="/family/records" element={<ProtectedRoute allowedRoles={["family_admin", "family_member"]}><FamilyRecords /></ProtectedRoute>} />

              {/* Hospital Routes */}
              <Route path="/hospital/dashboard" element={<ProtectedRoute allowedRoles={["hospital_admin", "doctor", "staff"]}><HospitalDashboard /></ProtectedRoute>} />
              <Route path="/hospital/patients" element={<ProtectedRoute allowedRoles={["hospital_admin", "doctor", "staff"]}><HospitalPatients /></ProtectedRoute>} />
              <Route path="/hospital/appointments" element={<ProtectedRoute allowedRoles={["hospital_admin", "doctor", "staff"]}><HospitalAppointments /></ProtectedRoute>} />
              <Route path="/hospital/records" element={<ProtectedRoute allowedRoles={["hospital_admin", "doctor", "staff"]}><HospitalRecords /></ProtectedRoute>} />
              <Route path="/hospital/staff" element={<ProtectedRoute allowedRoles={["hospital_admin"]}><HospitalStaff /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminHospitals /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminAudit /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
