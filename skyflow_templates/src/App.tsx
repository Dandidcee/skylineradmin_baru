import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/store/theme-store";
import { DocumentProvider } from "@/store/document-store";
import { ClientProvider } from "@/store/client-store";
import { CalendarProvider } from "@/store/calendar-store";
import { TodoProvider } from "@/store/todo-store";
import { lazy, Suspense } from "react";

// Helper for named exports
const lazyNamed = (modulePromise: Promise<any>, exportName: string) => 
  lazy(() => modulePromise.then(module => ({ default: module[exportName] })));

const DashboardPage = lazyNamed(import("@/pages/dashboard-page"), "DashboardPage");
const DocumentsPage = lazyNamed(import("@/pages/documents-page"), "DocumentsPage");
const TemplatesPage = lazyNamed(import("@/pages/templates-page"), "TemplatesPage");
const ClientsPage = lazyNamed(import("@/pages/clients-page"), "ClientsPage");
const PaymentPage = lazyNamed(import("./pages/payment-page"), "PaymentPage");
const CalendarPage = lazyNamed(import("@/pages/calendar-page"), "CalendarPage");
const TodoPage = lazyNamed(import("@/pages/todo-page"), "TodoPage");
const ProjectsPage = lazyNamed(import("./pages/projects-page"), "ProjectsPage");
const SoloProjectsPage = lazyNamed(import("./pages/solo-projects-page"), "SoloProjectsPage");
const LoginPage = lazyNamed(import("@/pages/login-page"), "LoginPage");
const SettingsPage = lazyNamed(import("./pages/settings-page"), "SettingsPage");
const RevisionsPage = lazyNamed(import("@/pages/revisions-page"), "RevisionsPage");
const MaintenancePage = lazyNamed(import("@/pages/maintenance-page"), "MaintenancePage");
const SharedDocumentPage = lazyNamed(import("@/pages/shared-document-page"), "SharedDocumentPage");
const CredentialsPage = lazyNamed(import("@/pages/credentials-page"), "CredentialsPage");
const PublicFormPage = lazyNamed(import("@/pages/public-form-page"), "PublicFormPage");
const FormResponsesPage = lazyNamed(import("@/pages/form-responses-page"), "FormResponsesPage");
const PublicFeedbackPage = lazyNamed(import("@/pages/public-feedback-page"), "PublicFeedbackPage");
const PublicTestimoniesPage = lazyNamed(import("@/pages/public-testimonies-page"), "PublicTestimoniesPage");
const FeedbackManagePage = lazyNamed(import("@/pages/feedback-manage-page"), "FeedbackManagePage");
// Halaman publik (login & shared document) tidak butuh data store
const PUBLIC_PATHS = ["/login", "/shared-document", "/form", "/feedback", "/testimonies"];

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
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0d]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-brand-blue"></div>
              <p className="text-white/50 text-sm font-medium animate-pulse tracking-widest uppercase">Memuat...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/login"               element={<LoginPage />} />
            <Route path="/shared-document/:id" element={<SharedDocumentPage />} />
            <Route path="/form"                element={<PublicFormPage />} />
            <Route path="/feedback"            element={<PublicFeedbackPage />} />
            <Route path="/testimonies"         element={<PublicTestimoniesPage />} />

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
            <Route path="/credentials"         element={<ProtectedRoute><CredentialsPage /></ProtectedRoute>} />
            <Route path="/forms"               element={<ProtectedRoute><FormResponsesPage /></ProtectedRoute>} />
            <Route path="/feedbacks-admin"     element={<ProtectedRoute><FeedbackManagePage /></ProtectedRoute>} />
            <Route path="/settings"            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
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
