import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatBot } from "./components/ChatBot";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingFallback } from "./components/LoadingFallback";

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DrugVerification = lazy(() => import("./pages/DrugVerification"));
const MedicalHistory = lazy(() => import("./pages/MedicalHistory"));
const SafetyScore = lazy(() => import("./pages/SafetyScore"));
const PharmacistVerification = lazy(() => import("./pages/PharmacistVerification"));
const FDAImport = lazy(() => import("./pages/FDAImport"));
const DietRecommendation = lazy(() => import("./pages/DietRecommendation"));
const Profile = lazy(() => import("./pages/Profile"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const PrivacySettings = lazy(() => import("./pages/PrivacySettings"));
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                  <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
                  <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/verify" element={<ErrorBoundary><ProtectedRoute><DrugVerification /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/history" element={<ErrorBoundary><ProtectedRoute><MedicalHistory /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/safety" element={<ErrorBoundary><ProtectedRoute><SafetyScore /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/pharmacist" element={<ErrorBoundary><ProtectedRoute><PharmacistVerification /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/fda-import" element={<ErrorBoundary><ProtectedRoute><FDAImport /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/diet" element={<ErrorBoundary><ProtectedRoute><DietRecommendation /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/profile" element={<ErrorBoundary><ProtectedRoute><Profile /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/settings/notifications" element={<ErrorBoundary><ProtectedRoute><NotificationSettings /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/settings/privacy" element={<ErrorBoundary><ProtectedRoute><PrivacySettings /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
                </Routes>
              </Suspense>
              <ChatBotWrapper />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
