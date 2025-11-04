import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  MessageSquare,
  CreditCard,
  UtensilsCrossed,
  ThumbsUp,
  Bell,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils/formatting";
import { ToastContainer, useToast } from "./common/Toast";

interface LayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Rooms", href: "/rooms", icon: Building2 },
  { label: "Students", href: "/students", icon: Users },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Complaints", href: "/complaints", icon: MessageSquare },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Food Requests", href: "/food-requests", icon: ThumbsUp },
  { label: "Announcements", href: "/announcements", icon: Bell },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static md:block bg-white border-r border-gray-200 transition-all duration-300 z-40 h-screen overflow-y-auto",
          sidebarOpen ? "w-64" : "w-0 md:w-64",
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Hostel Warden</h1>
          <p className="text-sm text-gray-500 mt-1">Management System</p>
        </div>

        <nav className="p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center md:text-left">
            Hostel Management System
          </h1>

          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            W
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:bg-gray-50">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
