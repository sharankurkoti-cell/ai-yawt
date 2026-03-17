import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AboutPageRoute from "./pages/AboutPageRoute";
import ProductsPageRoute from "./pages/ProductsPageRoute";
import DownloadPageRoute from "./pages/DownloadPageRoute";
import DocsPageRoute from "./pages/DocsPageRoute";
import ContactPageRoute from "./pages/ContactPageRoute";
import DemoPageRoute from "./pages/DemoPageRoute";
import PricingPageRoute from "./pages/PricingPageRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPageRoute />} />
              <Route path="/products" element={<ProductsPageRoute />} />
              <Route path="/download" element={<DownloadPageRoute />} />
              <Route path="/docs" element={<DocsPageRoute />} />
              <Route path="/contact" element={<ContactPageRoute />} />
              <Route path="/demo" element={<DemoPageRoute />} />
              <Route path="/pricing" element={<PricingPageRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

