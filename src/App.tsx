import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import CallDashboard from "./pages/CallDashboard";
import EmailAgent from "./pages/EmailAgent";
import Training from "./pages/Training";
import Directory from "./pages/Directory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={
                <ProtectedRoute requiredPermission="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute requiredPermission="reports">
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/call-dashboard" element={
                <ProtectedRoute requiredPermission="call-dashboard">
                  <CallDashboard />
                </ProtectedRoute>
              } />
              <Route path="/email-agent" element={<EmailAgent />} />
              <Route path="/training" element={
                <ProtectedRoute requiredPermission="training">
                  <Training />
                </ProtectedRoute>
              } />
              <Route path="/directory" element={
                <ProtectedRoute requiredPermission="directory">
                  <Directory />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
