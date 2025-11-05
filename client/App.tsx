import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
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
import Students from "@/pages/Students";
import Menu from "@/pages/Menu";
import Complaints from "@/pages/Complaints";
import Payments from "@/pages/Payments";
import FoodRequests from "@/pages/FoodRequests";
import Announcements from "@/pages/Announcements";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Check if user is logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
};

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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Rooms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Maintenance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Complaints />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Payments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Menu />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FoodRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage title="Announcements" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
