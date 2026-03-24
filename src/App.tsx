import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { PrivacyModeProvider } from "@/hooks/use-privacy-mode";
import { PropertiesProvider } from "@/contexts/PropertiesContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import OfflineBanner from "@/components/shared/OfflineBanner";

const Index = lazy(() => import("./pages/Index.tsx"));
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";

const Admin = lazy(() => import("./pages/Admin.tsx"));
const Staff = lazy(() => import("./pages/Staff.tsx"));
const Wallpapers = lazy(() => import("./pages/Wallpapers.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => {
  useEffect(() => {
    import("@/lib/native").then(({ initNativePlugins, isNative }) => {
      initNativePlugins();
      // On native, prefetch critical data into local cache for instant UI
      if (isNative) {
        import("@/lib/native-cache").then(({ prefetchCriticalData }) => prefetchCriticalData()).catch(() => {});
      }
    }).catch(() => {});
  }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PrivacyModeProvider>
        <PropertiesProvider>
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Sonner />
          <ErrorBoundary fallbackTitle="App crashed unexpectedly">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Suspense fallback={null}><ErrorBoundary fallbackTitle="Failed to load home"><Index /></ErrorBoundary></Suspense>} />
              <Route path="/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
              <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><ErrorBoundary fallbackTitle="Admin panel error"><Admin /></ErrorBoundary></Suspense>} />
              <Route path="/staff" element={<Suspense fallback={<LoadingSpinner />}><ErrorBoundary fallbackTitle="Staff panel error"><Staff /></ErrorBoundary></Suspense>} />
              <Route path="/wallpapers" element={<Suspense fallback={<LoadingSpinner />}><ErrorBoundary><Wallpapers /></ErrorBoundary></Suspense>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
        </PropertiesProvider>
        </PrivacyModeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
