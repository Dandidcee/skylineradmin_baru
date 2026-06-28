import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/store/theme-store";
import { DocumentProvider } from "@/store/document-store";
import { ClientProvider } from "@/store/client-store";
import { CalendarProvider } from "@/store/calendar-store";
import { TodoProvider } from "@/store/todo-store";

// Lazy load semua halaman agar bundle awal lebih kecil (code splitting)
const DashboardPage    = lazy(() => import("@/pages/dashboard-page").then(m => ({ default: m.DashboardPage })));
const DocumentsPage    = lazy(() => import("@/pages/documents-page").then(m => ({ default: m.DocumentsPage })));
const TemplatesPage    = lazy(() => import("@/pages/templates-page").then(m => ({ default: m.TemplatesPage })));
const ClientsPage      = lazy(() => import("@/pages/clients-page").then(m => ({ default: m.ClientsPage })));
const ProjectsPage     = lazy(() => import("@/pages/projects-page").then(m => ({ default: m.ProjectsPage })));
const SoloProjectsPage = lazy(() => import("@/pages/solo-projects-page").then(m => ({ default: m.SoloProjectsPage })));
const PaymentPage      = lazy(() => import("@/pages/payment-page").then(m => ({ default: m.PaymentPage })));
const MaintenancePage  = lazy(() => import("@/pages/maintenance-page").then(m => ({ default: m.MaintenancePage })));
const CalendarPage     = lazy(() => import("@/pages/calendar-page").then(m => ({ default: m.CalendarPage })));
const TodoPage         = lazy(() => import("@/pages/todo-page").then(m => ({ default: m.TodoPage })));
const RevisionsPage    = lazy(() => import("@/pages/revisions-page").then(m => ({ default: m.RevisionsPage })));
const SettingsPage     = lazy(() => import("@/pages/settings-page").then(m => ({ default: m.SettingsPage })));
const LoginPage        = lazy(() => import("@/pages/login-page").then(m => ({ default: m.LoginPage })));
const SharedDocumentPage = lazy(() => import("@/pages/shared-document-page").then(m => ({ default: m.SharedDocumentPage })));

// Skeleton loading yang muncul saat halaman sedang dimuat
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-text/50 animate-pulse">Memuat halaman...</p>
      </div>
    </div>
  );
}

// Halaman publik (login & shared document) tidak butuh data store
const PUBLIC_PATHS = ["/login", "/shared-document"];

/**
 * Provider wrapper yang hanya aktif saat user sudah login.
 * Ini mencegah 4 API call sia-sia saat halaman login / shared-document dibuka.
 */
function AuthProviders({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const hasToken = !!localStorage.getItem("token");

  // Halaman publik atau belum ada token → jangan wrap dengan data providers
  if (isPublic || !hasToken) {
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

// Root Application Component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProviders>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                      element={<DashboardPage />} />
            <Route path="/documents"             element={<DocumentsPage />} />
            <Route path="/templates"             element={<TemplatesPage />} />
            <Route path="/clients"               element={<ClientsPage />} />
            <Route path="/projects"              element={<ProjectsPage />} />
            <Route path="/solo-projects"         element={<SoloProjectsPage />} />
            <Route path="/payment"               element={<PaymentPage />} />
            <Route path="/maintenance"           element={<MaintenancePage />} />
            <Route path="/calendar"              element={<CalendarPage />} />
            <Route path="/activities"            element={<TodoPage />} />
            <Route path="/revisions"             element={<RevisionsPage />} />
            <Route path="/settings"              element={<SettingsPage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/shared-document/:id"   element={<SharedDocumentPage />} />
          </Routes>
        </Suspense>
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
