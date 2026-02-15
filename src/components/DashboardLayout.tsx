import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  Heart,
  LayoutDashboard,
  Users,
  Calendar,
  Syringe,
  Shield,
  FileText,
  LogOut,
  Building2,
  UserCog,
  BarChart3,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-sidebar-primary" />
            <span className="font-bold text-sidebar-foreground">{t.common.appName}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-2">
          <LanguageSwitcher variant="minimal" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t.common.logout}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">{title}</h1>
          <div className="ml-auto text-sm text-muted-foreground">
            {user?.email}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

// Nav configurations for each dashboard type
export function getFamilyNav(t: any): NavItem[] {
  return [
    { title: t.family.dashboard, url: "/family/dashboard", icon: LayoutDashboard },
    { title: t.family.members, url: "/family/members", icon: Users },
    { title: t.family.appointments, url: "/family/appointments", icon: Calendar },
    { title: t.family.vaccinations, url: "/family/vaccinations", icon: Syringe },
    { title: t.family.emergencyCard, url: "/family/emergency", icon: Shield },
    { title: t.family.healthRecords, url: "/family/records", icon: FileText },
  ];
}

export function getHospitalNav(t: any): NavItem[] {
  return [
    { title: t.hospital.dashboard, url: "/hospital/dashboard", icon: LayoutDashboard },
    { title: t.hospital.patients, url: "/hospital/patients", icon: Users },
    { title: t.hospital.appointments, url: "/hospital/appointments", icon: Calendar },
    { title: t.hospital.records, url: "/hospital/records", icon: FileText },
    { title: t.hospital.doctors, url: "/hospital/staff", icon: UserCog },
  ];
}

export function getAdminNav(t: any): NavItem[] {
  return [
    { title: t.admin.dashboard, url: "/admin/dashboard", icon: LayoutDashboard },
    { title: t.admin.users, url: "/admin/users", icon: Users },
    { title: t.admin.hospitals, url: "/admin/hospitals", icon: Building2 },
    { title: t.admin.analytics, url: "/admin/analytics", icon: BarChart3 },
    { title: t.admin.auditLog, url: "/admin/audit", icon: ClipboardList },
  ];
}
