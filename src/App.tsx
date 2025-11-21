import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatBot } from "./components/ChatBot";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DrugVerification from "./pages/DrugVerification";
import MedicalHistory from "./pages/MedicalHistory";
import SafetyScore from "./pages/SafetyScore";
import PharmacistVerification from "./pages/PharmacistVerification";
import FDAImport from "./pages/FDAImport";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const ChatBotWrapper = () => {
  const location = useLocation();
  const hideChatBotRoutes = ['/', '/auth'];
  
  if (hideChatBotRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <ChatBot />;
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/verify" element={<ProtectedRoute><DrugVerification /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute><SafetyScore /></ProtectedRoute>} />
              <Route path="/pharmacist" element={<ProtectedRoute><PharmacistVerification /></ProtectedRoute>} />
              <Route path="/fda-import" element={<ProtectedRoute><FDAImport /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBotWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
