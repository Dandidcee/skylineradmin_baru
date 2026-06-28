import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/store/theme-store";
import { DocumentProvider } from "@/store/document-store";
import { ClientProvider } from "@/store/client-store";
import { CalendarProvider } from "@/store/calendar-store";
import { TodoProvider } from "@/store/todo-store";
import { DashboardPage } from "@/pages/dashboard-page";
import { DocumentsPage } from "@/pages/documents-page";
import { TemplatesPage } from "@/pages/templates-page";
import { ClientsPage } from "@/pages/clients-page";
import { PaymentPage } from "./pages/payment-page";
import { CalendarPage } from "@/pages/calendar-page";
import { TodoPage } from "@/pages/todo-page";
import { ProjectsPage } from "./pages/projects-page";
import { SoloProjectsPage } from "./pages/solo-projects-page";
import { LoginPage } from "@/pages/login-page";
import { SettingsPage } from "./pages/settings-page";
import { RevisionsPage } from "@/pages/revisions-page";
import { MaintenancePage } from "@/pages/maintenance-page";
import { SharedDocumentPage } from "@/pages/shared-document-page";

// Halaman publik (login & shared document) tidak butuh data store
const PUBLIC_PATHS = ["/login", "/shared-document"];

/**
 * Provider wrapper yang hanya aktif saat user sudah login.
 * Ini mencegah API call sia-sia saat halaman login / shared-document dibuka.
 */
function AuthProviders({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  // Hanya skip provider di halaman publik seperti login & shared-document.
  // Jangan skip berdasarkan token, biar API service (yang meredirect 401) yang meng-handle jika belum login.
  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <DocumentProvider>
      <ClientProvider>
        <CalendarProvider>
          <TodoProvider>
            {children}
          </TodoProvider>
        </CalendarProvider>
      </ClientProvider>
    </DocumentProvider>
  );
}

import { Navigate } from "react-router-dom";

// Komponen pelindung rute pribadi (mencegah flash dashboard sebelum redirect API)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasToken = !!localStorage.getItem("token");
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Root Application Component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProviders>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/shared-document/:id" element={<SharedDocumentPage />} />

          {/* Protected Routes */}
          <Route path="/"                    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/documents"           element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/templates"           element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
          <Route path="/clients"             element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/projects"            element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/solo-projects"       element={<ProtectedRoute><SoloProjectsPage /></ProtectedRoute>} />
          <Route path="/payment"             element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/maintenance"         element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
          <Route path="/calendar"            element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/activities"          element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
          <Route path="/revisions"           element={<ProtectedRoute><RevisionsPage /></ProtectedRoute>} />
          <Route path="/settings"            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
        <Toaster 
          position="top-center" 
          expand={true} 
          toastOptions={{
            classNames: {
              toast: 'font-sans rounded-lg border shadow-lg p-4 flex items-start gap-3',
              title: 'text-sm font-semibold text-gray-900',
              description: 'text-xs text-gray-500',
              success: 'border-green-200 bg-green-50 text-green-900',
              error: 'border-red-200 bg-red-50 text-red-900',
              warning: 'border-amber-200 bg-amber-50 text-amber-900',
              info: 'border-blue-200 bg-blue-50 text-blue-900',
            }
          }}
        />
      </AuthProviders>
    </ThemeProvider>
  );
}
