import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/contexts/auth.context";
import { ProtectedRoute } from "@/components/protected-route";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent rate limiting issues
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Layout>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute requireOnboarding>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requireOnboarding>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </AuthProvider>
        </BrowserRouter>
      </Layout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
