import { Route, Routes } from "react-router-dom";
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

// Root Application Component
export default function App() {
  return (
    <ThemeProvider>
      <DocumentProvider>
        <ClientProvider>
            <CalendarProvider>
              <TodoProvider>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/solo-projects" element={<SoloProjectsPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/activities" element={<TodoPage />} />
                  <Route path="/revisions" element={<RevisionsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/shared-document/:id" element={<SharedDocumentPage />} />
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
              </TodoProvider>
            </CalendarProvider>
        </ClientProvider>
      </DocumentProvider>
    </ThemeProvider>
  );
}
