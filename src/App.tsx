import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatBot } from "./components/ChatBot";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingFallback } from "./components/LoadingFallback";
import { SessionTimeout } from "./components/SessionTimeout";

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DrugVerification = lazy(() => import("./pages/DrugVerification"));
const DrugInteractions = lazy(() => import("./pages/DrugInteractions"));
const PrescriptionScanner = lazy(() => import("./pages/PrescriptionScanner"));
const Emergency = lazy(() => import("./pages/Emergency"));
const MedicalHistory = lazy(() => import("./pages/MedicalHistory"));
const SafetyScore = lazy(() => import("./pages/SafetyScore"));
const PharmacistVerification = lazy(() => import("./pages/PharmacistVerification"));
const FDAImport = lazy(() => import("./pages/FDAImport"));
const DietRecommendation = lazy(() => import("./pages/DietRecommendation"));
const ProfileSettings = lazy(() => import("./pages/settings/Profile"));
const ThemeSettings = lazy(() => import("./pages/settings/Theme"));
const NotificationSettings = lazy(() => import("./pages/settings/Notifications"));
const SecuritySettings = lazy(() => import("./pages/settings/Security"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SessionTimeout />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><DrugVerification /></ProtectedRoute>} />
            <Route path="/interactions" element={<ProtectedRoute><DrugInteractions /></ProtectedRoute>} />
            <Route path="/prescription-scanner" element={<ProtectedRoute><PrescriptionScanner /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
                  <Route path="/safety" element={<ProtectedRoute><SafetyScore /></ProtectedRoute>} />
                  <Route path="/pharmacist" element={<ProtectedRoute><PharmacistVerification /></ProtectedRoute>} />
                  <Route path="/fda-import" element={<ProtectedRoute><FDAImport /></ProtectedRoute>} />
                  <Route path="/diet" element={<ProtectedRoute><DietRecommendation /></ProtectedRoute>} />
                  <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                  <Route path="/settings/theme" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
                  <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
                  <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ChatBotWrapper />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
