import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { seedInitialData } from "@/data/seedData";

// Pages
import Dashboard from "@/pages/Dashboard";
import Rooms from "@/pages/Rooms";
import Maintenance from "@/pages/Maintenance";
import NotFound from "@/pages/NotFound";

// Placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">This page is under development.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize sample data on app load
    seedInitialData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/students" element={<PlaceholderPage title="Students" />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/complaints" element={<PlaceholderPage title="Complaints" />} />
              <Route path="/payments" element={<PlaceholderPage title="Payments" />} />
              <Route path="/menu" element={<PlaceholderPage title="Menu Management" />} />
              <Route path="/food-requests" element={<PlaceholderPage title="Food Requests" />} />
              <Route path="/announcements" element={<PlaceholderPage title="Announcements" />} />
              <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
